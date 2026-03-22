const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const conexion = require('./config/database');

const Auth = require('./src/controllers/Auth');
const GestionLocales = require('./src/controllers/GestionLocales');
const GestionArrendatarios = require('./src/controllers/GestionArrendatarios');
const GestionContratos = require('./src/controllers/GestionContratos');
const GestionPagos = require('./src/controllers/GestionPagos');
const GestionServicios = require('./src/controllers/GestionServicios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta principal
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Sistema de Arrendamientos funcionando' });
});

// ==========================================
// AUTENTICACIÓN
// ==========================================

app.post('/api/login', (req, res) => {
    console.log(' Ruta /api/login alcanzada');
    console.log(' Body recibido:', req.body);
    
    const { email, password } = req.body;
    
    Auth.iniciarSesion(email, password, (err, usuario) => {
        if (err) {
            console.log(' Error en login:', err.message);
            return res.status(401).json({ error: err.message });
        }
        console.log(' Usuario autenticado:', usuario);
        res.json({ success: true, usuario, mensaje: 'Inicio de sesión exitoso' });
    });
});

// ==========================================
// GESTIÓN DE LOCALES
// ==========================================

app.get('/api/locales', (req, res) => {
    GestionLocales.consultarLocales((err, locales) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(locales);
    });
});

app.post('/api/locales', (req, res) => {
    GestionLocales.anadirLocal(req.body, (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: resultado.insertId, mensaje: 'Local añadido' });
    });
});

app.get('/api/locales/:id', (req, res) => {
    GestionLocales.consultarLocalPorId(req.params.id, (err, local) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(local[0]);
    });
});

app.put('/api/locales/:id', (req, res) => {
    GestionLocales.editarLocal(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Local actualizado' });
    });
});

app.delete('/api/locales/:id', (req, res) => {
    GestionLocales.eliminarLocal(req.params.id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Local eliminado' });
    });
});

// ==========================================
// GESTIÓN DE ARRENDATARIOS
// ==========================================

app.get('/api/arrendatarios', (req, res) => {
    console.log(' Obteniendo lista de arrendatarios');

    const query = `
        SELECT 
            u.idUsuario AS idArrendatario,
            u.idUsuario,
            u.nombre,
            u.documento,
            u.telefono,
            u.correo,
            r.nombreRol AS rol
        FROM usuarios u
        INNER JOIN rol r ON u.idRol = r.idRol
        WHERE u.idRol = 2;
    `;

    conexion.query(query, (err, results) => {
        if (err) {
            console. error(' Error obteniendo arrendatarios:', err.sqlMessage);
            return res.status(500).json({ error: err.sqlMessage });
        }

        console.log(` Arrendatarios obtenidos: ${results.length}`);
        res.json(results);
    });
});

app.post('/api/arrendatarios', (req, res) => {
    console.log(' Datos recibidos para nuevo arrendatario:', req.body);
    GestionArrendatarios.anadirArrendatario(req.body, (err, resultado) => {
        if (err) {
            console. error(' Error al agregar arrendatario:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(' Arrendatario agregado exitosamente, ID:', resultado.insertId);
        res.json({ success: true, id: resultado.insertId, mensaje: 'Arrendatario añadido' });
    });
});

app.get('/api/arrendatarios/:id', (req, res) => {
    GestionArrendatarios.consultarArrendatarioPorId(req.params.id, (err, arrendatario) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(arrendatario[0]);
    });
});

app.put('/api/arrendatarios/:id', (req, res) => {
    GestionArrendatarios.actualizarArrendatario(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Arrendatario actualizado' });
    });
});

app.delete('/api/arrendatarios/:id', (req, res) => {
    console.log(' Eliminando arrendatario ID:', req.params.id);
    GestionArrendatarios.eliminarArrendatario(req.params.id, (err) => {
        if (err) {
            console. error(' Error eliminando arrendatario:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, mensaje: 'Arrendatario eliminado' });
    });
});

// ==========================================
// GESTIÓN DE CONTRATOS
// ==========================================

app.get('/api/contratos', (req, res) => {
    GestionContratos.consultarContratos((err, contratos) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(contratos);
    });
});

app.post('/api/contratos', (req, res) => {
    GestionContratos.crearContrato(req.body, (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: resultado.insertId, mensaje: 'Contrato creado' });
    });
});

app.put('/api/contratos/:id', (req, res) => {
    GestionContratos.modificarContrato(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, mensaje: 'Contrato actualizado' });
    });
});

app.get('/api/contratos/:id', (req, res) => {
    GestionContratos.consultarContrato(req.params.id, (err, contrato) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(contrato[0]);
    });
});

app.delete('/api/contratos/:id', (req, res) => {
    console.log(' Eliminando contrato ID:', req.params.id);
    GestionContratos.eliminarContrato(req.params.id, (err) => {
        if (err) {
            console. error(' Error eliminando contrato:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(' Contrato eliminado exitosamente');
        res.json({ success: true, mensaje: 'Contrato eliminado' });
    });
});

// ==========================================
// GESTIÓN DE PAGOS - VERSIÓN COMPLETAMENTE CORREGIDA
// ==========================================

// ✅ Obtener TODOS los pagos (para administrador) - CORREGIDO
app.get('/api/pagos', (req, res) => {
    console.log('  Obteniendo todos los pagos desde pago_variados');
    
    const query = `
        SELECT 
            pv.idPagoVariado as idPago,
            pv.fechaPago,
            pv.monto,
            pv.tipo as tipoPago,
            pv.descripcion,
            pv.metodoPago,
            pv.idArrendatario,
            pv.idLocal,
            pv.idServicio,
            u.nombre as nombreArrendatario,
            u.documento as documentoArrendatario,
            l.direccion
        FROM pago_variados pv
        INNER JOIN usuarios u ON pv.idArrendatario = u.idUsuario
        INNER JOIN local l ON pv.idLocal = l.idLocal
        ORDER BY pv.fechaPago DESC
    `;
    
    conexion.query(query, (err, resultados) => {
        if (err) {
            console. error(' Error obteniendo pagos:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error al obtener pagos: ' + err.message 
            });
        }
        
        console.log(` Enviando ${resultados.length} pagos`);
        res.json(resultados);
    });
});


// ✅ ENDPOINT CORREGIDO - Obtener pagos simples de un arrendatario
app.get('/api/arrendatarios/:idArrendatario/pagos-simple', (req, res) => {
    const { idArrendatario } = req.params;
    console.log('  [BACKEND] Obteniendo pagos simples para arrendatario:', idArrendatario);
    
    const query = `
        SELECT 
            pv.idPagoVariado as idPago,
            pv.fechaPago,
            pv.monto,
            CASE 
                WHEN pv.tipo = 'Servicio' THEN 'Servicios'
                ELSE pv.tipo 
            END as tipoPago,
            pv.descripcion,
            l.direccion
            -- REMOVED: pv.comprobante (no existe en la tabla)
        FROM pago_variados pv
        INNER JOIN local l ON pv.idLocal = l.idLocal
        WHERE pv.idArrendatario = ?
        ORDER BY pv.fechaPago DESC
    `;
    
    conexion.query(query, [idArrendatario], (err, resultados) => {
        if (err) {
            console. error(' [BACKEND] Error obteniendo pagos simples:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error al cargar pagos: ' + err.message 
            });
        }
        
        console.log(` [BACKEND] Enviando ${resultados.length} pagos simples para arrendatario ${idArrendatario}`);
        res.json(resultados);
    });
});


// ✅ ENDPOINT DE DEBUG - Ver todos los pagos de un arrendatario
app.get('/api/debug/arrendatarios/:idArrendatario/pagos', (req, res) => {
    const { idArrendatario } = req.params;
    console.log(' [DEBUG] Verificando TODOS los pagos para:', idArrendatario);
    
    const query = `
        SELECT 
            pv.*,
            l.direccion,
            u.nombre as nombreArrendatario
        FROM pago_variados pv
        INNER JOIN local l ON pv.idLocal = l.idLocal
        INNER JOIN usuarios u ON pv.idArrendatario = u.idUsuario
        WHERE pv.idArrendatario = ?
        ORDER BY pv.fechaPago DESC
    `;
    
    conexion.query(query, [idArrendatario], (err, resultados) => {
        if (err) {
            console. error(' [DEBUG] Error:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log(`🐛 [DEBUG] Total pagos en BD: ${resultados.length}`);
        resultados.forEach((pago, index) => {
            console.log(`🐛 Pago ${index + 1}:`, {
                id: pago.idPagoVariado,
                fecha: pago.fechaPago,
                monto: pago.monto,
                tipo: pago.tipo,
                comprobante: pago.comprobante,
                arrendatario: pago.nombreArrendatario
            });
        });
        
        res.json(resultados);
    });
});

// ==========================================
// ENDPOINT: PAGOS PENDIENTES DEL MES (CORREGIDO)
// ==========================================

app.get('/api/arrendatarios/:id/pagos-pendientes-mes', (req, res) => {
    const idArrendatario = req.params.id;
    console.log('📅 Calculando pagos pendientes para arrendatario:', idArrendatario);
    
    // Paso 1: Obtener contratos activos
    const queryContratos = `
        SELECT 
            c.idContrato,
            c.idLocal,
            l.direccion,
            l.valorArriendo
        FROM contratoarrendamiento c
        INNER JOIN local l ON c.idLocal = l.idLocal
        WHERE c.idArrendatario = ?
        AND c.fechaFin >= CURDATE()
    `;
    
    conexion.query(queryContratos, [idArrendatario], (err, contratos) => {
        if (err) {
            console.error('❌ Error obteniendo contratos:', err);
            return res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
        
        if (contratos.length === 0) {
            return res.json({
                mesActual: obtenerNombreMesActual(),
                diaLimitePago: 5,
                pagosPendientes: []
            });
        }
        
        console.log(`📋 Contratos activos encontrados: ${contratos.length}`);
        
        // Paso 2: Verificar pagos ya realizados este mes
        const queryPagosRealizados = `
            SELECT 
                idLocal,
                tipo,
                DATE_FORMAT(fechaPago, '%Y-%m') as mes_pago
            FROM pago_variados
            WHERE idArrendatario = ?
            AND MONTH(fechaPago) = MONTH(CURDATE())
            AND YEAR(fechaPago) = YEAR(CURDATE())
        `;
        
        conexion.query(queryPagosRealizados, [idArrendatario], (err, pagosRealizados) => {
            if (err) {
                console.error('❌ Error verificando pagos:', err);
                return res.status(500).json({ 
                    success: false,
                    error: err.message 
                });
            }
            
            console.log(`✅ Pagos realizados este mes: ${pagosRealizados.length}`);
            
            // Crear mapa de pagos realizados
            const pagosRealizadosMap = new Set();
            pagosRealizados.forEach(pago => {
                const key = `${pago.idLocal}-${pago.tipo}`;
                pagosRealizadosMap.add(key);
                console.log(`✓ Ya pagado: ${key}`);
            });
            
            // Paso 3: Consultar servicios de cada local
            const promesasServicios = contratos.map(contrato => {
                return new Promise((resolve) => {
                    const queryServicios = `
                        SELECT 
                            s.idServicio,
                            s.nombreServicio,
                            s.valorServicio
                        FROM local_servicio ls
                        INNER JOIN servicio s ON ls.idServicio = s.idServicio
                        WHERE ls.idLocal = ? 
                        AND ls.incluido = 'Si'
                    `;
                    
                    conexion.query(queryServicios, [contrato.idLocal], (err, servicios) => {
                        if (err) {
                            console.error(`❌ Error servicios local ${contrato.idLocal}:`, err);
                            resolve({ ...contrato, servicios: [] });
                        } else {
                            resolve({ ...contrato, servicios: servicios || [] });
                        }
                    });
                });
            });
            
            // Esperar a que se carguen todos los servicios
            Promise.all(promesasServicios).then(contratosConServicios => {
                const pagosPendientes = [];
                const fechaLimite = new Date();
                fechaLimite.setDate(5);
                
                contratosConServicios.forEach(contrato => {
                    console.log(`\n🏢 Procesando local: ${contrato.direccion}`);
                    
                    // ✅ VERIFICAR ARRIENDO
                    const keyArriendo = `${contrato.idLocal}-Arriendo`;
                    const arriendoPagado = pagosRealizadosMap.has(keyArriendo);
                    console.log(`  💰 Arriendo: ${arriendoPagado ? '✅ PAGADO' : '❌ PENDIENTE'}`);
                    
                    if (!arriendoPagado) {
                        pagosPendientes.push({
                            tipo: 'Arriendo',
                            local: `${contrato.direccion} (Local #${contrato.idLocal})`,
                            idLocal: contrato.idLocal,
                            idContrato: contrato.idContrato,
                            monto: parseFloat(contrato.valorArriendo),
                            descripcion: `Arriendo mensual del local ${contrato.direccion}`,
                            vencimiento: fechaLimite.toISOString().split('T')[0],
                            servicios: []
                        });
                    }
                    
                    // ✅ VERIFICAR SERVICIOS
                    if (contrato.servicios && contrato.servicios.length > 0) {
                        const keyServicios = `${contrato.idLocal}-Servicio`;
                        const serviciosPagados = pagosRealizadosMap.has(keyServicios);
                        console.log(`  ⚡ Servicios: ${serviciosPagados ? '✅ PAGADOS' : '❌ PENDIENTES'}`);
                        
                        if (!serviciosPagados) {
                            const montoServicios = contrato.servicios.reduce((sum, s) => 
                                sum + parseFloat(s.valorServicio), 0
                            );
                            
                            const nombresServicios = contrato.servicios
                                .map(s => s.nombreServicio)
                                .join(', ');
                            
                            pagosPendientes.push({
                                tipo: 'Servicios',
                                local: `${contrato.direccion} (Local #${contrato.idLocal})`,
                                idLocal: contrato.idLocal,
                                idContrato: contrato.idContrato,
                                monto: montoServicios,
                                descripcion: `Servicios del local: ${nombresServicios}`,
                                vencimiento: fechaLimite.toISOString().split('T')[0],
                                servicios: contrato.servicios.map(s => ({
                                    idServicio: s.idServicio,
                                    nombre: s.nombreServicio,
                                    valor: parseFloat(s.valorServicio)
                                }))
                            });
                        }
                    }
                });
                
                console.log(`\n📊 RESUMEN: ${pagosPendientes.length} pagos pendientes`);
                pagosPendientes.forEach(p => {
                    console.log(`  - ${p.tipo}: ${p.local} - $${p.monto.toLocaleString()}`);
                });
                
                res.json({
                    mesActual: obtenerNombreMesActual(),
                    diaLimitePago: 5,
                    pagosPendientes: pagosPendientes.sort((a, b) => {
                        // Ordenar por local primero, luego por tipo
                        if (a.idLocal === b.idLocal) {
                            return a.tipo === 'Arriendo' ? -1 : 1;
                        }
                        return a.idLocal - b.idLocal;
                    })
                });
            });
        });
    });
});

// Función auxiliar para obtener el nombre del mes actual
function obtenerNombreMesActual() {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const fecha = new Date();
    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
}


// ✅ Compatibilidad con ruta antigua - CORREGIDO
app.get('/api/arrendatarios/:id/pagos', (req, res) => {
    const idArrendatario = req.params.id;
    console.log(`  Obteniendo pagos del arrendatario ${idArrendatario}`);
    
    const query = `
        SELECT 
            pv.idPagoVariado as idPago,
            pv.fechaPago,
            pv.monto,
            pv.tipo as tipoPago,
            pv.descripcion,
            l.direccion
        FROM pago_variados pv
        INNER JOIN local l ON pv.idLocal = l.idLocal
        WHERE pv.idArrendatario = ?
        ORDER BY pv.fechaPago DESC
    `;
    
    conexion.query(query, [idArrendatario], (err, resultados) => {
        if (err) {
            console. error(' Error obteniendo pagos:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(` Enviando ${resultados.length} pagos`);
        res.json(resultados);
    });
});

app.get('/api/pagos/reporte-pagos-mes', (req, res) => {
    console.log('📊 [BACKEND] Generando reporte de pagos del mes...');
    
    const DIA_LIMITE_PAGO = 5;
    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const añoActual = hoy.getFullYear();
    
    // Query principal: Obtener todos los contratos activos
    const queryContratos = `
        SELECT 
            u.idUsuario,
            u.nombre,
            u.documento,
            c.idLocal,
            l.direccion,
            l.valorArriendo,
            c.idContrato
        FROM usuarios u
        INNER JOIN contratoarrendamiento c ON u.idUsuario = c.idArrendatario
        INNER JOIN local l ON c.idLocal = l.idLocal
        WHERE u.idRol = 2
          AND c.fechaFin >= CURRENT_DATE()
        ORDER BY u.nombre
    `;
    
    conexion.query(queryContratos, async (err, contratos) => {
        if (err) {
            console.error('❌ [BACKEND] Error obteniendo contratos:', err);
            return res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
        
        console.log(`📋 [BACKEND] Contratos activos encontrados: ${contratos.length}`);
        
        const pendientes = [];
        const alDia = [];
        
        // Procesar cada contrato
        for (const contrato of contratos) {
            try {
                // 1. Verificar si pagó ARRIENDO este mes
                const queryPagoArriendo = `
                    SELECT COUNT(*) as count 
                    FROM pago_variados 
                    WHERE idArrendatario = ?
                      AND idLocal = ?
                      AND tipo = 'Arriendo'
                      AND MONTH(fechaPago) = ?
                      AND YEAR(fechaPago) = ?
                `;
                
                const resultArriendo = await new Promise((resolve, reject) => {
                    conexion.query(queryPagoArriendo, 
                        [contrato.idUsuario, contrato.idLocal, mesActual, añoActual], 
                        (err, result) => {
                            if (err) reject(err);
                            else resolve(result[0].count > 0);
                        }
                    );
                });
                
                // 2. Obtener servicios del local
                const queryServicios = `
                    SELECT s.idServicio, s.nombreServicio, s.valorServicio
                    FROM local_servicio ls
                    INNER JOIN servicio s ON ls.idServicio = s.idServicio
                    WHERE ls.idLocal = ?
                      AND ls.incluido = 'Si'
                `;
                
                const servicios = await new Promise((resolve, reject) => {
                    conexion.query(queryServicios, [contrato.idLocal], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                
                let resultServicios = true;
                
                if (servicios.length > 0) {
                    // 3. Verificar si pagó SERVICIOS este mes
                    const queryPagoServicios = `
                        SELECT COUNT(*) as count 
                        FROM pago_variados 
                        WHERE idArrendatario = ?
                          AND idLocal = ?
                          AND tipo = 'Servicio'
                          AND MONTH(fechaPago) = ?
                          AND YEAR(fechaPago) = ?
                    `;
                    
                    resultServicios = await new Promise((resolve, reject) => {
                        conexion.query(queryPagoServicios, 
                            [contrato.idUsuario, contrato.idLocal, mesActual, añoActual], 
                            (err, result) => {
                                if (err) reject(err);
                                else resolve(result[0].count > 0);
                            }
                        );
                    });
                }
                
                // 4. Calcular valores
                const valorServicios = servicios.reduce((sum, s) => 
                    sum + parseFloat(s.valorServicio), 0
                );
                
                const pagadoArriendo = resultArriendo;
                const pagadoServicios = resultServicios;
                const tieneServicios = servicios.length > 0;
                
                // 5. Clasificar arrendatario
                if (!pagadoArriendo || (tieneServicios && !pagadoServicios)) {
                    // 🔴 TIENE PAGOS PENDIENTES
                    let totalPendiente = 0;
                    const conceptosPendientes = [];
                    
                    if (!pagadoArriendo) {
                        totalPendiente += parseFloat(contrato.valorArriendo);
                        conceptosPendientes.push('Arriendo');
                    }
                    
                    if (tieneServicios && !pagadoServicios) {
                        totalPendiente += valorServicios;
                        conceptosPendientes.push('Servicios');
                    }
                    
                    pendientes.push({
                        nombre: contrato.nombre,
                        documento: contrato.documento,
                        direccion: contrato.direccion,
                        pagadoArriendo: pagadoArriendo,
                        valorArriendo: parseFloat(contrato.valorArriendo),
                        pagadoServicios: pagadoServicios,
                        valorServicios: valorServicios,
                        serviciosPendientes: tieneServicios && !pagadoServicios ? servicios.length : 0,
                        totalPendiente: totalPendiente,
                        conceptosPendientes: conceptosPendientes.join(', '),
                        montoArriendo: !pagadoArriendo ? parseFloat(contrato.valorArriendo) : 0,
                        montoServicios: (tieneServicios && !pagadoServicios) ? valorServicios : 0
                    });
                } else {
                    // ✅ ESTÁ AL DÍA
                    alDia.push({
                        nombre: contrato.nombre,
                        documento: contrato.documento,
                        direccion: contrato.direccion,
                        pagadoArriendo: pagadoArriendo,
                        pagadoServicios: tieneServicios ? pagadoServicios : true,
                        tieneServicios: tieneServicios
                    });
                }
                
            } catch (error) {
                console.error(`❌ [BACKEND] Error procesando contrato de ${contrato.nombre}:`, error);
            }
        }
        
        // Respuesta final
        console.log(`✅ [BACKEND] Reporte generado: ${pendientes.length} pendientes, ${alDia.length} al día`);
        
        res.json({
            success: true,
            pendientes: pendientes,
            alDia: alDia,
            fecha: hoy.toISOString().split('T')[0],
            mes: hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
            diaLimitePago: DIA_LIMITE_PAGO,
            totalPendientes: pendientes.length,
            totalAlDia: alDia.length
        });
    });
});


// ✅ Obtener pagos completos (con servicios) - CORREGIDO
app.get('/api/arrendatarios/:idArrendatario/pagos-completos', (req, res) => {
    const { idArrendatario } = req.params;
    console.log(' Solicitando pagos completos para:', idArrendatario);
    
    // Query corregida - usar pago_variados (singular) en vez de pagos_variados
    const query = `
        SELECT 
            pv.idPagoVariado as idPago,
            pv.fechaPago,
            pv.monto,
            pv.tipo as tipoPago,
            l.direccion
        FROM pago_variados pv
        INNER JOIN local l ON pv.idLocal = l.idLocal
        WHERE pv.idArrendatario = ?
        ORDER BY pv.fechaPago DESC
    `;
    
    conexion.query(query, [idArrendatario], (err, resultados) => {
        if (err) {
            console. error(' Error obteniendo pagos completos:', err);
            return res.status(500).json({ 
                success: false, 
                error: err.message 
            });
        }
        
        console.log(` Enviando ${resultados.length} pagos completos`);
        res.json(resultados);
    });
});

// ✅ 1. ENDPOINT: Obtener pagos pendientes del mes actual
app.get('/api/arrendatarios/:idArrendatario/pagos-pendientes-mes', async (req, res) => {
    const { idArrendatario } = req.params;
    const DIA_LIMITE_PAGO = 5;
    
    console.log('💳 Obteniendo pagos pendientes para arrendatario:', idArrendatario);
    
    try {
        // Obtener contratos activos del arrendatario
        const queryContratos = `
            SELECT 
                c.idContrato,
                c.idLocal,
                l.direccion,
                l.valorArriendo,
                c.fechaInicio,
                c.fechaFin
            FROM contratoarrendamiento c
            INNER JOIN local l ON c.idLocal = l.idLocal
            WHERE c.idArrendatario = ?
              AND c.fechaFin >= CURRENT_DATE()
        `;
        
        conexion.query(queryContratos, [idArrendatario], async (err, contratos) => {
            if (err) {
                console.error('❌ Error obteniendo contratos:', err);
                return res.status(500).json({ error: err.message });
            }
            
            if (contratos.length === 0) {
                return res.json({ pagosPendientes: [], mensaje: 'No tienes contratos activos' });
            }
            
            const pagosPendientes = [];
            
            // Para cada contrato, verificar pagos pendientes
            for (const contrato of contratos) {
                // 1. Verificar si pagó ARRIENDO este mes
                const queryPagoArriendo = `
                    SELECT COUNT(*) as count 
                    FROM pago_variados 
                    WHERE idArrendatario = ?
                      AND idLocal = ?
                      AND tipo = 'Arriendo'
                      AND MONTH(fechaPago) = MONTH(CURRENT_DATE())
                      AND YEAR(fechaPago) = YEAR(CURRENT_DATE())
                `;
                
                const pagoArriendo = await new Promise((resolve, reject) => {
                    conexion.query(queryPagoArriendo, [idArrendatario, contrato.idLocal], (err, result) => {
                        if (err) reject(err);
                        else resolve(result[0].count === 0);
                    });
                });
                
                if (pagoArriendo) {
                    pagosPendientes.push({
                        tipo: 'Arriendo',
                        local: contrato.direccion,
                        idLocal: contrato.idLocal,
                        idContrato: contrato.idContrato,
                        monto: parseFloat(contrato.valorArriendo),
                        descripcion: `Arriendo de ${contrato.direccion}`,
                        vencimiento: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(DIA_LIMITE_PAGO).padStart(2, '0')}`
                    });
                }
                
                // 2. Verificar si pagó SERVICIOS este mes
                const queryServicios = `
                    SELECT s.idServicio, s.nombreServicio, s.valorServicio
                    FROM local_servicio ls
                    INNER JOIN servicio s ON ls.idServicio = s.idServicio
                    WHERE ls.idLocal = ?
                      AND ls.incluido = 'Si'
                `;
                
                const servicios = await new Promise((resolve, reject) => {
                    conexion.query(queryServicios, [contrato.idLocal], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                
                if (servicios.length > 0) {
                    // Verificar si pagó servicios este mes
                    const queryPagoServicios = `
                        SELECT COUNT(*) as count 
                        FROM pago_variados 
                        WHERE idArrendatario = ?
                          AND idLocal = ?
                          AND tipo = 'Servicio'
                          AND MONTH(fechaPago) = MONTH(CURRENT_DATE())
                          AND YEAR(fechaPago) = YEAR(CURRENT_DATE())
                    `;
                    
                    const pagoServicios = await new Promise((resolve, reject) => {
                        conexion.query(queryPagoServicios, [idArrendatario, contrato.idLocal], (err, result) => {
                            if (err) reject(err);
                            else resolve(result[0].count === 0);
                        });
                    });
                    
                    if (pagoServicios) {
                        const montoServicios = servicios.reduce((total, s) => total + parseFloat(s.valorServicio), 0);
                        
                        pagosPendientes.push({
                            tipo: 'Servicios',
                            local: contrato.direccion,
                            idLocal: contrato.idLocal,
                            idContrato: contrato.idContrato,
                            monto: montoServicios,
                            descripcion: `Servicios: ${servicios.map(s => s.nombreServicio).join(', ')}`,
                            servicios: servicios,
                            vencimiento: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(DIA_LIMITE_PAGO).padStart(2, '0')}`
                        });
                    }
                }
            }
            
            console.log(`✅ Pagos pendientes encontrados: ${pagosPendientes.length}`);
            res.json({ 
                pagosPendientes,
                mesActual: new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
                diaLimite: DIA_LIMITE_PAGO
            });
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ Compatibilidad con ruta antigua
app.get('/api/arrendatarios/:id/pagos', (req, res) => {
    const idArrendatario = req.params.id;
    console.log(`  Obteniendo pagos del arrendatario ${idArrendatario}`);
    
    const query = `
        SELECT 
            pv.idPagoVariado as idPago,
            pv.fechaPago,
            pv.monto,
            pv.tipoPago,
            l.direccion,
            pv.comprobante,
            pv.estado
        FROM pagos_variados pv
        INNER JOIN local l ON pv.idLocal = l.idLocal
        WHERE pv.idArrendatario = ?
        ORDER BY pv.fechaPago DESC
    `;
    
    conexion.query(query, [idArrendatario], (err, resultados) => {
        if (err) {
            console. error(' Error obteniendo pagos:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(` Enviando ${resultados.length} pagos`);
        res.json(resultados);
    });
});

// ==========================================
// ENDPOINT REGISTRAR PAGO - VERSIÓN CORREGIDA
// ==========================================

app.post('/api/pagos/registrar', (req, res) => {
    console.log('💳 [BACKEND] Registrando pago:', req.body);
    
    const {
        fechaPago,
        monto,
        tipoPago,
        metodoPago,
        idArrendatario,
        idAdministrador = 11,
        idLocal,
        idContrato,
        servicios = []
    } = req.body;
    
    // Validación robusta
    if (!fechaPago || !monto || !tipoPago || !idArrendatario || !idLocal) {
        console.error('❌ Datos incompletos:', { fechaPago, monto, tipoPago, idArrendatario, idLocal });
        return res.status(400).json({ 
            success: false, 
            error: 'Faltan datos requeridos para registrar el pago'
        });
    }
    
    console.log('✅ Datos validados correctamente');
    
    // Construir descripción específica
    let descripcion = '';
    let tipoParaBD = tipoPago;
    
    if (tipoPago === 'Arriendo') {
        descripcion = `Pago de arriendo mensual - Local ${idLocal}`;
        tipoParaBD = 'Arriendo';
    } else if (tipoPago === 'Servicios') {
        if (servicios.length > 0) {
            const nombresServicios = servicios.map(s => s.nombre || s.nombreServicio).join(', ');
            descripcion = `Pago de servicios: ${nombresServicios} - Local ${idLocal}`;
        } else {
            descripcion = `Pago de servicios públicos - Local ${idLocal}`;
        }
        tipoParaBD = 'Servicio'; // ⚠️ Importante: usar 'Servicio' sin 's' para la BD
    }
    
    console.log('📝 Descripción generada:', descripcion);
    console.log('📝 Tipo para BD:', tipoParaBD);
    
    // Query corregida
    const queryPago = `
        INSERT INTO pago_variados 
        (fechaPago, monto, tipo, descripcion, metodoPago, idArrendatario, idAdministrador, idLocal, idContrato) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const valoresPago = [
        fechaPago, 
        parseFloat(monto), 
        tipoParaBD, // ⚠️ Usar 'Arriendo' o 'Servicio'
        descripcion,
        metodoPago || 'efectivo', 
        parseInt(idArrendatario), 
        parseInt(idAdministrador), 
        parseInt(idLocal), 
        idContrato || null
    ];
    
    console.log('🔄 Ejecutando query con valores:', valoresPago);
    
    conexion.query(queryPago, valoresPago, (err, resultado) => {
        if (err) {
            console.error('❌ Error insertando pago:', err.message);
            console.error('🔍 Detalle del error:', err);
            return res.status(500).json({ 
                success: false, 
                error: 'Error al guardar pago en la base de datos: ' + err.message 
            });
        }
        
        const idPagoVariado = resultado.insertId;
        console.log('✅ Pago guardado exitosamente con ID:', idPagoVariado);
        
        // Si hay servicios específicos, registrar cada uno
        if (servicios.length > 0) {
            console.log(`📦 Registrando ${servicios.length} servicios individuales...`);
            
            let serviciosRegistrados = 0;
            const erroresServicios = [];
            
            servicios.forEach((servicio, index) => {
                const queryServicio = `
                    INSERT INTO pago_variados 
                    (fechaPago, monto, tipo, descripcion, metodoPago, idArrendatario, idAdministrador, idLocal, idContrato, idServicio) 
                    VALUES (?, ?, 'Servicio', ?, ?, ?, ?, ?, ?, ?)
                `;
                
                const valoresServicio = [
                    fechaPago,
                    parseFloat(servicio.precio || servicio.valor || 0),
                    `Servicio ${servicio.nombre} - Local ${idLocal}`,
                    metodoPago || 'efectivo',
                    parseInt(idArrendatario),
                    parseInt(idAdministrador),
                    parseInt(idLocal),
                    idContrato || null,
                    parseInt(servicio.id || servicio.idServicio)
                ];
                
                conexion.query(queryServicio, valoresServicio, (errServ, resultServ) => {
                    if (errServ) {
                        console.error(`❌ Error registrando servicio ${index + 1}:`, errServ.message);
                        erroresServicios.push(servicio.nombre);
                    } else {
                        serviciosRegistrados++;
                        console.log(`✅ Servicio ${servicio.nombre} registrado con ID:`, resultServ.insertId);
                    }
                    
                    // Cuando todos los servicios se procesaron
                    if (serviciosRegistrados + erroresServicios.length === servicios.length) {
                        if (erroresServicios.length > 0) {
                            console.warn('⚠️ Algunos servicios no se registraron:', erroresServicios);
                        }
                        console.log(`✅ Total servicios registrados: ${serviciosRegistrados}/${servicios.length}`);
                    }
                });
            });
        }
        
        // Generar comprobante
        const comprobante = `PAGO-${idPagoVariado}-${Date.now().toString().slice(-6)}`;
        
        res.json({ 
            success: true, 
            idPago: idPagoVariado,
            comprobante: comprobante,
            message: '✅ Pago registrado correctamente',
            detalles: {
                tipo: tipoPago,
                monto: monto,
                local: idLocal,
                fecha: fechaPago
            }
        });
    });
});

// ==========================================
// GESTIÓN DE SERVICIOS
// ==========================================

app.get('/api/servicios', (req, res) => {
    GestionServicios.consultarServicios((err, servicios) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(servicios);
    });
});

app.post('/api/servicios', (req, res) => {
    GestionServicios.registrarServicio(req.body, (err, resultado) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: resultado.insertId, mensaje: 'Servicio registrado' });
    });
});

// ==========================================
// SERVICIOS POR LOCAL
// ==========================================

app.get('/api/servicios-por-local', (req, res) => {
    console.log(' [BACKEND] Obteniendo servicios por local...');
    
    const query = `
        SELECT 
            l.idLocal,
            l.direccion,
            COALESCE(GROUP_CONCAT(DISTINCT s.nombreServicio SEPARATOR ', '), 'Sin servicios') AS servicios,
            COALESCE(SUM(DISTINCT s.valorServicio), 0) AS valorTotalServicios
        FROM local l
        LEFT JOIN local_servicio ls ON l.idLocal = ls.idLocal
        LEFT JOIN servicio s ON ls.idServicio = s.idServicio
        GROUP BY l.idLocal, l.direccion
        ORDER BY l.idLocal
    `;
    
    conexion.query(query, (error, results) => {
        if (error) {
            console. error(' [BACKEND] Error en consulta:', error);
            return res.status(500).json({
                success: false,
                error: 'Error al obtener servicios: ' + error.message
            });
        }
        
        console.log(` [BACKEND] Enviando ${results.length} locales`);
        res.json(results);
    });
});

app.post('/api/servicios-por-local', (req, res) => {
    console.log(' [BACKEND] Agregando servicio a local:', req.body);
    
    const { idLocal, idServicio } = req.body;
    
    if (!idLocal || !idServicio) {
        return res.status(400).json({
            success: false,
            error: 'Se requieren idLocal e idServicio'
        });
    }
    
    const checkQuery = 'SELECT * FROM local_servicio WHERE idLocal = ? AND idServicio = ?';
    
    conexion.query(checkQuery, [idLocal, idServicio], (error, results) => {
        if (error) {
            console. error(' [BACKEND] Error verificando existencia:', error);
            return res.status(500).json({
                success: false,
                error: 'Error verificando servicio: ' + error.message
            });
        }
        
        if (results.length > 0) {
            console.log(' Servicio ya asignado a este local');
            return res.status(400).json({
                success: false,
                error: ' Este servicio ya está asignado a este local'
            });
        }
        
        const insertQuery = 'INSERT INTO local_servicio (idLocal, idServicio, incluido) VALUES (?, ?, "Si")';
        
        conexion.query(insertQuery, [idLocal, idServicio], (error, results) => {
            if (error) {
                console. error(' [BACKEND] Error en inserción:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Error de base de datos: ' + error.message
                });
            }
            
            console.log(' [BACKEND] Servicio agregado exitosamente');
            res.json({
                success: true,
                message: ' Servicio agregado al local exitosamente',
                insertId: results.insertId
            });
        });
    });
});

app.get('/api/servicios-disponibles', (req, res) => {
    const query = 'SELECT idServicio as id, nombreServicio, valorServicio FROM servicio';
    
    conexion.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ 
                success: false,
                error: 'Error al obtener servicios: ' + error.message 
            });
        }
        res.json(results);
    });
});

app.get('/api/locales/:id/servicios', (req, res) => {
    const idLocal = req.params.id;
    
    const query = `
        SELECT 
            s.idServicio,
            s.nombreServicio,
            s.valorServicio
        FROM servicio s
        INNER JOIN local_servicio ls ON s.idServicio = ls.idServicio
        WHERE ls.idLocal = ? AND ls.incluido = 'Si'
    `;
    
    conexion.query(query, [idLocal], (error, results) => {
        if (error) {
            return res.status(500).json({ 
                success: false,
                error: 'Error al obtener servicios: ' + error.message 
            });
        }
        res.json(results);
    });
});

// ==========================================
// MANTENIMIENTO - CORREGIDO
// ==========================================

app.get('/api/mantenimiento/solicitudes', (req, res) => {
    const query = `
        SELECT 
            m.idMantenimiento as id,
            m.tipoMantenimiento as tipo_servicio,
            m.descripcion,
            m.prioridad,
            m.estado,
            m.idLocal as local_id,
            l.direccion as local_nombre,
            a.nombre as arrendatario_nombre,
            m.fecha_creacion as fecha_creacion
        FROM mantenimiento m
        INNER JOIN local l ON m.idLocal = l.idLocal
        INNER JOIN usuarios a ON m.idArrendatario = a.idUsuario
        ORDER BY 
            CASE m.prioridad
                WHEN 'urgente' THEN 1
                WHEN 'normal' THEN 2
                WHEN 'baja' THEN 3
            END,
            m.idMantenimiento DESC
    `;
    
    conexion.query(query, (err, resultados) => {
        if (err) {
            console. error(' Error obteniendo solicitudes:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(resultados);
    });
});


app.post('/api/mantenimiento/actualizar-estado', (req, res) => {
    const { id, estado } = req.body;
    
    if (!id || !estado) {
        return res.status(400).json({ 
            success: false, 
            message: 'Datos incompletos' 
        });
    }
    
    const query = 'UPDATE mantenimiento SET estado = ? WHERE idMantenimiento = ?';
    
    conexion.query(query, [estado, id], (err, resultado) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: err.message 
            });
        }
        res.json({ 
            success: true, 
            message: 'Estado actualizado correctamente' 
        });
    });
});


// ==========================================
// CREAR SOLICITUD DE MANTENIMIENTO - VERSIÓN CORREGIDA
// ==========================================

app.post('/api/mantenimiento/solicitud', (req, res) => {
    console.log(' [BACKEND] Recibiendo solicitud de mantenimiento:', req.body);
    
    const { idLocal, idArrendatario, tipoMantenimiento, descripcion, prioridad } = req.body;
    
    // Validación completa
    if (!idLocal || !idArrendatario || !tipoMantenimiento || !descripcion) {
        console. error(' [BACKEND] Datos incompletos:', req.body);
        return res.status(400).json({
            success: false,
            message: 'Faltan campos requeridos: idLocal, idArrendatario, tipoMantenimiento, descripcion'
        });
    }
    
    const query = `
        INSERT INTO mantenimiento 
        (idLocal, idArrendatario, tipoMantenimiento, descripcion, prioridad, estado, idAdministrador) 
        VALUES (?, ?, ?, ?, ?, 'pendiente', 11)
    `;
    
    const valores = [idLocal, idArrendatario, tipoMantenimiento, descripcion, prioridad || 'normal'];
    
    console.log(' [BACKEND] Ejecutando query:', query);
    console.log(' [BACKEND] Con valores:', valores);
    
    conexion.query(query, valores, (err, resultado) => {
        if (err) {
            console. error(' [BACKEND] Error en base de datos:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Error de base de datos: ' + err.message 
            });
        }
        
        console.log(' [BACKEND] Solicitud creada con ID:', resultado.insertId);
        res.json({ 
            success: true, 
            id: resultado.insertId,
            message: 'Solicitud creada correctamente' 
        });
    });
});


app.get('/api/arrendatarios/:id/contratos', (req, res) => {
    const idArrendatario = req.params.id;
    // console.log(`📄 Obteniendo contratos del arrendatario ${idArrendatario}`); // ← COMENTAR
    
    const query = `
        SELECT 
            c.idContrato,
            c.fechaInicio,
            c.fechaFin,
            c.condiciones,
            l.idLocal,
            l.direccion,
            l.area,
            l.valorArriendo
        FROM contratoarrendamiento c
        INNER JOIN local l ON c.idLocal = l.idLocal
        WHERE c.idArrendatario = ?
        ORDER BY c.fechaInicio DESC
    `;
    
    conexion.query(query, [idArrendatario], (err, resultados) => {
        if (err) {
            console. error(' Error obteniendo contratos:', err);
            return res.status(500).json({ error: err.message });
        }
        // console.log(` Enviando ${resultados.length} contratos`); // ← COMENTAR
        res.json(resultados);
    });
});

// ==========================================
// SOLICITUDES DE MANTENIMIENTO POR ARRENDATARIO - CORREGIDO
// ==========================================

app.get('/api/arrendatarios/:id/solicitudes-mantenimiento', (req, res) => {
    const idArrendatario = req.params.id;
    console.log(`📋 Obteniendo solicitudes del arrendatario ${idArrendatario}`);
    
    const query = `
        SELECT 
            m.idMantenimiento as id,
            m.tipoMantenimiento as tipo_servicio,
            m.descripcion,
            m.prioridad,
            m.estado,
            l.direccion as local_nombre,
            m.fecha_creacion as fecha_creacion
        FROM mantenimiento m
        INNER JOIN local l ON m.idLocal = l.idLocal
        WHERE m.idArrendatario = ?
        ORDER BY m.fecha_creacion DESC
    `;
    
    conexion.query(query, [idArrendatario], (err, resultados) => {
        if (err) {
            console. error(' Error obteniendo solicitudes del arrendatario:', err);
            return res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
        console.log(` Enviando ${resultados.length} solicitudes del arrendatario`);
        res.json(resultados);
    });
});

// ==========================================
// RUTAS DE PAGOS DEL ARRENDATARIO - ACTUALIZADAS
// ==========================================

// ✅ ENDPOINT PRINCIPAL - Obtener todos los pagos variados
app.get('/api/arrendatarios/:idArrendatario/pagos', (req, res) => {
    const { idArrendatario } = req.params;
    console.log('  Obteniendo pagos del arrendatario:', idArrendatario);
    
    const query = `
        SELECT 
            pv.idPagoVariado,
            pv.fechaPago,
            pv.montoTotal,
            pv.tipoPago,
            pv.metodoPago,
            pv.comprobante,
            pv.estado,
            pv.detalleServicios,
            l.direccion,
            l.idLocal
        FROM pago_variados pv
        INNER JOIN local l ON pv.idLocal = l.idLocal
        WHERE pv.idArrendatario = ?
        ORDER BY pv.fechaPago DESC
    `;
    
    conexion.query(query, [idArrendatario], (err, resultados) => {
        if (err) {
            console. error(' Error obteniendo pagos:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error al cargar pagos: ' + err.message 
            });
        }
        
        console.log(` Enviando ${resultados.length} pagos`);
        res.json(resultados);
    });
});


// ✅ ENDPOINT POR TIPO DE PAGO
app.get('/api/arrendatarios/:idArrendatario/pagos/:tipo', (req, res) => {
    const { idArrendatario, tipo } = req.params;
    console.log(`📥 Solicitando pagos de tipo ${tipo} para:`, idArrendatario);

    const query = `
        SELECT 
            pv.idPagoVariado,
            pv.fechaPago,
            pv.montoTotal as monto,
            pv.tipoPago,
            pv.comprobante,
            pv.estado,
            l.direccion,
            pv.detalleServicios
        FROM pago_variados pv
        INNER JOIN local l ON pv.idLocal = l.idLocal 
        WHERE pv.idArrendatario = ? AND pv.tipoPago = ? AND pv.estado = 'completado'
        ORDER BY pv.fechaPago DESC
    `;
    
    conexion.query(query, [idArrendatario, tipo], (err, resultados) => {
        if (err) {
            console.error(` ERROR en /pagos/${tipo}:`, err);
            return res.status(500).json({ 
                success: false,
                error: `Error al cargar pagos de ${tipo}: ` + err.message 
            });
        }
        
        console.log(` Pagos de ${tipo} encontrados: ${resultados.length}`);
        res.json(resultados);
    });
});

// ==========================================
// OBTENER SERVICIOS DE UN PAGO - ENDPOINT FALTANTE
// ==========================================

app.get('/api/pagos/:idPago/servicios', (req, res) => {
    const { idPago } = req.params;
    console.log(' Solicitando servicios para pago:', idPago);
    
    // Como tu tabla pago_variados no tiene relación directa con servicios,
    // devolvemos un array vacío por ahora
    res.json([]);
});

// ==========================================
// OBTENER SERVICIOS DE UN PAGO VARIADO
// ==========================================

app.get('/api/pagos/:idPago/servicios', (req, res) => {
    const { idPago } = req.params;
    console.log(' Obteniendo detalle del pago variado:', idPago);
    
    const query = `
        SELECT 
            detalleServicios
        FROM pago_variados 
        WHERE idPagoVariado = ?
    `;
    
    conexion.query(query, [idPago], (err, resultados) => {
        if (err) {
            console. error(' Error obteniendo detalle del pago:', err);
            return res.status(500).json({ 
                success: false,
                error: err.message 
            });
        }
        
        if (resultados.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Pago no encontrado'
            });
        }
        
        const pago = resultados[0];
        console.log(' Detalle del pago obtenido');
        
        // Devolver el detalle como un objeto estructurado
        res.json({
            detalleServicios: pago.detalleServicios,
            tieneServicios: pago.detalleServicios && pago.detalleServicios.length > 0
        });
    });
});

// ==========================================
// ESTADÍSTICAS ACTUALIZADAS
// ==========================================

app.get('/api/estadisticas', (req, res) => {
    console.log(' Obteniendo estadísticas actualizadas...');
    
    const queries = {
        totalLocales: 'SELECT COUNT(*) as total FROM local',
        totalArrendatarios: 'SELECT COUNT(*) as total FROM usuarios WHERE idRol = 2',
        contratosActivos: `SELECT COUNT(*) as total FROM contratoarrendamiento 
                          WHERE fechaFin >= CURDATE() OR fechaFin IS NULL`,
        pagosRegistrados: 'SELECT COUNT(*) as total FROM pago_variados WHERE estado = "completado"',
        serviciosActivos: 'SELECT COUNT(*) as total FROM servicio WHERE estado = "activo"',
        ingresosTotales: 'SELECT COALESCE(SUM(montoTotal), 0) as total FROM pago_variados WHERE estado = "completado"'
    };
    
    const resultados = {};
    let consultasCompletadas = 0;
    const totalConsultas = Object.keys(queries).length;
    
    Object.keys(queries).forEach(key => {
        conexion.query(queries[key], (err, result) => {
            if (err) {
                console.error(` Error en estadística ${key}:`, err);
                resultados[key] = 0;
            } else {
                resultados[key] = result[0].total;
            }
            
            consultasCompletadas++;
            
            if (consultasCompletadas === totalConsultas) {
                console.log(' Estadísticas calculadas:', resultados);
                res.json(resultados);
            }
        });
    });
});

// ==========================================
// RUTA PARA REORGANIZAR IDS DE LOCALES
// ==========================================

app.post('/api/locales/reorganizar', (req, res) => {
    const queries = [
        'SET FOREIGN_KEY_CHECKS = 0',
        'CREATE TABLE local_temp AS SELECT * FROM local',
        'TRUNCATE TABLE local',
        'INSERT INTO local (direccion, area, valorArriendo, idAdministrador) SELECT direccion, area, valorArriendo, idAdministrador FROM local_temp ORDER BY idLocal',
        'DROP TABLE local_temp',
        'SET FOREIGN_KEY_CHECKS = 1'
    ];
    
    let currentQuery = 0;
    
    function executeNextQuery() {
        if (currentQuery >= queries.length) {
            res.json({ success: true, mensaje: 'IDs reorganizados' });
            return;
        }
        
        conexion.query(queries[currentQuery], (err) => {
            if (err) {
                console.error('Error en query:', queries[currentQuery], err);
                res.status(500).json({ error: 'Error reorganizando IDs' });
                return;
            }
            currentQuery++;
            executeNextQuery();
        });
    }
    
    executeNextQuery();
});


// ✅ ENDPOINT DE DEBUG LIMPIO
app.get('/api/debug/arrendatarios/:idArrendatario/pagos', (req, res) => {
    const { idArrendatario } = req.params;
    
    const query = `
        SELECT 
            pv.idPagoVariado,
            pv.fechaPago,
            pv.monto,
            pv.tipo,
            l.direccion
        FROM pago_variados pv
        INNER JOIN local l ON pv.idLocal = l.idLocal
        WHERE pv.idArrendatario = ?
        ORDER BY pv.fechaPago DESC
    `;
    
    conexion.query(query, [idArrendatario], (err, resultados) => {
        if (err) {
            console. error(' Error en debug:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log(`🔍 Debug: ${resultados.length} pagos para arrendatario ${idArrendatario}`);
        res.json(resultados);
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
    console.log(`!!!! Servidor corriendo en http://localhost:${PORT}!!!!`);
});