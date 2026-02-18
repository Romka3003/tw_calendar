# Desk Booking — бронирование столов

Веб-приложение для бронирования рабочих столов на неделю вперёд. Рассчитано на небольшую команду (6 столов, до 10 человек).

## Стек

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS**
- **БД:** Neon (Postgres), free tier — встроенная интеграция с Vercel
- Деплой: **Vercel**

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

Столы не хранятся в БД — в коде используются столы с id 1…6.

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
