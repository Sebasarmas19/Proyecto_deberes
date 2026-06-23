# Dinow 🦖

**Dinow** es una aplicación web moderna (PWA) diseñada para ayudar a los hogares a organizar, recordar y registrar sus deberes domésticos de manera justa, transparente y divertida. Implementa un sistema completo de planificación semanal, acumulación de puntos, rankings y logros, manteniendo un libro mayor inviolable para evitar conflictos.

## ✨ Características Principales

- 🎯 **Organización Transparente**: Define deberes, sus niveles de obligatoriedad y asígnalos mediante un Plan Semanal predecible o dejalos como reclamables para quien desee hacerlos.
- 🏆 **Gamificación y Puntos**: Los participantes ganan (o pierden) puntos según su cumplimiento. ¡Compite por llegar al top del ranking del hogar!
- 🤝 **Solidaridad y Coberturas**: ¿No puedes hacer tu tarea? Alguien más puede cubrirte y llevarse puntos extra (Bono de Ayuda), siempre que confirmen la cobertura.
- 🎖️ **Logros y Títulos Mensuales**: "Limpiador Estrella", "Salvador del Mes"... el sistema premia las buenas conductas a lo largo del mes.
- 🔒 **Seguridad y Auditoría**: El Administrador tiene una contraseña segura, y cada participante tiene su propio PIN. Cualquier cambio o ajuste hecho por el admin queda guardado en un registro de auditoría público para todos.
- 📱 **Instalable (PWA)**: Diseñado para usarse como una aplicación nativa en tu teléfono. Se puede instalar en la pantalla de inicio y tiene soporte para Notificaciones Push.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router) + TypeScript
- **Estilos**: Tailwind CSS con una paleta de colores premium y diseño de interfaz moderno
- **Base de Datos**: PostgreSQL alojado en [Supabase](https://supabase.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Autenticación**: Sistema customizado por cookies seguras y PINs cifrados con `scrypt`

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/TU_USUARIO/dinow.git
   cd dinow
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Variables de Entorno**
   Crea un archivo `.env.local` en la raíz del proyecto. Necesitarás tener una base de datos PostgreSQL en Supabase.
   ```env
   DATABASE_URL="postgresql://postgres.[PROYECTO]:[PASSWORD]@aws-0-REGION.pooler.supabase.com:6543/postgres"
   NEXT_PUBLIC_VAPID_PUBLIC_KEY="tu_vapid_public_key"
   VAPID_PRIVATE_KEY="tu_vapid_private_key"
   CRON_SECRET="una_cadena_secreta_cualquiera"
   ```

4. **Preparar la Base de Datos**
   Asegúrate de empujar el esquema de Drizzle a tu base de datos:
   ```bash
   npm run db:push
   ```

5. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador. Si la base de datos está vacía, serás redirigido a la pantalla de Setup Inicial para configurar el hogar.

## 📦 Producción (Vercel)

El proyecto está optimizado para desplegarse fácilmente en Vercel. 
- Al desplegar, asegúrate de configurar las mismas Variables de Entorno.
- Configura las Cron Jobs en `vercel.json` (ya incluido) para ejecutar la generación de días (`/api/cron/generar-dia`) y los recordatorios (`/api/cron/recordatorio`).

## 📚 Arquitectura

La lógica de negocio se encuentra en la carpeta `lib/`, separada por dominios en lugar de capas globales:
- `lib/<dominio>.actions.ts`: Server Actions (Puntos de entrada desde el cliente)
- `lib/<dominio>.service.ts`: Lógica de negocio core (Reglas del hogar)
- `lib/<dominio>.repo.ts`: Acceso a la base de datos
- `lib/db/`: Configuración y esquema estricto de Drizzle ORM

## ⚖️ El Reglamento

Dinow se basa en reglas inmutables de convivencia:
1. **Los Puntos no se inventan**: Toda suma o resta proviene del libro mayor (`transacciones_puntos`).
2. **Cierre de Día**: El día "doméstico" termina a las 3:00 AM (configurable), permitiendo cumplir deberes de trasnocho.
3. **No Negociables**: Hay deberes críticos que, si nadie hace, desencadenan una penalización colectiva para todo el hogar.

*(Revisa el documento `docs/02_El_Reglamento.md` para el detalle completo de las mecánicas del juego)*.

---

