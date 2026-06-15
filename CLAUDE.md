# Sistema de Deberes de la Casa

App web para que un hogar organice, recuerde y registre sus deberes domésticos, con rotación justa, sistema de puntos, rankings, logros y un reglamento. Por ahora para un solo hogar (sin login multi-hogar), pero construido para escalar a multihogar más adelante.

## Stack

- Next.js (App Router) + TypeScript
- - Supabase (Postgres + Auth + Storage) como backend
- Drizzle como ORM tipado contra Postgres
- Drizzle Kit para migraciones de esquema
- Vercel para el hosting
- PWA (instalable en pantalla de inicio, con notificaciones)

## Arquitectura

- Frontend y servidor conviven en `app/` (App Router). Componentes de servidor por defecto; `"use client"` solo para interactividad.
- La lógica de negocio vive en `lib/`, organizada por dominio (no por capa global):
  - `lib/<dominio>/<dominio>.actions.ts` → server actions (punto de entrada, como controllers)
  - `lib/<dominio>/<dominio>.service.ts` → lógica de negocio (funciones, no clases salvo que haya estado)
  - `lib/<dominio>/<dominio>.repo.ts` → acceso a datos (llama a Supabase)
  - `lib/db/supabase.ts` → cliente único de Supabase (singleton)
- Lecturas: directas desde server components vía services/repos. Escrituras: por server actions.
- Sin sistema de módulos ni inyección de dependencias: se organiza con carpetas e imports directos.
- `lib/db/` contiene el esquema de Drizzle y el cliente, más los repos que lo usan.

## Reglas inmutables

- NUNCA exponer la lógica de puntos o penalizaciones al navegador. Va en el servidor (server actions) y se blinda con Row-Level Security en Supabase.
- Los puntos se DERIVAN de la tabla `transacciones_puntos` (libro mayor). No se sobrescriben; las correcciones del admin son filas de tipo `ajuste_admin`.
- Los logros, los títulos y los cuatro rankings van FIJOS en el motor. El admin NO los modifica.
- El bono por cubrir a otro solo se otorga si el participante ya cumplió su propio deber del día Y el ayudado confirmó.
- Los tres deberes no negociables deben cumplirse siempre; si ninguno los hace, penalización colectiva a los tres.
- El día cierra a las 3:00 AM, hora de Caracas (`America/Caracas`). Lo marcado antes de esa hora cuenta para el día anterior.
- Toda acción del admin se registra en `registro_auditoria`, visible para los tres.
- Todo cuelga del objeto `hogar` (clave para escalar a multihogar sin reescribir el esquema).

## Terminología (usar siempre estos términos)

- hogar — el grupo, la unidad raíz
- participante — una persona del hogar
- deber — una tarea; dos ejes independientes: `tipo_asignacion` (rotativo | reclamable) y `es_obligatorio` (no negociable o no)
- registro — un cumplimiento marcado (el historial permanente)
- transacción de puntos — una suma o resta en el libro mayor
- los cuatro rankings: general, confiable (porcentaje), solidario, responsable de la casa

## Cómo trabajar con el usuario (IMPORTANTE)

- **Explicar siempre.** Después de cada respuesta y de cada cosa que haga, explicar exactamente qué fue lo que hice. Lo más importante para el usuario es **entender** lo que se está haciendo.
- **Invitar a preguntar.** El usuario puede no entender algo; dejar espacio para que haga preguntas y responderlas con claridad antes de seguir.
- **Resumen al terminar código.** Cada vez que implemente o termine de implementar código, generar al final un **resumen claro y específico de todo lo que hice**, pensado para que el usuario lo entienda por completo (qué archivos, qué hace cada uno, por qué).
- Lenguaje claro y sin asumir conocimiento previo de backend; el usuario está aprendiendo.

## Especificación completa

El detalle vive en `docs/`. Consulta el archivo relevante según la tarea:

- `docs/01_La_Idea.md` — la visión y cómo funciona todo el sistema
- `docs/02_El_Reglamento.md` — las reglas de negocio caso por caso, con la tabla de puntos
- `docs/03_Modelo_de_Datos.md` — el esquema de la base de datos (tablas, columnas, relaciones, matriz de puntos)

## Nota sobre la versión de Next.js

Este proyecto usa Next.js 16, que tiene cambios importantes respecto a versiones anteriores. Antes de escribir código relacionado con routing, server actions o configuración, consulta `AGENTS.md` y `node_modules/next/dist/docs/` para no asumir convenciones de versiones previas.
