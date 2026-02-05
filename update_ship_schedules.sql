-- Tambahkan kolom 'service' jika belum ada
ALTER TABLE ship_schedules ADD COLUMN IF NOT EXISTS service VARCHAR(255);

-- Tambahkan kolom 'mean' jika belum ada
ALTER TABLE ship_schedules ADD COLUMN IF NOT EXISTS mean VARCHAR(255);