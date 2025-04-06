import jieba from '@node-rs/jieba';
import type { UserData, UserTagMatrix } from './types';

// 全局缓存（提升性能）
let globalTermStats: {
  collectionFreq: { [term: string]: number }; // 全集合词频
  totalTerms: number;        // 全集合总词数
} | null = null;

const nodejieba = new jieba.Jieba()

/**
 * 计算 Clarity Score
 */
export const calculateClarity = (
  term: string,
  userPosts: string[],
  allPosts: string[],
  topG: number = Math.ceil(allPosts.length * 0.2)
): number => {
  // 第一次调用时初始化全局统计
  if (!globalTermStats) {
    const collectionFreq: { [term: string]: number } = {};
    let totalTerms = 0;

    // 分词并统计全集合词频
    allPosts.forEach(post => {
      const terms = nodejieba.cut(post, true); // 精确模式分词
      terms.forEach(t => {
        collectionFreq[t] = (collectionFreq[t] || 0) + 1;
        totalTerms++;
      });
    });

    globalTermStats = { collectionFreq, totalTerms };
  }

  // 步骤 1：构建查询模型（检索包含 term 的 topG 微博）
  const scoredPosts = allPosts
    .map(post => {
      const terms = nodejieba.cut(post, true);
      const tf = terms.filter(t => t === term).length;
      return { post, score: tf };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topG);

  // 步骤 2：计算查询模型的词项分布
  const queryModel: { [term: string]: number } = {};
  let queryTotal = 0;
  
  scoredPosts.forEach(({ post }) => {
    nodejieba.cut(post, true).forEach(t => {
      queryModel[t] = (queryModel[t] || 0) + 1;
      queryTotal++;
    });
  });

  // 步骤 3：计算 KL 散度
  let klDivergence = 0;
  Object.keys(queryModel).forEach(t => {
    const pQuery = queryModel[t]! / queryTotal;
    const pCollection = (globalTermStats!.collectionFreq[t] || 0) / globalTermStats!.totalTerms;
    
    if (pQuery > 0 && pCollection > 0) {
      klDivergence += pQuery * Math.log2(pQuery / pCollection);
    }
  });

  return klDivergence;
};

/**
 * 改进版标签生成
 */
export const generateUserTags = (
  user: UserData,
  allUsers: UserData[],
  topN: number = 5
): string[] => {
  // 首次调用时初始化全局统计
  if (!globalTermStats) {
    const allPosts = allUsers.flatMap(u => u.posts);
    calculateClarity('', [], allPosts); // 触发初始化
  }

  // 统计候选词项
  const termStats: { 
    [term: string]: { 
      tf: number;       // 用户内词频
      clarity: number;  // clarity 得分
      score: number;    // tf * clarity
    } 
  } = {};

  // 分词并统计用户词频
  user.posts.forEach(post => {
    const terms = nodejieba.cut(post, true);
    terms.forEach(t => {
      termStats[t] = termStats[t] || { tf: 0, clarity: 0, score: 0 };
      termStats[t].tf += 1;
    });
  });

  // 计算 clarity 得分（并行优化）
  Object.keys(termStats).forEach(term => {
    termStats[term]!.clarity = calculateClarity(term, user.posts, allUsers.flatMap(u => u.posts));
  });

  // 计算最终得分
  const totalTerms = user.posts.reduce((sum, post) => sum + nodejieba.cut(post).length, 0);
  Object.keys(termStats).forEach(term => {
    const tf = termStats[term]!.tf / totalTerms;
    termStats[term]!.score = tf * termStats[term]!.clarity;
  });

  // 选择 topN 并归一化
  return Object.entries(termStats)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, topN)
    .map(([term, { score }], _, arr) => {
      const total = arr.reduce((sum, [_, s]) => sum + s.score, 0);
      return term;
    });
};

/**
 * 构建初始用户 - 标签矩阵
 */
export const buildUserTagMatrix = (users: UserData[], allTags: string[]): UserTagMatrix => {
  return users.map(user => {
    const userTags = user.tags || generateUserTags(user, users);
    const Z = userTags.length;
    return allTags.map(tag => 
      userTags.includes(tag) ? 1/Z : 0
    );
  });
};
