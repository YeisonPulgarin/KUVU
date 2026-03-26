const conexion = require('../../config/database');

class GestionLocales {
    static anadirLocal(datosLocal, empresaId, callback) {
        const query = 'INSERT INTO local (direccion, area, valorArriendo, idAdministrador, empresa_id) VALUES (?, ?, ?, ?, ?)';
        conexion.query(query, [datosLocal.direccion, datosLocal.area, datosLocal.valorArriendo, datosLocal.idAdministrador, empresaId], callback);
    }

    static consultarLocales(empresaId, callback) {
        const query = 'SELECT * FROM local WHERE empresa_id = ? ORDER BY idLocal ASC';
        conexion.query(query, [empresaId], callback);
    }

    static consultarLocalPorId(id, empresaId, callback) {
        const query = 'SELECT * FROM local WHERE idLocal = ? AND empresa_id = ?';
        conexion.query(query, [id, empresaId], callback);
    }

    static editarLocal(id, datosActualizados, empresaId, callback) {
        const query = 'UPDATE local SET direccion = ?, area = ?, valorArriendo = ?, idAdministrador = ? WHERE idLocal = ? AND empresa_id = ?';
        conexion.query(query, [datosActualizados.direccion, datosActualizados.area, datosActualizados.valorArriendo, datosActualizados.idAdministrador, id, empresaId], callback);
    }

    static eliminarLocal(id, empresaId, callback) {
        const queries = [
            ['DELETE FROM pago_variados WHERE idLocal = ? AND empresa_id = ?', [id, empresaId]],
            ['DELETE FROM contratoarrendamiento WHERE idLocal = ? AND empresa_id = ?', [id, empresaId]],
            ['DELETE FROM local WHERE idLocal = ? AND empresa_id = ?', [id, empresaId]]
        ];

        let i = 0;
        function next() {
            if (i >= queries.length) return callback(null, { success: true });
            const [sql, params] = queries[i++];
            conexion.query(sql, params, (err) => {
                if (err) return callback(err);
                next();
            });
        }
        next();
    }
}

module.exports = GestionLocales;