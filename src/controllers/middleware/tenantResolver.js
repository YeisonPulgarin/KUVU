const conexion = require('../../../config/database');

function tenantResolver(req, res, next) {
    const host = req.hostname; // ej: amarilo.localhost o amarilo.tusistema.com
    const partes = host.split('.');
    const subdominio = partes[0];

    // En desarrollo local, si no hay subdominio real, usar header o query param
    const tenantSubdominio = subdominio !== 'localhost' ? subdominio : 
                             (req.headers['x-tenant'] || req.query.tenant || 'amarilo');

    const query = 'SELECT * FROM empresas WHERE subdominio = ? AND activo = 1';

    conexion.query(query, [tenantSubdominio], (err, resultados) => {
        if (err) {
            return res.status(500).json({ error: 'Error resolviendo tenant' });
        }

        if (resultados.length === 0) {
            return res.status(404).json({ error: `Empresa '${tenantSubdominio}' no encontrada` });
        }

        req.empresa = resultados[0]; // { id, nombre, subdominio, color_primario, ... }
        req.empresaId = resultados[0].id;
        next();
    });
}

module.exports = tenantResolver;