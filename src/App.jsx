import { useState, useRef, useEffect } from "react";

// ─── CONFIG ───────────────────────────────────────────────────
const TODAY       = new Date("2026-06-07");
const STORAGE_KEY = "mapa8ano_v4";
const WA_PHONE    = "5561994611414";

// ─── UTILS ────────────────────────────────────────────────────
function parseDate(s) {
  if (!s || s === "decorrer" || s === "verificar") return null;
  const [d, m] = s.split("/").map(Number);
  return new Date(2026, m - 1, d);
}
function daysDiff(s) {
  const t = parseDate(s); if (!t) return null;
  return Math.ceil((t - TODAY) / 86400000);
}
function ikey(sid, idx) { return `${sid}__${idx}`; }
function addDays(d, n)   { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function sameDay(a, b)   { return a.toDateString() === b.toDateString(); }
function getMonday(date) {
  const d = new Date(date), day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0,0,0,0); return d;
}
function fmt(d)    { return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; }
function fmtISO(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }

const DIAS_FULL  = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
const DIAS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const MESES      = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];

// ─── DATA ─────────────────────────────────────────────────────