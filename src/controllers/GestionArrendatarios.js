const conexion = require('../../config/database');

class GestionArrendatarios {
    static anadirArrendatario(datos, empresaId, callback) {
        const query = 'INSERT INTO usuarios (nombre, documento, telefono, correo, idRol, empresa_id) VALUES (?, ?, ?, ?, 2, ?)';
        conexion.query(query, [datos.nombre, datos.documento, datos.telefono, datos.correo, empresaId], callback);
    }

    static consultarArrendatarioPorId(id, empresaId, callback) {
        const query = 'SELECT * FROM usuarios WHERE idUsuario = ? AND idRol = 2 AND empresa_id = ?';
        conexion.query(query, [id, empresaId], callback);
    }

    static actualizarArrendatario(id, datos, empresaId, callback) {
        const query = 'UPDATE usuarios SET nombre = ?, documento = ?, telefono = ?, correo = ? WHERE idUsuario = ? AND empresa_id = ?';
        conexion.query(query, [datos.nombre, datos.documento, datos.telefono, datos.correo, id, empresaId], callback);
    }

    static eliminarArrendatario(id, empresaId, callback) {
        const queries = [
            ['DELETE FROM pago_variados WHERE idArrendatario = ? AND empresa_id = ?', [id, empresaId]],
            ['DELETE FROM contratoarrendamiento WHERE idArrendatario = ? AND empresa_id = ?', [id, empresaId]],
            ['DELETE FROM usuarios WHERE idUsuario = ? AND empresa_id = ?', [id, empresaId]]
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

module.exports = GestionArrendatarios;