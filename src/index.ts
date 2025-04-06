import type { UserData } from './types';
import { buildUserTagMatrix } from './tags-retrieval';
import { buildTagCorrelationMatrix } from './tags-correlation';
import { buildSocialRelationMatrix } from './social-relation';
import { iterateMatrix } from './iteration';
import { mockedData } from '../data/mock';

const users = mockedData;

// 步骤 1：构建用户 - 标签矩阵
const allTags = Array.from(new Set(users.flatMap(u => u.tags || [])));
const M_ul = buildUserTagMatrix(users, allTags);

// 步骤 2：构建标签相关性矩阵
const M_ir = buildTagCorrelationMatrix(M_ul);

// 步骤 3：更新用户 - 标签矩阵
const M_re = M_ul.map(row => 
  row.map((_, j) => 
    row.reduce((sum, val, k) => sum + val * M_ir[k]![j]!, 0)
  )
);

// 步骤 4：构建社交关系矩阵
const M_sr = buildSocialRelationMatrix(users);

// 步骤 5：迭代更新
const M_final = iterateMatrix(M_re, M_sr);

// 步骤 6：生成推荐（示例）
const recommendMicroblogs = (userId: number, threshold: number = 0.5) => {
  const userIdx = users.findIndex(u => u.id === userId);
  const userVector = M_final[userIdx];
  // 假设微博向量 E 为二进制存在标签，直接判断标签是否存在于全局标签中，无需考虑标签出现的次数或权重。
  const microblogs = [
    { id: 1, tags: ["科技", "编程"] },
    { id: 2, tags: ["旅行", "摄影"] }
  ];
  return microblogs.filter(mb => {
    const E = allTags.map(t => mb.tags.includes(t) ? 1 : 0);
    const score = E.reduce((sum, e, j) => sum + e * userVector![j]! as 0|1, 0);
    return score > threshold;
  });
};

console.log(recommendMicroblogs(1));