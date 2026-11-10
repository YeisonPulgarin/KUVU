-- 03-auth-columnas.sql — password columns for `usuarios`.
--
-- Idempotent and additive only: it adds columns (existing rows get NULL / 0) and never
-- changes or drops columns, rows, indexes or foreign keys. Running it twice is a no-op.
--
-- New installation: runs automatically after 01-schema.sql and 02-seed.sql (empty volume).
--
-- Existing database (kuvu_db with data), from the repo root:
--   1. Full backup first, and check it ends with "-- Dump completed":
--        docker exec kuvu_db sh -c 'exec mysqldump -uroot -p"$MARIADB_ROOT_PASSWORD" --single-transaction --routines --triggers --databases bd_arrendamientos' > db/backups/bd_arrendamientos-AAAAMMDD-HHMMSS.sql
--   2. This file:
--        docker exec -i kuvu_db sh -c 'exec mysql -uroot -p"$MARIADB_ROOT_PASSWORD" bd_arrendamientos' < db/init/03-auth-columnas.sql
--   3. Temporary passwords (= each user's document, change required), from backend/:
--        npm run passwords:bootstrap
--   4. Check: SELECT COUNT(*) FROM usuarios WHERE password_hash IS NULL;  -- expected 0
--   Restore if anything fails:
--        docker exec -i kuvu_db sh -c 'exec mysql -uroot -p"$MARIADB_ROOT_PASSWORD"' < db/backups/<file>.sql

ALTER TABLE `usuarios`
  ADD COLUMN IF NOT EXISTS `password_hash`         VARCHAR(60) NULL,
  ADD COLUMN IF NOT EXISTS `debe_cambiar_password` TINYINT(1)  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `intentos_fallidos`     INT(11)     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `bloqueado_hasta`       DATETIME    NULL;
