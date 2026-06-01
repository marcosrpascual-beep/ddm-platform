# Guía Completa — DDM Platform

Todo lo que necesitás para instalar, configurar y usar la plataforma desde cero.

---

## ¿Qué es esto?

Una plataforma web para gestionar clientes y tareas de tu equipo. Incluye:
- CRM de clientes con alertas de vencimiento, renovaciones y estadísticas
- Gestor de tareas con temporizadores y asignación de equipo
- Panel personal por usuario
- Cerebro IA (chat con Claude sobre tu negocio)
- Notificaciones por email automáticas

---

## Requisitos previos

Antes de empezar, necesitás tener instalado en tu computadora:

1. **Node.js 18 o superior**
   - Descargalo en: https://nodejs.org (elegí la versión LTS)
   - Verificá: `node --version` → tiene que decir v18 o más

2. **Git**
   - Mac: ya viene instalado (verificá con `git --version`)
   - Windows: descargalo en https://git-scm.com

3. **Una cuenta en Neon (base de datos gratuita)**
   - Registrate en https://neon.tech
   - Creá un nuevo proyecto → copiá las URLs de conexión

---

## Paso 1 — Instalar Claude Code (opcional pero recomendado)

Claude Code es el asistente de IA que te ayuda a modificar y mantener la plataforma.

```bash
npm install -g @anthropic-ai/claude-code
```

Para usarlo, abrí una terminal en la carpeta del proyecto y escribí `claude`.

---

## Paso 2 — Descargar el proyecto

```bash
git clone https://github.com/marcosrpascual-beep/ddm-platform.git
cd ddm-platform
```

---

## Paso 3 — Instalar dependencias

```bash
npm install
```

Esto descarga todos los paquetes necesarios. Puede tardar 1-2 minutos.

---

## Paso 4 — Configurar variables de entorno

Copiá el archivo de ejemplo:

```bash
cp .env.example .env
```

Abrí el archivo `.env` y completá cada variable:

```
DATABASE_URL=       ← URL de conexión de Neon (la que dice "pooled")
DIRECT_URL=         ← URL de conexión de Neon (la que dice "direct")
NEXTAUTH_SECRET=    ← Generalo con: openssl rand -base64 32
NEXTAUTH_URL=       ← http://localhost:3000 (para desarrollo local)
GMAIL_USER=         ← Tu email de Gmail
GMAIL_APP_PASSWORD= ← Contraseña de aplicación de Gmail (ver más abajo)
ADMIN_EMAIL=        ← Tu email donde llegán las notificaciones
```

### Cómo obtener la App Password de Gmail

1. Entrá a tu cuenta de Google → **Seguridad**
2. Activá la verificación en dos pasos (si no la tenés)
3. Buscá "Contraseñas de aplicaciones"
4. Generá una nueva para "Correo" → copiá las 16 letras

---

## Paso 5 — Configurar la base de datos

```bash
npx prisma migrate deploy
npx prisma db seed
```

El primer comando crea las tablas. El segundo carga un usuario admin inicial:
- **Email:** admin@ddm.com
- **Contraseña:** ddm2024admin

> Importante: cambiá esta contraseña desde el panel de usuarios apenas entres.

---

## Paso 6 — Correr la plataforma localmente

```bash
npm run dev
```

Abrí el browser en **http://localhost:3000** y entrá con las credenciales del paso anterior.

---

## Paso 7 — Subir a Vercel (producción)

### 7.1 Crear cuenta en Vercel

Registrate en https://vercel.com con tu cuenta de GitHub.

### 7.2 Conectar el repositorio

1. En Vercel → **Add New Project**
2. Elegí el repositorio `ddm-platform`
3. Dejá todo como está en la configuración → click en **Deploy**

El primer deploy va a fallar porque todavía no tiene las variables de entorno.

### 7.3 Configurar variables de entorno en Vercel

1. En tu proyecto de Vercel → **Settings → Environment Variables**
2. Agregá cada una de las variables de tu archivo `.env`
3. Para `NEXTAUTH_URL` usá la URL de tu dominio en Vercel (ej: `https://mi-plataforma.vercel.app`)

### 7.4 Rediployar

Ve a **Deployments → los tres puntitos → Redeploy**. Esta vez va a funcionar.

---

## Secciones de la plataforma

### /admin/clients — CRM de Clientes
- Ver todos los clientes: activos, inactivos y los que abandonaron
- Countdown de vencimiento por cliente (en días)
- Agregar/editar clientes con fechas de inicio y fin
- Registrar renovaciones
- Estadísticas: distribución por país, nuevos clientes por mes, LTV

### /admin/tasks — Gestión de Tareas
- Crear tareas con título, descripción, prioridad y deadline
- Asignar tareas a miembros del equipo
- Temporizador por tarea
- Marcar tareas como completadas
- Filtrar por estado y prioridad

### /admin/users — Usuarios del Equipo
- Crear y gestionar usuarios
- Roles: ADMIN (acceso total) o EMPLOYEE (solo su panel)
- Activar/desactivar usuarios

### /admin/mi-panel — Panel Personal
- Vista de las tareas asignadas al usuario logueado
- Temporizador personal
- Ver alarmas y notificaciones propias

### /admin/cerebro — Cerebro IA
- Chat con Claude (IA de Anthropic) sobre tu negocio
- Requiere una API Key de Anthropic: https://console.anthropic.com/settings/keys
- Podés cargar información de tu negocio en la variable `CEREBRO_SYSTEM_PROMPT`

### /dashboard — Vista de Colaboradores
- Versión simplificada para empleados (sin acceso a CRM ni configuración)

---

## Notificaciones automáticas

La plataforma puede enviar emails automáticos cuando:
- Una tarea está próxima a vencer (al 50% del tiempo y al 80%)
- Un cliente está próximo a vencer

Para activar esto en Vercel, configurá un cron job en `vercel.json` (ya está incluido) y asegurate de que las variables de Gmail estén correctas.

---

## Personalizar la plataforma

Para modificar la plataforma con ayuda de IA:

1. Abrí una terminal en la carpeta del proyecto
2. Escribí `claude`
3. Pedile lo que necesitás en lenguaje natural, por ejemplo:
   - "Agregá un campo de teléfono a los clientes"
   - "Cambiá el color del menú a azul"
   - "Creá una sección de facturas"

---

## Problemas frecuentes

**Error: DATABASE_URL not found**
→ Verificá que el archivo `.env` existe y tiene las URLs de Neon correctas

**Error: Invalid credentials al hacer login**
→ Corré `npx prisma db seed` para crear el usuario admin

**Los emails no llegan**
→ Verificá que `GMAIL_APP_PASSWORD` son las 16 letras sin espacios, y que tenés activada la verificación en dos pasos

**Error en Vercel: NEXTAUTH_SECRET**
→ Generá un secret con `openssl rand -base64 32` y agregalo en Vercel → Settings → Environment Variables

---

## Soporte

Si tenés dudas o necesitás ayuda para modificar la plataforma, usá Claude Code como se explica en la sección de personalización.
