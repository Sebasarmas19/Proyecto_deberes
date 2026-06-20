# Prompts de Vistas — Sistema de Deberes de la Casa

Archivo de referencia con los prompts exactos para Claude Code cuando se construya cada vista del proyecto. Úsalos tal cual para que Claude entienda exactamente qué necesitas.

---

## PROMPT 1 — Página inicial (Elección de perfil)

```
Crea la página inicial de la app "Sistema de Deberes de la Casa". 
Es la puerta de entrada, mobile-first, vertical. Tiene dos estados:

ESTADO A — Primera vez (no hay usuarios creados todavía):
- Fondo con la paleta de la app (cremas, terracota, verdes suaves)
- Un solo círculo de perfil centrado en pantalla, grande
- Ícono de persona genérico dentro del círculo
- Nombre "Admin" debajo del círculo
- Texto pequeño debajo: "Configura tu hogar para empezar"
- Al hacer click en el círculo de Admin entra directamente sin contraseña

ESTADO B — Ya hay usuarios creados:
- Tres círculos de perfil en la parte superior (los usuarios), 
  cada uno con su foto o ícono y su nombre debajo
- Un círculo de Admin más abajo, separado visualmente de los usuarios,
  con un ícono de candado pequeño indicando que tiene contraseña
- Al hacer click en un usuario entra directo a sus vistas
- Al hacer click en Admin abre un modal de contraseña

El estilo visual debe ser cálido y familiar, consistente con 
la paleta ya definida en el proyecto. Que se sienta como el 
selector de perfiles de Windows pero con el diseño cálido 
de nuestra app.
```

---

## PROMPT 2 — Vista usuario: Página principal

```
Crea la vista principal del perfil usuario de la app 
"Sistema de Deberes de la Casa". Mobile-first, vertical.
Esta vista ya existe en el proyecto — respeta exactamente 
su paleta, tipografía, estilo de tarjetas y componentes.

La vista tiene estas secciones de arriba a abajo:

1. Header: fecha de hoy y saludo con el nombre del usuario

2. Tarjeta HERO: el deber obligatorio que le toca hoy 
   (ej: Cocinar), con su ícono y los puntos que vale. 
   Debajo, los criterios de aceptación solo como lista 
   de referencia (NO son checkboxes interactivos, 
   son solo texto informativo de qué significa cumplirlo)

3. Botón primario grande: "Marcar como cumplido"

4. Sección "Estado de hoy": tres círculos compactos, 
   uno por participante, mostrando su nombre, qué deber 
   le toca hoy y si está cumplido (verde) o pendiente (gris)

5. Sección "Extras de la semana": lista de deberes 
   reclamables disponibles hoy con su nombre, puntos 
   y botón "Reclamar"

6. Navegación inferior fija con tres tabs: 
   Perfil (Logros) | Home | Rankings
```

---

## PROMPT 3 — Vista Admin: Dashboard (hogar ya creado)

```
Crea el dashboard principal del perfil Admin de la app 
"Sistema de Deberes de la Casa". Mobile-first, vertical.
Este dashboard aparece cuando el hogar ya está configurado.
Usa la misma paleta de la app (cremas, terracota, verdes suaves).

La vista tiene estas secciones de arriba a abajo:

1. Header: ícono de casa + nombre del hogar (ej: "Casa de los Hermanos"),
   nombre del admin (ej: "Sebastián - Admin")

2. Sección "Accesos Rápidos": grid de 6 botones/tarjetas, 
   cada uno con ícono y nombre:
   - Participantes
   - Deberes  
   - Editar Plan
   - Ajustar Puntos
   - Configuración
   - Auditoría
   Cada botón lleva a su vista correspondiente.

3. Sección "Plan de la Semana": tabla compacta y visual
   con los días de la semana (Lun a Dom) en columnas
   y los tres participantes en filas (Sebastián, Silvana, Samuel),
   mostrando qué deber obligatorio le toca a cada uno cada día.
   Solo visual, no editable desde aquí. Tabla con scroll 
   horizontal si no entra completa.
```

---

## PROMPT 4 — Vista Admin: Setup Dashboard (primera vez, sin hogar creado)

```
Crea la vista de setup inicial del perfil Admin de la app 
"Sistema de Deberes de la Casa". Es un wizard de 3 pasos 
que aparece solo la primera vez que el admin entra, 
cuando no hay hogar creado todavía. Mobile-first, vertical.
Usa la paleta de la app (cremas, terracota, verdes suaves).

Muestra los 3 pasos como pantallas o secciones secuenciales:

PASO 1 — "Crear el hogar":
- Input: Nombre del hogar
- Input: Zona horaria (default: America/Caracas)
- Input: Hora de cierre del día (default: 03:00 AM)
- Botón: [Siguiente]

PASO 2 — "Configurar valores globales":
- Input: Bono por ayuda (puntos extra al cubrir a otro)
- Input: Penalización por fallo (puntos que se restan al fallar)
- Input: Penalización colectiva (puntos que pierden los tres 
  si un deber obligatorio no lo hace nadie)
- Input: Contraseña Admin (se crea aquí por primera vez, 
  campo de contraseña con confirmación)
- Botón: [Siguiente]

PASO 3 — "Confirmación":
- Resumen visual de todo lo que se configuró en los pasos anteriores
- Botón: [Crear hogar y continuar]

Que cada paso tenga un indicador de progreso (ej: 1 de 3, 2 de 3).
El tono es claro y guiado, que el admin sepa exactamente 
qué está haciendo en cada momento.
```

---

## Notas de uso

- Estos prompts están listos para copiar y pegar directamente en Claude Code
- Cada prompt especifica mobile-first y vertical (móvil)
- Todos usan la paleta de colores del proyecto (cremas, terracota, verdes suaves)
- Los accesos rápidos en el dashboard admin (PROMPT 3) aún no tienen descripciones detalladas de las sub-vistas — eso se decide con Claude Code en el momento
- La vista de usuario (PROMPT 2) ya tiene su look definido; respeta ese estilo en todas las siguientes
- El orden recomendado para construir: 1 → 4 → 3 → 2 (entrada → setup → dashboard admin → home usuario)
