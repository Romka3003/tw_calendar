# Desk Booking — бронирование столов

Веб-приложение для бронирования рабочих столов на неделю вперёд. Рассчитано на небольшую команду (6 столов, до 10 человек).

## Стек

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS**
- **БД:** Postgres (Supabase через Vercel, Neon, Railway или любой по `POSTGRES_URL`)
- Деплой: **Vercel**

## БД: Supabase, Neon или Railway

Приложение подключается к Postgres по переменной `POSTGRES_URL` через драйвер [postgres.js](https://github.com/porsager/postgres) (работает с Supabase, Neon, Railway и любым Postgres).

---

### Вариант: Supabase через Vercel (рекомендуется)

Supabase — это Postgres с удобным интерфейсом. При подключении через Vercel переменная **`POSTGRES_URL`** подставляется автоматически, код менять не нужно.

#### 1. Добавить Supabase через Vercel

1. Откройте [Vercel](https://vercel.com) → ваш проект (например, twcalendar).
2. **Settings** → **Integrations** (или **Storage** в боковом меню).
3. **Browse Marketplace** / **Add Integration** → найдите **Supabase** → **Add** / **Install**.
4. Разрешите доступ и выберите проект, к которому подключать БД.
5. Создайте **новый** Supabase-проект (Create new project) или подключите существующий (Link existing).
6. После подключения Vercel автоматически добавит в проект переменные: **`POSTGRES_URL`**, `POSTGRES_URL_NON_POOLING`, `SUPABASE_URL` и др. Наше приложение использует **`POSTGRES_URL`** — она уже будет задана.

#### 2. Открыть Supabase Studio и выполнить SQL

1. В Vercel в разделе интеграции Supabase (или **Storage** → ваш Supabase) нажмите **Open in Supabase** / **Supabase Studio** — откроется дашборд Supabase.
2. В Supabase: **SQL Editor** (левое меню).
3. Выполните по очереди:
   - вставьте содержимое файла **`sql/init.sql`** → **Run**;
   - вставьте содержимое файла **`sql/migrate_admin.sql`** → **Run**.
4. Таблицы `bookings`, `desks`, `settings`, `team_members` будут созданы.

#### 3. Редеплой (если переменные только что подставились)

1. В Vercel: **Deployments** → у последнего деплоя ⋮ → **Redeploy**.
2. После деплоя админка и главная страница будут работать с Supabase.

Локально можно подтянуть переменные: `vercel env pull .env.local` (в корне проекта).

---

### Вариант: Railway (Postgres)

[Railway](https://railway.app) даёт Postgres с простым подключением извне (Vercel, локально).

#### 1. Создание БД в Railway

1. Зайдите на [railway.app](https://railway.app), войдите (через GitHub можно).
2. **New Project** → выберите **Deploy from template** или **Empty Project**.
3. В проекте нажмите **+ New** → **Database** → **PostgreSQL** (или найдите шаблон [PostgreSQL](https://railway.com/template/postgres)).
4. Дождитесь деплоя сервиса Postgres (иконка слоника).

#### 2. Получение connection string

1. Откройте сервис **PostgreSQL** (клик по блоку).
2. Вкладка **Variables** (или **Connect**). Там будут переменные:
   - **`DATABASE_URL`** или **`DATABASE_PUBLIC_URL`** — для подключения снаружи (Vercel, локально) нужен **публичный** URL. Если есть `DATABASE_PUBLIC_URL` — копируйте его; если только `DATABASE_URL` — скопируйте его (для внешнего доступа Railway включает TCP Proxy).
   - При необходимости нажмите **Connect** / **Public URL** и скопируйте строку вида:  
     `postgresql://postgres:PASSWORD@host.railway.app:PORT/railway`
3. Формат: `postgresql://user:password@host:port/railway` (часто с `?sslmode=require` или без — приложение подставит при необходимости).

#### 3. Подключение к Vercel

1. В [Vercel](https://vercel.com) откройте проект → **Settings** → **Environment Variables**.
2. Добавьте или измените переменную:
   - **Name:** `POSTGRES_URL`
   - **Value:** вставьте скопированный connection string из Railway.
3. Сохраните и сделайте **Redeploy** проекта.

#### 4. Инициализация таблиц в Railway

1. В Railway откройте сервис Postgres → вкладка **Data** или **Query** (или **Connect** → открыть в клиенте).
2. Если есть **SQL-консоль** в Railway — выполните там по очереди:
   - сначала содержимое `sql/init.sql`;
   - затем содержимое `sql/migrate_admin.sql`.
3. Если SQL-консоли нет — подключитесь локально по тому же connection string (например, через [pgAdmin](https://www.pgadmin.org/), [DBeaver](https://dbeaver.io/) или `psql`) и выполните оба файла.

После этого приложение на Vercel будет использовать Railway как БД.

---

## БД: Neon (free)

[Neon](https://neon.tech) даёт бесплатный Postgres и удобно подключается к Vercel.

### Создание БД в Neon

1. Зайдите на [neon.tech](https://neon.tech) и войдите (через GitHub можно).
2. **New Project** → укажите имя (например `desk-booking`) и регион.
3. После создания откройте проект → вкладка **Dashboard** или **Connection details**.
4. Скопируйте **Connection string**. Для Vercel (serverless) используйте **Pooled connection** — обычно кнопка «Pooled» или строка с `-pooler` в хосте. Формат:  
   `postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`

### Подключение к Vercel

1. В [Vercel](https://vercel.com) откройте ваш проект (деплой из GitHub).
2. **Settings** → **Environment Variables**.
3. Добавьте переменную:
   - **Name:** `POSTGRES_URL`
   - **Value:** вставьте скопированный connection string из Neon (pooled).
4. Сохраните и сделайте **Redeploy** проекта.

### Инициализация таблиц в Neon

1. В Neon откройте проект → **SQL Editor**.
2. Выполните один раз содержимое файла `sql/init.sql` (см. раздел «Инициализация БД» ниже).

После этого приложение на Vercel будет сохранять брони в Neon.

## Локальный запуск

1. Клонируйте репозиторий и установите зависимости:

```bash
npm install
```

2. Создайте файл `.env.local` и добавьте переменные для подключения к БД (см. ниже).

3. Выполните SQL для создания таблицы (см. раздел «Инициализация БД»).

4. Запустите dev-сервер:

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

## Переменные окружения

- **`POSTGRES_URL`** — connection string из Neon (обязательно **pooled** для Vercel/serverless).

Локально: создайте `.env.local` и добавьте туда `POSTGRES_URL` со значением из Neon (тот же pooled URL). Без этой переменной приложение работает в **демо-режиме** (данные в памяти).

## Инициализация БД

Выполните SQL один раз в **Neon** (SQL Editor) или через `psql` по `POSTGRES_URL`:

```sql
-- Файл: sql/init.sql

CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  desk_id INT NOT NULL CHECK (desk_id BETWEEN 1 AND 6),
  date DATE NOT NULL,
  booked_by VARCHAR(40) NOT NULL,
  note VARCHAR(140),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (desk_id, date)
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date);
```

**Если БД уже была создана раньше** (есть только таблица `bookings`), выполните ещё раз в SQL Editor файл `sql/migrate_admin.sql` — он создаст таблицы `desks`, `settings`, `team_members` и свяжет брони со столами. После этого будет доступна админка по адресу `/admin`.

## Админка (/admin)

- **Участники:** список фамилий и план (желаемое число дней). Добавление, правка, удаление.
- **Столы:** количество (1–12) и названия (например «Стол 1» или «1512.111»). Сохранение применяется к основной сетке бронирования.

Ссылка «Настройки» в шапке главной страницы ведёт в админку.

## Деплой на Vercel

1. Импортируйте репозиторий в [vercel.com](https://vercel.com): **Add New Project** → выберите репозиторий.

2. Подключите БД **Neon** (см. раздел «БД: Neon (free)» выше):
   - Создайте проект в [neon.tech](https://neon.tech), скопируйте **pooled** connection string.
   - В Vercel: **Settings** → **Environment Variables** → добавьте `POSTGRES_URL`.

3. В Neon выполните SQL инициализации (раздел «Инициализация БД»).

4. **Deploy** (или Redeploy). Приложение будет доступно по ссылке вида `https://ваш-проект.vercel.app`.

## API

- **GET** `/api/week?tzOffsetMinutes=<number>`  
  Возвращает даты недели (сегодня + 6 дней), список столов и брони.  
  `tzOffsetMinutes` — `new Date().getTimezoneOffset()` с клиента.

- **POST** `/api/book`  
  Тело: `{ "deskId": 1–6, "date": "YYYY-MM-DD", "bookedBy": "Имя", "note": "необязательно", "tzOffsetMinutes": number }`  
  Ответы: 200 — ок, 409 — слот занят, 400 — невалидные данные.

- **POST** `/api/unbook`  
  Тело: `{ "deskId", "date", "bookedBy" }`  
  Снимает бронь только если `bookedBy` совпадает с записью. 403 — нельзя снять (не своя бронь или её нет).

## Definition of Done

- На `/` отображается неделя вперёд и 6 столов.
- Можно забронировать свободный слот, указав имя.
- Занятый слот не перезаписывается (409).
- Снять бронь можно только при совпадении имени.
- В проде на Vercel данные сохраняются в Postgres.
