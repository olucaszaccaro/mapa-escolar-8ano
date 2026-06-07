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
const SUBJECTS = [
  { id:"arte", name:"Arte", emoji:"🎨", color:"#f59e0b", items:[
    { type:"trabalho", title:"AV2 – Trabalho Escrito", due:"19/06", weight:"Peso 10,0", points:10, status:"pending",
      details:["Tema: Resumos","Instruções no E-class e mural da sala","⚠️ Entrega com 80% — 1ª data (29/05) já passou"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",  due:"10/06", weight:"Valor 5,0",  points:5,  status:"urgent",
      details:["Definição do tema","Objetivos do projeto","Metodologia","Cronograma"] },
    { type:"trabalho", title:"AV3 – TB Atividades",     due:"decorrer", weight:"Valor 5,0", points:5, status:"ongoing",
      details:["Atividades feitas em sala de aula","Atividades para casa"] },
  ]},
  { id:"ciencias", name:"Ciências", emoji:"🔬", color:"#10b981", items:[
    { type:"prova",    title:"AV2 – Prova",            due:"12/06", weight:"Peso 10,0", points:10, status:"urgent",
      details:["Cap. 05 – De onde eu vim? (parte II) — pp. 32–39","Cap. 06 – Sexualidade humana — pp. 40–62"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",  due:"10/06", weight:"Valor 5,0",  points:5,  status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"trabalho", title:"AV3 – TB Atividades",     due:"decorrer", weight:"Valor 1,0", points:1, status:"ongoing",
      details:["Todas as atividades solicitadas durante o bimestre"] },
  ]},
  { id:"edfisica", name:"Ed. Física", emoji:"🏃", color:"#3b82f6", items:[
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",  due:"10/06", weight:"Valor 5,0", points:5, status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"atividade",title:"AF – Kahoot / Folha A4",  due:"verificar", weight:"Valor 5,0", points:5, status:"check",
      details:["⚠️ Datas originais já passaram (18/05 e 25/05)","Verificar com o professor se há reposição"] },
  ]},
  { id:"espanhol", name:"Espanhol", emoji:"🇪🇸", color:"#ef4444", items:[
    { type:"prova",    title:"AV2 – Prova",            due:"17/06", weight:"Peso 10,0", points:10, status:"pending",
      details:["Compreensão de texto","Meios de comunicação","Futuro simples/imperfeito e condicional","Sinopse","Las herramientas","Verbos irregulares","Apostila pp. 40, 42, 55, 58 e 59"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",  due:"10/06", weight:"Valor 5,0", points:5,  status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"trabalho", title:"TB Atividades semanais",  due:"03/06", weight:"Valor 3,0", points:3,  status:"check",
      details:["⚠️ 1ª data (100%) já passou em 03/06","Verificar se todas as entregas foram feitas"] },
  ]},
  { id:"geografia", name:"Geografia", emoji:"🌍", color:"#8b5cf6", items:[
    { type:"prova",    title:"AV2 – Prova",               due:"17/06", weight:"Peso 10,0", points:10, status:"pending",
      details:["Cap. 5 – Perfil da pop. africana, região norte, subsaariana, apartheid","Cap. 6 – Padrão econômico e distribuição de produtos","Apostila pp. 26–64"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",     due:"10/06", weight:"Valor 5,0", points:5,  status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"atividade",title:"AT2 – Lista Online E-class", due:"08/06", weight:"Valor 2,0", points:2,  status:"fire",
      details:["🔥 HOJE É O ÚLTIMO DIA!","20 questões de múltipla escolha, Caps. 5 e 6"] },
    { type:"trabalho", title:"Atividades do Livro",        due:"decorrer", weight:"Valor 1,0", points:1, status:"ongoing",
      details:["Atividades do livro didático em sala e em casa"] },
  ]},
  { id:"historia", name:"História", emoji:"📖", color:"#d97706", items:[
    { type:"prova",    title:"AV2 – Prova",            due:"18/06", weight:"Peso 10,0", points:10, status:"pending",
      details:["Cap. 6 – América Latina no séc. XIX e início do XX","Apostila pp. 39–56"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",  due:"10/06", weight:"Valor 5,0", points:5,  status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"trabalho", title:"TB – Atividades + Participação", due:"decorrer", weight:"Valor 5,0", points:5, status:"ongoing",
      details:["Todas as atividades realizadas em sala e em casa"] },
  ]},
  { id:"ingles", name:"Inglês", emoji:"🇬🇧", color:"#06b6d4", items:[
    { type:"prova",    title:"AV2 – Prova",               due:"18/06", weight:"Peso 10,0", points:10, status:"pending",
      details:["School events, Gerunds, How/What about","Both/Either/Neither, Camping, Enough/to","My travel, Before/after (conj. e prep.)","Trampoline 7 un.4 pp.63–80 + T8 uns.1–3 pp.9–62"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",     due:"10/06", weight:"Valor 5,0", points:5,  status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"atividade",title:"TB – Revisão E-class",       due:"09/06", weight:"Valor 1,0 · 80%", points:1, status:"urgent",
      details:["⚠️ 1ª data já passou (03/06)","Ainda dá para fazer com 80% até 09/06"] },
    { type:"trabalho", title:"TB – Atividades caderno/livro", due:"19/06", weight:"Valor 1,0", points:1, status:"pending",
      details:["Vistos ao longo do bimestre — data limite: 19/06"] },
  ]},
  { id:"portugues", name:"Português", emoji:"📝", color:"#ec4899", items:[
    { type:"prova",    title:"AV2 – Prova",            due:"15/06", weight:"Peso 10,0", points:10, status:"pending",
      details:["Regência nominal","Modificadores de substantivos e verbos","Descriminar x Discriminar, Deferir x Diferir","Descrição x Discrição, Concerto x Conserto","Apostila pp. 37–39; 49–54; 56–60"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",  due:"10/06", weight:"Valor 5,0", points:5,  status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"atividade",title:"TB – Lista de Revisão",   due:"08/06", weight:"Valor 1,0", points:1,  status:"fire",
      details:["🔥 AMANHÃ — realizada em sala de aula, dia 08/06"] },
    { type:"trabalho", title:"TB – Livro + Caderno",    due:"decorrer", weight:"Valor 4,0", points:4, status:"ongoing",
      details:["Livro: utilização, atividades, organização","Caderno: registro completo e legibilidade"] },
  ]},
  { id:"matematica", name:"Matemática", emoji:"➗", color:"#6366f1", items:[
    { type:"prova",    title:"AV2 – Prova",               due:"16/06", weight:"Peso 10,0", points:10, status:"pending",
      details:["Sistema de equações do 1º grau","Equação do 2º grau na forma ax² = b","Apostila pp. 13–26"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",     due:"10/06", weight:"Valor 5,0", points:5,  status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"atividade",title:"TB3 – Lista Online E-class", due:"11/06", weight:"Valor 2,0", points:2,  status:"urgent",
      details:["Cap. 5 — disponível no E-class de 08 a 11/06"] },
    { type:"trabalho", title:"TB1/TB2 – Caderno + Livro",  due:"decorrer", weight:"Valor 3,0", points:3, status:"ongoing",
      details:["TB1: Caderno de Exercícios (1,5) · TB2: Livro Didático (1,5)"] },
  ]},
  { id:"redacao", name:"Redação", emoji:"✍️", color:"#f43f5e", items:[
    { type:"prova",    title:"AV2 – Prova",            due:"12/06", weight:"Peso 10,0", points:10, status:"urgent",
      details:["Interpretação de texto","Relato de experiência e Produção colaborativa","Apostila pp. 2,3,6–9,18,19,22–24,31–33,35,36,43,46–48"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",  due:"10/06", weight:"Valor 5,0", points:5,  status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"trabalho", title:"TB – Atividades livro/caderno", due:"decorrer", weight:"Valor 2,0", points:2, status:"ongoing",
      details:["Todas as atividades solicitadas durante o bimestre"] },
  ]},
  { id:"religioso", name:"Ens. Religioso", emoji:"✝️", color:"#84cc16", items:[
    { type:"prova",    title:"AV2 – Prova",              due:"15/06", weight:"Peso 10,0", points:10, status:"pending",
      details:["Cap. 7 – O Profeta do Messias (O Chamado p.49; Retrato do Messias p.50)","Cap. 8 – Fiel longe de casa (Daniel p.55; Impérios Mundiais p.57)","Apostila pp. 47–57"] },
    { type:"projeto",  title:"AV3 – FIC Pré-Projeto",   due:"10/06", weight:"Valor 5,0", points:5,  status:"urgent",
      details:["Definição do tema, objetivos, metodologia e cronograma"] },
    { type:"trabalho", title:"TB – Caderno Exercícios (Caps.5–8)", due:"11/06", weight:"Valor 1,0 · 80%", points:1, status:"urgent",
      details:["Caps. 5,6,7,8 do Caderno de Exercícios","⚠️ 2ª data: 10/06 (8TA) ou 11/06 (8MA/MB) com 80%"] },
  ]},
];

const ST_CFG = {
  fire:    { label:"HOJE",      color:"#ef4444", pri:0 },
  urgent:  { label:"URGENTE",   color:"#f97316", pri:1 },
  check:   { label:"VERIFICAR", color:"#eab308", pri:2 },
  pending: { label:"PENDENTE",  color:"#3b82f6", pri:3 },
  ongoing: { label:"CONTÍNUO",  color:"#475569", pri:4 },
};
const T_ICON  = { prova:"📋", trabalho:"📁", projeto:"🗂️", atividade:"⚡" };
const T_LABEL = { prova:"PROVA", trabalho:"TRABALHO", projeto:"PROJETO", atividade:"ATIVIDADE" };

function dueBadge(due) {
  const d = daysDiff(due); if (d === null) return null;
  if (d < 0)  return { txt:`${Math.abs(d)}d atrás`, col:"#ef4444" };
  if (d === 0) return { txt:"HOJE!",    col:"#ef4444" };
  if (d === 1) return { txt:"Amanhã!",  col:"#f97316" };
  if (d <= 3)  return { txt:`em ${d}d`, col:"#f97316" };
  if (d <= 7)  return { txt:`em ${d}d`, col:"#eab308" };
  return        { txt:`em ${d}d`,       col:"#64748b" };
}

// All items with a real date, flattened
function allCalEvents() {
  return SUBJECTS.flatMap(s => s.items.map((it, i) => {
    const d = parseDate(it.due); if (!d) return null;
    return { key:ikey(s.id,i), sid:s.id, sname:s.name, semoji:s.emoji, scolor:s.color,
             title:it.title, due:it.due, date:d, type:it.type, status:it.status,
             weight:it.weight, points:it.points };
  }).filter(Boolean));
}

// ─── CONFETTI ─────────────────────────────────────────────────
function Confetti({ on }) {
  const ref = useRef();
  useEffect(() => {
    if (!on || !ref.current) return;
    const cv = ref.current, ctx = cv.getContext("2d");
    cv.width = cv.offsetWidth; cv.height = cv.offsetHeight;
    const P = Array.from({length:70}, () => ({
      x:Math.random()*cv.width, y:-10,
      vx:(Math.random()-0.5)*5, vy:Math.random()*4+2,
      r:Math.random()*5+2, c:`hsl(${Math.random()*360},90%,60%)`, life:1
    }));
    let raf;
    (function draw() {
      ctx.clearRect(0,0,cv.width,cv.height);
      P.forEach(p => {
        p.x+=p.vx; p.y+=p.vy; p.life-=0.012;
        ctx.globalAlpha=Math.max(0,p.life); ctx.fillStyle=p.c;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
      });
      if (P.some(p=>p.life>0)) raf = requestAnimationFrame(draw);
    })();
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,pointerEvents:"none",width:"100%",height:"100%",borderRadius:"inherit"}}/>;
}

// ─── WHATSAPP MESSAGE BUILDER ──────────────────────────────────
function buildWhatsAppMsg(done) {
  const todayDay = TODAY.getDay(); // 0=Sun
  const monday   = getMonday(TODAY);
  const sunday   = addDays(monday, 6);

  // Items due strictly in the future (>= today) and not done
  const pending = allCalEvents().filter(e => {
    if (done[e.key]) return false;
    const d = daysDiff(e.due);
    return d !== null && d >= 0;
  }).sort((a,b) => a.date - b.date);

  // Split: due today vs rest of week (tomorrow..sunday)
  const todayItems = pending.filter(e => sameDay(e.date, TODAY));
  const weekItems  = pending.filter(e => {
    return e.date > TODAY && e.date <= sunday;
  });
  // Beyond this week
  const laterItems = pending.filter(e => e.date > sunday);

  const todayStr = `${DIAS_FULL[TODAY.getDay()]}, ${TODAY.getDate()} de ${MESES[TODAY.getMonth()]}`;

  let msg = `📚 *Mapa Escolar — 8º Ano*\n`;
  msg += `📅 ${todayStr}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  if (todayItems.length) {
    msg += `🔥 *HOJE (${fmt(TODAY)})*\n`;
    todayItems.forEach(e => {
      msg += `${e.semoji} *${e.sname}* — ${e.title}\n`;
      msg += `   ${T_LABEL[e.type]} · ${e.weight}\n`;
    });
    msg += `\n`;
  }

  if (weekItems.length) {
    msg += `📆 *ESTA SEMANA*\n`;
    // group by date
    const byDate = {};
    weekItems.forEach(e => {
      const k = fmtISO(e.date);
      if (!byDate[k]) byDate[k] = [];
      byDate[k].push(e);
    });
    Object.entries(byDate).sort().forEach(([dk, evts]) => {
      const d = new Date(dk+"T00:00:00");
      const dayName = DIAS_FULL[d.getDay()];
      msg += `\n*${dayName} (${fmt(d)})*\n`;
      evts.forEach(e => {
        msg += `${e.semoji} *${e.sname}* — ${e.title}\n`;
        msg += `   ${T_LABEL[e.type]} · ${e.weight}\n`;
      });
    });
    msg += `\n`;
  }

  if (laterItems.length) {
    msg += `📋 *PRÓXIMAS SEMANAS*\n`;
    const byDate = {};
    laterItems.forEach(e => {
      const k = fmtISO(e.date);
      if (!byDate[k]) byDate[k] = [];
      byDate[k].push(e);
    });
    Object.entries(byDate).sort().forEach(([dk, evts]) => {
      const d = new Date(dk+"T00:00:00");
      msg += `\n*${fmt(d)}*\n`;
      evts.forEach(e => {
        msg += `${e.semoji} ${e.sname} — ${e.title} · ${e.weight}\n`;
      });
    });
    msg += `\n`;
  }

  const totalPending = pending.length;
  const doneCnt = allCalEvents().filter(e => done[e.key]).length;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `✅ ${doneCnt} concluído${doneCnt!==1?"s":""} · ⏳ ${totalPending} pendente${totalPending!==1?"s":""}\n`;
  msg += `_Enviado pelo Mapa Escolar 8º Ano_`;

  return msg;
}

function openWhatsApp(done) {
  const msg = buildWhatsAppMsg(done);
  const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────
function ChkBtn({ checked, onToggle, mt=0 }) {
  return (
    <button onClick={e=>{e.stopPropagation();onToggle();}}
      style={{width:22,height:22,borderRadius:6,border:`1.5px solid ${checked?"#22c55e":"#334155"}`,
        background:checked?"#22c55e":"transparent",cursor:"pointer",flexShrink:0,
        display:"flex",alignItems:"center",justifyContent:"center",transition:"all .18s",marginTop:mt}}>
      {checked && <span style={{fontSize:11,color:"#fff",lineHeight:1}}>✓</span>}
    </button>
  );
}

function Chip({ children, color, bg }) {
  return (
    <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:"2px 7px",borderRadius:20,
      fontSize:10,fontWeight:700,letterSpacing:".05em",background:bg||color+"22",
      color, border:`1px solid ${color}44`}}>
      {children}
    </span>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [st, setSt] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  });
  const done = st.done || {};

  function save(patch) {
    setSt(p => {
      const n = {...p, ...patch};
      localStorage.setItem(STORAGE_KEY, JSON.stringify(n));
      return n;
    });
  }
  function toggleDone(k, sid) {
    const next = {...done, [k]: !done[k]};
    save({done: next});
    const s = SUBJECTS.find(x => x.id === sid);
    if (s && s.items.every((_,i) => next[ikey(sid,i)])) {
      setCelebrate(sid); setTimeout(() => setCelebrate(null), 3200);
    }
  }

  const [view,      setView]      = useState("list");  // list | calendar | subject
  const [selSub,    setSelSub]    = useState(null);
  const [expItem,   setExpItem]   = useState(null);
  const [showAlrt,  setShowAlrt]  = useState(true);
  const [wkOff,     setWkOff]     = useState(0);
  const [filter,    setFilter]    = useState("Todos");
  const [celebrate, setCelebrate] = useState(null);
  const [toast,     setToast]     = useState(null);
  const [waPreview, setWaPreview] = useState(false);

  function showToast(m, dur=2800) { setToast(m); setTimeout(() => setToast(null), dur); }

  const subject = selSub ? SUBJECTS.find(s => s.id === selSub) : null;
  const events  = allCalEvents();

  // Calendar week
  const monday  = addDays(getMonday(TODAY), wkOff * 7);
  const wkDays  = Array.from({length:7}, (_,i) => addDays(monday, i));
  const wkLabel = `${fmt(monday)} – ${fmt(wkDays[6])}`;

  // Alerts: undone, due 0–4 days from today
  const alerts = SUBJECTS.flatMap(s => s.items.map((it,i) => {
    const k = ikey(s.id,i); if (done[k]) return null;
    const d = daysDiff(it.due); if (d === null || d < 0 || d > 4) return null;
    return {k, s, it, days:d};
  }).filter(Boolean)).sort((a,b) => a.days - b.days);

  // ── WHATSAPP PREVIEW MODAL ────────────────────────────────────
  if (waPreview) {
    const msg = buildWhatsAppMsg(done);
    return (
      <div style={BG}>
        <style>{CSS}</style>
        <div style={WRAP}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <button className="bbtn" onClick={() => setWaPreview(false)}>← Voltar</button>
            <div>
              <div style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:".1em",fontWeight:600}}>
                WhatsApp
              </div>
              <div style={{fontWeight:700,fontSize:15,color:"#f1f5f9"}}>Resumo das Atividades</div>
            </div>
          </div>

          {/* Preview bubble */}
          <div style={{background:"#1a1d27",border:"1px solid #252836",borderRadius:14,padding:16,marginBottom:16,
            fontFamily:"'DM Mono',monospace",fontSize:12,lineHeight:1.7,color:"#94a3b8",whiteSpace:"pre-wrap",
            maxHeight:380,overflowY:"auto"}}>
            {msg}
          </div>

          <div style={{fontSize:11,color:"#475569",marginBottom:16,textAlign:"center"}}>
            A mensagem será aberta no WhatsApp pronta para envio ao número <strong style={{color:"#25d366"}}>+55 (61) 99461-1414</strong>
          </div>

          <button onClick={() => { openWhatsApp(done); setWaPreview(false); }}
            style={{width:"100%",padding:"14px 0",borderRadius:13,background:"#25d366",border:"none",
              color:"#fff",fontWeight:700,fontSize:15,cursor:"pointer",display:"flex",
              alignItems:"center",justifyContent:"center",gap:10,fontFamily:"inherit",
              boxShadow:"0 4px 20px #25d36640",transition:"opacity .18s"}}>
            <span style={{fontSize:20}}>💬</span>
            Abrir no WhatsApp
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN ──────────────────────────────────────────────────────
  return (
    <div style={BG}>
      <style>{CSS}</style>

      {/* TOAST */}
      {toast && (
        <div className="fade-in" style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",
          background:"#1e2235",border:"1px solid #3d4559",borderRadius:12,padding:"10px 20px",
          fontSize:13,color:"#e2e8f0",zIndex:9999,maxWidth:340,textAlign:"center",
          boxShadow:"0 8px 32px #000a",whiteSpace:"nowrap"}}>
          {toast}
        </div>
      )}

      <div style={WRAP}>

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div>
              <div style={{fontSize:11,letterSpacing:".12em",color:"#475569",fontWeight:600,textTransform:"uppercase",marginBottom:2}}>
                Escola Adventista · Sobradinho
              </div>
              <h1 style={{fontSize:21,fontWeight:700,color:"#f1f5f9",letterSpacing:"-.02em"}}>
                8º Ano — 2º Bimestre
              </h1>
            </div>
            {/* WhatsApp button */}
            <button onClick={() => setWaPreview(true)}
              style={{background:"#25d366",border:"none",borderRadius:12,padding:"9px 13px",
                cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,
                boxShadow:"0 2px 12px #25d36630",transition:"opacity .18s"}}>
              <span style={{fontSize:20}}>💬</span>
              <span style={{fontSize:9,fontWeight:700,color:"#fff",letterSpacing:".05em"}}>RESUMO</span>
            </button>
          </div>

          {/* Tabs */}
          {view !== "subject" && (
            <div style={{display:"flex",gap:6}}>
              {[["list","📚 Matérias"],["calendar","📅 Calendário"]].map(([v,lbl]) => (
                <button key={v} className={`tabbtn ${view===v?"on":"off"}`} onClick={() => setView(v)}>
                  {lbl}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── ALERTS ─────────────────────────────────────────── */}
        {view !== "subject" && alerts.length > 0 && (
          <div style={{background:"linear-gradient(135deg,#1e1a2e,#1e2235)",border:"1px solid #ef444432",
            borderRadius:14,padding:14,marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",
              marginBottom:showAlrt?10:0}} onClick={() => setShowAlrt(v=>!v)}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span className={alerts.some(a=>a.days===0)?"pulse":""} style={{fontSize:15}}>🚨</span>
                <span style={{fontWeight:600,fontSize:13,color:"#fca5a5"}}>
                  {alerts.length} pendência{alerts.length>1?"s":""} urgente{alerts.length>1?"s":""}
                </span>
              </div>
              <span style={{color:"#475569",fontSize:11}}>{showAlrt?"▲":"▼"}</span>
            </div>
            {showAlrt && (
              <div className="fade-in" style={{display:"flex",flexDirection:"column",gap:6}}>
                {alerts.map(({k,s,it,days},i) => (
                  <div key={i} style={{background:"#0f1117",border:"1px solid #252836",borderRadius:10,
                    padding:"9px 12px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}
                    onClick={() => {setSelSub(s.id);setView("subject");setExpItem(null);}}>
                    <span style={{fontSize:17}}>{s.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{it.title}</div>
                      <div style={{fontSize:10,color:"#64748b"}}>{s.name} · {it.due}</div>
                    </div>
                    <div style={{fontSize:11,fontWeight:700,
                      color:days===0?"#ef4444":days<=2?"#f97316":"#eab308",flexShrink:0}}>
                      {days===0?"HOJE":days===1?"Amanhã":`${days}d`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            LIST VIEW
        ══════════════════════════════════════════════════════ */}
        {view === "list" && (
          <div className="fade-in">
            {/* Filter chips */}
            <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
              {["Todos","Provas","Trabalhos","Urgentes"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{padding:"5px 13px",borderRadius:99,fontSize:12,fontWeight:600,
                    cursor:"pointer",flexShrink:0,fontFamily:"inherit",transition:"all .18s",
                    background:filter===f?"#6366f1":"#1e2235",
                    color:filter===f?"#fff":"#64748b",
                    border:`1px solid ${filter===f?"#6366f1":"#252836"}`}}>
                  {f}
                </button>
              ))}
            </div>

            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {SUBJECTS.map(s => {
                const visible = s.items.map((it,i) => ({it,i})).filter(({it,i}) => {
                  if (filter==="Provas")    return it.type==="prova";
                  if (filter==="Trabalhos") return it.type!=="prova" && it.type!=="projeto";
                  if (filter==="Urgentes")  return !done[ikey(s.id,i)] && (it.status==="fire"||it.status==="urgent");
                  return true;
                });
                if (!visible.length) return null;
                const total   = s.items.length;
                const doneCnt = s.items.filter((_,i) => done[ikey(s.id,i)]).length;
                const urgCnt  = s.items.filter((it,i) => !done[ikey(s.id,i)] && (it.status==="fire"||it.status==="urgent")).length;
                const allDone = doneCnt === total;
                return (
                  <div key={s.id} style={{position:"relative",overflow:"hidden"}}>
                    {celebrate===s.id && <Confetti on={true}/>}
                    <div className="card" style={{padding:"12px 14px",cursor:"pointer",position:"relative",overflow:"hidden"}}
                      onClick={() => {setSelSub(s.id);setView("subject");setExpItem(null);}}>
                      <div style={{position:"absolute",top:0,left:0,width:3,height:"100%",background:s.color,borderRadius:"14px 0 0 14px"}}/>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingLeft:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:9}}>
                          <span style={{fontSize:19}}>{s.emoji}</span>
                          <div>
                            <div style={{fontWeight:600,fontSize:14,color:allDone?"#475569":"#f1f5f9"}}>{s.name}</div>
                            <div style={{fontSize:11,color:"#475569"}}>{doneCnt}/{total} concluído{doneCnt!==1?"s":""}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:44,height:4,background:"#252836",borderRadius:99,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${(doneCnt/total)*100}%`,
                              background:s.color,borderRadius:99,transition:"width .4s"}}/>
                          </div>
                          {urgCnt>0 && (
                            <span style={{background:"#ef4444",color:"#fff",borderRadius:99,fontSize:9,fontWeight:700,padding:"1px 6px"}}>
                              {urgCnt}
                            </span>
                          )}
                          {allDone && <span style={{color:"#22c55e",fontSize:14}}>✓</span>}
                          <span style={{color:"#334155",fontSize:14}}>›</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            CALENDAR VIEW
        ══════════════════════════════════════════════════════ */}
        {view === "calendar" && (
          <div className="fade-in">
            {/* Week nav */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <button className="bbtn" onClick={() => setWkOff(v=>v-1)}>‹</button>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",fontFamily:"'DM Mono'"}}>{wkLabel}</div>
                {wkOff===0 && <div style={{fontSize:10,color:"#6366f1",fontWeight:600,marginTop:1}}>semana atual</div>}
              </div>
              <button className="bbtn" onClick={() => setWkOff(v=>v+1)}>›</button>
            </div>

            {/* Week: items grouped by day */}
            {(() => {
              // collect events for this week
              const wkEvts = events.filter(e => wkDays.some(d => sameDay(d, e.date)));
              const hasAny  = wkEvts.length > 0;

              if (!hasAny) return (
                <div style={{textAlign:"center",color:"#334155",padding:"40px 0",fontSize:14}}>
                  Nenhum evento nesta semana
                </div>
              );

              return (
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  {wkDays.map((day, di) => {
                    const isToday   = sameDay(day, TODAY);
                    const isWE      = di >= 5;
                    const dayEvts   = events.filter(e => sameDay(e.date, day)).sort((a,b) => ST_CFG[a.status].pri - ST_CFG[b.status].pri);
                    const pendEvts  = dayEvts.filter(e => !done[e.key]);
                    const doneEvts  = dayEvts.filter(e =>  done[e.key]);

                    if (!dayEvts.length && !isToday) return null; // hide empty days

                    return (
                      <div key={di} style={{marginBottom:8}}>
                        {/* Day label */}
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,marginTop:4}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"center",
                            width:32,height:32,borderRadius:"50%",flexShrink:0,
                            background:isToday?"#6366f1":"#1e2235",
                            border:`1px solid ${isToday?"#6366f1":isWE?"#1e2235":"#252836"}`}}>
                            <span style={{fontSize:13,fontWeight:700,
                              color:isToday?"#fff":isWE?"#334155":"#64748b"}}>
                              {day.getDate()}
                            </span>
                          </div>
                          <div>
                            <span style={{fontSize:13,fontWeight:600,
                              color:isToday?"#a5b4fc":isWE?"#334155":"#94a3b8"}}>
                              {DIAS_FULL[day.getDay()]}
                            </span>
                            {isToday && <span style={{fontSize:10,color:"#6366f1",fontWeight:700,marginLeft:6}}>HOJE</span>}
                          </div>
                          {dayEvts.length>0 && (
                            <div style={{marginLeft:"auto",fontSize:10,color:"#475569"}}>
                              {doneEvts.length}/{dayEvts.length} ✓
                            </div>
                          )}
                        </div>

                        {/* Events for this day */}
                        {dayEvts.length === 0
                          ? <div style={{paddingLeft:40,fontSize:12,color:"#252836",fontStyle:"italic"}}>Sem atividades</div>
                          : <div style={{display:"flex",flexDirection:"column",gap:5,paddingLeft:40}}>
                              {dayEvts.map((e, i) => {
                                const isDone = done[e.key];
                                return (
                                  <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 12px",
                                    background:isDone?"#111318":"#1a1d27",
                                    border:`1px solid ${isDone?"#1e2235":"#252836"}`,
                                    borderLeft:`3px solid ${isDone?"#334155":e.scolor}`,
                                    borderRadius:10,transition:"all .18s"}}>
                                    <ChkBtn checked={isDone} onToggle={() => toggleDone(e.key, e.sid)}/>
                                    <div style={{flex:1,opacity:isDone?.45:1}}>
                                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                                        <span style={{fontSize:12,fontWeight:600,color:e.scolor}}>{e.semoji} {e.sname}</span>
                                        <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:99,
                                          background:e.scolor+"20",color:e.scolor}}>
                                          {T_LABEL[e.type]}
                                        </span>
                                      </div>
                                      <div style={{fontSize:13,color:"#e2e8f0",fontWeight:500,
                                        textDecoration:isDone?"line-through":"none"}}>
                                        {e.title}
                                      </div>
                                      <div style={{fontSize:10,color:"#475569",marginTop:1}}>{e.weight}</div>
                                    </div>
                                    <button style={{background:"transparent",border:"none",color:"#475569",
                                      fontSize:13,cursor:"pointer",padding:"4px 6px"}}
                                      onClick={() => {setSelSub(e.sid);setView("subject");setExpItem(null);}}>›</button>
                                  </div>
                                );
                              })}
                            </div>
                        }
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Contínuos */}
            <div style={{marginTop:16}}>
              <div style={{fontSize:11,color:"#334155",letterSpacing:".1em",textTransform:"uppercase",
                fontWeight:600,marginBottom:8}}>
                Atividades contínuas (sem data fixa)
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {SUBJECTS.flatMap(s => s.items.map((it,i) => ({it,i,s}))).filter(({it}) => it.due==="decorrer").map(({it,i,s},idx) => {
                  const k = ikey(s.id,i), isDone = done[k];
                  return (
                    <div key={idx} style={{display:"flex",alignItems:"center",gap:9,padding:"8px 12px",
                      background:"#141720",border:"1px solid #1e2235",
                      borderLeft:`3px solid ${isDone?"#334155":s.color}`,
                      borderRadius:10,opacity:isDone?.5:1}}>
                      <ChkBtn checked={isDone} onToggle={() => toggleDone(k, s.id)}/>
                      <div style={{flex:1}}>
                        <span style={{fontSize:12,fontWeight:600,color:s.color,marginRight:6}}>{s.emoji} {s.name}</span>
                        <span style={{fontSize:12,color:isDone?"#475569":"#94a3b8",textDecoration:isDone?"line-through":"none"}}>
                          {it.title}
                        </span>
                      </div>
                      <span style={{fontSize:10,color:"#334155"}}>{it.weight}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SUBJECT DETAIL VIEW
        ══════════════════════════════════════════════════════ */}
        {view === "subject" && subject && (
          <div className="fade-in" style={{position:"relative"}}>
            {celebrate===subject.id && <Confetti on={true}/>}

            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
              <button className="bbtn" onClick={() => {setView("list");setExpItem(null);}}>← Voltar</button>
              <span style={{fontSize:21}}>{subject.emoji}</span>
              <span style={{fontWeight:700,fontSize:18,color:"#f1f5f9"}}>{subject.name}</span>
            </div>

            {/* Progress bar */}
            {(() => {
              const total = subject.items.length;
              const dc    = subject.items.filter((_,i) => done[ikey(subject.id,i)]).length;
              return (
                <div style={{marginBottom:18}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                    <span style={{fontSize:11,color:"#475569"}}>Progresso</span>
                    <span style={{fontSize:11,fontWeight:600,color:dc===total?"#22c55e":"#64748b"}}>
                      {dc}/{total} concluído{dc!==1?"s":""}
                    </span>
                  </div>
                  <div style={{height:5,background:"#252836",borderRadius:99,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${(dc/total)*100}%`,background:subject.color,
                      borderRadius:99,transition:"width .4s"}}/>
                  </div>
                </div>
              );
            })()}

            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {[...subject.items.map((it,i) => ({it,i}))].sort((a,b) => ST_CFG[a.it.status].pri - ST_CFG[b.it.status].pri).map(({it,i}) => {
                const k      = ikey(subject.id, i);
                const isDone = done[k];
                const stc    = ST_CFG[it.status];
                const badge  = dueBadge(it.due);
                const isExp  = expItem === i;

                return (
                  <div key={i} style={{background:isDone?"#141720":"#1e2235",
                    border:`1px solid ${isExp?"#3d4559":"#252836"}`,
                    borderRadius:12,padding:"12px 14px",transition:"all .18s"}}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <ChkBtn checked={isDone} onToggle={() => toggleDone(k, subject.id)} mt={2}/>

                      <div style={{flex:1,cursor:"pointer"}} onClick={() => setExpItem(isExp?null:i)}>
                        {/* Badges */}
                        <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:5,flexWrap:"wrap"}}>
                          {isDone
                            ? <Chip color="#22c55e">✓ FEITO</Chip>
                            : <Chip color={stc.color}>{stc.label}</Chip>
                          }
                          <Chip color="#475569" bg="#252836">{T_ICON[it.type]} {T_LABEL[it.type]}</Chip>
                        </div>
                        {/* Title */}
                        <div style={{fontWeight:600,fontSize:14,
                          color:isDone?"#475569":"#e2e8f0",
                          textDecoration:isDone?"line-through":"none",marginBottom:3}}>
                          {it.title}
                        </div>
                        {/* Meta */}
                        <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                          <span style={{fontSize:11,color:"#475569",fontFamily:"'DM Mono'"}}>
                            📅 {it.due==="decorrer"?"No decorrer":it.due==="verificar"?"Verificar":it.due}
                          </span>
                          {badge && !isDone && <span style={{fontSize:11,fontWeight:700,color:badge.col}}>{badge.txt}</span>}
                          <span style={{fontSize:11,color:"#334155"}}>· {it.weight}</span>
                        </div>
                      </div>

                      <span style={{color:"#334155",fontSize:14,marginTop:4,cursor:"pointer",
                        transition:"transform .2s",transform:isExp?"rotate(90deg)":"none"}}
                        onClick={() => setExpItem(isExp?null:i)}>›</span>
                    </div>

                    {/* Expanded details */}
                    {isExp && !isDone && (
                      <div className="fade-in" style={{marginTop:12,paddingTop:12,borderTop:"1px solid #252836"}}>
                        <div style={{fontSize:10,color:"#475569",letterSpacing:".1em",textTransform:"uppercase",
                          fontWeight:600,marginBottom:8}}>
                          Detalhes / Conteúdo
                        </div>
                        {it.details.map((d,di) => (
                          <div key={di} style={{padding:"5px 0",borderBottom:"1px solid #1a1d27",
                            fontSize:13,color:"#94a3b8",display:"flex",alignItems:"flex-start",gap:8}}>
                            <div style={{width:6,height:6,borderRadius:"50%",background:subject.color,
                              opacity:.7,marginTop:5,flexShrink:0}}/>
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{marginTop:36,textAlign:"center",fontSize:10,color:"#1e2235"}}>
          Mapa de Notas · 2º Bimestre 2026
        </div>
      </div>
    </div>
  );
}

// ─── CONSTANTS ────────────────────────────────────────────────
const BG   = { fontFamily:"'DM Sans','Segoe UI',sans-serif", background:"#0f1117", minHeight:"100vh", color:"#e2e8f0" };
const WRAP = { maxWidth:540, margin:"0 auto", padding:"20px 16px 52px" };
const CSS  = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-track{background:#1a1d27}
::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}
.card{background:#1a1d27;border:1px solid #252836;border-radius:14px;transition:border-color .18s}
.card:hover{border-color:#3d4559}
.tabbtn{padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:all .18s;letter-spacing:.02em;font-family:inherit}
.tabbtn.on{background:#1e2235;color:#f1f5f9;border:1px solid #3d4559}
.tabbtn.off{background:transparent;color:#475569;border:1px solid transparent}
.tabbtn.off:hover{color:#94a3b8}
.bbtn{background:#1e2235;border:1px solid #252836;border-radius:10px;padding:8px 14px;cursor:pointer;color:#94a3b8;font-size:13px;transition:all .18s;display:inline-flex;align-items:center;gap:6px;font-family:inherit}
.bbtn:hover{border-color:#3d4559;color:#e2e8f0}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}.pulse{animation:pulse 2s infinite}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn .22s ease-out}
`;
