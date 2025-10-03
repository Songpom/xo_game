// src/screens/Board.js
import React from "react";

/* บันทึกลง DB: Array → String */
export function cellsToString(cells, N) {
  const safe = Array.isArray(cells) ? cells.slice(0, N * N) : [];
  while (safe.length < N * N) safe.push("");
  return safe.join(","); // เช่น "X,O,,O,X,,,,"
}

/* ดึงจาก DB: String → Array */
export function stringToCells(str, N) {
  const arr = (str || "").split(",").map((s) => s.trim().toUpperCase());
  while (arr.length < N * N) arr.push("");
  return arr.slice(0, N * N);
}

/* กระดานคลิกได้ */
export default function BoardInteractive({
  size = 3,
  cells = [],
  onCellClick = () => {},
  cellPx = 72,
  gap = 6
}) {
  const gridStyle = {
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

  return (
    <div style={gridStyle} aria-label={`Board ${size} by ${size}`}>
      {cells.map((v, i) => (
        <div key={i} style={cellStyle} onClick={() => onCellClick(i)}>
          <span style={{ color: v === "X" ? "#1976d2" : v === "O" ? "#d32f2f" : "#999" }}>
            {v}
          </span>
        </div>
      ))}
    </div>
  );
}
