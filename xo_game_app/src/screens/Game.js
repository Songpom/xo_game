import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { checkWinner, makeEmptyBoard, findWinningLine } from "../component/gamelogic";
import { defaultKForN } from "../component/rules";
import { getBestMove } from "../component/Ai";
import BoardInteractive, { cellsToString } from "../component/Board";
import {
  startHistory,
  appendMove,
  finishHistory,
  deleteHistory,
} from "../services/historyService";
import "../styles/Game.css";

export default function Game() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};
  const mode  = state?.mode  ?? "PVP";
  const N     = state?.size  ?? 3;
  const K     = state?.k     ?? defaultKForN(N);
  const first = state?.first ?? "X";

  const [botType, setBotType] = useState(mode === "PVBOT" ? "RANDOM" : null);

  useEffect(() => { if (!state) navigate("/home"); }, [state, navigate]);

  const [cells, setCells]   = useState(() => makeEmptyBoard(N));
  const [turn, setTurn]     = useState(first);
  const [winner, setWinner] = useState(null);
  const [saved, setSaved]   = useState(false);
  const [winLine, setWinLine] = useState(null);   

  const isPvBot = mode === "PVBOT";

  const historyIdRef   = useRef(null);
  const startedRef     = useRef(false);
  const turnCounterRef = useRef(0);
  const finishedRef    = useRef(false);
  const deletingRef    = useRef(false);

  async function ensureHistoryStarted() {
    if (startedRef.current) return;
    const created = await startHistory({
      mode,
      sizeBoard: N,
      firstPlayer: first,
      botType,
    });
    historyIdRef.current = created.id;
    startedRef.current = true;
  }

  const endGameIfWin = async (board) => {
    const boardAfter = cellsToString(board, N);
    const maybeWinner = checkWinner(board, N, K);
    if (maybeWinner && !finishedRef.current) {
      finishedRef.current = true;
      setWinner(maybeWinner);
      const line = findWinningLine(board, N, K);
      setWinLine(line || null);
      await finishHistory(historyIdRef.current, {
        winner: maybeWinner,
        finalBoard: boardAfter,
      });
      setSaved(true);
      return true;
    }
    return false;
  };

  const onCellClick = async (index) => {
    if (winner || cells[index]) return;
    if (isPvBot && turn === "O") return;

    const nextBoard = [...cells];
    nextBoard[index] = turn;
    setCells(nextBoard);
    setTurn(turn === "X" ? "O" : "X");

    try {
      await ensureHistoryStarted();
      turnCounterRef.current += 1;
      const boardAfter = cellsToString(nextBoard, N);
      await appendMove(historyIdRef.current, {
        turnNumber: turnCounterRef.current,
        player: turn,
        rowIdx: Math.floor(index / N),
        colIdx: index % N,
        boardAfter,
      });

      const ended = await endGameIfWin(nextBoard);
      if (ended) return;
    } catch (e) {
      console.error("appendMove (human) failed:", e);
    }
  };

  useEffect(() => {
    if (botType !== "RANDOM") return;
    if (!isPvBot || winner || turn !== "O") return;

    const empties = cells.map((v, i) => (v ? null : i)).filter((x) => x !== null);
    if (!empties.length) return;

    const pick = empties[Math.floor(Math.random() * empties.length)];
    const t = setTimeout(async () => {
      const nextBoard = [...cells];
      if (nextBoard[pick]) return;
      nextBoard[pick] = "O";
      setCells(nextBoard);
      setTurn("X");

      try {
        await ensureHistoryStarted();
        turnCounterRef.current += 1;
        const boardAfter = cellsToString(nextBoard, N);

        await appendMove(historyIdRef.current, {
          turnNumber: turnCounterRef.current,
          player: "O",
          rowIdx: Math.floor(pick / N),
          colIdx: pick % N,
          boardAfter,
        });

        const ended = await endGameIfWin(nextBoard);
        if (ended) return;
      } catch (e) {
        console.error("appendMove (bot RANDOM) failed:", e);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [botType, isPvBot, winner, turn, cells, N, K]);


  useEffect(() => {
    if (botType !== "AI") return;
    if (mode !== "PVBOT" || winner || turn !== "O") return;

    const moveIndex = getBestMove(cells, N, K, "O", "X");
    if (moveIndex == null || cells[moveIndex]) return;

    const t = setTimeout(async () => {
      const nextBoard = [...cells];
      nextBoard[moveIndex] = "O";
      setCells(nextBoard);
      setTurn("X");
      try {
        await ensureHistoryStarted();
        turnCounterRef.current += 1;
        const boardAfter = cellsToString(nextBoard, N);

        await appendMove(historyIdRef.current, {
          turnNumber: turnCounterRef.current,
          player: "O",
          rowIdx: Math.floor(moveIndex / N),
          colIdx: moveIndex % N,
          boardAfter,
        });

        const ended = await endGameIfWin(nextBoard);
        if (ended) return;
      } catch (e) {
        console.error("appendMove (bot AI) failed:", e);
      }
    }, 280);

    return () => clearTimeout(t);
  }, [botType, mode, winner, turn, cells, N, K]);

  const reset = async () => {
    if (historyIdRef.current && !deletingRef.current) {
      try {
        deletingRef.current = true;
        await deleteHistory(historyIdRef.current);
      } catch (e) {
        console.warn("deleteHistory on reset failed:", e);
      } finally {
        deletingRef.current = false;
      }
    }
    historyIdRef.current = null;
    startedRef.current = false;
    finishedRef.current = false;
    turnCounterRef.current = 0;
    setCells(makeEmptyBoard(N));
    setTurn(Math.random() < 0.5 ? "X" : "O");
    setWinner(null);
    setSaved(false);
    setWinLine(null);
  };

  const handleBackToHome = async () => {
    if (!winner && historyIdRef.current && !deletingRef.current) {
      try {
        deletingRef.current = true;
        await deleteHistory(historyIdRef.current);
      } catch (e) {
        console.warn("deleteHistory on back failed:", e);
      } finally {
        deletingRef.current = false;
      }
    }
    navigate("/home");
  };

  useEffect(() => {
    const onBeforeUnload = () => {
      if (startedRef.current && !finishedRef.current) {
        navigator.sendBeacon?.(
          `${process.env.REACT_APP_API_URL}/history/${historyIdRef.current}`,
          new Blob([], { type: "application/json" })
        );
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    return () => {
      if (startedRef.current && !finishedRef.current && historyIdRef.current && !deletingRef.current) {
        deletingRef.current = true;
        deleteHistory(historyIdRef.current).catch(() => {});
      }
    };
  }, []);

  const statusText = useMemo(
    () => (!winner ? `ตาปัจจุบัน: ${turn}` : winner === "DRAW" ? "ผลลัพธ์: เสมอ" : `ผู้ชนะ: ${winner}`),
    [winner, turn]
  );

  return (
    <div className="game-page">
      <div className="game-header">
        <button className="btn btn-ghost" onClick={handleBackToHome}>
          ← กลับหน้า Home
        </button>

        <div className="game-meta">
          โหมด: <b>{mode}</b> · กระดาน: <b>{N}×{N}</b> · ชนะเมื่อเรียง <b>{K}</b>
          {isPvBot && (
            <>
              {" "}· บอท:{" "}
              <span style={{ fontWeight: 800 }}>
                {botType === "AI" ? "AI" : "Random"}
              </span>
            </>
          )}
        </div>

        {isPvBot && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className={`btn ${botType === "RANDOM" ? "btn-primary" : ""}`}
              onClick={() => setBotType("RANDOM")}
              aria-pressed={botType === "RANDOM"}
            >
              🤖 Random
            </button>
            <button
              className={`btn ${botType === "AI" ? "btn-primary" : ""}`}
              onClick={() => setBotType("AI")}
              aria-pressed={botType === "AI"}
            >
              🧠 AI
            </button>
          </div>
        )}
      </div>

      <div className="status-row">
        <div className={`status-badge ${winner ? "done" : "turn"}`}>{statusText}</div>
        {winner && (
          <div className={`save-indicator ${saved ? "saved" : "saving"}`}>
            {saved ? "บันทึกแล้ว" : "กำลังบันทึก…"}
          </div>
        )}
      </div>

      <div className="board-wrap">
        <BoardInteractive
          size={N}
          cells={cells}
          onCellClick={onCellClick}
          cellPx={N <= 5 ? 90 : N <= 10 ? 56 : 36}
          gap={N <= 10 ? 6 : 4}
          winningLine={winLine}     
          winner={winner || null}   
        />
      </div>

      <div className="actions">
        <button className="btn" onClick={reset}>เริ่มใหม่ (สุ่มคนเริ่ม)</button>
        <button className="btn" onClick={handleBackToHome}>เปลี่ยนโหมด/ขนาด</button>
      </div>
    </div>
  );
}
