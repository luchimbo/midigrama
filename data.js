const orgData = [
  {
    id: "fede",
    name: "Fede",
    pin: "1478",
    area: "Marketing",
    tasks: [
      { 
        id: "f2", 
        name: "Redes", 
        frequency: "Diario", 
        lastDone: "", 
        notes: "", 
        completed: false,
        isCategory: true,
        guide: "IG/FB/TikTok: Subir Reels de unboxing, demos cortas y responder comentarios. Editar en CapCut (max 40-60 seg, subtítulos, gancho en primeros 3 seg). Mínimo 1 video/semana. Usar GPT Marketing Pro Studio para guiones. Google Maps: Responder reseñas y fotos del local.",
        subtasks: [
          { name: "Facebook", completed: false },
          { name: "Instagram", completed: false },
          { name: "TikTok", completed: false },
          { name: "YouTube", completed: false }
        ],
        otrosText: ""
      },
      { 
        id: "f12", 
        name: "Boletines electrónicos", 
        frequency: "Semanal", 
        lastDone: "", 
        notes: "", 
        completed: false, 
        guide: "Newsletter vía Perfit. Piezas para lanzamientos y campañas (Reyes, Hot Sale, etc). Links a Tiendanube (revisar que funcionen). NO poner precios. Lista de mails: se exporta de TN una vez al mes." 
      },
      { 
        id: "f5", 
        name: "Publicidad FB", 
        frequency: "Esporádico", 
        lastDone: "", 
        notes: "", 
        completed: false,
        guide: "Meta Ads (IG/FB). Impacto visual y conversión. Presupuesto: ~$10.000/día. Apuntar a perfil de IG para ofertas generales o a pcmidi.com.ar para productos específicos. Público: Entrenado y afines a la página."
      },
      { 
        id: "f4", 
        name: "Mejorar publicaciones", 
        frequency: "Esporádico", 
        lastDone: "", 
        notes: "", 
        completed: false,
        guide: "Auditoría de catálogo. Corregir garantías, descripciones y fotos. Optimizar SEO usando GEOMODI."
      },
      { 
        id: "f8", 
        name: "Destacados de TN", 
        frequency: "Semanal", 
        lastDone: "", 
        notes: "", 
        completed: false,
        guide: "Cambiar semanalmente. Usar productos con urgencia (Promociones Masivas en MODI) y descuentos. Siempre deben ser 8 productos."
      },
      { 
        id: "f3", 
        name: "Publicaciones nuevas", 
        frequency: "Esporádico", 
        lastDone: "", 
        notes: "", 
        completed: false, 
        guide: "Manual de Marca: https://drive.google.com/drive/folders/14i6MZAhMnI6OY8Nl_XDFHA2Iyz6VSxls?usp=sharing | Subir fotos/descripciones según SKU (TN/ML). ML: Placa marca en 2da posición; placas ubicación/empresa al final. Títulos optimizados y preventa si no hay stock. Arturia Drive: https://drive.google.com/drive/u/0/folders/16rqWoI824XpOS6BmAm8FboleOOnnSAPE" 
      },
      { id: "f7", name: "MKT Arturia", frequency: "Esporádico", lastDone: "", notes: "", completed: false, guide: "Se tiene una reunion mensual con Gaba de Arturia para controlar el Shared to do List que es el siguiente sheets con tareas mensuales que nos dice Arturia que tenemos que cumplir: https://docs.google.com/spreadsheets/d/1_rHwIUhiFh5GZMp76tQY3I8B_aQxpgdqfrTyToAl314/edit?gid=2008487064#gid=2008487064" },
      { 
        id: "f11", 
        name: "Influencers", 
        frequency: "Esporádico", 
        lastDone: "", 
        notes: "", 
        completed: false,
        guide: "Coordinar acciones. Ofrecer software Arturia (Shared List) para abaratar costos a cambio de videos. Si hay equipos físicos, gestionar notas de crédito con proveedores. Verificar etiquetas y cumplimiento de contenido."
      },
      { 
        id: "f9", 
        name: "Contacto con Marketing de Proveedores", 
        frequency: "Mensual/Periódica", 
        lastDone: "", 
        notes: "", 
        completed: false,
        guide: "Relación con marcas (Arturia, Gaba, etc). Reunión mensual con Arturia para 'Shared to do List': https://docs.google.com/spreadsheets/d/1_rHwIUhiFh5GZMp76tQY3I8B_aQxpgdqfrTyToAl314/edit?gid=2008487064 | Solicitar assets, lanzamientos globales y co-branding."
      },
      { 
        id: "f1", 
        name: "Diseño de imágenes", 
        frequency: "Mensual/Periódica", 
        lastDone: "", 
        notes: "", 
        completed: false, 
        guide: "Soporte visual: placas redes, banners ML (Navidad, etc), flyers eventos. Respetar Manual de Marca y colores pcmidi." 
      },
      { id: "f13", name: "Diseño gráfico (banners, folletos)", frequency: "Mensual/Periódica", lastDone: "", notes: "", completed: false },
      { 
        id: "f6", 
        name: "Publi. Revistas", 
        frequency: "Mensual/Periódica", 
        lastDone: "", 
        notes: "", 
        completed: false,
        guide: "Revistas (Todo Guitarra, Goldar). Contacto: Luis Mojoli (Recorplay). Decidir producto (usualmente nuevo) y coordinar con Guille si se repite diseño."
      },
      { 
        id: "f10", 
        name: "Reportes de Marketing", 
        frequency: "Esporádico", 
        lastDone: "", 
        notes: "", 
        completed: false,
        guide: "Presentaciones de fin de año. Métricas de alcance, piezas creadas, eventos (Workshops) y repercusión en ventas."
      },
      { id: "f14", name: "Ventas 2", frequency: "Semanal", lastDone: "", notes: "", completed: false, guide: "Apoyo a Ventas cuando este necesite colaboración en atención mostrador o cuando se encuentre desarrollando otra tarea (descargas, ir a depósito, etc)." },
      { id: "f15", name: "Mercado ads", frequency: "Semanal", lastDone: "", notes: "", completed: false },
    ]
  },
  {
    id: "joaco",
    name: "Joaco",
    pin: "2589",
    area: "Administrativo / Comex",
    tasks: [
      { id: "ja1", name: "Apertura y cierre", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "ja2", name: "Flujo de caja", frequency: "Diario", lastDone: "", notes: "", completed: false, guide: "Mantener la planilla estrictamente actualizada." },
      { id: "ja3", name: "Denuncias Publicaciones ML", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "ja4", name: "Transferencias internacionales", frequency: "Mensual", lastDone: "", notes: "", completed: false, guide: "Según Ale no se hace más." },
      { id: "ja5", name: "Planilla de Costos", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "ja6", name: "Control stock", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "ja7", name: "Poner fecha de llegada de productos en MODI", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "ja8", name: "Compra de Insumos y fuentes", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "ja9", name: "Pasar facturas de compras al contabilium y pagos (automatizar)", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { 
        id: "ja10", 
        name: "Pago de servicios, alquileres, etc.", 
        frequency: "Mensual", 
        resetPolicy: "monthly",
        lastDone: "", 
        notes: "", 
        completed: false,
        isCategory: true,
        subtasks: [
          { name: "Alquiler local", completed: false },
          { name: "ABL local", completed: false },
          { name: "Edesur local", completed: false },
          { name: "Aysa", completed: false },
          { name: "Expensas", completed: false },
          { name: "Movistar (teléfono fijo)", completed: false },
          { name: "Personal Hogar (internet)", completed: false },
          { name: "Alquiler deposito", completed: false },
          { name: "ABL deposito 60%", completed: false },
          { name: "Edesur deposito", completed: false },
          { name: "Inacap", completed: false },
          { name: "Faecys", completed: false },
          { name: "Sec", completed: false },
          { name: "La estrella", completed: false },
          { name: "VEP 931", completed: false },
          { name: "VEP Autonomos", completed: false },
          { name: "Contadora", completed: false },
          { name: "Juancito", completed: false }
        ],
        otrosText: ""
      },
      { id: "ja11", name: "Envio de Facturas ML, resumenes de tarjeta, resumen banco...", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "ja12", name: "Ingreso y Control costos mercaderia Local", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "ja13", name: "Revisar contracargos de Mercadopago", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "ja14", name: "Control de planillas de viajes de logisticas", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "ja15", name: "Reelevamiento de Activos y pasivos", frequency: "Anual", lastDone: "", notes: "", completed: false },
      { id: "ja16", name: "Registro de Marcas", frequency: "Anual", lastDone: "", notes: "", completed: false },
      { id: "ja17", name: "Dominios", frequency: "Anual", lastDone: "", notes: "", completed: false },
    ]
  },
  {
    id: "lucio", name: "Lucio", pin: "3690", area: "Agentización",
    tasks: [
      { id: "l2", name: "Agentizacion por medio de bots IA", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { 
        id: "l3", 
        name: "PCM Tour", 
        frequency: "Mensual", 
        lastDone: "", 
        notes: "", 
        completed: false,
        guide: "Evento mensual en escuela/institución. Coordinar showroom para estudiantes. Llevar listado de productos para control, stickers y llaveros." 
      },
      { 
        id: "l4", 
        name: "Desarrollo de Aplicaciones", 
        frequency: "Diario", 
        lastDone: "", 
        notes: "", 
        completed: false,
        isCategory: true,
        subtasks: [
          { name: "Predikpedia", completed: false, notes: "" },
          { name: "Geomodi", completed: false, notes: "" }
        ],
        otrosText: ""
      }
    ]
  },
  {
    id: "camilo", name: "Camilo", pin: "7412", area: "Logística",
    tasks: [
      { id: "c1", name: "Etiquetado especial", frequency: "Diario", lastDone: "", notes: "", completed: false, guide: "Revisar generación de etiquetas e interactuar con MS." },
      { id: "c2", name: "Orden de depósitos", frequency: "Diario", lastDone: "", notes: "", completed: false, guide: "Impresión etiquetas (colecta y flex)." },
      { id: "c3", name: "Pedido de insumos", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "c4", name: "Control stock fuentes", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "c5", name: "Coordinación de Envíos", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "c6", name: "Empaquetado", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "c7", name: "Vidriera (no dejar que falten productos adelante)", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "c8", name: "Preparar full", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "c9", name: "Traspasos de depòsito", frequency: "Mensual", lastDone: "", notes: "", completed: false },
    ]
  },
  {
    id: "ivan", name: "Ivan", pin: "8523", area: "Técnica",
    tasks: [
      { id: "i1", name: "Reclamos", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "i2", name: "Whatsapp y mail soporte", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "i3", name: "Contacto proveedores (repuestos)", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "i4", name: "Reparaciones de equipos", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "i5", name: "Testear baterias, fuentes, etc.", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "i6", name: "Procesar ingresos de productos a soporte", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "i7", name: "Mantenimiento de los locales", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "i9", name: "Bicicletero", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "i10", name: "Exhibición", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "i11", name: "Controlar envios (colecta, flex, etc)", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "i12", name: "Envío de licencias", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "i13", name: "Desarme de Baterias y kits", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "i14", name: "Completar pendiente tecnico", frequency: "Diario", lastDone: "", notes: "", completed: false },
    ]
  },
  {
    id: "joaquito", name: "Joaquito", pin: "9630", area: "Ventas",
    tasks: [
      { id: "j1", name: "Mensajería ML", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j2", name: "Responder preguntas Cybermercado", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j3", name: "Ideas de Campañas", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "j4", name: "Caja", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j5", name: "Full", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "j6", name: "Teléfono", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j7", name: "Control de Boletines", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "j8", name: "Procesar devoluciones", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j9", name: "Responder Mails Ventas", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j10", name: "Control de Sincronización", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j11", name: "Responder mensajes instagram", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j12", name: "Controlar publicaciones activas", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "j13", name: "Agregar productos al TOP", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "j14", name: "Whatsapp Ventas", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j15", name: "Control de publicaciones nuevas", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "j16", name: "Preventas", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "j17", name: "Atencion mostrador", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j18", name: "Cotizacion (KIMI)", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "j19", name: "Adwords", frequency: "Semanal", lastDone: "", notes: "", completed: false },
    ]
  },
  {
    id: "dani", name: "Dani", pin: "3108", area: "Encargado",
    tasks: [
      { id: "d1", name: "Compras locales e internacionales", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "d2", name: "Control de ingresos mercaderia Importada", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "d3", name: "NAMM", frequency: "Anual", lastDone: "", notes: "", completed: false },
      { id: "d4", name: "Distribución y control de Tareas", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "d5", name: "Contacto con proveedores", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "d6", name: "Gestion de tramites varios", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "d7", name: "Control de Puntualidad", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "d8", name: "Búsquedas laborales", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "d9", name: "Control transferencias y pagos", frequency: "Semanal", lastDone: "", notes: "", completed: false },
      { id: "d10", name: "Planificar los desafíos mensuales", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "d11", name: "Controlar transferir sueldos", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "d12", name: "Planilla balance mensual Comex", frequency: "Mensual", lastDone: "", notes: "", completed: false },
    ]
  },
  {
    id: "guillermo", name: "Guillermo", pin: "0813", area: "CEO",
    tasks: [
      { id: "g1", name: "Flujo de Caja", frequency: "Diario", lastDone: "", notes: "", completed: false },
      { id: "g2", name: "Contratos alquiler firma y control", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "g3", name: "Seguridad: cámaras y alarmas", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "g4", name: "Atencion de Reclamos Legales", frequency: "Mensual", lastDone: "", notes: "", completed: false },
      { id: "g5", name: "Banco: efectivo", frequency: "Diario", lastDone: "", notes: "", completed: false },
    ]
  }
];

// Definiciones fijas de usuarios y tareas (template). El estado dinámico del día
// y los reportes se guardan en Supabase (ver db.js). Estas definiciones son el
// "molde" del que arranca cada día vacío.
window.orgData = orgData;

// Managers que pueden ver Control de Calidad / Vista General completa.
window.MANAGER_IDS = ["dani", "guillermo"];
