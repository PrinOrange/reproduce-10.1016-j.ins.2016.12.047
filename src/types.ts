// 用户 - 标签权重矩阵
export type UserTagMatrix = number[][];

// 标签相关性矩阵
export type TagCorrelationMatrix = number[][];

// 用户社交关系矩阵
export type SocialRelationMatrix = number[][];

// 用户数据（包含标签和社交关系）
export interface UserData {
  id: number;
  posts: string[];          // 用户发布的微博内容
  following: number[];      // 关注的用户 ID
  followers: number[];      // 粉丝的用户 ID
  tags?: string[];          // 用户标签（可选，若系统提供）
}