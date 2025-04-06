import type { UserTagMatrix, TagCorrelationMatrix } from './types';

/**
 * 计算内部相关性 LIR
 */
const calculateLIR = (matrix: UserTagMatrix, tagIdxA: number, tagIdxB: number): number => {
  const H = matrix.filter(row => row[tagIdxA]! > 0 && row[tagIdxB]! > 0);
  if (H.length === 0) return 0;
  
  const sum = H.reduce((acc, row) => {
    const wij = row[tagIdxA];
    const wik = row[tagIdxB];
    return acc + (wij! * wik!) / (wij! + wik! - wij! * wik!);
  }, 0);
  
  return sum / H.length;
};

/**
 * 构建标签相关性矩阵
 */
export const buildTagCorrelationMatrix = (
  matrix: UserTagMatrix,
  alpha: number = 0.5
): TagCorrelationMatrix => {
  const n = matrix[0]!.length;
  const lrMatrix: TagCorrelationMatrix = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let j = 0; j < n; j++) {
    for (let k = 0; k < n; k++) {
      if (j === k) {
        lrMatrix[j]![k] = 1;
      } else {
        const lir = calculateLIR(matrix, j, k);
        // 简化的 LOR 计算
        const lor = Math.random(); // 模拟外部相关性
        lrMatrix[j]![k] = alpha * lor + (1 - alpha) * lir;
      }
    }
  }
  return lrMatrix;
};