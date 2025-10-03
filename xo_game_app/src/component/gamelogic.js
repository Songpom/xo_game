export const idx = (row, col, N) => row * N + col;

export function checkWinner(cells, N, K) {
  const dirs = [
    { dr: 0, dc: 1 }, 
    { dr: 1, dc: 0 },  
    { dr: 1, dc: 1 },  
    { dr: 1, dc: -1 },
  ];
  const inBounds = (r, c) => r >= 0 && r < N && c >= 0 && c < N;
  let hasEmpty = false;

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const s = cells[idx(r, c, N)];
      if (!s) { hasEmpty = true; continue; }
      for (const { dr, dc } of dirs) { 
        const endR = r + (K - 1) * dr;
        const endC = c + (K - 1) * dc;
        if (!inBounds(endR, endC)) continue;

        let ok = true;
        for (let step = 1; step < K; step++) {
          const rr = r + (step * dr);
          const cc = c + (step * dc);
          if (cells[idx(rr, cc, N)] !== s) { ok = false; break; }
        }
        if (ok) return s;
      }
    }
  }
  if (!hasEmpty) return "DRAW";
  return null;
}
export function findWinningLine(cells, N, K) {
  const dirs = [
    { dr: 0, dc: 1 },  
    { dr: 1, dc: 0 },  
    { dr: 1, dc: 1 },  
    { dr: 1, dc: -1 },  
  ];
  const inBounds = (r, c) => r >= 0 && r < N && c >= 0 && c < N;

  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const s = cells[r * N + c];
      if (!s) continue;
      for (const { dr, dc } of dirs) {
        const endR = r + (K - 1) * dr;
        const endC = c + (K - 1) * dc;
        if (!inBounds(endR, endC)) continue;

        let ok = true;
        for (let step = 1; step < K; step++) {
          const rr = r + step * dr, cc = c + step * dc;
          if (cells[rr * N + cc] !== s) { ok = false; break; }
        }
        if (ok) {
          const line = [];
          for (let step = 0; step < K; step++) {
            line.push((r + step * dr) * N + (c + step * dc));
          }
          return line; 
        }
      }
    }
  }
  return null;
}


export const makeEmptyBoard = (N) => Array(N * N).fill("");
