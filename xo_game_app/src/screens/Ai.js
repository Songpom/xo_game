// src/screens/Ai.js
// ใช้ร่วมกับ checkWinner/idx จาก gamelogic.js
import { checkWinner, idx } from "./gamelogic";

const DIRECTIONS = [
  { dr: 0, dc: 1 },
  { dr: 1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
];

const inBounds = (r, c, N) => r >= 0 && r < N && c >= 0 && c < N;

// 1) ทดลองวางแล้วชนะเลยไหม
function findImmediateWin(boardCells, boardSize, winCondition, playerSymbol) {
  for (let i = 0; i < boardCells.length; i++) {
    if (boardCells[i]) continue;
    const next = [...boardCells];
    next[i] = playerSymbol;
    const w = checkWinner(next, boardSize, winCondition);
    if (w === playerSymbol) return i;
  }
  return null;
}

// 2) นับความต่อเนื่องในทิศทางหนึ่ง
function countLine(boardCells, boardSize, row, col, dr, dc, symbol) {
  let countSame = 0;
  let r = row + dr, c = col + dc;
  while (inBounds(r, c, boardSize) && boardCells[idx(r, c, boardSize)] === symbol) {
    countSame++; r += dr; c += dc;
  }
  const openEnd = inBounds(r, c, boardSize) && !boardCells[idx(r, c, boardSize)] ? 1 : 0;
  return { countSame, openEnd };
}

// 3) ประเมินคะแนนตำแหน่งเดียว
function evaluatePosition(boardCells, boardSize, winCondition, row, col, symbol) {
  const temp = [...boardCells];
  temp[idx(row, col, boardSize)] = symbol;

  let score = 0;
  for (const { dr, dc } of DIRECTIONS) {
    const fwd = countLine(temp, boardSize, row, col, dr, dc, symbol);
    const bwd = countLine(temp, boardSize, row, col, -dr, -dc, symbol);
    const runLen = 1 + fwd.countSame + bwd.countSame;
    const openEnds = fwd.openEnd + bwd.openEnd;

    if (runLen >= winCondition) score += 10_000;
    else if (runLen === winCondition - 1 && openEnds >= 1) score += 3_000;
    else if (runLen === winCondition - 2 && openEnds === 2) score += 800;
    else if (runLen === winCondition - 2 && openEnds === 1) score += 300;
    else if (runLen === winCondition - 3 && openEnds === 2) score += 120;
      else score += runLen * 10 + openEnds * 5;
  }

  // โบนัสใกล้กลางกระดาน
  const center = (boardSize - 1) / 2;
  const distCenter = Math.abs(row - center) + Math.abs(col - center);
  score += Math.max(0, 10 - distCenter);

  return score;
}

// 4) เลือกช่องที่ดีที่สุด
export function getBestMove(boardCells, boardSize, winCondition, botSymbol = "O", humanSymbol = "X") {
  // ชนะทันที
  const winNow = findImmediateWin(boardCells, boardSize, winCondition, botSymbol);
  if (winNow !== null) return winNow;

  // บล็อกคู่แข่ง
  const blockNow = findImmediateWin(boardCells, boardSize, winCondition, humanSymbol);
  if (blockNow !== null) return blockNow;

  // สำหรับกระดานเล็ก ชอบ center > corner
  if (boardSize <= 4) {
    const centerIndex = boardSize % 2 === 1 ? idx((boardSize - 1) / 2, (boardSize - 1) / 2, boardSize) : null;
    if (centerIndex !== null && !boardCells[centerIndex]) return centerIndex;
    const corners = [
      idx(0, 0, boardSize),
      idx(0, boardSize - 1, boardSize),
      idx(boardSize - 1, 0, boardSize),
      idx(boardSize - 1, boardSize - 1, boardSize),
    ].filter(i => !boardCells[i]);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  }

  // ประเมินทุกช่องว่าง (รุก+รับ)
  let bestIndex = null;
  let bestScore = -Infinity;
  for (let i = 0; i < boardCells.length; i++) {
    if (boardCells[i]) continue;
    const row = Math.floor(i / boardSize);
    const col = i % boardSize;
    const attack = evaluatePosition(boardCells, boardSize, winCondition, row, col, botSymbol);
    const defense = evaluatePosition(boardCells, boardSize, winCondition, row, col, humanSymbol);
    const total = attack + defense * 0.6;
    if (total > bestScore) { bestScore = total; bestIndex = i; }
  }

  if (bestIndex === null) {
    const empties = boardCells.map((v, i) => (v ? null : i)).filter((x) => x !== null);
    return empties.length ? empties[Math.floor(Math.random() * empties.length)] : 0;
  }
  return bestIndex;
}
