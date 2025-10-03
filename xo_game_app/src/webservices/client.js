import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL?.replace(/\/+$/, "") || "http://localhost:8082/api/";

const client = axios.create({
  baseURL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export default client;
