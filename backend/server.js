const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const conexion = require('./config/database');
const tenantResolver = require('./src/controllers/middleware/tenantResolver');

const Auth = require('./src/controllers/Auth');
const GestionLocales = require('./src/controllers/GestionLocales');
const GestionArrendatarios = require('./src/controllers/GestionArrendatarios');
const GestionContratos = require('./src/controllers/GestionContratos');
const GestionPagos = require('./src/controllers/GestionPagos');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ==========================================
// RUTA PÚBLICA - Configuración de empresa
// ==========================================

app.get('/api/empresa/config', tenantResolver, (req, res) => {
    res.json({
        id: req.empresa.id,
        nombre: req.empresa.nombre,
        subdominio: req.empresa.subdominio,
        color_primario: req.empresa.color_primario,
        color_secundario: req.empresa.color_secundario,
        color_texto: req.empresa.color_texto,
        logo_url: req.empresa.logo_url,
        slogan: req.empresa.slogan
    });
});

// ==========================================
// AUTENTICACIÓN
// ==========================================

app.post('/api/login', tenantResolver, (req, res) => {
    const { email, password } = req.body;
    const empresaId = req.empresaId;

    Auth.iniciarSesion(email, password, empresaId, (err, usuario) => {
        if (err) return res.status(401).json({ error: err.message });
        res.json({ success: true, usuario, mensaje: 'Inicio de sesión exitoso' });
    });
});

// ==========================================
// GESTIÓN DE LOCALES
// ==========================================

app.get('/api/locales', tenantResolver, (req, res) => {
    GestionLocales.consultarLocales(req.empresaId, (err, locales) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(locales);
    });
});

app.post('/api/locales', tenantResolver, (req, res) => {
    GestionLocales.anadirLocal(req.body, req.empresaId, (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: resultado.insertId, mensaje: 'Local añadido' });
    });
});

app.get('/api/locales/:id', tenantResolver, (req, res) => {
    GestionLocales.consultarLocalPorId(req.params.id, req.empresaId, (err, local) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(local[0]);
    });
});

app.put('/api/locales/:id', tenantResolver, (req, res) => {
    GestionLocales.editarLocal(req.params.id, req.body, req.empresaId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Local actualizado' });
    });
});

app.delete('/api/locales/:id', tenantResolver, (req, res) => {
    GestionLocales.eliminarLocal(req.params.id, req.empresaId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Local eliminado' });
    });
});

// ==========================================
// GESTIÓN DE ARRENDATARIOS
// ==========================================

app.get('/api/arrendatarios', tenantResolver, (req, res) => {
    const query = `
        SELECT u.idUsuario AS idArrendatario, u.idUsuario, u.nombre,
               u.documento, u.telefono, u.correo, r.nombreRol AS rol
        FROM usuarios u
        INNER JOIN rol r ON u.idRol = r.idRol
        WHERE u.idRol = 2 AND u.empresa_id = ?
    `;
    conexion.query(query, [req.empresaId], (err, results) => {
        if (err) return res.status(500).json({ error: err.sqlMessage });
        res.json(results);
    });
});

app.post('/api/arrendatarios', tenantResolver, (req, res) => {
    GestionArrendatarios.anadirArrendatario(req.body, req.empresaId, (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: resultado.insertId, mensaje: 'Arrendatario añadido' });
    });
});

app.get('/api/arrendatarios/:id', tenantResolver, (req, res) => {
    GestionArrendatarios.consultarArrendatarioPorId(req.params.id, req.empresaId, (err, arrendatario) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(arrendatario[0]);
    });
});

app.put('/api/arrendatarios/:id', tenantResolver, (req, res) => {
    GestionArrendatarios.actualizarArrendatario(req.params.id, req.body, req.empresaId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Arrendatario actualizado' });
    });
});

app.delete('/api/arrendatarios/:id', tenantResolver, (req, res) => {
    GestionArrendatarios.eliminarArrendatario(req.params.id, req.empresaId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Arrendatario eliminado' });
    });
});

// ==========================================
// GESTIÓN DE CONTRATOS
// ==========================================

app.get('/api/contratos', tenantResolver, (req, res) => {
    GestionContratos.consultarContratos(req.empresaId, (err, contratos) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(contratos);
    });
});

app.post('/api/contratos', tenantResolver, (req, res) => {
    GestionContratos.crearContrato(req.body, req.empresaId, (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: resultado.insertId, mensaje: 'Contrato creado' });
    });
});

app.get('/api/contratos/:id', tenantResolver, (req, res) => {
    GestionContratos.consultarContrato(req.params.id, req.empresaId, (err, contrato) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(contrato[0]);
    });
});

app.put('/api/contratos/:id', tenantResolver, (req, res) => {
    GestionContratos.modificarContrato(req.params.id, req.body, req.empresaId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Contrato actualizado' });
    });
});

app.delete('/api/contratos/:id', tenantResolver, (req, res) => {
    GestionContratos.eliminarContrato(req.params.id, req.empresaId, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Contrato eliminado' });
    });
});

// ==========================================
// GESTIÓN DE PAGOS
// ==========================================

app.get('/api/pagos', tenantResolver, (req, res) => {
    const query = `
        SELECT pv.idPagoVariado as idPago, pv.fechaPago, pv.monto,
               pv.tipo as tipoPago, pv.descripcion, pv.metodoPago,
               pv.idArrendatario, pv.idLocal,
               u.nombre as nombreArrendatario, u.documento as documentoArrendatario,
               l.direccion
        FROM pago_variados pv
        INNER JOIN usuarios u ON pv.idArrendatario = u.idUsuario
        INNER JOIN local l ON pv.idLocal = l.idLocal
        WHERE pv.empresa_id = ?
        ORDER BY pv.fechaPago DESC
    `;
    conexion.query(query, [req.empresaId], (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(resultados);
    });
});

app.post('/api/pagos/registrar', tenantResolver, (req, res) => {
    const { fechaPago, monto, tipoPago, metodoPago,
            idArrendatario, idAdministrador = 11, idLocal, idContrato } = req.body;

    if (!fechaPago || !monto || !tipoPago || !idArrendatario || !idLocal) {
        return res.status(400).json({ success: false, error: 'Faltan datos requeridos' });
    }

    const tipoParaBD = tipoPago === 'Servicios' ? 'Servicio' : tipoPago;
    const descripcion = `Pago de ${tipoPago} - Local ${idLocal}`;

    const query = `
        INSERT INTO pago_variados 
        (fechaPago, monto, tipo, descripcion, metodoPago, idArrendatario, 
         idAdministrador, idLocal, idContrato, empresa_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    conexion.query(query,
        [fechaPago, parseFloat(monto), tipoParaBD, descripcion,
         metodoPago || 'efectivo', parseInt(idArrendatario),
         parseInt(idAdministrador), parseInt(idLocal), idContrato || null, req.empresaId],
        (err, resultado) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, idPago: resultado.insertId, mensaje: 'Pago registrado' });
        }
    );
});

app.get('/api/arrendatarios/:id/pagos', tenantResolver, (req, res) => {
    const query = `
        SELECT pv.idPagoVariado as idPago, pv.fechaPago, pv.monto,
               pv.tipo as tipoPago, pv.descripcion, l.direccion
        FROM pago_variados pv
        INNER JOIN local l ON pv.idLocal = l.idLocal
        WHERE pv.idArrendatario = ? AND pv.empresa_id = ?
        ORDER BY pv.fechaPago DESC
    `;
    conexion.query(query, [req.params.id, req.empresaId], (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(resultados);
    });
});

app.get('/api/arrendatarios/:id/contratos', tenantResolver, (req, res) => {
    const query = `
        SELECT c.idContrato, c.fechaInicio, c.fechaFin, c.condiciones,
               l.idLocal, l.direccion, l.area, l.valorArriendo
        FROM contratoarrendamiento c
        INNER JOIN local l ON c.idLocal = l.idLocal
        WHERE c.idArrendatario = ? AND c.empresa_id = ?
        ORDER BY c.fechaInicio DESC
    `;
    conexion.query(query, [req.params.id, req.empresaId], (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(resultados);
    });
});

app.get('/api/arrendatarios/:id/pagos-pendientes-mes', tenantResolver, (req, res) => {
    const idArrendatario = req.params.id;
    const empresaId = req.empresaId;

    const queryContratos = `
        SELECT c.idContrato, c.idLocal, l.direccion, l.valorArriendo
        FROM contratoarrendamiento c
        INNER JOIN local l ON c.idLocal = l.idLocal
        WHERE c.idArrendatario = ? AND c.empresa_id = ? AND c.fechaFin >= CURDATE()
    `;

    conexion.query(queryContratos, [idArrendatario, empresaId], (err, contratos) => {
        if (err) return res.status(500).json({ error: err.message });
        if (contratos.length === 0) {
            return res.json({ mesActual: obtenerNombreMesActual(), diaLimitePago: 5, pagosPendientes: [] });
        }

        const queryPagosRealizados = `
            SELECT idLocal, tipo FROM pago_variados
            WHERE idArrendatario = ? AND empresa_id = ?
            AND MONTH(fechaPago) = MONTH(CURDATE()) AND YEAR(fechaPago) = YEAR(CURDATE())
        `;

        conexion.query(queryPagosRealizados, [idArrendatario, empresaId], (err, pagosRealizados) => {
            if (err) return res.status(500).json({ error: err.message });

            const pagosMap = new Set(pagosRealizados.map(p => `${p.idLocal}-${p.tipo}`));
            const pagosPendientes = [];
            const fechaLimite = new Date();
            fechaLimite.setDate(5);

            contratos.forEach(contrato => {
                if (!pagosMap.has(`${contrato.idLocal}-Arriendo`)) {
                    pagosPendientes.push({
                        tipo: 'Arriendo',
                        local: contrato.direccion,
                        idLocal: contrato.idLocal,
                        idContrato: contrato.idContrato,
                        monto: parseFloat(contrato.valorArriendo),
                        vencimiento: fechaLimite.toISOString().split('T')[0]
                    });
                }
            });

            res.json({ mesActual: obtenerNombreMesActual(), diaLimitePago: 5, pagosPendientes });
        });
    });
});

// ==========================================
// MANTENIMIENTO
// ==========================================

app.get('/api/mantenimiento/solicitudes', tenantResolver, (req, res) => {
    const query = `
        SELECT m.idMantenimiento as id, m.tipoMantenimiento as tipo_servicio,
               m.descripcion, m.prioridad, m.estado, m.idLocal as local_id,
               l.direccion as local_nombre, a.nombre as arrendatario_nombre,
               m.fecha_creacion
        FROM mantenimiento m
        INNER JOIN local l ON m.idLocal = l.idLocal
        INNER JOIN usuarios a ON m.idArrendatario = a.idUsuario
        WHERE m.empresa_id = ?
        ORDER BY CASE m.prioridad WHEN 'urgente' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, m.idMantenimiento DESC
    `;
    conexion.query(query, [req.empresaId], (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(resultados);
    });
});

app.post('/api/mantenimiento/solicitud', tenantResolver, (req, res) => {
    const { idLocal, idArrendatario, tipoMantenimiento, descripcion, prioridad } = req.body;

    if (!idLocal || !idArrendatario || !tipoMantenimiento || !descripcion) {
        return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    const query = `
        INSERT INTO mantenimiento 
        (idLocal, idArrendatario, tipoMantenimiento, descripcion, prioridad, estado, idAdministrador, empresa_id) 
        VALUES (?, ?, ?, ?, ?, 'pendiente', 11, ?)
    `;

    conexion.query(query,
        [idLocal, idArrendatario, tipoMantenimiento, descripcion, prioridad || 'normal', req.empresaId],
        (err, resultado) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, id: resultado.insertId, message: 'Solicitud creada' });
        }
    );
});

app.post('/api/mantenimiento/actualizar-estado', tenantResolver, (req, res) => {
    const { id, estado } = req.body;
    if (!id || !estado) return res.status(400).json({ success: false, message: 'Datos incompletos' });

    conexion.query('UPDATE mantenimiento SET estado = ? WHERE idMantenimiento = ? AND empresa_id = ?',
        [estado, id, req.empresaId],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: err.message });
            res.json({ success: true, message: 'Estado actualizado' });
        }
    );
});

app.get('/api/arrendatarios/:id/solicitudes-mantenimiento', tenantResolver, (req, res) => {
    const query = `
        SELECT m.idMantenimiento as id, m.tipoMantenimiento as tipo_servicio,
               m.descripcion, m.prioridad, m.estado,
               l.direccion as local_nombre, m.fecha_creacion
        FROM mantenimiento m
        INNER JOIN local l ON m.idLocal = l.idLocal
        WHERE m.idArrendatario = ? AND m.empresa_id = ?
        ORDER BY m.fecha_creacion DESC
    `;
    conexion.query(query, [req.params.id, req.empresaId], (err, resultados) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(resultados);
    });
});

// ==========================================
// ESTADÍSTICAS
// ==========================================

app.get('/api/estadisticas', tenantResolver, (req, res) => {
    const id = req.empresaId;
    const queries = {
        totalLocales: ['SELECT COUNT(*) as total FROM local WHERE empresa_id = ?', [id]],
        totalArrendatarios: ['SELECT COUNT(*) as total FROM usuarios WHERE idRol = 2 AND empresa_id = ?', [id]],
        contratosActivos: ['SELECT COUNT(*) as total FROM contratoarrendamiento WHERE empresa_id = ? AND fechaFin >= CURDATE()', [id]],
        pagosRegistrados: ['SELECT COUNT(*) as total FROM pago_variados WHERE empresa_id = ?', [id]],
        ingresosTotales: ['SELECT COALESCE(SUM(monto), 0) as total FROM pago_variados WHERE empresa_id = ?', [id]]
    };

    const resultados = {};
    let completadas = 0;
    const total = Object.keys(queries).length;

    Object.keys(queries).forEach(key => {
        const [sql, params] = queries[key];
        conexion.query(sql, params, (err, result) => {
            resultados[key] = err ? 0 : result[0].total;
            if (++completadas === total) res.json(resultados);
        });
    });
});

// ==========================================
// REPORTE PAGOS MES
// ==========================================

app.get('/api/pagos/reporte-pagos-mes', tenantResolver, (req, res) => {
    const empresaId = req.empresaId;
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const año = hoy.getFullYear();

    const queryContratos = `
        SELECT u.idUsuario, u.nombre, u.documento, c.idLocal,
               l.direccion, l.valorArriendo, c.idContrato
        FROM usuarios u
        INNER JOIN contratoarrendamiento c ON u.idUsuario = c.idArrendatario
        INNER JOIN local l ON c.idLocal = l.idLocal
        WHERE u.idRol = 2 AND u.empresa_id = ? AND c.fechaFin >= CURRENT_DATE()
        ORDER BY u.nombre
    `;

    conexion.query(queryContratos, [empresaId], async (err, contratos) => {
        if (err) return res.status(500).json({ success: false, error: err.message });

        const pendientes = [];
        const alDia = [];

        for (const contrato of contratos) {
            const pagadoArriendo = await new Promise((resolve) => {
                conexion.query(
                    `SELECT COUNT(*) as count FROM pago_variados 
                     WHERE idArrendatario = ? AND idLocal = ? AND tipo = 'Arriendo'
                     AND MONTH(fechaPago) = ? AND YEAR(fechaPago) = ? AND empresa_id = ?`,
                    [contrato.idUsuario, contrato.idLocal, mes, año, empresaId],
                    (err, r) => resolve(err ? false : r[0].count > 0)
                );
            });

            if (!pagadoArriendo) {
                pendientes.push({
                    nombre: contrato.nombre, documento: contrato.documento,
                    direccion: contrato.direccion, pagadoArriendo: false,
                    valorArriendo: parseFloat(contrato.valorArriendo),
                    totalPendiente: parseFloat(contrato.valorArriendo),
                    conceptosPendientes: 'Arriendo'
                });
            } else {
                alDia.push({
                    nombre: contrato.nombre, documento: contrato.documento,
                    direccion: contrato.direccion, pagadoArriendo: true
                });
            }
        }

        res.json({
            success: true, pendientes, alDia,
            fecha: hoy.toISOString().split('T')[0],
            mes: hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
            diaLimitePago: 5,
            totalPendientes: pendientes.length,
            totalAlDia: alDia.length
        });
    });
});

function obtenerNombreMesActual() {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const f = new Date();
    return `${meses[f.getMonth()]} ${f.getFullYear()}`;
}

app.listen(PORT, () => {
    console.log(`!!!! Servidor corriendo en http://localhost:${PORT}!!!!`);
});