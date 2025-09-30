import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import Game from "./screens/Game";
import Replay from "./screens/Replay"; // NEW

export default function Routers() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/play" element={<Game />} />
        <Route path="/replay/:id" element={<Replay />} /> {/* NEW */}
      </Routes>
    </BrowserRouter>
  );
}
