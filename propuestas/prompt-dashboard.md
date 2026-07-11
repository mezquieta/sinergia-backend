# Prompt: Suite de dashboards de negocio "Sinergia Panel"

Prompt detallado para construir la suite de dashboards inspirada en las 6 secciones
(Ejecutivo, Ventas, Financiero, Marketing, Equipo/RRHH, Objetivos). Copiar y pegar
completo en Claude Code / Fable.

---

Construye "Sinergia Panel", una suite de dashboards de negocio, como una nueva
sección `panel/` de este repo (mismo patrón que `crm/` y `voz/`: HTML/CSS/JS
vanilla en un solo archivo por página, sin frameworks, desplegable en Vercel
como sitio estático + funciones serverless en `api/`).

## Contexto y restricciones técnicas

- Stack: HTML/CSS/JS vanilla, estilo visual idéntico al de `crm/index.html`
  (tema oscuro, variables CSS --bg #0f1117, --panel #181b23, acento naranja
  #c2571b, misma tipografía system-ui y mismo lenguaje de componentes).
- Datos: todo persiste en localStorage (sin base de datos). Debe haber
  importación de datos por CSV y captura manual con formularios, más
  exportación de cada sección a CSV. Incluye un botón "Cargar datos de
  ejemplo" que llena todo con datos demo realistas para ver los dashboards
  vivos de inmediato.
- Integración con lo existente: la sección Ventas y Marketing deben poder leer
  los leads del CRM ya construido (localStorage key `sinergia_crm_leads`,
  objetos con {nombre, etapa, score, urgencia, interes, seguimiento}).
- IA: crea un endpoint `api/panel.js` (SDK `@google/genai`, modelo
  `gemini-2.0-flash`, misma estructura CORS y manejo de errores que
  `api/crm.js`) con una acción `insights`: recibe los KPIs agregados de una
  sección y devuelve JSON con 3 insights de acción concretos y alertas.
  Cada dashboard tiene un botón "✨ Insights IA".
- Gráficas: dibújalas con SVG/canvas propio o una librería embebida en el
  archivo (sin CDNs externos). Líneas, barras, donas y anillos de progreso.
- Todo en español. Moneda configurable (por defecto USD). Selector de periodo
  global (mes actual, trimestre, año, rango personalizado) y comparación
  "vs. periodo anterior" en todos los KPIs, con flecha ↑/↓ y variación en %
  (verde si mejora, rojo si empeora; ojo: en gastos/rotación/CAC "bajar" es
  mejorar).
- Navegación: sidebar fija con las 6 secciones + Configuración. En móvil,
  colapsa a menú. Cada sección es una vista de la misma SPA.

## Sección 1 — Dashboard Ejecutivo

"Resume toda la empresa en 10 segundos."

- 4 KPIs grandes: Facturación, Ganancia neta, Margen %, y Meta mensual
  (con barra de progreso: realizado / meta y % de cumplimiento).
- Gráfica de línea: evolución de la facturación por mes (últimos 6-12 meses).
- Dona: facturación por canal (los canales los define el usuario en
  Configuración, ej. Sitio, Marketplace, Representantes, Otros).
- Tabla: desempeño por línea de producto/servicio — columnas Producto,
  Facturación, Variación %, Margen %, Ganancia; variaciones coloreadas.
- Bloque "3 insights de acción" generado por la IA a partir de los datos
  (ej. "facturación arriba del plan por 2º mes: mantener foco en las
  campañas que más convierten").

## Sección 2 — Ventas

"Para exigirle más a tu equipo pero con datos."

- 4 KPIs: Facturación del periodo, Pedidos, Ticket medio (AOV), Ítems vendidos.
- Ranking de vendedores: tabla con #, Vendedor, Meta, Realizado, % de meta
  con barra de progreso — verde ≥100%, ámbar 85-99%, rojo <85%. Ordenada de
  mayor a menor para que el equipo compita por el primer puesto.
- Gráfica de barras: Meta vs. Realizado por mes.
- Gráfica de línea: ticket medio a lo largo del tiempo.
- Tabla "Productos campeones": producto, ítems vendidos, facturación.
- Extra CRM: tarjeta con leads activos por etapa y tasa de conversión
  (leads cerrados / leads totales) leyendo `sinergia_crm_leads`.

## Sección 3 — Financiero

"Saber si el negocio está creciendo en ganancia… o solo facturando."

- 4 KPIs: Ingresos, Gastos, Ganancia neta, Margen neto %.
- Gráfica de 3 líneas: evolución de ingresos (verde), gastos (rojo) y
  ganancia (amarillo) por mes.
- Flujo de caja: entradas, salidas y saldo del periodo + barras mensuales
  verdes (positivo) / rojas (negativo).
- Panel "Indicadores de salud" con semáforo ✔/⚠ contra metas configurables:
  margen neto (meta > 25%), liquidez corriente (> 1.20), endeudamiento
  (< 60%), flujo de caja (> 0), rotación de inventario (> 2.5).
- Alertas financieras: lista visual cuando un indicador cae bajo su meta,
  con severidad y sugerencia de la IA.
- Captura: movimientos de ingreso/gasto con categoría, o import CSV.

## Sección 4 — Marketing

"Saber qué canal realmente trae plata, no likes."

- 4 KPIs: Inversión total, CAC medio, ROI medio (x), Conversión media %.
- Dona: inversión por canal (Google Ads, Meta Ads, Instagram Ads, LinkedIn,
  YouTube, Otros — editables).
- Tabla "Desempeño por canal": canal, inversión, CAC, ROI, conversión %;
  resalta el mejor y peor canal.
- Embudo de conversión general: impresiones → clics → leads → ventas, con
  % de paso entre etapas.
- Barras horizontales: ROI por campaña (top 5).
- Ventas atribuidas: cada campaña puede registrar ventas generadas para
  calcular su ROI = ventas atribuidas / inversión.

## Sección 5 — Equipo / RRHH

"Dejar de manejar personas por sensación."

- 4 KPIs: Rotación % (YTD), Cantidad de empleados, Costo por contratación,
  Ausentismo promedio % — todos con variación vs. mismo periodo del año
  anterior (recuerda: rotación/costo/ausentismo mejoran al BAJAR).
- Gráfica de línea: rotación % por mes.
- Gráfica de barras: cantidad de empleados por mes.
- Barras horizontales: ausentismo por área y headcount por área.
- Tabla de colaboradores: nombre, área, fecha de ingreso, estado
  (activo/baja), desempeño (1-5). Las altas/bajas alimentan rotación y
  evolución del equipo automáticamente.

## Sección 6 — Objetivos

"Saber si estás cerca o lejos de la meta."

- Anillo grande de progreso general del trimestre: % logrado, realizado /
  meta en dinero.
- KPI "Proyección de cierre": extrapola el ritmo actual del periodo
  transcurrido y muestra si quedará arriba o abajo de la meta (con % y
  tendencia); KPI "Faltan": monto restante y % para la meta.
- Anillos de cumplimiento por área: Ventas, Financiero, Marketing, RRHH,
  Producto, Soporte — cada uno con % y realizado/meta, coloreado verde
  ≥90%, ámbar 60-89%, rojo <60%.
- Tabla "Progreso consolidado": área, barra de cumplimiento, realizado,
  meta, estado ("por encima de la meta" / "en riesgo" / "atrasado").
- Las metas se definen por trimestre en Configuración; las áreas de Ventas,
  Financiero y Marketing pueden autocompletar su "realizado" desde los datos
  de sus propias secciones.

## Configuración

- Nombre del negocio, moneda, canales de venta, canales de marketing, áreas,
  vendedores, metas por trimestre y por área, metas de los indicadores de
  salud financiera.
- Exportar/importar TODOS los datos como un solo JSON (respaldo manual).

## Criterios de aceptación

- Con "Cargar datos de ejemplo", las 6 secciones se ven pobladas y coherentes
  entre sí (los totales de Ventas cuadran con el Ejecutivo, etc.).
- Sin errores en consola; funciona en móvil; ningún recurso externo (CDNs).
- Verifica el flujo completo en navegador antes de dar por terminado, y
  navega las 6 secciones con datos demo.
