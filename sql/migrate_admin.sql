-- Миграция: таблицы для админки (участники, столы, настройки)
-- Выполнить один раз после init.sql (если БД уже была создана раньше)

-- Столы: id 1..12, название. Показываем первые num_desks штук
CREATE TABLE IF NOT EXISTS desks (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL
);

INSERT INTO desks (id, name) VALUES
  (1, 'Стол 1'), (2, 'Стол 2'), (3, 'Стол 3'), (4, 'Стол 4'),
  (5, 'Стол 5'), (6, 'Стол 6'), (7, 'Стол 7'), (8, 'Стол 8'),
  (9, 'Стол 9'), (10, 'Стол 10'), (11, 'Стол 11'), (12, 'Стол 12')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Настройки: количество отображаемых столов
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(64) PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT INTO settings (key, value) VALUES ('num_desks', '6')
ON CONFLICT (key) DO NOTHING;

-- Участники команды: фамилия и желаемое кол-во дней (план)
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  desired_days INT NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Убрать жёсткую проверку desk_id 1..6 и привязать к таблице desks
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_desk_id_check;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_desk_id_fkey'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_desk_id_fkey
      FOREIGN KEY (desk_id) REFERENCES desks(id) ON DELETE RESTRICT;
  END IF;
END $$;
