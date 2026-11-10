# alfa-dashboard

Dashboard privado para gestionar proyectos con el agente Alfa. Incluye autenticación, chat con IA, subida de archivos, y gestión de proyectos.

## Características

- 🔐 **Autenticación privada** - NextAuth con credenciales, GitHub, Google
- 💬 **Chat con Alfa** - Agente IA experto en ciberseguridad, sistemas y software
- 📁 **Gestión de proyectos** - Crea, edita, elimina proyectos
- 📤 **Subida de archivos** - Imágenes, videos, PDFs, código (hasta 100MB)
- 🗄️ **Base de datos PostgreSQL** - Prisma ORM
- ☁️ **Almacenamiento S3/R2** - Cloudflare R2, AWS S3, MinIO
- 🎨 **UI moderna** - Tailwind CSS, modo oscuro, responsive
- 🐳 **Docker ready** - Despliegue en Render con Blueprint

## Stack

- Next.js 14 (App Router, TypeScript)
- NextAuth.js v4
- Prisma + PostgreSQL
- Tailwind CSS
- OpenAI API (GPT-4o-mini)
- Tavily API (búsqueda web)
- AWS SDK v3 (S3/R2)

## Despliegue en Render (Blueprint)

1. **Fork/Clona este repo** a tu GitHub
2. En Render: **New + → Blueprint** → Selecciona el repo
3. Render detectará `render.yaml` y creará:
   - Web Service: `alfa-dashboard`
   - PostgreSQL: `alfa-dashboard-db`
4. **Rellena las variables de entorno** (marcadas `sync: false`):
   - `DATABASE_URL` - Se auto-rellena desde la BD de Render
   - `NEXTAUTH_URL` - URL pública de tu servicio (ej: `https://alfa-dashboard-xxxx.onrender.com`)
   - `NEXTAUTH_SECRET` - Genera uno: `openssl rand -base64 32`
   - `OPENAI_API_KEY` - Tu key de OpenAI (requiere saldo)
   - `TAVILY_API_KEY` - Opcional, para búsqueda web (gratis en tavily.com)
   - `S3_*` - Configura tu bucket S3/R2 (Cloudflare R2 recomendado, gratis)
   - `GITHUB_ID/SECRET` - Opcional, para login con GitHub
   - `GOOGLE_CLIENT_ID/SECRET` - Opcional, para login con Google
5. **Apply** → Render hace build + deploy automático

## Desarrollo local

```bash
# Clonar e instalar
git clone <tu-repo>
cd alfa-dashboard
npm install

# Configurar variables
cp .env.example .env
# Edita .env con tus valores

# Base de datos
npx prisma db push
npx prisma db seed # opcional

# Desarrollo
npm run dev
# Abre http://localhost:3000
```

## Variables de entorno requeridas

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | URL pública de la app | ✅ |
| `NEXTAUTH_SECRET` | Secreto para JWT (32+ chars) | ✅ |
| `OPENAI_API_KEY` | Key de OpenAI para el agente | ✅ |
| `TAVILY_API_KEY` | Key de Tavily para búsqueda web | ❌ |
| `S3_ENDPOINT` | Endpoint S3 (ej: R2) | ❌ |
| `S3_ACCESS_KEY_ID` | Access key S3 | ❌ |
| `S3_SECRET_ACCESS_KEY` | Secret key S3 | ❌ |
| `S3_BUCKET_NAME` | Nombre del bucket | ❌ |
| `S3_PUBLIC_URL` | URL pública para archivos | ❌ |
| `GITHUB_ID/SECRET` | OAuth GitHub | ❌ |
| `GOOGLE_CLIENT_ID/SECRET` | OAuth Google | ❌ |

## Estructura del proyecto

```
alfa-dashboard/
├── prisma/
│   └── schema.prisma          # Modelos de BD
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth endpoints
│   │   │   ├── chat/          # Chat con Alfa
│   │   │   ├── upload/        # Subida de archivos
│   │   │   └── projects/      # CRUD proyectos
│   │   ├── dashboard/         # Páginas protegidas
│   │   │   ├── page.tsx       # Lista de proyectos
│   │   │   ├── chat/          # Chat general
│   │   │   └── projects/      # Detalle de proyecto
│   │   ├── login/             # Página de login
│   │   ├── layout.tsx         # Layout raíz
│   │   └── page.tsx           # Redirección inicial
│   ├── components/
│   │   ├── Chat.tsx           # Componente de chat
│   │   ├── FileUpload.tsx     # Subida de archivos
│   │   ├── ProjectCard.tsx    # Tarjeta de proyecto
│   │   └── Sidebar.tsx        # Navegación lateral
│   └── lib/
│       ├── auth.ts            # Config NextAuth
│       ├── server-auth.ts     # Helpers de servidor
│       ├── prisma.ts          # Cliente Prisma
│       ├── agent.ts           # Lógica del agente Alfa
│       ├── s3.ts              # Utilidades S3/R2
│       └── utils.ts           # Helpers generales
├── middleware.ts              # Protección de rutas
├── Dockerfile                 # Imagen Docker
├── render.yaml                # Blueprint Render
└── package.json
```

## Licencia

Privado - Solo para uso autorizado.