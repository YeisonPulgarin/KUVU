const conexion = require('../../config/database');

class GestionPagos {
    static registrarPago(datos, empresaId, callback) {
        const query = `INSERT INTO pago_variados 
            (fechaPago, monto, tipo, descripcion, metodoPago, idArrendatario, idAdministrador, idLocal, idContrato, empresa_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        conexion.query(query, [datos.fechaPago, datos.monto, datos.tipo, datos.descripcion, datos.metodoPago, datos.idArrendatario, datos.idAdministrador, datos.idLocal, datos.idContrato || null, empresaId], callback);
    }

    static consultarPagos(empresaId, callback) {
        const query = `
            SELECT pv.idPagoVariado as id, pv.fechaPago, pv.monto, pv.tipo as tipoPago,
                   u.nombre as nombreArrendatario, l.direccion
            FROM pago_variados pv
            JOIN usuarios u ON pv.idArrendatario = u.idUsuario
            JOIN local l ON pv.idLocal = l.idLocal
            WHERE pv.empresa_id = ?
            ORDER BY pv.fechaPago DESC
        `;
        conexion.query(query, [empresaId], callback);
    }
}

module.exports = GestionPagos;