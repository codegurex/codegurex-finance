# Codegurex Finance

Sistema financiero interno de Codegurex. MVP Fase 1: autenticación, dashboard, ingresos, gastos y clientes.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind v4** + componentes UI propios (shadcn-style)
- **Supabase** (Auth + Postgres)
- **Prisma 7** ORM
- **lucide-react** iconos

## Setup

### 1. Crea el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un nuevo proyecto.
2. Anota la contraseña de la base de datos.
3. Espera a que el proyecto esté listo (1-2 min).

### 2. Llena `.env`

Copia los valores de Supabase a `.env` (ya existe en la raíz, no se commitea):

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`: en **Settings → API**.
- `DATABASE_URL`: en **Project Settings → Database → Connection string → URI** (usa la conexión directa, puerto 5432).

### 3. Aplica el esquema

```bash
npm run db:push
```

Esto crea las tablas `users`, `clients`, `income`, `expenses`, `projects`, `invoices` en Supabase.

> Nota: el `id` del modelo `User` coincide con `auth.users.id` de Supabase. Para que se inserte automáticamente al registrar un usuario, en el SQL Editor de Supabase ejecuta:
>
> ```sql
> create or replace function public.handle_new_user()
> returns trigger language plpgsql security definer as $$
> begin
>   insert into public.users (id, email)
>   values (new.id, new.email);
>   return new;
> end;
> $$;
>
> create trigger on_auth_user_created
>   after insert on auth.users
>   for each row execute function public.handle_new_user();
> ```

### 4. Arranca el servidor

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Te redirige a `/login`. Crea una cuenta y entra.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run db:push` — sincroniza el schema con Postgres (sin migración)
- `npm run db:migrate` — crea y aplica una migración
- `npm run db:studio` — abre Prisma Studio
- `npm run db:generate` — regenera el cliente Prisma

## Estructura

```
src/
├── app/
│   ├── (app)/              # rutas protegidas (sidebar + auth check)
│   │   ├── layout.tsx
│   │   ├── page.tsx        # /  → dashboard
│   │   ├── ingresos/
│   │   ├── gastos/
│   │   └── clientes/
│   ├── auth/callback/      # callback de Supabase OAuth/email
│   ├── login/              # página pública de login
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                 # button, card, input
│   ├── sidebar.tsx
│   └── stat-card.tsx
├── lib/
│   ├── supabase/           # clients browser/server/middleware
│   ├── prisma.ts
│   ├── utils.ts
│   └── format.ts
├── generated/prisma/       # cliente Prisma (gitignored)
└── middleware.ts           # protección de rutas
prisma/
└── schema.prisma
```

## Roadmap

- **Fase 1 (actual)** — auth, dashboard, CRUD ingresos/gastos/clientes
- **Fase 2** — facturas PDF, reportes, exportaciones, gráficos
- **Fase 3** — roles, automatizaciones, IA, integraciones (Stripe, Telegram)
