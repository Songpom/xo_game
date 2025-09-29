export const idx = (r, c, N) => r * N + c;

export function checkWinner(cells, N, K) {
  const dirs = [
    { dr: 0, dc: 1 },  // →
    { dr: 1, dc: 0 },  // ↓
    { dr: 1, dc: 1 },  // ↘
    { dr: 1, dc: -1 }, // ↙
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
          const rr = r + step * dr, cc = c + step * dc;
          if (cells[idx(rr, cc, N)] !== s) { ok = false; break; }
        }
        if (ok) return s; // "X" | "O"
      }
    }
  }
  if (!hasEmpty) return "DRAW";
  return null;
}

export const makeEmptyBoard = (N) => Array(N * N).fill("");
