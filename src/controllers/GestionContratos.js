const conexion = require('../../config/database');

class GestionContratos {
    static crearContrato(datos, empresaId, callback) {
        const query = 'INSERT INTO contratoarrendamiento (fechaInicio, fechaFin, condiciones, idLocal, idArrendatario, idAdministrador, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        conexion.query(query, [datos.fechaInicio, datos.fechaFin, datos.condiciones, datos.idLocal, datos.idArrendatario, datos.idAdministrador, empresaId], callback);
    }

    static consultarContratos(empresaId, callback) {
        const query = `
            SELECT c.idContrato as id, c.fechaInicio, c.fechaFin, c.condiciones,
                   l.direccion, u.nombre as nombreArrendatario, l.valorArriendo, l.area
            FROM contratoarrendamiento c
            JOIN local l ON c.idLocal = l.idLocal
            JOIN usuarios u ON c.idArrendatario = u.idUsuario
            WHERE c.empresa_id = ?
            ORDER BY c.idContrato ASC
        `;
        conexion.query(query, [empresaId], callback);
    }

    static consultarContrato(id, empresaId, callback) {
        const query = `
            SELECT c.idContrato as id, c.fechaInicio, c.fechaFin, c.condiciones,
                   c.idLocal, c.idArrendatario, c.idAdministrador,
                   l.direccion, u.nombre as nombreArrendatario
            FROM contratoarrendamiento c
            JOIN local l ON c.idLocal = l.idLocal
            JOIN usuarios u ON c.idArrendatario = u.idUsuario
            WHERE c.idContrato = ? AND c.empresa_id = ?
        `;
        conexion.query(query, [id, empresaId], callback);
    }

    static modificarContrato(id, datos, empresaId, callback) {
        const query = 'UPDATE contratoarrendamiento SET fechaInicio = ?, fechaFin = ?, condiciones = ? WHERE idContrato = ? AND empresa_id = ?';
        conexion.query(query, [datos.fechaInicio, datos.fechaFin, datos.condiciones, id, empresaId], callback);
    }

    static eliminarContrato(id, empresaId, callback) {
        const query = 'DELETE FROM contratoarrendamiento WHERE idContrato = ? AND empresa_id = ?';
        conexion.query(query, [id, empresaId], callback);
    }
}

module.exports = GestionContratos;