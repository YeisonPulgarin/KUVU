-- 04-auth-seed.sql — temporary passwords for the demo users of 02-seed.sql.
--
-- New installation only (runs after 03-auth-columnas.sql on an empty volume). Each demo user
-- gets their document ('123') as a temporary password, with a change required on first
-- sign-in. One bcrypt hash per user (cost 12), so equal passwords still have different hashes.
--
-- Harmless on an existing database: it only matches rows whose document is still '123'
-- and that have no hash yet. Existing databases use `npm run passwords:bootstrap` instead.

UPDATE `usuarios` SET `password_hash` = '$2b$12$uLEeKsNELBUP1pAV0h5pcueah7RKD5B4AEHYSBMJLFjs4qFNmW4Vu', `debe_cambiar_password` = 1 WHERE `idUsuario` = 1 AND `documento` = '123' AND `password_hash` IS NULL;
UPDATE `usuarios` SET `password_hash` = '$2b$12$idGUancFZJQJzdEUMf5fsOWFhSGFoijtAaMCJov.JyycHlcDNaZqu', `debe_cambiar_password` = 1 WHERE `idUsuario` = 2 AND `documento` = '123' AND `password_hash` IS NULL;
UPDATE `usuarios` SET `password_hash` = '$2b$12$P.4f/ACqmUEeuM7yz2QK6.n3Bc.Hd1MHb7.V0B4ZzN/4hEzYHJej.', `debe_cambiar_password` = 1 WHERE `idUsuario` = 3 AND `documento` = '123' AND `password_hash` IS NULL;
UPDATE `usuarios` SET `password_hash` = '$2b$12$2HfX3Q1hOYuM0CLE2Y5eyOQLSq8nXUTp40Hg4D0nTZBmEBDk.6x6q', `debe_cambiar_password` = 1 WHERE `idUsuario` = 4 AND `documento` = '123' AND `password_hash` IS NULL;
UPDATE `usuarios` SET `password_hash` = '$2b$12$/1BziLVa5PE8vFwCSlkvheVeFtr87fgRhrqG.AqqWzXt8M41BLsTy', `debe_cambiar_password` = 1 WHERE `idUsuario` = 5 AND `documento` = '123' AND `password_hash` IS NULL;
UPDATE `usuarios` SET `password_hash` = '$2b$12$mlvWStwVdFuAfho0y03quOq.jedSKEwWfN1zwxrGJW17d8j.qJuqC', `debe_cambiar_password` = 1 WHERE `idUsuario` = 6 AND `documento` = '123' AND `password_hash` IS NULL;
UPDATE `usuarios` SET `password_hash` = '$2b$12$4xxgDwuCNf8CfZNmX6QS8O3lB0al//Zt2RNkF12QD7Y.A286jONA6', `debe_cambiar_password` = 1 WHERE `idUsuario` = 7 AND `documento` = '123' AND `password_hash` IS NULL;
UPDATE `usuarios` SET `password_hash` = '$2b$12$r1yySdqigFy7SAf6UdnkJeCn0Yvu47WPYT5WBzqLyLeOOQ1Vy/O1i', `debe_cambiar_password` = 1 WHERE `idUsuario` = 8 AND `documento` = '123' AND `password_hash` IS NULL;
