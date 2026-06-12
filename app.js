// ============================================================
//  MIDIGrama — Lógica de la app (vanilla JS)
//  Reseteo diario "on-open": cada día arranca del template vacío.
// ============================================================

const MANAGERS = window.MANAGER_IDS || ["dani", "guillermo"];

// ---------- Estado en memoria ----------
let currentUser = null;     // clon del template con estado dinámico del día
let currentDay = null;      // "YYYY-MM-DD" (hora Argentina)
let activeTab = "tareas";
let freqFilter = "Todos";
let pinTarget = null;
let saveTimer = null;
let emittedToday = false;     // ¿ya emitió reporte hoy?
let remindedToday = false;    // ¿ya se mostró el recordatorio de las 17:30?
let reminderTimer = null;

const REMINDER_MINUTES = 17 * 60 + 30; // 17:30

// ---------- Utilidades de fecha ----------
function argDate() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
}
function pad(n) { return String(n).padStart(2, "0"); }
function dayKey(d = argDate()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function displayDate(d = argDate()) { return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`; }
function dayKeyToDisplay(key) {
  if (!key) return "";
  const [y, m, dd] = key.split("-");
  return `${dd}/${m}/${y.slice(-2)}`;
}
function nowTime() { const d = argDate(); return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; }

// ---------- Helpers DOM ----------
const $ = sel => document.querySelector(sel);
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function escapeHtml(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function linkify(text) {
  return escapeHtml(text).replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}
function initials(name) { return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(); }

function toast(msg, type = "ok") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `toast ${type}`;
  setTimeout(() => t.classList.add("hidden"), 3200);
}

// ============================================================
//  LOGIN
// ============================================================
function renderLogin() {
  $("#login-screen").classList.remove("hidden");
  $("#app-screen").classList.add("hidden");
  $("#pin-pad").classList.add("hidden");
  $("#user-grid").classList.remove("hidden");

  const grid = $("#user-grid");
  grid.innerHTML = "";
  orgData.forEach(u => {
    const b = el("button", "user-btn");
    b.innerHTML = `<span class="avatar">${initials(u.name)}</span>
      <span><span class="u-name">${escapeHtml(u.name)}</span><br><span class="u-area">${escapeHtml(u.area)}</span></span>`;
    b.onclick = () => openPinPad(u);
    grid.appendChild(b);
  });

  const badge = $("#mode-badge");
  badge.textContent = DB.mode === "supabase" ? "● Base de datos conectada" : "● Modo local (sin BD compartida)";
}

function openPinPad(user) {
  pinTarget = user;
  $("#user-grid").classList.add("hidden");
  $("#pin-pad").classList.remove("hidden");
  $("#pin-user-name").textContent = user.name;
  const input = $("#pin-input");
  input.value = "";
  // solo dígitos, máximo 4
  input.oninput = () => { input.value = input.value.replace(/\D/g, "").slice(0, 4); };
  setTimeout(() => input.focus(), 50);
}

function submitPin() {
  const input = $("#pin-input");
  const value = input.value.trim();
  if (value.length !== 4) { toast("El PIN tiene 4 dígitos", "warn"); input.focus(); return; }
  if (value === pinTarget.pin) {
    login(pinTarget);
  } else {
    toast("PIN incorrecto", "err");
    input.value = "";
    input.focus();
  }
}

$("#pin-form").onsubmit = (e) => { e.preventDefault(); submitPin(); };
$("#pin-back").onclick = () => openLoginGrid();
function openLoginGrid() {
  $("#pin-pad").classList.add("hidden");
  $("#user-grid").classList.remove("hidden");
}

// ============================================================
//  CARGA DEL DÍA (reseteo on-open)
// ============================================================
function freshUserClone(template) {
  const u = JSON.parse(JSON.stringify(template));
  u.tasks.forEach(t => {
    t.completed = false;
    t.notes = "";
    t.reviewStatus = null;
    t.reviewComment = "";
    if (t.isCategory) {
      (t.subtasks || []).forEach(s => { s.completed = false; s.notes = ""; });
      t.otrosText = "";
    }
  });
  u.extras = [];
  return u;
}

function applySavedState(user, saved) {
  if (!saved || !Array.isArray(saved.tasks)) return;
  const byId = {};
  saved.tasks.forEach(s => { byId[s.id] = s; });
  user.tasks.forEach(t => {
    const s = byId[t.id];
    if (!s) return;
    t.completed = !!s.completed;
    t.notes = s.notes || "";
    t.reviewStatus = s.reviewStatus || null;
    t.reviewComment = s.reviewComment || "";
    if (t.isCategory && Array.isArray(s.subtasks)) {
      t.subtasks.forEach(sub => {
        const ss = s.subtasks.find(x => x.name === sub.name);
        if (ss) { sub.completed = !!ss.completed; sub.notes = ss.notes || ""; }
      });
      t.otrosText = s.otrosText || "";
    }
  });
  user.novedades = Array.isArray(saved.novedades) ? saved.novedades.slice() : [];
  user.extras = Array.isArray(saved.extras) ? saved.extras.map(e => ({ ...e })) : [];
}

function serializeState(user) {
  return {
    tasks: user.tasks.map(t => ({
      id: t.id,
      completed: !!t.completed,
      notes: t.notes || "",
      reviewStatus: t.reviewStatus || null,
      reviewComment: t.reviewComment || "",
      subtasks: t.isCategory ? (t.subtasks || []).map(s => ({ name: s.name, completed: !!s.completed, notes: s.notes || "" })) : undefined,
      otrosText: t.isCategory ? (t.otrosText || "") : undefined
    })),
    novedades: user.novedades || [],
    extras: (user.extras || []).map(e => ({ text: e.text || "", notes: e.notes || "" }))
  };
}

// Arrastra tareas rechazadas (no resueltas) del último día previo: reaparecen
// pendientes, con el comentario del manager, hasta que se aprueben.
function carryOverRejections(user, prev) {
  if (!prev || !Array.isArray(prev.tasks)) return false;
  const byId = {};
  prev.tasks.forEach(s => { byId[s.id] = s; });
  let carried = false;
  user.tasks.forEach(t => {
    const s = byId[t.id];
    if (s && s.reviewStatus === "rejected") {
      t.reviewStatus = "rejected";
      t.reviewComment = s.reviewComment || "";
      t.notes = s.notes || "";   // mostrar lo que se había escrito
      t.completed = false;        // queda pendiente de corregir
      carried = true;
    }
  });
  return carried;
}

// Construye las tareas de un reporte a partir de un daily_state guardado
// (usa el template de orgData para los nombres). Reutiliza la misma lógica
// que buildReportTasks pero leyendo de un estado persistido.
function buildReportTasksFromState(template, state) {
  const byId = {};
  template.tasks.forEach(t => { byId[t.id] = t; });
  const out = [];
  (state.tasks || []).forEach(s => {
    const tmpl = byId[s.id];
    if (!tmpl) return;
    if (tmpl.isCategory) {
      const subsDone = (s.subtasks || []).filter(x => x.completed);
      const hasNotes = s.notes && s.notes.trim();
      const hasOtros = s.otrosText && s.otrosText.trim();
      if (subsDone.length || hasNotes || hasOtros) {
        let detail = subsDone.map(x => x.notes ? `${x.name}: ${x.notes}` : x.name).join(" | ");
        if (hasNotes) detail = (detail ? detail + " | " : "") + s.notes.trim();
        if (hasOtros) detail += (detail ? ` (+Otros: ${s.otrosText.trim()})` : `Otros: ${s.otrosText.trim()}`);
        out.push({ name: tmpl.name, notes: detail, sourceTaskId: tmpl.id, reviewStatus: s.reviewStatus || null, reviewComment: s.reviewComment || "" });
      }
    } else if (s.completed) {
      out.push({ name: tmpl.name, notes: (s.notes || "").trim(), sourceTaskId: tmpl.id, reviewStatus: s.reviewStatus || null, reviewComment: s.reviewComment || "" });
    }
  });
  (state.extras || []).forEach(ex => {
    if (ex.text && ex.text.trim()) {
      out.push({ name: ex.text.trim(), notes: (ex.notes || "").trim(), sourceTaskId: null, reviewStatus: null, reviewComment: "" });
    }
  });
  return out;
}

// Cierre automático: archiva en la bitácora cualquier día anterior con trabajo
// cargado que no haya sido emitido. Se dispara al abrir la app un día nuevo,
// así nadie pierde lo que escribió aunque se haya olvidado de emitir.
async function autoArchivePreviousDays() {
  try {
    const states = await DB.loadStatesBefore(currentDay);
    if (!states.length) return;
    const reports = await DB.loadReports({});
    const archived = new Set(reports.map(r => `${r.user_id}|${r.day}`));
    for (const st of states) {
      if (archived.has(`${st.user_id}|${st.day}`)) continue;
      const tmpl = orgData.find(u => u.id === st.user_id);
      if (!tmpl) continue;
      const tasks = buildReportTasksFromState(tmpl, st);
      const novedades = Array.isArray(st.novedades) ? st.novedades : [];
      if (!tasks.length && !novedades.length) continue;
      const report = {
        id: `${st.user_id}-${st.day}-auto`,
        user_id: st.user_id,
        user_name: tmpl.name,
        area: tmpl.area,
        day: st.day,
        timestamp: "cierre automático",
        timestamp_ms: Date.now(),
        tasks,
        novedades
      };
      await DB.saveReport(report);
      archived.add(`${st.user_id}|${st.day}`);
    }
  } catch (e) { console.error("autoArchivePreviousDays:", e); }
}

async function login(template) {
  currentDay = dayKey();
  await autoArchivePreviousDays(); // cierra/archiva días anteriores sin emitir
  const user = freshUserClone(template);
  user.novedades = [];
  try {
    const saved = await DB.loadDailyState(user.id, currentDay);
    if (saved) {
      applySavedState(user, saved); // ya trabajó hoy: seguimos donde dejó
    } else {
      // Día nuevo: arranca vacío, pero arrastramos rechazos sin resolver.
      const prev = await DB.loadLatestStateBefore(user.id, currentDay);
      if (carryOverRejections(user, prev)) {
        try { await DB.saveDailyState(user.id, currentDay, serializeState(user)); } catch (e) {}
      }
    }
  } catch (e) {
    toast("No se pudo cargar el día. Revisá la conexión.", "err");
  }
  currentUser = user;
  activeTab = "tareas";
  emittedToday = false;
  startReminder();
  $("#login-screen").classList.add("hidden");
  $("#app-screen").classList.remove("hidden");
  renderApp();
}

function logout() {
  currentUser = null;
  clearInterval(reminderTimer);
  renderLogin();
}
$("#logout-btn").onclick = logout;

// ============================================================
//  PERSISTENCIA AUTOMÁTICA
// ============================================================
function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { await DB.saveDailyState(currentUser.id, currentDay, serializeState(currentUser)); }
    catch (e) { /* silencioso; ya se loguea en db.js */ }
  }, 600);
}

// ============================================================
//  SHELL (topbar + tabs)
// ============================================================
function renderApp() {
  $("#current-user-chip").textContent = `${currentUser.name} · ${currentUser.area}`;
  $("#today-label").textContent = "📅 " + dayKeyToDisplay(currentDay);

  const tabs = [
    { id: "tareas", label: "Tareas del día" },
    { id: "bitacora", label: "Bitácora" },
    { id: "general", label: "Vista general" },
  ];
  if (MANAGERS.includes(currentUser.id)) tabs.push({ id: "calidad", label: "Control de Calidad" });

  const nav = $("#tabs");
  nav.innerHTML = "";
  tabs.forEach(t => {
    const b = el("button", "tab" + (t.id === activeTab ? " active" : ""), t.label);
    b.onclick = () => { activeTab = t.id; renderApp(); };
    nav.appendChild(b);
  });

  if (activeTab === "tareas") renderTareas();
  else if (activeTab === "bitacora") renderBitacora();
  else if (activeTab === "general") renderGeneral();
  else if (activeTab === "calidad") renderCalidad();
}

// ============================================================
//  VISTA: TAREAS DEL DÍA
// ============================================================
const FREQS = ["Todos", "Diario", "Semanal", "Mensual", "Esporádico"];
function freqMatches(taskFreq, filter) {
  if (filter === "Todos") return true;
  if (filter === "Mensual") return /Mensual|Anual/.test(taskFreq);
  return taskFreq === filter;
}

function renderTareas() {
  const c = $("#view-container");
  c.innerHTML = "";
  c.appendChild(el("h2", "view-title", "Tareas del día"));
  c.appendChild(el("p", "view-sub", "Marcá lo que hiciste y agregá el detalle. Al otro día arranca vacío y lo de hoy queda en la bitácora."));

  // filtro
  const filter = el("div", "freq-filter");
  FREQS.forEach(f => {
    const ch = el("button", "chip" + (f === freqFilter ? " active" : ""), f);
    ch.onclick = () => { freqFilter = f; renderTareas(); };
    filter.appendChild(ch);
  });
  c.appendChild(filter);

  // novedades
  c.appendChild(renderNovedadesBox());

  // tareas
  const visible = currentUser.tasks.filter(t => freqMatches(t.frequency, freqFilter));
  if (!visible.length) c.appendChild(el("div", "empty-state", "No hay tareas para este filtro."));
  visible.forEach(t => c.appendChild(renderTaskCard(t)));

  // tareas extra
  c.appendChild(renderExtrasBox());

  // barra emitir
  const done = currentUser.tasks.filter(t => {
    if (t.isCategory) return (t.subtasks || []).some(s => s.completed) || !!(t.otrosText && t.otrosText.trim());
    return t.completed;
  }).length;
  const bar = el("div", "emit-bar glass");
  bar.appendChild(el("span", "progress-text", `✅ ${done} de ${currentUser.tasks.length} tareas marcadas`));
  const emit = el("button", "btn-primary", "Emitir reporte del día");
  emit.onclick = emitirReporte;
  bar.appendChild(emit);
  c.appendChild(bar);
}

function renderNovedadesBox() {
  const box = el("div", "novedades-box glass");
  box.appendChild(el("h3", null, "📌 Novedades / extraordinarios de hoy"));
  const row = el("div", "nov-input-row");
  const input = el("input");
  input.placeholder = "Ej: Se cortó la luz 2 horas...";
  input.onkeydown = e => { if (e.key === "Enter") addNov(); };
  const add = el("button", "btn-ghost", "Agregar");
  function addNov() {
    const v = input.value.trim();
    if (!v) return;
    currentUser.novedades.push(v);
    input.value = "";
    scheduleSave();
    renderTareas();
  }
  add.onclick = addNov;
  row.appendChild(input); row.appendChild(add);
  box.appendChild(row);

  const list = el("ul", "nov-list");
  (currentUser.novedades || []).forEach((n, i) => {
    const li = el("li", null, `<span>${escapeHtml(n)}</span>`);
    const del = el("button", "del", "×");
    del.onclick = () => { currentUser.novedades.splice(i, 1); scheduleSave(); renderTareas(); };
    li.appendChild(del);
    list.appendChild(li);
  });
  box.appendChild(list);
  return box;
}

function renderExtrasBox() {
  const box = el("div", "novedades-box glass");
  box.appendChild(el("h3", null, "➕ Tareas extra / observaciones"));
  const row = el("div", "nov-input-row");
  const input = el("input");
  input.placeholder = "Ej: Reunión con proveedor, revisión de presupuesto...";
  input.onkeydown = e => { if (e.key === "Enter") addExtra(); };
  const add = el("button", "btn-ghost", "Agregar");
  function addExtra() {
    const v = input.value.trim();
    if (!v) return;
    currentUser.extras = currentUser.extras || [];
    currentUser.extras.push({ text: v, notes: "" });
    input.value = "";
    scheduleSave();
    renderTareas();
  }
  add.onclick = addExtra;
  row.appendChild(input); row.appendChild(add);
  box.appendChild(row);

  (currentUser.extras || []).forEach((ex, i) => {
    const item = el("div", "extra-item");
    const top = el("div", "extra-top");
    const lbl = el("span", "extra-text", escapeHtml(ex.text));
    const del = el("button", "del", "×");
    del.onclick = () => { currentUser.extras.splice(i, 1); scheduleSave(); renderTareas(); };
    top.appendChild(lbl); top.appendChild(del);
    item.appendChild(top);
    const notes = el("input", "subtask-note");
    notes.type = "text";
    notes.placeholder = "Detalle / observaciones...";
    notes.value = ex.notes || "";
    notes.oninput = () => { ex.notes = notes.value; scheduleSave(); };
    item.appendChild(notes);
    box.appendChild(item);
  });
  return box;
}

function renderTaskCard(task) {
  const card = el("div", "task-card glass");
  const head = el("div", "task-head");

  if (!task.isCategory) {
    const chk = el("input", "task-check");
    chk.type = "checkbox";
    chk.checked = !!task.completed;
    chk.onchange = () => { task.completed = chk.checked; scheduleSave(); renderTareas(); };
    head.appendChild(chk);
  } else {
    head.appendChild(el("span", null, "📂"));
  }

  const main = el("div", "task-main");
  let nameHtml = `<span class="task-name ${task.completed ? "done" : ""}">${escapeHtml(task.name)}</span>
    <span class="freq-tag freq-${escapeHtml(task.frequency)}">${escapeHtml(task.frequency)}</span>`;
  if (task.reviewStatus === "rejected") nameHtml += `<span class="review-badge review-rejected">Rechazada</span>`;
  if (task.reviewStatus === "approved") nameHtml += `<span class="review-badge review-approved">Aprobada</span>`;
  main.innerHTML = `<div>${nameHtml}</div>`;
  if (task.reviewComment) main.appendChild(el("div", "review-comment", "↳ " + escapeHtml(task.reviewComment)));
  if (task.guide) main.appendChild(el("div", "task-guide", linkify(task.guide)));

  if (task.isCategory) {
    const subs = el("div", "subtasks");
    (task.subtasks || []).forEach(sub => {
      const row = el("div", "subtask");
      const top = el("label", "subtask-top");
      const sc = el("input"); sc.type = "checkbox"; sc.checked = !!sub.completed;
      sc.onchange = () => { sub.completed = sc.checked; scheduleSave(); renderTareas(); };
      top.appendChild(sc);
      top.appendChild(el("span", null, escapeHtml(sub.name)));
      row.appendChild(top);
      // campo de texto propio de cada subtarea
      const sn = el("input", "subtask-note");
      sn.type = "text";
      sn.placeholder = `Detalle de ${sub.name}...`;
      sn.value = sub.notes || "";
      sn.oninput = () => { sub.notes = sn.value; scheduleSave(); };
      row.appendChild(sn);
      subs.appendChild(row);
    });
    main.appendChild(subs);

    // campo "Otros" para cosas que no están en la lista
    const otrosBox = el("div", "otros-box");
    otrosBox.appendChild(el("label", "otros-label", "➕ Otros"));
    const ot = el("input", "subtask-note");
    ot.type = "text";
    ot.placeholder = "Agregá otra cosa que hayas hecho...";
    ot.value = task.otrosText || "";
    ot.oninput = () => { task.otrosText = ot.value; scheduleSave(); };
    otrosBox.appendChild(ot);
    main.appendChild(otrosBox);
  } else {
    // tareas normales: una sola nota general
    const notes = el("textarea", "task-notes");
    notes.placeholder = "Detalle / observaciones...";
    notes.value = task.notes || "";
    notes.oninput = () => { task.notes = notes.value; scheduleSave(); };
    main.appendChild(notes);
  }

  head.appendChild(main);
  card.appendChild(head);
  return card;
}

// ============================================================
//  EMITIR REPORTE
// ============================================================
function buildReportTasks(user) {
  const out = [];
  user.tasks.forEach(t => {
    if (t.isCategory) {
      const subsDone = (t.subtasks || []).filter(s => s.completed);
      const hasNotes = t.notes && t.notes.trim();
      const hasOtros = t.otrosText && t.otrosText.trim();
      if (subsDone.length || hasNotes || hasOtros) {
        let detail = subsDone.map(s => s.notes ? `${s.name}: ${s.notes}` : s.name).join(" | ");
        if (hasNotes) detail = (detail ? detail + " | " : "") + t.notes.trim();
        if (hasOtros) detail += (detail ? ` (+Otros: ${t.otrosText.trim()})` : `Otros: ${t.otrosText.trim()}`);
        out.push({ name: t.name, notes: detail, sourceTaskId: t.id, reviewStatus: t.reviewStatus || null, reviewComment: t.reviewComment || "" });
      }
    } else if (t.completed) {
      out.push({ name: t.name, notes: (t.notes || "").trim(), sourceTaskId: t.id, reviewStatus: t.reviewStatus || null, reviewComment: t.reviewComment || "" });
    }
  });
  (user.extras || []).forEach(ex => {
    if (ex.text && ex.text.trim()) {
      out.push({ name: ex.text.trim(), notes: (ex.notes || "").trim(), sourceTaskId: null, reviewStatus: null, reviewComment: "" });
    }
  });
  return out;
}

function emitirReporte() {
  const tasks = buildReportTasks(currentUser);
  const novedades = currentUser.novedades || [];
  if (!tasks.length && !novedades.length) {
    toast("No marcaste ninguna tarea ni novedad todavía.", "warn");
    return;
  }
  // tareas marcadas sin detalle
  const sinDetalle = tasks.filter(t => !t.notes);
  showConfirmModal(tasks, novedades, sinDetalle);
}

function showConfirmModal(tasks, novedades, sinDetalle) {
  const root = $("#modal-root");
  const overlay = el("div", "modal-overlay");
  const modal = el("div", "modal glass");
  modal.appendChild(el("h2", null, "Confirmar reporte del día"));
  modal.appendChild(el("p", "view-sub", `${displayDate()} · ${currentUser.name}`));

  if (sinDetalle.length) {
    modal.appendChild(el("p", "review-comment",
      `⚠ ${sinDetalle.length} tarea(s) marcadas sin detalle: ${sinDetalle.map(t => t.name).join(", ")}. Igual podés enviar.`));
  }

  const ul = el("ul");
  tasks.forEach(t => ul.appendChild(el("li", null, `<strong>${escapeHtml(t.name)}</strong>${t.notes ? " — " + escapeHtml(t.notes) : ""}`)));
  novedades.forEach(n => ul.appendChild(el("li", null, `📌 ${escapeHtml(n)}`)));
  modal.appendChild(ul);

  const actions = el("div", "modal-actions");
  const cancel = el("button", "btn-ghost", "Cancelar");
  cancel.onclick = () => root.innerHTML = "";
  const confirm = el("button", "btn-primary", "Confirmar y enviar");
  confirm.onclick = () => { root.innerHTML = ""; procesarEnvio(tasks, novedades); };
  actions.appendChild(cancel); actions.appendChild(confirm);
  modal.appendChild(actions);

  overlay.appendChild(modal);
  overlay.onclick = e => { if (e.target === overlay) root.innerHTML = ""; };
  root.appendChild(overlay);
}

async function procesarEnvio(tasks, novedades) {
  // ¿ya hay reporte de hoy para este usuario? -> mergeamos
  let existing = null;
  try {
    const reps = await DB.loadReports({ day: currentDay, userId: currentUser.id });
    existing = reps[0] || null;
  } catch (e) { /* ignore */ }

  const report = existing || {
    id: `${currentUser.id}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    user_id: currentUser.id,
    user_name: currentUser.name,
    area: currentUser.area,
    day: currentDay,
    tasks: [],
    novedades: []
  };
  if (!Array.isArray(report.tasks)) report.tasks = [];
  if (!Array.isArray(report.novedades)) report.novedades = [];

  // merge por sourceTaskId
  tasks.forEach(nt => {
    const idx = report.tasks.findIndex(rt => rt.sourceTaskId && nt.sourceTaskId
      ? rt.sourceTaskId === nt.sourceTaskId : rt.name === nt.name);
    if (idx !== -1) report.tasks[idx] = { ...report.tasks[idx], ...nt };
    else report.tasks.push(nt);
  });
  novedades.forEach(n => { if (!report.novedades.includes(n)) report.novedades.push(n); });

  report.timestamp = nowTime();
  report.timestamp_ms = Date.now();

  try {
    await DB.saveReport(report);
    await DB.saveDailyState(currentUser.id, currentDay, serializeState(currentUser));
    emittedToday = true;
    toast("Reporte emitido ✔ — quedó en la bitácora", "ok");
    activeTab = "bitacora";
    renderApp();
  } catch (e) {
    toast("Error al enviar el reporte. Revisá la conexión.", "err");
  }
}

// ============================================================
//  VISTA: BITÁCORA
// ============================================================
async function renderBitacora() {
  const c = $("#view-container");
  c.innerHTML = "";
  c.appendChild(el("h2", "view-title", "Bitácora"));
  const isManager = MANAGERS.includes(currentUser.id);
  c.appendChild(el("p", "view-sub", isManager
    ? "Historial de reportes de todo el equipo."
    : "Tu historial de reportes diarios."));

  let reports = [];
  try { reports = await DB.loadReports(isManager ? {} : { userId: currentUser.id }); }
  catch (e) { c.appendChild(el("div", "empty-state", "No se pudo cargar la bitácora.")); return; }

  if (!reports.length) { c.appendChild(el("div", "empty-state", "Todavía no hay reportes.")); return; }

  // agrupar por día
  const byDay = {};
  reports.forEach(r => { (byDay[r.day] = byDay[r.day] || []).push(r); });
  Object.keys(byDay).sort().reverse().forEach(day => {
    c.appendChild(el("h3", "view-sub", "🗓 " + dayKeyToDisplay(day)));
    byDay[day].forEach(r => c.appendChild(renderReportCard(r)));
  });
}

function renderReportCard(r) {
  const card = el("div", "report-card glass");
  const head = el("div", "report-head");
  head.appendChild(el("span", "avatar", initials(r.user_name || "?")));
  const meta = el("div", "report-meta");
  meta.innerHTML = `<div class="report-user">${escapeHtml(r.user_name || "")} <span class="u-area">${escapeHtml(r.area || "")}</span></div>
    <div class="report-time">${escapeHtml(r.timestamp || "")}</div>`;
  head.appendChild(meta);
  card.appendChild(head);

  const ul = el("ul", "report-tasks");
  (r.tasks || []).forEach(t => {
    let badge = "";
    if (t.reviewStatus === "rejected") badge = ' <span class="review-badge review-rejected">Rechazada</span>';
    if (t.reviewStatus === "approved") badge = ' <span class="review-badge review-approved">Aprobada</span>';
    ul.appendChild(el("li", null,
      `<span class="t-name">${escapeHtml(t.name)}${badge}</span>` +
      (t.notes ? `<span class="t-notes">${linkify(t.notes)}</span>` : "") +
      (t.reviewComment ? `<span class="t-notes review-comment">↳ ${escapeHtml(t.reviewComment)}</span>` : "")));
  });
  card.appendChild(ul);

  (r.novedades || []).forEach(n => card.appendChild(el("span", "nov-tag", "📌 " + escapeHtml(n))));
  return card;
}

// ============================================================
//  VISTA: GENERAL (progreso del equipo hoy)
// ============================================================
async function renderGeneral() {
  const c = $("#view-container");
  c.innerHTML = "";
  c.appendChild(el("h2", "view-title", "Vista general — " + dayKeyToDisplay(currentDay)));
  c.appendChild(el("p", "view-sub", "Progreso de cada área en el día de hoy y quién ya emitió su reporte."));

  let states = [], reports = [];
  try {
    states = await DB.loadAllDailyStates(currentDay);
    reports = await DB.loadReports({ day: currentDay });
  } catch (e) { c.appendChild(el("div", "empty-state", "No se pudo cargar la vista general.")); return; }

  const stateById = {}; states.forEach(s => stateById[s.user_id] = s);
  const sentIds = new Set(reports.map(r => r.user_id));

  orgData.forEach(u => {
    const s = stateById[u.id];
    const total = u.tasks.length;
    let done = 0;
    if (s && Array.isArray(s.tasks)) {
      done = s.tasks.filter(t => t.completed).length;
    }
    const pct = total ? Math.round((done / total) * 100) : 0;
    const row = el("div", "ov-row glass");
    row.appendChild(el("span", "ov-name", `<span class="avatar" style="width:28px;height:28px;flex:0 0 28px;font-size:12px;">${initials(u.name)}</span> ${escapeHtml(u.name)}`));
    row.appendChild(el("span", "ov-area", escapeHtml(u.area)));
    const bar = el("div", "ov-bar"); bar.appendChild(el("div")); bar.firstChild.style.width = pct + "%";
    row.appendChild(bar);
    row.appendChild(el("span", "ov-pct", `${done}/${total}`));
    row.appendChild(el("span", "ov-status " + (sentIds.has(u.id) ? "sent" : "pending"),
      sentIds.has(u.id) ? "✔ Emitió" : "⏳ Pendiente"));
    c.appendChild(row);
  });
}

// ============================================================
//  VISTA: CONTROL DE CALIDAD (managers)
// ============================================================
async function renderCalidad() {
  const c = $("#view-container");
  c.innerHTML = "";
  c.appendChild(el("h2", "view-title", "Control de Calidad"));
  c.appendChild(el("p", "view-sub", "Revisá y aprobá (o rechazá) las tareas reportadas hoy por el equipo."));

  let reports = [];
  try { reports = await DB.loadReports({ day: currentDay }); }
  catch (e) { c.appendChild(el("div", "empty-state", "No se pudo cargar.")); return; }

  reports = reports.filter(r => r.user_id !== currentUser.id);
  if (!reports.length) { c.appendChild(el("div", "empty-state", "Todavía nadie emitió reporte hoy.")); return; }

  reports.forEach(r => {
    const card = el("div", "report-card glass");
    card.appendChild(el("div", "report-user", `${escapeHtml(r.user_name)} · ${escapeHtml(r.area)} — ${escapeHtml(r.timestamp || "")}`));
    const ul = el("ul", "report-tasks");
    (r.tasks || []).forEach((t, i) => {
      const li = el("li");
      let badge = "";
      if (t.reviewStatus === "rejected") badge = ' <span class="review-badge review-rejected">Rechazada</span>';
      if (t.reviewStatus === "approved") badge = ' <span class="review-badge review-approved">Aprobada</span>';
      li.innerHTML = `<span class="t-name">${escapeHtml(t.name)}${badge}</span>` +
        (t.notes ? `<span class="t-notes">${linkify(t.notes)}</span>` : "") +
        (t.reviewComment ? `<span class="t-notes review-comment">↳ ${escapeHtml(t.reviewComment)}</span>` : "");
      const actions = el("div", "modal-actions");
      actions.style.marginTop = "8px";
      const ok = el("button", "btn-ghost", "✔ Aprobar");
      ok.onclick = () => reviewTask(r, i, "approved");
      const no = el("button", "btn-ghost", "✖ Rechazar");
      no.onclick = () => {
        const comment = prompt("Comentario para el rechazo (qué corregir):", t.reviewComment || "");
        if (comment !== null) reviewTask(r, i, "rejected", comment);
      };
      actions.appendChild(ok); actions.appendChild(no);
      li.appendChild(actions);
      ul.appendChild(li);
    });
    card.appendChild(ul);
    c.appendChild(card);
  });
}

async function reviewTask(report, taskIndex, status, comment = "") {
  report.tasks[taskIndex].reviewStatus = status;
  report.tasks[taskIndex].reviewComment = comment;
  try {
    await DB.saveReport(report);
    // reflejar en el estado del día del usuario (si todavía es hoy)
    const sourceId = report.tasks[taskIndex].sourceTaskId;
    if (sourceId) {
      const saved = await DB.loadDailyState(report.user_id, report.day);
      if (saved && Array.isArray(saved.tasks)) {
        const st = saved.tasks.find(x => x.id === sourceId);
        if (st) {
          st.reviewStatus = status; st.reviewComment = comment;
          await DB.saveDailyState(report.user_id, report.day, saved);
        }
      }
    }
    toast(status === "approved" ? "Tarea aprobada" : "Tarea rechazada", status === "approved" ? "ok" : "warn");
    renderCalidad();
  } catch (e) { toast("No se pudo guardar la revisión.", "err"); }
}

// ============================================================
//  RECORDATORIO 17:30 ("emitir antes de irse")
// ============================================================
function userHasWork() {
  if (!currentUser) return false;
  const tasksDone = currentUser.tasks.some(t =>
    t.completed || (t.isCategory && (t.subtasks || []).some(s => s.completed)) || (t.notes && t.notes.trim()));
  return tasksDone || (currentUser.novedades || []).length > 0;
}

function checkReminder() {
  if (!currentUser || remindedToday || emittedToday) return;
  const d = argDate();
  const mins = d.getHours() * 60 + d.getMinutes();
  if (mins >= REMINDER_MINUTES && mins < 23 * 60 + 59 && userHasWork()) {
    remindedToday = true;
    showReminderModal();
  }
}

function startReminder() {
  clearInterval(reminderTimer);
  remindedToday = false;
  reminderTimer = setInterval(checkReminder, 60 * 1000); // revisa cada minuto
}

function showReminderModal() {
  const root = $("#modal-root");
  if (root.querySelector(".modal-overlay")) return; // no encimar
  const overlay = el("div", "modal-overlay");
  const modal = el("div", "modal glass");
  modal.appendChild(el("h2", null, "⏰ Antes de irte"));
  modal.appendChild(el("p", "view-sub",
    "Son más de las 17:30 y todavía no emitiste tu reporte del día. ¿Lo emitís ahora así queda en la bitácora?"));
  const actions = el("div", "modal-actions");
  const later = el("button", "btn-ghost", "Después");
  later.onclick = () => { root.innerHTML = ""; };
  const now = el("button", "btn-primary", "Emitir reporte ahora");
  now.onclick = () => { root.innerHTML = ""; activeTab = "tareas"; renderApp(); emitirReporte(); };
  actions.appendChild(later); actions.appendChild(now);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  overlay.onclick = e => { if (e.target === overlay) root.innerHTML = ""; };
  root.appendChild(overlay);
}

// ============================================================
//  ARRANQUE
// ============================================================
renderLogin();
