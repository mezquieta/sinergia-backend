# Auditoría del backend — julio 2026

Revisión completa del código existente en `api/gemini.js` y `package.json`.
Los hallazgos están ordenados por severidad. **Todos fueron corregidos ya en esta rama.**

## Hallazgos

### 1. CRÍTICO — Import de una clase que no existe en el paquete instalado

- **Dónde:** `api/gemini.js`, línea 1.
- **Problema:** se importaba `GoogleGenAI` desde `@google/generative-ai`, pero ese
  paquete exporta `GoogleGenerativeAI`. La clase `GoogleGenAI` pertenece al SDK
  nuevo `@google/genai`.
- **Efecto:** el endpoint crasheaba en el arranque con cualquier request — la app
  entera estaba muerta en producción.
- **Arreglo aplicado:** se migró la dependencia a `@google/genai` en `package.json`
  y el import quedó consistente.

### 2. CRÍTICO — API del SDK incompatible con la versión instalada

- **Dónde:** `api/gemini.js`, llamadas `ai.models.generateContent({...})` y
  `config: { responseMimeType }`.
- **Problema:** esa sintaxis es del SDK nuevo; la versión instalada (`0.1.1` del
  paquete viejo) usa `getGenerativeModel().generateContent()`. Aunque el import
  se hubiera corregido, ninguna llamada funcionaba.
- **Arreglo aplicado:** con la migración a `@google/genai` la sintaxis existente
  ya es válida — no hubo que reescribir la lógica.

### 3. ALTO — Modelo de IA deprecado

- **Dónde:** `api/gemini.js`, `model: 'gemini-1.5-flash'` (2 lugares).
- **Problema:** Google retiró `gemini-1.5-flash` de la API; los requests devuelven
  error 404 del lado de Google.
- **Arreglo aplicado:** se actualizó a `gemini-2.0-flash` en ambas llamadas.

### 4. MEDIO — Acción desconocida dejaba el request colgado

- **Dónde:** `api/gemini.js`, final del `try`.
- **Problema:** si el body traía un `action` distinto de `generate_scenario` o
  `evaluate_voice`, la función terminaba sin responder nada → el cliente quedaba
  esperando hasta el timeout de Vercel.
- **Arreglo aplicado:** ahora responde `400 { error: 'Unknown action' }`.

## Pendientes recomendados (no bloqueantes)

- **CORS abierto (`*`):** cualquier sitio puede consumir tu API y gastar tu cuota
  de Gemini. Cuando tengas dominio propio, restringe `Access-Control-Allow-Origin`.
- **Sin validación de tamaño de input:** un `textInput` gigante consume tokens sin
  límite. Conviene truncar/validar longitudes.
- **`JSON.parse` sobre la respuesta de la IA:** si Gemini devuelve JSON malformado
  se responde 500 genérico; se podría reintentar una vez antes de fallar
  (el endpoint nuevo `api/crm.js` ya maneja este caso con un 502 explícito).
