const conexion = require('../../config/database');

class Auth {
    static iniciarSesion(email, password, empresaId, callback) {
        const query = `
            SELECT u.idUsuario, u.nombre, u.correo, u.documento, r.idRol, r.nombreRol 
            FROM usuarios u 
            INNER JOIN rol r ON u.idRol = r.idRol 
            WHERE u.correo = ? AND u.documento = ? AND u.empresa_id = ?
        `;
        conexion.query(query, [email, password, empresaId], (err, resultados) => {
            if (err) return callback(err, null);
            if (resultados.length > 0) {
                callback(null, {
                    idUsuario: resultados[0].idUsuario,
                    nombre: resultados[0].nombre,
                    correo: resultados[0].correo,
                    documento: resultados[0].documento,
                    idRol: resultados[0].idRol,
                    rol: resultados[0].nombreRol
                });
            } else {
                callback(new Error("Credenciales inválidas"), null);
            }
        });
    }
}

module.exports = Auth;