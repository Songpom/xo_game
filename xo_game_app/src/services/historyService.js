import client from "../webservices/client";

export async function listHistory() {
  const res = await client.get("/history");   
  return res.data;
}

export async function createHistory(payload) {
  const res = await client.post("/history", payload); 
  return res.data;
}
