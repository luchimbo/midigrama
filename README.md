# MIDIGrama — Centro de Operaciones Diario

App interna para que cada integrante del equipo cargue sus tareas del día, emita un reporte
y quede registrado en la **bitácora**. **Cada día arranca vacío automáticamente** (el reseteo se
calcula al abrir la app — no depende de ningún cron, así que nunca falla ni "se saltea" un lunes).

## Cómo funciona el reseteo diario

No hay job programado. Al iniciar sesión, la app mira la fecha de hoy (hora Argentina):
- Si ya cargaste algo **hoy**, seguís donde dejaste.
- Si es un **día nuevo**, las tareas arrancan vacías. Lo del día anterior ya quedó guardado en la
  bitácora (tabla `reports`), así que no se pierde nada.

## Stack

- HTML / CSS / JavaScript vanilla (sin build step).
- **Supabase** (Postgres) como base de datos compartida.
- Deploy estático en Vercel.

## Puesta en marcha

### 1. Crear el proyecto en Supabase
1. Entrá a https://supabase.com y creá un proyecto gratis.
2. En el panel: **SQL Editor → New query**, pegá el contenido de [`supabase/schema.sql`](supabase/schema.sql)
   y dale **Run**. Eso crea las tablas `daily_state` y `reports`.
3. Andá a **Project Settings → API** y copiá:
   - **Project URL**
   - **anon public** key

### 2. Conectar la app
Editá [`config.js`](config.js) y pegá los dos valores:

```js
window.SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
window.SUPABASE_ANON_KEY = "eyJ...";
```

> Mientras estén vacíos, la app corre en **modo local** (guarda solo en tu navegador, sin BD
> compartida). Sirve para probar la UI, pero cada persona vería sus propios datos.

### 3. Probar localmente
```bash
npx http-server -p 8000 -c-1
```
Abrí http://localhost:8000 e iniciá sesión con un PIN.

### 4. Deploy en Vercel
Subí la carpeta a un repo y conectalo en https://vercel.com, o usá `vercel` CLI.
No hace falta configurar nada más (no hay backend ni cron).

## Usuarios (PIN)

| Usuario | PIN | Área |
|---|---|---|
| Fede | 1478 | Marketing |
| Joaco | 2589 | Administrativo / Comex |
| Lucio | 3690 | Agentización |
| Camilo | 7412 | Logística |
| Ivan | 8523 | Técnica |
| Joaquito | 9630 | Ventas |
| Dani | 3108 | Encargado (manager) |
| Guillermo | 0813 | CEO (manager) |

Los usuarios y tareas se editan en [`data.js`](data.js).
`dani` y `guillermo` son managers: ven la bitácora completa y el **Control de Calidad**.
