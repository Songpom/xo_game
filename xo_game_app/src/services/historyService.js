import client from "../webservices/client";

export async function listHistory() {
  const res = await client.get("/history");
  return res.data;
}

export async function startHistory({ mode, sizeBoard, firstPlayer, botType }) {
  const res = await client.post("/history", { mode, sizeBoard, firstPlayer, botType });
  return res.data;
}

export async function appendMove(historyId, { turnNumber, player, rowIdx, colIdx, boardAfter }) {
  const res = await client.post(`/history/${historyId}/moves`, {
    turnNumber, player, rowIdx, colIdx, boardAfter
  });
  return res.data;
}

export async function finishHistory(historyId, { winner, finalBoard }) {
  const res = await client.post(`/history/${historyId}/finish`, { winner, finalBoard });
  return res.data;
}

/* 👇 เพิ่มสองตัวนี้ */
export async function getHistory(id) {
  const res = await client.get(`/history/${id}`);
  return res.data;
}

export async function getMoves(id) {
  const res = await client.get(`/history/${id}/moves`);
  return res.data;
}

export async function deleteHistory(id) {
  await client.delete(`/history/${id}`);
}
