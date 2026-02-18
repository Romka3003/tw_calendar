-- Таблица бронирований столов
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  desk_id INT NOT NULL CHECK (desk_id BETWEEN 1 AND 6),
  date DATE NOT NULL,
  booked_by VARCHAR(40) NOT NULL,
  note VARCHAR(140),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (desk_id, date)
);

-- Индекс для быстрого выборки по датам
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (date);
