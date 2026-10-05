-- KUVU database schema
-- Loaded automatically by the MariaDB entrypoint on first start, in alphabetical
-- order, before 02-seed.sql. Only runs when the data volume is empty.
--
-- FOREIGN_KEY_CHECKS is disabled because mysqldump emits tables in alphabetical
-- order (contratoarrendamiento, empresas, local, mantenimiento, pago_variados,
-- rol, usuarios), which violates the dependency graph: local references empresas
-- and usuarios, both of which come later.

SET NAMES utf8mb4;
USE bd_arrendamientos;

SET FOREIGN_KEY_CHECKS = 0;
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contratoarrendamiento` (
  `idContrato` int(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` int(11) NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFin` date NOT NULL,
  `condiciones` text DEFAULT NULL,
  `idLocal` int(11) NOT NULL,
  `idArrendatario` int(11) NOT NULL,
  `idAdministrador` int(11) NOT NULL,
  PRIMARY KEY (`idContrato`),
  KEY `idLocal` (`idLocal`),
  KEY `idArrendatario` (`idArrendatario`),
  KEY `idAdministrador` (`idAdministrador`),
  KEY `fk_contrato_empresa` (`empresa_id`),
  CONSTRAINT `contratoarr_ibfk_1` FOREIGN KEY (`idLocal`) REFERENCES `local` (`idLocal`) ON DELETE CASCADE,
  CONSTRAINT `contratoarr_ibfk_2` FOREIGN KEY (`idArrendatario`) REFERENCES `usuarios` (`idUsuario`),
  CONSTRAINT `contratoarr_ibfk_3` FOREIGN KEY (`idAdministrador`) REFERENCES `usuarios` (`idUsuario`),
  CONSTRAINT `fk_contrato_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `empresas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `subdominio` varchar(50) NOT NULL,
  `color_primario` varchar(7) DEFAULT '#2C7A7B',
  `color_secundario` varchar(7) DEFAULT '#38A169',
  `color_texto` varchar(7) DEFAULT '#FFFFFF',
  `logo_url` varchar(255) DEFAULT NULL,
  `slogan` varchar(150) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `subdominio` (`subdominio`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `local` (
  `idLocal` int(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` int(11) NOT NULL,
  `direccion` varchar(150) NOT NULL,
  `area` decimal(10,2) DEFAULT NULL,
  `valorArriendo` decimal(10,2) DEFAULT NULL,
  `idAdministrador` int(11) NOT NULL,
  PRIMARY KEY (`idLocal`),
  KEY `idAdministrador` (`idAdministrador`),
  KEY `fk_local_empresa` (`empresa_id`),
  CONSTRAINT `fk_local_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  CONSTRAINT `local_ibfk_1` FOREIGN KEY (`idAdministrador`) REFERENCES `usuarios` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mantenimiento` (
  `idMantenimiento` int(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` int(11) NOT NULL,
  `idLocal` int(11) NOT NULL,
  `idArrendatario` int(11) NOT NULL,
  `tipoMantenimiento` varchar(50) NOT NULL,
  `descripcion` text NOT NULL,
  `prioridad` enum('baja','normal','urgente') DEFAULT 'normal',
  `estado` enum('pendiente','en_proceso','completado','cancelado') DEFAULT 'pendiente',
  `idAdministrador` int(11) NOT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idMantenimiento`),
  KEY `idLocal` (`idLocal`),
  KEY `idAdministrador` (`idAdministrador`),
  KEY `fk_mantenimiento_arrendatario` (`idArrendatario`),
  KEY `fk_mantenimiento_empresa` (`empresa_id`),
  CONSTRAINT `fk_mantenimiento_arrendatario` FOREIGN KEY (`idArrendatario`) REFERENCES `usuarios` (`idUsuario`),
  CONSTRAINT `fk_mantenimiento_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  CONSTRAINT `mantenimiento_ibfk_1` FOREIGN KEY (`idLocal`) REFERENCES `local` (`idLocal`),
  CONSTRAINT `mantenimiento_ibfk_2` FOREIGN KEY (`idAdministrador`) REFERENCES `usuarios` (`idUsuario`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pago_variados` (
  `idPagoVariado` int(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` int(11) NOT NULL,
  `fechaPago` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tipo` enum('Arriendo','Multa','Otro') NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `metodoPago` varchar(50) DEFAULT 'Efectivo',
  `idArrendatario` int(11) NOT NULL,
  `idAdministrador` int(11) NOT NULL,
  `idLocal` int(11) NOT NULL,
  `idContrato` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idPagoVariado`),
  KEY `fk_pv_arrendatario` (`idArrendatario`),
  KEY `fk_pv_administrador` (`idAdministrador`),
  KEY `fk_pv_local` (`idLocal`),
  KEY `fk_pv_contrato` (`idContrato`),
  KEY `fk_pago_empresa` (`empresa_id`),
  CONSTRAINT `fk_pago_empresa` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  CONSTRAINT `fk_pv_administrador` FOREIGN KEY (`idAdministrador`) REFERENCES `usuarios` (`idUsuario`),
  CONSTRAINT `fk_pv_arrendatario` FOREIGN KEY (`idArrendatario`) REFERENCES `usuarios` (`idUsuario`),
  CONSTRAINT `fk_pv_contrato` FOREIGN KEY (`idContrato`) REFERENCES `contratoarrendamiento` (`idContrato`),
  CONSTRAINT `fk_pv_local` FOREIGN KEY (`idLocal`) REFERENCES `local` (`idLocal`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rol` (
  `idRol` int(11) NOT NULL AUTO_INCREMENT,
  `nombreRol` varchar(50) NOT NULL,
  PRIMARY KEY (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `idUsuario` int(11) NOT NULL AUTO_INCREMENT,
  `empresa_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `documento` varchar(50) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `idRol` int(11) NOT NULL,
  PRIMARY KEY (`idUsuario`),
  KEY `idRol` (`idRol`),
  KEY `fk_usr_emp` (`empresa_id`),
  CONSTRAINT `fk_usr_emp` FOREIGN KEY (`empresa_id`) REFERENCES `empresas` (`id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`idRol`) REFERENCES `rol` (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
SET FOREIGN_KEY_CHECKS = 1;