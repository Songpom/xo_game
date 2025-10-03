import React from "react";

export function cellsToString(cells, N) {
  const safe = Array.isArray(cells) ? cells.slice(0, N * N) : [];
  while (safe.length < N * N) safe.push("");
  return safe.join(",");
}

export default function BoardInteractive({
  size = 3,
  cells = [],
  onCellClick = () => {},
  cellPx = 72,
  gap = 6,
  winningLine = null,    
  winner = null        
}) {
  const gridStyle = {
    position: "relative",
    display: "grid",
    gridTemplateColumns: `repeat(${size}, ${cellPx}px)`,
    gridTemplateRows: `repeat(${size}, ${cellPx}px)`,
    gap
  };

  const cellStyle = {
    width: cellPx,
    height: cellPx,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontWeight: 800,
    fontSize: Math.round(cellPx * 0.5),
    cursor: "pointer",
    userSelect: "none",
    background: "#fff"
  };

  const boardPxW = size * cellPx + (size - 1) * gap;
  const boardPxH = boardPxW;

  const hasWin = winningLine && winningLine.length >= 2;

  const colorX = "#1976d2";
  const colorO = "#d32f2f";
  const neutral = "#999";

  const lineColor = winner === "X" ? colorX : winner === "O" ? colorO : "#22c55e";

  const centerOf = (i) => {
    const r = Math.floor(i / size);
    const c = i % size;
    const x = c * (cellPx + gap) + cellPx / 2;
    const y = r * (cellPx + gap) + cellPx / 2;
    return { x, y };
  };

  let lineCoords = null;
  if (hasWin) {
    const first = winningLine[0];
    const last  = winningLine[winningLine.length - 1];
    const a = centerOf(first);
    const b = centerOf(last);
    lineCoords = { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }

  return (
    <div style={{ position: "relative", width: boardPxW, height: boardPxH }} aria-label={`Board ${size} by ${size}`}>
      <div style={gridStyle}>
        {cells.map((v, i) => (
          <div key={i} style={cellStyle} onClick={() => onCellClick(i)}>
            <span style={{ color: v === "X" ? colorX : v === "O" ? colorO : neutral }}>
              {v}
            </span>
          </div>
        ))}
      </div>
      {hasWin && lineCoords && (
        <svg
          width={boardPxW}
          height={boardPxH}
          viewBox={`0 0 ${boardPxW} ${boardPxH}`}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <line
            {...lineCoords}
            stroke={lineColor}
            strokeWidth={Math.max(4, Math.round(cellPx * 0.12))}
            strokeLinecap="round"
            opacity="0.95"
            filter="url(#glow)"
          />
        </svg>
      )}
    </div>
  );
}
