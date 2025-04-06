import type { UserData } from '../src/types';
import jieba from '@node-rs/jieba';

const nodejieba = new jieba.Jieba()

// 基础数据种子
const TOPICS = [
  '机器学习', '深度学习', '人工智能', '编程', '算法',
  '旅行攻略', '摄影技巧', '美食探店', '户外运动', '健身',
  '科技新闻', '金融投资', '股票分析', '电影评论', '音乐分享'
];

const EMOJIS = ['🚀', '💻', '📷', '🍔', '🏔️', '🎬', '🎵', '💰', '⚡', '❤️'];
const LOCATIONS = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '重庆', '南京'];

// 生成微博内容（带时间戳）
const generatePost = (userId: number, index: number) => {
  const date = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
  return {
    content: `用户${userId}的第${index+1}条微博：${
      TOPICS[Math.floor(Math.random() * TOPICS.length)]
    } ${EMOJIS[Math.floor(Math.random() * EMOJIS.length)]} #${
      ['科技达人', '旅行家', '美食家', '影迷'][userId % 4]
    }`,
    timestamp: date.toISOString(),
    likes: Math.floor(Math.random() * 1000),
    reposts: Math.floor(Math.random() * 500)
  };
};

// 生成用户关系网络
const generateSocialGraph = (users: UserData[]) => {
  users.forEach(user => {
    const followNum = Math.floor(Math.random() * 10) + 5;
    user.following = Array.from({ length: followNum }, () => 
      users![Math.floor(Math.random() * users.length)]!.id
    ).filter((v, i, a) => a.indexOf(v) === i); // 去重

    users.forEach(other => {
      if (other.following.includes(user.id) && Math.random() > 0.7) {
        user.followers.push(other.id);
      }
    });
  });
};

// 生成完整数据集
const mockUsers: UserData[] = Array.from({ length: 50 }, (_, i) => {
  const userId = i + 1;
  const posts = Array.from({ length: 20 + Math.floor(Math.random() * 15) }, (_, j) =>
    generatePost(userId, j)
  );
  
  // 自动生成标签（基于内容分析）
  const allTerms = posts.flatMap(p => 
    nodejieba.cut(p.content).filter(t => t.length > 1)
  );
  const termFreq: { [term: string]: number } = {};
  allTerms.forEach(t => termFreq[t] = (termFreq[t] || 0) + 1);
  const tags = Object.entries(termFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([t]) => t);

  return {
    id: userId,
    name: `用户${userId}`,
    location: LOCATIONS[userId % LOCATIONS.length],
    registrationDate: new Date(Date.now() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000).toISOString(),
    posts: posts.map(p => p.content),
    postDetails: posts, // 保留完整元数据
    following: [],
    followers: [],
    tags: tags.slice(0, 3), // 取前 3 个标签
    interests: TOPICS.slice(userId % 3, userId % 3 + 2)
  };
});

// 生成社交关系
generateSocialGraph(mockUsers);

export const mockedData = mockUsers;
