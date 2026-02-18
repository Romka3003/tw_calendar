# Desk Booking — бронирование столов

Веб-приложение для бронирования рабочих столов на неделю вперёд. Рассчитано на небольшую команду (6 столов, до 10 человек).

## Стек

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS**
- **Vercel Postgres** (Neon) через `@vercel/postgres`
- Деплой: **Vercel**

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

## Переменные окружения (Vercel Postgres)

При использовании **Vercel Postgres** в проекте Vercel подключается хранилище Postgres (Neon). В локальной разработке нужны те же переменные в `.env.local`:

- `POSTGRES_URL` — URL подключения (pool)
- `POSTGRES_URL_NON_POOLING` — URL прямого подключения (опционально, для миграций)

Получить их можно так:

1. В [Vercel Dashboard](https://vercel.com) откройте проект.
2. **Storage** → создайте или выберите **Postgres** (Vercel Postgres / Neon).
3. Подключите хранилище к проекту — переменные появятся в **Settings → Environment Variables**.

Для локального запуска скопируйте `POSTGRES_URL` и при необходимости `POSTGRES_URL_NON_POOLING` в `.env.local`.

## Инициализация БД

Выполните SQL один раз (через Vercel Dashboard → Storage → ваша БД → Query, или через `psql` по `POSTGRES_URL`):

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

1. Залейте проект в Git (GitHub, GitLab, Bitbucket).

2. В [vercel.com](https://vercel.com): **Add New Project** → импортируйте репозиторий.

3. Подключите **Vercel Postgres**:
   - В проекте: **Storage** → **Create Database** → **Postgres**.
   - Подключите созданную БД к проекту (переменные `POSTGRES_*` подставятся автоматически).

4. Выполните SQL инициализации (см. выше) в консоли вашей БД в Vercel/Neon.

5. Деплой: **Deploy**. После сборки приложение будет доступно по URL вида `https://ваш-проект.vercel.app`.

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
