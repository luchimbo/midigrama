// ============================================================
//  CAPA DE ACCESO A DATOS
// ============================================================
// Usa Supabase si hay credenciales en config.js.
// Si no, cae a MODO LOCAL (localStorage) para poder probar la UI
// sin base de datos. La interfaz pública es la misma en ambos casos:
//
//   DB.loadDailyState(userId, day)        -> { tasks, novedades } | null
//   DB.saveDailyState(userId, day, state) -> Promise
//   DB.saveReport(report)                 -> Promise
//   DB.loadReports({ day, userId })       -> [reports]
//   DB.loadAllDailyStates(day)            -> [{ user_id, tasks, novedades }]
//   DB.mode                               -> "supabase" | "local"
// ============================================================

const DB = (() => {
  const hasCreds = !!(window.SUPABASE_URL && window.SUPABASE_ANON_KEY);
  let client = null;

  if (hasCreds && window.supabase && typeof window.supabase.createClient === "function") {
    client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  }

  const mode = client ? "supabase" : "local";

  // ---------- Helpers MODO LOCAL ----------
  const LS_STATE = "midigrama_daily_state"; // { "userId|day": {tasks, novedades} }
  const LS_REPORTS = "midigrama_reports";   // [report]

  function lsRead(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }
  function lsWrite(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // ---------- API ----------
  async function loadDailyState(userId, day) {
    if (mode === "local") {
      const all = lsRead(LS_STATE, {});
      return all[`${userId}|${day}`] || null;
    }
    const { data, error } = await client
      .from("daily_state")
      .select("tasks, novedades")
      .eq("user_id", userId)
      .eq("day", day)
      .maybeSingle();
    if (error) { console.error("loadDailyState:", error); throw error; }
    return data || null;
  }

  // Estado más reciente ANTERIOR a 'day' (para arrastrar tareas rechazadas).
  async function loadLatestStateBefore(userId, day) {
    if (mode === "local") {
      const all = lsRead(LS_STATE, {});
      const rows = Object.entries(all)
        .filter(([k]) => k.startsWith(`${userId}|`))
        .map(([k, v]) => ({ day: k.split("|")[1], tasks: v.tasks, novedades: v.novedades }))
        .filter(r => r.day < day)
        .sort((a, b) => b.day.localeCompare(a.day));
      return rows[0] || null;
    }
    const { data, error } = await client
      .from("daily_state")
      .select("day, tasks, novedades")
      .eq("user_id", userId)
      .lt("day", day)
      .order("day", { ascending: false })
      .limit(1);
    if (error) { console.error("loadLatestStateBefore:", error); throw error; }
    return (data && data[0]) || null;
  }

  // Todos los estados de días ANTERIORES a 'day' (para auto-archivar en bitácora).
  async function loadStatesBefore(day) {
    if (mode === "local") {
      const all = lsRead(LS_STATE, {});
      return Object.entries(all)
        .map(([k, v]) => ({ user_id: k.split("|")[0], day: k.split("|")[1], tasks: v.tasks, novedades: v.novedades }))
        .filter(r => r.day < day);
    }
    const { data, error } = await client
      .from("daily_state")
      .select("user_id, day, tasks, novedades")
      .lt("day", day);
    if (error) { console.error("loadStatesBefore:", error); throw error; }
    return data || [];
  }

  async function loadAllDailyStates(day) {
    if (mode === "local") {
      const all = lsRead(LS_STATE, {});
      return Object.entries(all)
        .filter(([k]) => k.endsWith(`|${day}`))
        .map(([k, v]) => ({ user_id: k.split("|")[0], tasks: v.tasks, novedades: v.novedades }));
    }
    const { data, error } = await client
      .from("daily_state")
      .select("user_id, tasks, novedades")
      .eq("day", day);
    if (error) { console.error("loadAllDailyStates:", error); throw error; }
    return data || [];
  }

  async function saveDailyState(userId, day, state) {
    const payload = {
      user_id: userId,
      day,
      tasks: state.tasks || [],
      novedades: state.novedades || [],
      updated_at: new Date().toISOString()
    };
    if (mode === "local") {
      const all = lsRead(LS_STATE, {});
      all[`${userId}|${day}`] = { tasks: payload.tasks, novedades: payload.novedades };
      lsWrite(LS_STATE, all);
      return;
    }
    const { error } = await client
      .from("daily_state")
      .upsert(payload, { onConflict: "user_id,day" });
    if (error) { console.error("saveDailyState:", error); throw error; }
  }

  async function saveReport(report) {
    if (mode === "local") {
      const all = lsRead(LS_REPORTS, []);
      const idx = all.findIndex(r => r.id === report.id);
      if (idx !== -1) all[idx] = report; else all.push(report);
      lsWrite(LS_REPORTS, all);
      return;
    }
    const { error } = await client
      .from("reports")
      .upsert(report, { onConflict: "id" });
    if (error) { console.error("saveReport:", error); throw error; }
  }

  async function loadReports({ day = null, userId = null } = {}) {
    if (mode === "local") {
      let all = lsRead(LS_REPORTS, []);
      if (day) all = all.filter(r => r.day === day);
      if (userId) all = all.filter(r => r.user_id === userId);
      return all.sort((a, b) => (b.timestamp_ms || 0) - (a.timestamp_ms || 0));
    }
    let q = client.from("reports").select("*").order("timestamp_ms", { ascending: false });
    if (day) q = q.eq("day", day);
    if (userId) q = q.eq("user_id", userId);
    const { data, error } = await q;
    if (error) { console.error("loadReports:", error); throw error; }
    return data || [];
  }

  return { mode, loadDailyState, loadLatestStateBefore, loadStatesBefore, loadAllDailyStates, saveDailyState, saveReport, loadReports };
})();

window.DB = DB;
