# Prompt genérico: Suite de dashboards de negocio

Prompt para construir una suite de dashboards de 7 secciones (Ejecutivo, Ventas,
Financiero, Marketing, Operaciones, Equipo/RRHH, Objetivos) en CUALQUIER repo.
Copiar y pegar completo en Claude Code / Fable dentro del proyecto donde se
quiera el dashboard.

---

Construye una suite de dashboards de negocio como una nueva sección de ESTE
repositorio. Antes de escribir una sola línea de código, haz el Paso 0.

## Paso 0 — Descubre el proyecto y adáptate a él

Explora el repo actual y decide con base en lo que encuentres:

- **Stack:** detecta lenguaje, framework y forma de despliegue (Next/React/Vue,
  HTML estático, funciones serverless, backend propio, etc.) y construye el
  dashboard siguiendo las convenciones del proyecto, no las tuyas. Si el repo
  está vacío o es estático simple, usa el fallback: HTML/CSS/JS vanilla en una
  carpeta `panel/`, sin frameworks ni CDNs externos.
- **Estilo visual:** si el proyecto ya tiene páginas, design system o variables
  CSS, reutilízalos para que el dashboard se vea parte del mismo producto. Si
  no hay nada, usa un tema oscuro sobrio con un solo color de acento.
- **Datos reales primero:** busca qué información ya existe y conéctala a las
  secciones que corresponda — base de datos, APIs propias, archivos
  JSON/CSV, localStorage de otras vistas, modelos o esquemas existentes.
  Cada dato real que encuentres reemplaza a su equivalente manual. Lo que no
  exista se captura con formularios e importación CSV, y persiste donde el
  proyecto ya persista datos (su BD si tiene; si no, localStorage).
- **IA (opcional pero deseable):** si el proyecto ya tiene integrado un
  proveedor de IA (revisa dependencias y variables de entorno), crea un
  endpoint de "insights" reutilizando ese mismo proveedor, clave y patrones de
  código. Si no hay ninguno, omite los bloques de IA sin romper el resto.
- **Idioma y moneda:** usa el idioma predominante del proyecto (si no es
  claro, español). Moneda configurable.

Reglas transversales para TODAS las secciones:

- Selector de periodo global (mes, trimestre, año, rango personalizado) y
  comparación "vs. periodo anterior" en todos los KPIs, con flecha ↑/↓ y
  variación % (verde si mejora, rojo si empeora; cuidado: en gastos, CAC,
  rotación de personal, tiempo de despacho y quiebres de stock, BAJAR es
  mejorar).
- Gráficas sin dependencias externas nuevas salvo que el proyecto ya use una
  librería de charts — en ese caso, úsala.
- Navegación: sidebar con las 7 secciones + Configuración; colapsable en móvil.
- Botón "Cargar datos de ejemplo" que puebla todo con datos demo realistas y
  coherentes entre secciones, para ver los dashboards vivos de inmediato.
- Exportación de cada sección a CSV y respaldo/restauración de todos los
  datos en un JSON.

## Sección 1 — Dashboard Ejecutivo

"Resume toda la empresa en 10 segundos."

- 4 KPIs grandes: Facturación, Ganancia neta, Margen %, y Meta mensual
  (con barra de progreso: realizado / meta y % de cumplimiento).
- Gráfica de línea: evolución de la facturación por mes (últimos 6-12 meses).
- Dona: facturación por canal (canales configurables).
- Tabla: desempeño por línea de producto/servicio — Producto, Facturación,
  Variación %, Margen %, Ganancia; variaciones coloreadas.
- Bloque "3 insights de acción" generado por la IA a partir de los datos
  (ej. "facturación arriba del plan por 2º mes: mantener foco en las
  campañas que más convierten").

## Sección 2 — Ventas

"Para exigirle más a tu equipo pero con datos."

- 5 KPIs: Facturación del periodo, Pedidos, Ticket medio (AOV), Ítems
  vendidos, y Conversión comercial % (ventas cerradas / oportunidades).
- Ranking de vendedores: tabla con #, Vendedor, Meta, Realizado, % de meta
  con barra de progreso — verde ≥100%, ámbar 85-99%, rojo <85%. Ordenada de
  mayor a menor para que el equipo compita por el primer puesto.
- Gráfica de barras: Meta vs. Realizado por mes.
- Gráfica de línea: ticket medio a lo largo del tiempo.
- Tabla "Productos campeones": producto, ítems vendidos, facturación.
- Si el repo tiene datos de leads/clientes (CRM, tabla de contactos, etc.),
  agrega una tarjeta con leads activos por etapa y tasa de conversión
  calculada desde esos datos reales.

## Sección 3 — Financiero

"Saber si el negocio está creciendo en ganancia… o solo facturando."

- 4 KPIs: Ingresos, Gastos, Ganancia neta, Margen neto %.
- Gráfica de 3 líneas: evolución de ingresos (verde), gastos (rojo) y
  ganancia (amarillo) por mes.
- Flujo de caja: entradas, salidas y saldo del periodo + barras mensuales
  verdes (positivo) / rojas (negativo).
- Panel "Indicadores de salud" con semáforo ✔/⚠ contra metas configurables:
  margen neto (meta > 25%), liquidez corriente (> 1.20), endeudamiento
  (< 60%), flujo de caja (> 0), rotación de inventario (> 2.5),
  punto de equilibrio (% alcanzado de la facturación necesaria para cubrir
  costos del mes) y cobertura de caja ("la caja disponible cubre X meses de
  gastos" al ritmo actual).
- Alertas financieras: lista visual cuando un indicador cae bajo su meta,
  con severidad y sugerencia de la IA.
- Captura: movimientos de ingreso/gasto con categoría, o import CSV.

## Sección 4 — Marketing

"Saber qué canal realmente trae plata, no likes."

- 6 KPIs: Inversión total, Leads generados, CAC medio, Costo por lead,
  ROAS/ROI medio (x), CTR promedio % y Conversión media %.
- Dona: inversión por canal (Google Ads, Meta Ads, Email, Orgánico, Otros —
  editables).
- Tabla "Desempeño por canal": canal, inversión, CAC, ROI, conversión %;
  resalta el mejor y peor canal.
- Embudo de conversión general: impresiones → clics → leads → ventas, con
  % de paso entre etapas.
- Barras horizontales: ROI por campaña (top 5).
- Ventas atribuidas: cada campaña puede registrar ventas generadas para
  calcular su ROI = ventas atribuidas / inversión.
- Tarjetas destacadas: "Campaña top" del periodo y "Tasa de conversión de
  landing" %, con variación vs. periodo anterior.
- Bloque "Insights clave" por canal (ej. "email marketing tiene el mejor
  retorno", "Meta Ads genera más volumen de leads") generado por la IA.

## Sección 5 — Operaciones

"Controla el día a día sin perder velocidad: vuelve visible lo que
normalmente se pierde en la operación."

- 6 KPIs: Órdenes procesadas, Entregas a tiempo %, Tiempo promedio de
  despacho (horas), Nivel de servicio %, Rotación de inventario, Quiebres
  de stock.
- Gráfica de línea: órdenes procesadas, tendencia semanal (Lun-Dom).
- Barras horizontales: cumplimiento por área (Logística, Almacén, Despacho,
  Compras, Transporte — editables) en %.
- Panel "Estado de inventario clave": lista de productos con semáforo
  🟢 stock alto / 🟡 stock medio / 🔴 stock bajo.
- Tabla "Cumplimiento por bodega/sucursal": bodega, cumplimiento %,
  variación vs. mes anterior.
- Alertas operacionales generadas por reglas + IA: productos con stock bajo,
  mejoras/deterioros de tiempos de despacho, bodegas que requieren revisión.

## Sección 6 — Equipo / RRHH

"Dejar de manejar personas por sensación."

- 4 KPIs: Rotación % (YTD), Cantidad de empleados, Costo por contratación,
  Ausentismo promedio % — todos con variación vs. mismo periodo del año
  anterior.
- Gráfica de línea: rotación % por mes.
- Gráfica de barras: cantidad de empleados por mes.
- Barras horizontales: ausentismo por área y headcount por área.
- Tabla de colaboradores: nombre, área, fecha de ingreso, estado
  (activo/baja), desempeño (1-5). Las altas/bajas alimentan rotación y
  evolución del equipo automáticamente.

## Sección 7 — Objetivos

"Saber si estás cerca o lejos de la meta."

- Anillo grande de progreso general del trimestre: % logrado, realizado /
  meta en dinero.
- KPI "Proyección de cierre": extrapola el ritmo actual del periodo
  transcurrido y muestra si quedará arriba o abajo de la meta (con % y
  tendencia); KPI "Faltan": monto restante y % para la meta.
- Anillos de cumplimiento por área: Ventas, Financiero, Marketing,
  Operaciones, RRHH, Producto, Soporte — cada uno con % y realizado/meta,
  coloreado verde ≥90%, ámbar 60-89%, rojo <60%.
- Tabla "Progreso consolidado": área, barra de cumplimiento, realizado,
  meta, estado ("por encima de la meta" / "en riesgo" / "atrasado").
- Las metas se definen por trimestre en Configuración; las áreas cuyos datos
  ya viven en otras secciones (Ventas, Financiero, Marketing, Operaciones)
  autocompletan su "realizado" desde esos datos.

## Configuración

- Nombre del negocio, moneda, canales de venta, canales de marketing, áreas,
  bodegas, vendedores, metas por trimestre y por área, metas de los
  indicadores de salud financiera.
- Exportar/importar TODOS los datos como un solo JSON (respaldo manual).

## Criterios de aceptación

- Con "Cargar datos de ejemplo", las 7 secciones se ven pobladas y coherentes
  entre sí (los totales de Ventas cuadran con el Ejecutivo, etc.).
- Si el repo tenía datos reales, al menos una sección los muestra de verdad.
- Sin errores en consola; funciona en móvil; sin dependencias externas nuevas.
- Verifica el flujo completo en navegador antes de dar por terminado, navegando
  las 7 secciones con datos demo, y muestra evidencia (captura de pantalla).
