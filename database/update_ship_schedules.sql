-- Hapus kolom 'service' jika tidak diperlukan
ALTER TABLE ship_schedules DROP COLUMN IF EXISTS service;

-- Perbarui data awal jika diperlukan
UPDATE `ship_schedules` SET `mean` = 0 WHERE `service` IS NULL;