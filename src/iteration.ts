import type { UserTagMatrix, SocialRelationMatrix } from './types';

/**
 * 矩阵迭代更新
 */
export const iterateMatrix = (
  M_re: UserTagMatrix,
  M_sr: SocialRelationMatrix,
  beta: number = 0.6,
  maxIter: number = 10
): UserTagMatrix => {
  let M_x = M_re!;
  for (let i = 0; i < maxIter; i++) {
    const nextM = M_x.map((row, idx) => 
      row.map((val, j) => 
        beta * val + (1 - beta) * 
        M_sr[idx]!.reduce((acc, s, k) => acc + s * M_x[k]![j]!, 0)
      )
    );
    M_x = nextM;
  }
  return M_x;
};