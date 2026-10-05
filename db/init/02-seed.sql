-- KUVU seed data
-- Loaded automatically by the MariaDB entrypoint on first start, in alphabetical
-- order, after 01-schema.sql. Only runs when the data volume is empty.
--
-- Plain INSERTs on purpose: INSERT IGNORE would downgrade a foreign key violation
-- to a warning, letting a broken seed "succeed" while leaving tables empty.
-- Idempotency comes from the volume guard, not from the SQL.

SET NAMES utf8mb4;
USE bd_arrendamientos;

SET FOREIGN_KEY_CHECKS = 0;
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

LOCK TABLES `contratoarrendamiento` WRITE;
/*!40000 ALTER TABLE `contratoarrendamiento` DISABLE KEYS */;
INSERT INTO `contratoarrendamiento` (`idContrato`, `empresa_id`, `fechaInicio`, `fechaFin`, `condiciones`, `idLocal`, `idArrendatario`, `idAdministrador`) VALUES (1,1,'2025-01-01','2026-12-31','Pago mensual anticipado',1,2,1);
INSERT INTO `contratoarrendamiento` (`idContrato`, `empresa_id`, `fechaInicio`, `fechaFin`, `condiciones`, `idLocal`, `idArrendatario`, `idAdministrador`) VALUES (2,2,'2025-01-01','2026-12-31','Pago mensual anticipado',3,4,3);
INSERT INTO `contratoarrendamiento` (`idContrato`, `empresa_id`, `fechaInicio`, `fechaFin`, `condiciones`, `idLocal`, `idArrendatario`, `idAdministrador`) VALUES (3,3,'2025-01-01','2026-12-31','Pago mensual anticipado',5,6,5);
INSERT INTO `contratoarrendamiento` (`idContrato`, `empresa_id`, `fechaInicio`, `fechaFin`, `condiciones`, `idLocal`, `idArrendatario`, `idAdministrador`) VALUES (4,4,'2025-01-01','2026-12-31','Pago mensual anticipado',7,8,7);
/*!40000 ALTER TABLE `contratoarrendamiento` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `empresas` WRITE;
/*!40000 ALTER TABLE `empresas` DISABLE KEYS */;
INSERT INTO `empresas` (`id`, `nombre`, `subdominio`, `color_primario`, `color_secundario`, `color_texto`, `logo_url`, `slogan`, `activo`, `created_at`) VALUES (1,'Amarilo','amarilo','#F5A623','#F0851A','#FFFFFF','images/empresas/amarilo/amarilo.jpg','Tu hogar ideal te espera',1,'2026-03-25 02:04:58');
INSERT INTO `empresas` (`id`, `nombre`, `subdominio`, `color_primario`, `color_secundario`, `color_texto`, `logo_url`, `slogan`, `activo`, `created_at`) VALUES (2,'Nido Rent','nido','#2C7A7B','#38A169','#FFFFFF','images/empresas/nidorent/Muchachos.png','Gestión inteligente de propiedades',1,'2026-03-25 02:04:58');
INSERT INTO `empresas` (`id`, `nombre`, `subdominio`, `color_primario`, `color_secundario`, `color_texto`, `logo_url`, `slogan`, `activo`, `created_at`) VALUES (3,'Balcones de San Soucci','balcones','#8B4513','#A0522D','#FFFFFF','images/empresas/balcones/balcones.jpg','Vive con elegancia',1,'2026-03-25 02:04:58');
INSERT INTO `empresas` (`id`, `nombre`, `subdominio`, `color_primario`, `color_secundario`, `color_texto`, `logo_url`, `slogan`, `activo`, `created_at`) VALUES (4,'Mi Inmueble','miinmueble','#2B4C8C','#3A6FD8','#FFFFFF','images/empresas/miinmueble/miinmueble.jpg','Encuentra tu espacio perfecto',1,'2026-03-25 02:04:58');
/*!40000 ALTER TABLE `empresas` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `local` WRITE;
/*!40000 ALTER TABLE `local` DISABLE KEYS */;
INSERT INTO `local` (`idLocal`, `empresa_id`, `direccion`, `area`, `valorArriendo`, `idAdministrador`) VALUES (1,1,'Calle 42 #11-02 Barrio Doña Luz',70.00,2200000.00,1);
INSERT INTO `local` (`idLocal`, `empresa_id`, `direccion`, `area`, `valorArriendo`, `idAdministrador`) VALUES (2,1,'Calle 24 #34-40 Barrio Centro',40.50,1400000.00,1);
INSERT INTO `local` (`idLocal`, `empresa_id`, `direccion`, `area`, `valorArriendo`, `idAdministrador`) VALUES (3,2,'Calle 42 #11-02 Barrio Doña Luz',70.00,2200000.00,3);
INSERT INTO `local` (`idLocal`, `empresa_id`, `direccion`, `area`, `valorArriendo`, `idAdministrador`) VALUES (4,2,'Calle 24 #34-40 Barrio Centro',40.50,1400000.00,3);
INSERT INTO `local` (`idLocal`, `empresa_id`, `direccion`, `area`, `valorArriendo`, `idAdministrador`) VALUES (5,3,'Calle 11 #12-33 Barrio Grama',80.00,3500000.00,5);
INSERT INTO `local` (`idLocal`, `empresa_id`, `direccion`, `area`, `valorArriendo`, `idAdministrador`) VALUES (6,3,'Calle 5a #24-84 Alborada',40.00,1300000.00,5);
INSERT INTO `local` (`idLocal`, `empresa_id`, `direccion`, `area`, `valorArriendo`, `idAdministrador`) VALUES (7,4,'Calle 11 #12-33 Barrio Grama',80.00,3500000.00,7);
INSERT INTO `local` (`idLocal`, `empresa_id`, `direccion`, `area`, `valorArriendo`, `idAdministrador`) VALUES (8,4,'Calle 5a #24-84 Alborada',40.00,1300000.00,7);
/*!40000 ALTER TABLE `local` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `mantenimiento` WRITE;
/*!40000 ALTER TABLE `mantenimiento` DISABLE KEYS */;
INSERT INTO `mantenimiento` (`idMantenimiento`, `empresa_id`, `idLocal`, `idArrendatario`, `tipoMantenimiento`, `descripcion`, `prioridad`, `estado`, `idAdministrador`, `fecha_creacion`) VALUES (1,1,1,2,'Plomería','Fuga de agua en el baño','urgente','pendiente',1,'2025-10-29 07:01:58');
INSERT INTO `mantenimiento` (`idMantenimiento`, `empresa_id`, `idLocal`, `idArrendatario`, `tipoMantenimiento`, `descripcion`, `prioridad`, `estado`, `idAdministrador`, `fecha_creacion`) VALUES (2,2,3,4,'Electricidad','Apagones frecuentes en el local','normal','en_proceso',3,'2025-10-29 07:01:58');
INSERT INTO `mantenimiento` (`idMantenimiento`, `empresa_id`, `idLocal`, `idArrendatario`, `tipoMantenimiento`, `descripcion`, `prioridad`, `estado`, `idAdministrador`, `fecha_creacion`) VALUES (3,3,5,6,'Pintura','Necesito pintar las paredes','baja','pendiente',5,'2025-10-29 07:01:58');
INSERT INTO `mantenimiento` (`idMantenimiento`, `empresa_id`, `idLocal`, `idArrendatario`, `tipoMantenimiento`, `descripcion`, `prioridad`, `estado`, `idAdministrador`, `fecha_creacion`) VALUES (4,4,7,8,'Aire Acondicionado','El aire no enfría','normal','completado',7,'2025-10-29 07:01:58');
INSERT INTO `mantenimiento` (`idMantenimiento`, `empresa_id`, `idLocal`, `idArrendatario`, `tipoMantenimiento`, `descripcion`, `prioridad`, `estado`, `idAdministrador`, `fecha_creacion`) VALUES (5,4,7,8,'Electricidad','El toma de la habitación principal no quiere funcionar','urgente','pendiente',7,'2026-05-10 06:58:51');
INSERT INTO `mantenimiento` (`idMantenimiento`, `empresa_id`, `idLocal`, `idArrendatario`, `tipoMantenimiento`, `descripcion`, `prioridad`, `estado`, `idAdministrador`, `fecha_creacion`) VALUES (6,4,7,8,'Agua','Se daño el registro del agua','normal','en_proceso',7,'2026-05-10 06:59:48');
/*!40000 ALTER TABLE `mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `pago_variados` WRITE;
/*!40000 ALTER TABLE `pago_variados` DISABLE KEYS */;
INSERT INTO `pago_variados` (`idPagoVariado`, `empresa_id`, `fechaPago`, `monto`, `tipo`, `descripcion`, `metodoPago`, `idArrendatario`, `idAdministrador`, `idLocal`, `idContrato`, `fecha_creacion`) VALUES (1,1,'2025-10-29',2200000.00,'Arriendo','Arriendo octubre - Local 1','transferencia',2,1,1,1,'2025-10-30 00:40:19');
INSERT INTO `pago_variados` (`idPagoVariado`, `empresa_id`, `fechaPago`, `monto`, `tipo`, `descripcion`, `metodoPago`, `idArrendatario`, `idAdministrador`, `idLocal`, `idContrato`, `fecha_creacion`) VALUES (2,1,'2025-11-29',2200000.00,'Arriendo','Arriendo noviembre - Local 1','tarjeta',2,1,1,1,'2025-11-30 00:40:19');
INSERT INTO `pago_variados` (`idPagoVariado`, `empresa_id`, `fechaPago`, `monto`, `tipo`, `descripcion`, `metodoPago`, `idArrendatario`, `idAdministrador`, `idLocal`, `idContrato`, `fecha_creacion`) VALUES (3,2,'2025-10-29',2200000.00,'Arriendo','Arriendo octubre - Local 3','efectivo',4,3,3,2,'2025-10-30 00:40:19');
INSERT INTO `pago_variados` (`idPagoVariado`, `empresa_id`, `fechaPago`, `monto`, `tipo`, `descripcion`, `metodoPago`, `idArrendatario`, `idAdministrador`, `idLocal`, `idContrato`, `fecha_creacion`) VALUES (4,2,'2025-11-29',2200000.00,'Arriendo','Arriendo noviembre - Local 3','transferencia',4,3,3,2,'2025-11-30 00:40:19');
INSERT INTO `pago_variados` (`idPagoVariado`, `empresa_id`, `fechaPago`, `monto`, `tipo`, `descripcion`, `metodoPago`, `idArrendatario`, `idAdministrador`, `idLocal`, `idContrato`, `fecha_creacion`) VALUES (5,3,'2025-10-29',3500000.00,'Arriendo','Arriendo octubre - Local 5','efectivo',6,5,5,3,'2025-10-30 00:40:19');
INSERT INTO `pago_variados` (`idPagoVariado`, `empresa_id`, `fechaPago`, `monto`, `tipo`, `descripcion`, `metodoPago`, `idArrendatario`, `idAdministrador`, `idLocal`, `idContrato`, `fecha_creacion`) VALUES (6,3,'2025-11-29',3500000.00,'Arriendo','Arriendo noviembre - Local 5','tarjeta',6,5,5,3,'2025-11-30 00:40:19');
INSERT INTO `pago_variados` (`idPagoVariado`, `empresa_id`, `fechaPago`, `monto`, `tipo`, `descripcion`, `metodoPago`, `idArrendatario`, `idAdministrador`, `idLocal`, `idContrato`, `fecha_creacion`) VALUES (7,4,'2025-10-29',3500000.00,'Arriendo','Arriendo octubre - Local 7','transferencia',8,7,7,4,'2025-10-30 00:40:19');
INSERT INTO `pago_variados` (`idPagoVariado`, `empresa_id`, `fechaPago`, `monto`, `tipo`, `descripcion`, `metodoPago`, `idArrendatario`, `idAdministrador`, `idLocal`, `idContrato`, `fecha_creacion`) VALUES (8,4,'2025-11-29',3500000.00,'Arriendo','Arriendo noviembre - Local 7','efectivo',8,7,7,4,'2025-11-30 00:40:19');
INSERT INTO `pago_variados` (`idPagoVariado`, `empresa_id`, `fechaPago`, `monto`, `tipo`, `descripcion`, `metodoPago`, `idArrendatario`, `idAdministrador`, `idLocal`, `idContrato`, `fecha_creacion`) VALUES (9,1,'2026-08-28',2200000.00,'Arriendo','Pago de arriendo - Local 1','Tarjeta',2,1,1,1,'2026-08-28 00:53:50');
/*!40000 ALTER TABLE `pago_variados` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `rol` WRITE;
/*!40000 ALTER TABLE `rol` DISABLE KEYS */;
INSERT INTO `rol` (`idRol`, `nombreRol`) VALUES (1,'Administrador');
INSERT INTO `rol` (`idRol`, `nombreRol`) VALUES (2,'Arrendatario');
/*!40000 ALTER TABLE `rol` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` (`idUsuario`, `empresa_id`, `nombre`, `documento`, `telefono`, `correo`, `idRol`) VALUES (1,1,'Administrador 1','123','3000000001','admin1@gmail.com',1);
INSERT INTO `usuarios` (`idUsuario`, `empresa_id`, `nombre`, `documento`, `telefono`, `correo`, `idRol`) VALUES (2,1,'Usuario 1','123','3100000001','usuario1@gmail.com',2);
INSERT INTO `usuarios` (`idUsuario`, `empresa_id`, `nombre`, `documento`, `telefono`, `correo`, `idRol`) VALUES (3,2,'Administrador 2','123','3000000002','admin2@gmail.com',1);
INSERT INTO `usuarios` (`idUsuario`, `empresa_id`, `nombre`, `documento`, `telefono`, `correo`, `idRol`) VALUES (4,2,'Usuario 2','123','3100000002','usuario2@gmail.com',2);
INSERT INTO `usuarios` (`idUsuario`, `empresa_id`, `nombre`, `documento`, `telefono`, `correo`, `idRol`) VALUES (5,3,'Administrador 3','123','3000000003','admin3@gmail.com',1);
INSERT INTO `usuarios` (`idUsuario`, `empresa_id`, `nombre`, `documento`, `telefono`, `correo`, `idRol`) VALUES (6,3,'Usuario 3','123','3100000003','usuario3@gmail.com',2);
INSERT INTO `usuarios` (`idUsuario`, `empresa_id`, `nombre`, `documento`, `telefono`, `correo`, `idRol`) VALUES (7,4,'Administrador 4','123','3000000004','admin4@gmail.com',1);
INSERT INTO `usuarios` (`idUsuario`, `empresa_id`, `nombre`, `documento`, `telefono`, `correo`, `idRol`) VALUES (8,4,'Usuario 4','123','3100000004','usuario4@gmail.com',2);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
SET FOREIGN_KEY_CHECKS = 1;