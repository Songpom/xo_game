import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Game from "./screens/Game";

export default function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/play" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}
