import type { UserData, SocialRelationMatrix } from './types';

/**
 * 计算余弦相似度
 */
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dot = vecA.reduce((acc, val, i) => acc + val * vecB[i]!, 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val ** 2, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val ** 2, 0));
  return dot / (normA * normB || 1e-6);
};

/**
 * 构建社交关系矩阵
 */
export const buildSocialRelationMatrix = (users: UserData[]): SocialRelationMatrix => {
  const N = users.length;
  const matrix: SocialRelationMatrix = Array.from({ length: N }, () => new Array(N).fill(0));

  users.forEach((userA, i) => {
    users.forEach((userB, j) => {
      if (i === j) {
        matrix[i]![j] = 1;
      } else {
        // 关注相似度
        const fgSim = cosineSimilarity(
          users.map(u => userA.following.includes(u.id) ? 1 : 0),
          users.map(u => userB.following.includes(u.id) ? 1 : 0)
        );
        // 粉丝相似度
        const frSim = cosineSimilarity(
          users.map(u => userA.followers.includes(u.id) ? 1 : 0),
          users.map(u => userB.followers.includes(u.id) ? 1 : 0)
        );
        matrix[i]![j] = fgSim + frSim;
      }
    });
  });
  
  // 归一化
  const min = Math.min(...matrix.flat());
  const max = Math.max(...matrix.flat());
  return matrix.map(row => row.map(val => (val - min) / (max - min)));
};