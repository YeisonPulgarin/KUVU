// ==========================================
// FUNCIÓN SHOWTAB - NAVEGACIÓN ENTRE PESTAÑAS
// ==========================================
function showTab(tabName, event) {
    console.log(`📂 Cambiando a pestaña: ${tabName}`);
    
    // Ocultar todos los contenidos de pestañas
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Remover clase active de todas las pestañas
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Activar pestaña y contenido actual
    event.currentTarget.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Cargar datos automáticamente al cambiar de pestaña
    switch(tabName) {
        case 'contrato':
            cargarContrato();
            break;
        case 'pagos':
            cargarPagosPendientesMes();
            break;
        case 'historial':
            cargarHistorialPagos();
            break;
        case 'solicitudes':
            cargarSolicitudesMantenimiento();
            break;
        case 'servicios':
            cargarServicios();
            break;
    }
}

// ==========================================
// CARGAR CONTRATO
// ==========================================
async function cargarContrato() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return;

    try {
        const response = await fetch(`http://localhost:3000/api/arrendatarios/${usuario.idUsuario}/contratos`);
        const contratos = await response.json();
        
        const tbody = document.getElementById('tablaContrato');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        if (contratos.length > 0) {
            contratos.forEach(contrato => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td>${contrato.direccion || 'No especificada'}</td>
                    <td>${new Date(contrato.fechaInicio).toLocaleDateString()}</td>
                    <td>${new Date(contrato.fechaFin).toLocaleDateString()}</td>
                    <td>$${Number(contrato.valorArriendo || 0).toLocaleString()}</td>
                    <td>${contrato.area || 'N/A'} m²</td>
                    <td><span class="estado-activo">ACTIVO</span></td>
                    <td>
                        <button class="btn btn-primary btn-ver-detalles" data-contrato-id="${contrato.idContrato}">Ver Detalles</button>
                    </td>
                `;

                const boton = fila.querySelector('.btn-ver-detalles');
                boton.addEventListener('click', function() {
                    const idContrato = this.getAttribute('data-contrato-id');
                    verDetallesContrato(parseInt(idContrato));
                });

                tbody.appendChild(fila);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No tienes contratos activos</td></tr>';
        }
    } catch (error) {
        console.error('Error cargando contrato:', error);
        const tbody = document.getElementById('tablaContrato');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error cargando contratos</td></tr>';
        }
    }
}

function verDetallesContrato(idContrato) {
    try {
        // Normalizar id a string para búsquedas en atributos
        const idStr = String(idContrato);

        // Intentar obtener el contrato desde variables globales comunes
        const posiblesListas = [
            window.contratos,
            window.contratosData,
            window.listaContratos,
            window.contratosPendientes
        ];
        let contrato = null;
        for (const lista of posiblesListas) {
            if (Array.isArray(lista)) {
                contrato = lista.find(c => String(c.id) === idStr || String(c.idContrato) === idStr) || contrato;
            }
        }

        // Fallback 1: buscar botón con data-contrato-id y extraer la fila asociada
        if (!contrato) {
            const boton = document.querySelector(`button[data-contrato-id="${idStr}"]`);
            const fila = boton ? boton.closest('tr') : null;
            if (fila) {
                const celdas = fila.querySelectorAll('td');
                contrato = {
                    id: idContrato,
                    direccion: (celdas[0]?.textContent || '').trim(),
                    fechaInicio: (celdas[1]?.textContent || '').trim(),
                    fechaFin: (celdas[2]?.textContent || '').trim(),
                    valor: (celdas[3]?.textContent || '').trim(),
                    area: (celdas[4]?.textContent || '').trim(),
                    estado: (celdas[5]?.textContent || '').trim(),
                    condiciones: '' // mantengo campo por compatibilidad
                };
            }
        }

        // Fallback 2 (antiguo): buscar por filas del tbody si no se encontró antes
        if (!contrato) {
            const filas = Array.from(document.querySelectorAll('#tablaContrato tr'));
            const fila = filas.find(r => r.dataset?.id == idContrato || r.dataset?.idcontrato == idContrato);
            if (fila) {
                const celdas = fila.querySelectorAll('td');
                contrato = {
                    id: idContrato,
                    direccion: (celdas[0]?.textContent || '').trim(),
                    fechaInicio: (celdas[1]?.textContent || '').trim(),
                    fechaFin: (celdas[2]?.textContent || '').trim(),
                    valor: (celdas[3]?.textContent || '').trim(),
                    area: (celdas[4]?.textContent || '').trim(),
                    estado: (celdas[5]?.textContent || '').trim(),
                    condiciones: ''
                };
            }
        }

        if (!contrato) {
            alert('No se pudo encontrar la información del contrato.');
            return;
        }

        // Eliminar modal antiguo si existe
        const exist = document.getElementById('modalDetallesContrato');
        if (exist) exist.remove();

        // Formatear valores
        const formatoMoneda = (v) => {
            if (typeof v === 'number') return v.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
            const num = Number(String(v).replace(/[^0-9.-]+/g, ''));
            return isNaN(num) ? v : num.toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
        };

        const html = `
            <div id="modalDetallesContrato" class="modal active" style="display:flex; align-items:center; justify-content:center;">
                <div class="modal-content" style="max-width:700px; width:95%; border-radius:12px; padding:24px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:12px;">
                        <div>
                            <h2 style="margin:0 0 6px 0; color:#0f172a;">📄 Detalles del Contrato #${contrato.id}</h2>
                            <small style="color:#6b7280;">Información completa y estado del contrato</small>
                        </div>
                        <button id="cerrarDetallesContrato" class="close" style="font-size:20px; border:none; background:transparent; cursor:pointer;">×</button>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:14px; margin-top:14px; margin-bottom:18px;">
                        <div style="background:#f8fafc; padding:14px; border-radius:10px;">
                            <p style="margin:6px 0;"><strong>🏠 Dirección</strong><br><span style="color:#374151;">${contrato.direccion || '—'}</span></p>
                            <p style="margin:6px 0;"><strong>📅 Fecha Inicio</strong><br><span style="color:#374151;">${contrato.fechaInicio || '—'}</span></p>
                            <p style="margin:6px 0;"><strong>📅 Fecha Fin</strong><br><span style="color:#374151;">${contrato.fechaFin || '—'}</span></p>
                        </div>

                        <div style="background:#fff; padding:14px; border-radius:10px; border:1px solid #eef2f7;">
                            <p style="margin:6px 0;"><strong>💰 Valor Arriendo</strong><br><span style="color:#374151;">${formatoMoneda(contrato.valor)}</span></p>
                            <p style="margin:6px 0;"><strong>📐 Área</strong><br><span style="color:#374151;">${contrato.area || '—'}</span></p>
                            <p style="margin:6px 0;"><strong>📌 Estado</strong><br><span style="color:#374151;">${contrato.estado || '—'}</span></p>
                        </div>
                    </div>

                    <div style="background:#ffffff; padding:14px; border-radius:10px; border:1px solid #eef2f7; margin-bottom:18px;">
                        <h4 style="margin:0 0 8px 0; color:#0f172a;">🔎 Condiciones</h4>
                        <p style="color:#374151; margin:0;">${contrato.condiciones || contrato.descripcion || 'Sin condiciones registradas'}</p>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:10px;">
                        <button id="cerrarDetallesContrato2" class="btn" style="background:white; border:1px solid #e6edf3; color:#374151; padding:10px 14px; border-radius:8px;">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);

        // handlers para cerrar (botones y fondo/ESC)
        const modalEl = document.getElementById('modalDetallesContrato');
        const btnCerrar1 = document.getElementById('cerrarDetallesContrato');
        const btnCerrar2 = document.getElementById('cerrarDetallesContrato2');

        const closeFn = () => {
            const m = document.getElementById('modalDetallesContrato');
            if (m) m.remove();
            document.removeEventListener('keydown', escHandler);
        };

        const escHandler = (e) => { if (e.key === 'Escape') closeFn(); };

        btnCerrar1?.addEventListener('click', closeFn);
        btnCerrar2?.addEventListener('click', closeFn);

        // cerrar al hacer click fuera del contenido
        modalEl?.addEventListener('click', (ev) => {
            if (ev.target === modalEl) closeFn();
        });

        document.addEventListener('keydown', escHandler);
    } catch (err) {
        console.error('verDetallesContrato error:', err);
        alert('Ocurrió un error al mostrar los detalles del contrato.');
    }
}

// ==========================================
// TAB PAGOS - CARGAR PAGOS PENDIENTES DEL MES
// ==========================================
async function cargarPagosPendientesMes() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return;
    
    try {
        console.log('📋 Cargando pagos pendientes del mes...');
        
        const response = await fetch(`http://localhost:3000/api/arrendatarios/${usuario.idUsuario}/pagos-pendientes-mes`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Pagos pendientes recibidos:', data);
        
        mostrarPagosPendientes(data);
        
    } catch (error) {
        console.error('❌ Error cargando pagos pendientes:', error);
        const container = document.getElementById('pagos');
        if (container) {
            container.innerHTML = `
                <h3>💳 Realizar Pagos</h3>
                <div class="card" style="background: #fee2e2; padding: 20px; border-left: 4px solid #dc2626;">
                    <p style="color: #991b1b; margin: 0;">❌ Error al cargar pagos pendientes: ${error.message}</p>
                </div>
            `;
        }
    }
}

// ==========================================
// MOSTRAR PAGOS PENDIENTES EN LA INTERFAZ
// ==========================================
function mostrarPagosPendientes(data) {
    const container = document.getElementById('pagos');
    
    if (!container) {
        console.error('❌ No se encontró el contenedor de pagos');
        return;
    }
    
    const { pagosPendientes, mesActual, diaLimite } = data;
    
    let html = `
        <h3>💳 Realizar Pagos del Mes</h3>
        
        <div class="card" style="background: #f0f9ff; border-left: 4px solid #0ea5e9; margin-bottom: 20px;">
            <h4>📅 ${mesActual}</h4>
            <p><strong>Día límite de pago:</strong> ${diaLimite} de cada mes</p>
            ${pagosPendientes.length > 0 
                ? `<p style="color: #dc2626;"><strong>⚠️ Tienes ${pagosPendientes.length} pago(s) pendiente(s)</strong></p>`
                : `<p style="color: #16a34a;"><strong>✅ ¡Estás al día! No tienes pagos pendientes este mes</strong></p>`
            }
        </div>
    `;
    
    if (pagosPendientes.length === 0) {
        html += `
            <div class="card" style="text-align: center; padding: 40px; background: #d1f4dd;">
                <div style="font-size: 4em; margin-bottom: 20px;">✅</div>
                <h3 style="color: #16a34a;">¡Excelente!</h3>
                <p style="color: #15803d; font-size: 1.1em;">Has completado todos tus pagos de este mes</p>
            </div>
        `;
    } else {
        // Mostrar cada pago pendiente
        pagosPendientes.forEach((pago, index) => {
            const esVencido = new Date(pago.vencimiento) < new Date();
            const diasRestantes = Math.ceil((new Date(pago.vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
            
            const emoji = pago.tipo === 'Arriendo' ? '🏠' : '⚡';
            const colorBorde = esVencido ? '#dc2626' : '#f59e0b';
            
            html += `
                <div class="card" style="border-left: 4px solid ${colorBorde}; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 10px 0;">${emoji} ${pago.tipo}</h4>
                            <p style="margin: 5px 0;"><strong>Local:</strong> ${pago.local}</p>
                            <p style="margin: 5px 0;">${pago.descripcion}</p>
                            <p style="margin: 5px 0; color: ${esVencido ? '#dc2626' : '#666'};">
                                <strong>Vencimiento:</strong> ${new Date(pago.vencimiento).toLocaleDateString()}
                                ${esVencido 
                                    ? ' <span style="background: #fee2e2; color: #991b1b; padding: 3px 8px; border-radius: 5px; font-size: 0.85em;">⚠️ VENCIDO</span>'
                                    : diasRestantes <= 2 
                                        ? ` <span style="background: #fef3c7; color: #92400e; padding: 3px 8px; border-radius: 5px; font-size: 0.85em;">⏰ ${diasRestantes} día(s)</span>`
                                        : ''
                                }
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-size: 1.5em; font-weight: bold; color: #dc2626; margin: 0;">
                                $${pago.monto.toLocaleString()}
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        class="btn btn-success" 
                        onclick="abrirModalPago(${index})"
                        style="width: 100%; padding: 12px; font-size: 1.1em;">
                        💳 Pagar Ahora
                    </button>
                </div>
            `;
        });
    }
    
    container.innerHTML = html;
    
    // Guardar pagos pendientes en memoria para usar en el modal
    window.pagosPendientes = pagosPendientes;
}

// ==========================================
// ABRIR MODAL PARA REALIZAR UN PAGO ESPECÍFICO
// ==========================================
function abrirModalPago(index) {
    try {
        const pago = window.pagosPendientes && window.pagosPendientes[index];
        if (!pago) {
            alert('❌ Error: No se encontró información del pago');
            return;
        }

        // Si ya existe modal previo, eliminarlo
        const existente = document.getElementById('modalPagoEspecifico');
        if (existente) existente.remove();

        // Crear modal con secciones dinámicas (tarjeta / pse / transferencia / efectivo)
        const modalHTML = `
            <div class="modal active" id="modalPagoEspecifico" style="display: flex;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>💳 Realizar Pago</h2>
                        <span class="close" onclick="cerrarModalPago()">&times;</span>
                    </div>

                    <form id="formPagoEspecifico" onsubmit="procesarPagoEspecifico(event, ${index})">
                        <div class="form-group">
                            <label>Tipo de Pago:</label>
                            <input type="text" value="${pago.tipo}" readonly style="background: #f1f5f9;">
                        </div>

                        <div class="form-group">
                            <label>Local:</label>
                            <input type="text" value="${pago.local}" readonly style="background: #f1f5f9;">
                        </div>

                        <div class="form-group">
                            <label>Descripción:</label>
                            <input type="text" value="${pago.descripcion}" readonly style="background: #f1f5f9;">
                        </div>

                        <div class="form-group">
                            <label>Monto:</label>
                            <input type="text" value="$${pago.monto.toLocaleString()}" readonly style="background: #f1f5f9; font-size: 1.2em; font-weight: bold; color: #dc2626;">
                        </div>

                        <div class="form-group">
                            <label>💳 Método de Pago:</label>
                            <select id="metodoPagoModal" required>
                                <option value="">Seleccione método...</option>
                                <option value="tarjeta">💳 Tarjeta Crédito/Débito</option>
                                <option value="pse">🏦 PSE</option>
                                <option value="transferencia">📤 Transferencia Bancaria</option>
                                <option value="efectivo">💰 Efectivo</option>
                            </select>
                        </div>

                        <!-- SECCIONES DINÁMICAS PARA CADA MÉTODO -->
                        <div id="camposTarjetaModal" style="display:none; margin-bottom:12px;">
                            <h4 style="margin:8px 0;">Datos de la tarjeta</h4>
                            <div class="form-group">
                                <label>Número de tarjeta</label>
                                <input type="text" id="numeroTarjetaModal" placeholder="XXXX XXXX XXXX XXXX" maxlength="19">
                            </div>
                            <div style="display:flex; gap:8px;">
                                <div class="form-group" style="flex:1;">
                                    <label>Expiración</label>
                                    <input type="text" id="expTarjetaModal" placeholder="MM/AA" maxlength="5">
                                </div>
                                <div class="form-group" style="width:120px;">
                                    <label>CVC</label>
                                    <input type="text" id="cvcTarjetaModal" placeholder="123" maxlength="4">
                                </div>
                            </div>
                        </div>

                        <div id="camposPSEModal" style="display:none; margin-bottom:12px;">
                            <h4 style="margin:8px 0;">PSE - Seleccione banco</h4>
                            <div class="form-group">
                                <label>Banco</label>
                                <select id="bancoPSEModal">
                                    <option value="">Seleccionar banco...</option>
                                </select>
                            </div>
                            <small style="color:#666;">Serás redirigido al portal bancario para completar el pago.</small>
                        </div>

                        <div id="camposTransferenciaModal" style="display:none; margin-bottom:12px;">
                            <h4 style="margin:8px 0;">Transferencia Bancaria</h4>
                            <div style="background:#f8fafc;padding:12px;border-radius:8px;">
                                <p><strong>Banco:</strong> Bancolombia</p>
                                <p><strong>Cuenta:</strong> 123-456789-01</p>
                                <p><strong>Tipo:</strong> Cuenta de Ahorros</p>
                                <p><strong>Titular:</strong> Nido Rent</p>
                                <p><strong>Nit:</strong> 901.234.567-8</p>
                            </div>
                            <div class="form-group">
                                <label>Número de comprobante</label>
                                <input type="text" id="comprobanteTransferencia" placeholder="Ingrese número de comprobante">
                            </div>
                        </div>

                        <div id="camposEfectivoModal" style="display:none; margin-bottom:12px;">
                            <h4 style="margin:8px 0;">Pago en efectivo</h4>
                            <div style="background:#fff;padding:12px;border-radius:8px;">
                                <label style="display:block; margin-bottom:8px;"><input type="radio" name="efectivoProviderModal" value="efecty"> Efecty</label>
                                <label style="display:block; margin-bottom:8px;"><input type="radio" name="efectivoProviderModal" value="supergiros"> SuperGiros</label>
                                <small style="color:#666;">Seleccione el servicio para generar la referencia de pago en efectivo.</small>
                            </div>
                        </div>

                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                            <label style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" id="terminosPagoModal" required>
                                <span>Acepto los términos y condiciones del servicio</span>
                            </label>
                        </div>

                        <button type="submit" class="btn btn-success" style="width: 100%; padding: 15px; font-size: 1.1em;">
                            💳 Confirmar Pago
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Enlazar comportamiento dinámico (todo dentro de la función; evita errores globales)
        const metodoSelect = document.getElementById('metodoPagoModal');
        const camposTarjeta = document.getElementById('camposTarjetaModal');
        const camposPSE = document.getElementById('camposPSEModal');
        const camposTransferencia = document.getElementById('camposTransferenciaModal');
        const camposEfectivo = document.getElementById('camposEfectivoModal');
        const bancoPSE = document.getElementById('bancoPSEModal');

        function ocultarTodasSeccionesModal() {
            try {
                if (camposTarjeta) camposTarjeta.style.display = 'none';
                if (camposPSE) camposPSE.style.display = 'none';
                if (camposTransferencia) camposTransferencia.style.display = 'none';
                if (camposEfectivo) camposEfectivo.style.display = 'none';
            } catch (e) { console.warn('Error ocultando secciones modal:', e); }
        }

        function actualizarModalPorMetodo() {
            try {
                const valor = metodoSelect?.value || '';
                ocultarTodasSeccionesModal();
                if (valor === 'tarjeta') {
                    if (camposTarjeta) camposTarjeta.style.display = 'block';
                } else if (valor === 'pse') {
                    if (camposPSE) camposPSE.style.display = 'block';
                    // si solo está el placeholder (1 opción) o no hay opciones, añadimos la lista completa
                    if (bancoPSE && bancoPSE.options.length <= 1) {
                        const bancos = [
                            {val: 'bancolombia', text: 'Bancolombia'},
                            {val: 'davivienda', text: 'Davivienda'},
                            {val: 'bogota', text: 'Banco de Bogotá'},
                            {val: 'avvillas', text: 'AV Villas'},
                            {val: 'bbva', text: 'BBVA'},
                            {val: 'nequi', text: 'Nequi'}
                        ];
                        bancos.forEach(b => bancoPSE.add(new Option(b.text, b.val)));
                    }
                } else if (valor === 'transferencia') {
                    if (camposTransferencia) camposTransferencia.style.display = 'block';
                } else if (valor === 'efectivo') {
                    if (camposEfectivo) camposEfectivo.style.display = 'block';
                } else {
                    ocultarTodasSeccionesModal();
                }
            } catch (e) { console.warn('Error actualizando modal por método:', e); }
        }

        if (metodoSelect) {
            metodoSelect.addEventListener('change', actualizarModalPorMetodo);
            // Inicializa vista según valor por defecto
            actualizarModalPorMetodo();
        }
    } catch (err) {
        console.error('Error en abrirModalPago:', err);
        alert('Ocurrió un error al abrir el modal de pago. Revisa la consola.');
    }
}

// ==========================================
// CERRAR MODAL
// ==========================================
function cerrarModalPago() {
    const modal = document.getElementById('modalPagoEspecifico');
    if (modal) modal.remove();
}

// ==========================================
// PROCESAR PAGO ESPECÍFICO
// ==========================================
async function procesarPagoEspecifico(event, index) {
    event.preventDefault();
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const pago = window.pagosPendientes[index];
    const metodoPago = document.getElementById('metodoPagoModal').value;
    
    if (!metodoPago) {
        alert('❌ Por favor seleccione un método de pago');
        return;
    }
    
    console.log('💰 Procesando pago:', pago);
    
    // Mostrar loader
    const btnSubmit = event.target.querySelector('button[type="submit"]');
    const textoOriginal = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '⏳ Procesando...';
    btnSubmit.disabled = true;
    
    try {
        const pagoData = {
            fechaPago: new Date().toISOString().split('T')[0],
            monto: pago.monto,
            tipoPago: pago.tipo,
            metodoPago: metodoPago,
            idArrendatario: parseInt(usuario.idUsuario),
            idAdministrador: 11,
            idLocal: parseInt(pago.idLocal),
            idContrato: pago.idContrato,
            servicios: pago.servicios || []
        };
        
        console.log('📤 Enviando datos:', pagoData);
        
        const response = await fetch('http://localhost:3000/api/pagos/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pagoData)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ ¡Pago realizado exitosamente!');
            cerrarModalPago();
            
            // Recargar pagos pendientes
            await cargarPagosPendientesMes();
            
            // Recargar historial después de un momento
            setTimeout(() => cargarHistorialPagos(), 1000);
        } else {
            throw new Error(result.error || 'Error al procesar el pago');
        }
        
    } catch (error) {
        console.error('❌ Error procesando pago:', error);
        alert('❌ Error al procesar el pago: ' + error.message);
        
        // Restaurar botón
        btnSubmit.innerHTML = textoOriginal;
        btnSubmit.disabled = false;
    }
}

// ==========================================
// HISTORIAL DE PAGOS
// ==========================================
async function cargarHistorialPagos() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        console.error('❌ No hay usuario logueado');
        return;
    }
    
    try {
        const tbody = document.getElementById('tablaHistorialPagos');
        
        if (!tbody) {
            console.error('❌ No se encontró tablaHistorialPagos en el DOM');
            return;
        }
        
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">⏳ Cargando historial...</td></tr>';
        
        const pagos = await cargarPagosDesdeBD(usuario.idUsuario);
        
        console.log('📊 Pagos cargados desde BD:', pagos.length);
        
        tbody.innerHTML = '';
        
        if (pagos && pagos.length > 0) {
            pagos.forEach(pago => {
                const fecha = pago.fechaPago ? 
                    new Date(pago.fechaPago).toLocaleDateString() : 
                    'No especificada';
                
                const monto = pago.monto ? Number(pago.monto).toLocaleString() : '0';
                const tipoPagoBadge = obtenerBadgeTipoPagoArrendatario(pago.tipoPago, pago.descripcion);
                const direccion = pago.direccion || 'Local contratado';
                
                tbody.innerHTML += `
                    <tr>
                        <td>${fecha}</td>
                        <td>$${monto}</td>
                        <td>${tipoPagoBadge}</td>
                        <td>${direccion}</td>
                        <td>
                            <span class="estado-al-dia">PAGADO</span>
                        </td>
                    </tr>
                `;
            });
            
            console.log(`✅ ${pagos.length} pagos cargados en la tabla`);
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                        <div style="font-size: 3em; margin-bottom: 10px;">🔭</div>
                        <p>No hay pagos registrados</p>
                        <small>Los pagos que realices aparecerán aquí</small>
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('❌ Error cargando historial de pagos:', error);
        const tbody = document.getElementById('tablaHistorialPagos');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: red; padding: 20px;">
                        ❌ Error al cargar el historial: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

async function cargarPagosDesdeBD(idArrendatario) {
    try {
        console.log('🔍 [FRONTEND] Cargando pagos para arrendatario:', idArrendatario);
        
        const response = await fetch(`http://localhost:3000/api/debug/arrendatarios/${idArrendatario}/pagos`);
        
        if (response.ok) {
            const pagosDebug = await response.json();
            console.log('✅ [FRONTEND] Pagos recibidos del endpoint debug:', pagosDebug.length, 'pagos');
            
            const pagosFormateados = pagosDebug.map(pago => ({
                idPago: pago.idPagoVariado,
                fechaPago: pago.fechaPago,
                monto: pago.monto,
                tipoPago: pago.tipo || 'Servicios',
                descripcion: pago.descripcion || `Pago - ${pago.direccion}`,
                direccion: pago.direccion,
                comprobante: `PAGO-${pago.idPagoVariado}`,
                servicios: []
            }));
            
            return pagosFormateados;
        }
        
        throw new Error(`Error HTTP: ${response.status}`);
        
    } catch (error) {
        console.error('❌ [FRONTEND] Error cargando pagos desde BD:', error);
        return [];
    }
}

function obtenerBadgeTipoPagoArrendatario(tipoPago, descripcion = '') {
    let tipoFinal = tipoPago;
    
    if (!tipoFinal || tipoFinal === '' || tipoFinal === 'null' || tipoFinal === 'undefined') {
        if (descripcion && descripcion.includes('servicio')) {
            tipoFinal = 'Servicios';
        } else if (descripcion && descripcion.includes('arriendo')) {
            tipoFinal = 'Arriendo';
        } else {
            tipoFinal = 'Servicios';
        }
    }
    
    if (tipoFinal === 'Servicio') {
        tipoFinal = 'Servicios';
    }
    
    const tipo = tipoFinal.toString().toLowerCase().trim();
    
    const badges = {
        'arriendo': '<span style="background: #e3f2fd; color: #1565c0; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">🏠 Arriendo</span>',
        'servicios': '<span style="background: #e8f5e8; color: #2e7d32; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">⚡ Servicios</span>',
        'arriendo + servicios': '<span style="background: #fff3e0; color: #ef6c00; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">🏠⚡ Ambos</span>',
        'ambos': '<span style="background: #fff3e0; color: #ef6c00; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">🏠⚡ Ambos</span>',
        'mantenimiento': '<span style="background: #fef3c7; color: #92400e; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">🔧 Mantenimiento</span>'
    };
    
    if (tipo.includes('arriendo') && tipo.includes('servicio')) {
        return badges['arriendo + servicios'];
    } else if (tipo.includes('arriendo')) {
        return badges['arriendo'];
    } else if (tipo.includes('servicio')) {
        return badges['servicios'];
    }
    
    return badges[tipo] || `<span style="background: #f1f5f9; color: #64748b; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${tipoFinal || 'Otro'}</span>`;
}

// ==========================================
// TAB SERVICIOS
// ==========================================
async function cargarServicios() {
    console.log('🚀 INICIANDO carga robusta de servicios...');

    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        console.error('❌ No hay usuario en localStorage');
        document.getElementById('serviciosInfo').innerHTML = '<p style="color:#666">Usuario no identificado.</p>';
        return;
    }

    try {
        document.getElementById('serviciosInfo').innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <div class="spinner"></div>
                <p>Cargando información de servicios...</p>
            </div>
        `;

        const rContratos = await fetch(`http://localhost:3000/api/arrendatarios/${usuario.idUsuario}/contratos`);
        if (!rContratos.ok) throw new Error(`Error al obtener contratos: ${rContratos.status}`);
        const contratos = await rContratos.json();

        if (!Array.isArray(contratos) || contratos.length === 0) {
            document.getElementById('serviciosInfo').innerHTML = `
                <div style="text-align:center;padding:40px;color:#666;">
                    <h3>🏠 No tienes contratos activos</h3>
                    <p>No se encontraron contratos para mostrar servicios.</p>
                </div>
            `;
            return;
        }

        const rServ = await fetch(`http://localhost:3000/api/servicios-por-local`);
        if (!rServ.ok) throw new Error(`Error al obtener servicios por local: ${rServ.status}`);
        const localesConServicios = await rServ.json();

        const mapaLocales = new Map();
        localesConServicios.forEach(l => {
            const id = l.idLocal ?? l.id_local ?? l.id ?? l.local_id;
            mapaLocales.set(String(id), {
                idLocal: id,
                direccion: l.direccion ?? l.local_nombre ?? l.direccion_local ?? '',
                servicios: (l.servicios === null || l.servicios === undefined) ? 'Sin servicios' : String(l.servicios).trim(),
                valorTotalServicios: l.valorTotalServicios ?? l.valor_total_servicios ?? 0
            });
        });

        let serviciosHTML = '';
        let contratosConServicios = 0;

        contratos.forEach((contrato, idx) => {
            const idLocalContrato = contrato.idLocal ?? contrato.localId ?? contrato.id_local ?? contrato.local_id ?? contrato.local;
            const idKey = idLocalContrato !== undefined && idLocalContrato !== null ? String(idLocalContrato) : null;

            if (!idKey) {
                serviciosHTML += `
                    <div style="background:#fee2e2;padding:20px;border-radius:10px;margin-bottom:20px;">
                        <h3 style="color:#991b1b;">🏢 Contrato ${idx+1}</h3>
                        <p>❌ No se identificó el id del local en este contrato</p>
                    </div>
                `;
                return;
            }

            const local = mapaLocales.get(idKey);

            if (!local) {
                serviciosHTML += `
                    <div style="background:#fee2e2;padding:20px;border-radius:10px;margin-bottom:20px;">
                        <h3 style="color:#991b1b;">🏢 Local ${idx+1}: ${contrato.direccion || 'Local ' + idKey}</h3>
                        <p>❌ No se encontró información de servicios para este local (ID: ${idKey})</p>
                    </div>
                `;
                return;
            }

            contratosConServicios++;
            serviciosHTML += `
                <div style="background:#f0f9ff;padding:20px;border-radius:10px;margin-bottom:20px;border-left:5px solid #0ea5e9;">
                    <h3 style="margin:0 0 10px 0;">🏢 ${local.direccion || contrato.direccion || 'Local ' + idKey}</h3>
            `;

            if (!local.servicios || local.servicios.toLowerCase() === 'sin servicios') {
                serviciosHTML += `
                    <p style="background:#fef3c7;padding:12px;border-radius:8px;color:#92400e;">
                        ⚠️ No hay servicios asignados a este local
                    </p>
                `;
            } else {
                const serviciosArray = local.servicios.split(/\s*[,;|]\s*/).filter(s => s && s.trim().length);
                serviciosHTML += `<p><strong>Servicios incluidos:</strong></p><ul style="list-style:none;padding:0;margin:0 0 15px 0;">`;
                serviciosArray.forEach(s => {
                    const servicioLimpio = s.trim();
                    const emoji = servicioLimpio.includes('Agua') ? '💧' : servicioLimpio.includes('Luz') ? '💡' : servicioLimpio.includes('Internet') ? '🌐' : '🔧';
                    serviciosHTML += `<li style="padding:10px;background:white;margin-bottom:8px;border-radius:8px;display:flex;align-items:center;gap:10px;">
                        <span style="font-size:1.4em;">${emoji}</span>
                        <span style="font-weight:500;">${servicioLimpio}</span>
                    </li>`;
                });
                serviciosHTML += `</ul>
                    <p style="background:white;padding:12px;border-radius:8px;margin:0;">
                        <strong>💰 Valor total servicios:</strong>
                        <span style="color:#0ea5e9;font-weight:bold;">${Number(local.valorTotalServicios || 0).toLocaleString()}</span>
                    </p>`;
            }

            serviciosHTML += `</div>`;
        });

        if (contratosConServicios === 0 && contratos.length > 0) {
            serviciosHTML = `
                <div style="text-align:center;padding:40px;color:#666;">
                    <h3>🔍 No se encontraron servicios</h3>
                    <p>Tienes ${contratos.length} contrato(s) activo(s) pero no se encontraron servicios asociados.</p>
                </div>
            `;
        }

        document.getElementById('serviciosInfo').innerHTML = serviciosHTML;
        console.log('✅ Servicios renderizados para', contratosConServicios, 'locales de', contratos.length);

    } catch (err) {
        console.error('❌ Error cargando servicios (robusto):', err);
        document.getElementById('serviciosInfo').innerHTML = `
            <div style="background:#fee2e2;padding:20px;border-radius:10px;">
                <h3 style="color:#991b1b;">❌ Error al cargar los servicios</h3>
                <p style="color:#7f1d1d;">${err.message}</p>
                <button onclick="cargarServicios()" style="padding:8px 16px;background:#dc2626;color:white;border:none;border-radius:5px;cursor:pointer;">🔄 Reintentar</button>
            </div>
        `;
    }
}

// ==========================================
// TAB SOLICITUDES - MANTENIMIENTO
// ==========================================
async function cargarSolicitudesMantenimiento() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return;

    try {
        const response = await fetch(`http://localhost:3000/api/arrendatarios/${usuario.idUsuario}/solicitudes-mantenimiento`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const solicitudes = await response.json();
        
        const tbody = document.getElementById('tablaSolicitudesMantenimiento');
        if (!tbody) {
            console.error('❌ No se encontró la tabla de solicitudes');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (solicitudes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">No hay solicitudes de mantenimiento registradas</td></tr>';
            return;
        }
        
        solicitudes.forEach(solicitud => {
            const prioridadBadge = obtenerBadgePrioridad(solicitud.prioridad);
            const estadoBadge = obtenerBadgeEstado(solicitud.estado);
            const fecha = solicitud.fecha_creacion ? new Date(solicitud.fecha_creacion).toLocaleDateString() : 'No especificada';
            
            tbody.innerHTML += `
                <tr>
                    <td>${solicitud.tipo_servicio}</td>
                    <td>${solicitud.descripcion || 'Sin descripción'}</td>
                    <td>${prioridadBadge}</td>
                    <td>${estadoBadge}</td>
                    <td>${fecha}</td>
                </tr>
            `;
        });
        
        console.log(`✅ ${solicitudes.length} solicitudes cargadas`);
        
    } catch (error) {
        console.error('❌ Error cargando solicitudes:', error);
        const tbody = document.getElementById('tablaSolicitudesMantenimiento');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 40px;">Error al cargar las solicitudes</td></tr>';
        }
    }
}

function obtenerBadgePrioridad(prioridad) {
    const badges = {
        'urgente': '<span style="background: #fee; color: #c00; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">🔴 URGENTE</span>',
        'normal': '<span style="background: #fff4e6; color: #e67e22; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">🟡 NORMAL</span>',
        'baja': '<span style="background: #f0f0f0; color: #666; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">🟢 BAJA</span>'
    };
    return badges[prioridad] || prioridad;
}

function obtenerBadgeEstado(estado) {
    const badges = {
        'pendiente': '<span style="background: #fff3cd; color: #856404; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">⏳ PENDIENTE</span>',
        'en_proceso': '<span style="background: #cfe2ff; color: #084298; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">⚙️ EN PROCESO</span>',
        'completado': '<span style="background: #d1e7dd; color: #0f5132; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">✅ COMPLETADO</span>',
        'cancelado': '<span style="background: #f8d7da; color: #842029; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">❌ CANCELADO</span>'
    };
    return badges[estado] || estado;
}

// ==========================================
// MODAL Y FORMULARIO DE NUEVA SOLICITUD
// ==========================================
function mostrarModalSolicitudMantenimiento() {
    console.log('🔧 Abriendo modal para nueva solicitud...');
    
    cargarLocalesParaSolicitud();
    
    const form = document.getElementById('formNuevaSolicitud');
    if (form) {
        form.reset();
    }
    
    const modal = document.getElementById('modalNuevaSolicitud');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error('❌ Modal modalNuevaSolicitud no encontrado en el DOM');
    }
}

async function cargarLocalesParaSolicitud() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return;

    try {
        const response = await fetch(`http://localhost:3000/api/arrendatarios/${usuario.idUsuario}/contratos`);
        const contratos = await response.json();
        
        const selectLocal = document.getElementById('selectLocalSolicitud');
        if (!selectLocal) return;
        
        selectLocal.innerHTML = '<option value="">Seleccionar local...</option>';
        
        if (contratos.length > 0) {
            contratos.forEach(contrato => {
                selectLocal.innerHTML += `<option value="${contrato.idLocal}">${contrato.direccion}</option>`;
            });
        } else {
            selectLocal.innerHTML = '<option value="">No tienes locales asignados</option>';
        }
        
        console.log('✅ Locales cargados para solicitud:', contratos.length);
    } catch (error) {
        console.error('❌ Error cargando locales para solicitud:', error);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// ==========================================
// INICIALIZACIÓN DEL FORMULARIO DE SOLICITUDES
// ==========================================
function inicializarFormularioSolicitudes() {
    const formSolicitud = document.getElementById('formNuevaSolicitud');
    if (formSolicitud) {
        formSolicitud.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            const idLocal = document.getElementById('selectLocalSolicitud').value;
            const tipoProblema = document.getElementById('tipoProblema').value;
            const descripcion = document.getElementById('descripcionProblema').value;
            const prioridad = document.getElementById('prioridadSolicitud').value;
            
            if (!idLocal || idLocal === '') {
                alert('⚠️ Por favor seleccione un local.');
                return;
            }
            
            if (!tipoProblema || tipoProblema === '') {
                alert('⚠️ Por favor seleccione el tipo de problema.');
                return;
            }
            
            if (!descripcion || descripcion.trim() === '') {
                alert('⚠️ Por favor ingrese una descripción del problema.');
                return;
            }
            
            if (!prioridad || prioridad === '') {
                alert('⚠️ Por favor seleccione la prioridad.');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/mantenimiento/solicitud', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        idLocal: parseInt(idLocal),
                        idArrendatario: parseInt(usuario.idUsuario),
                        tipoMantenimiento: tipoProblema,
                        descripcion: descripcion.trim(),
                        prioridad: prioridad
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Error del servidor: ${response.status}`);
                }
                
                const data = await response.json();
                
                if (data.success) {
                    alert('✅ Solicitud enviada correctamente');
                    closeModal('modalNuevaSolicitud');
                    document.getElementById('formNuevaSolicitud').reset();
                    await cargarSolicitudesMantenimiento();
                } else {
                    alert('❌ Error: ' + (data.message || 'No se pudo crear la solicitud'));
                }
                
            } catch (error) {
                console.error('❌ Error enviando solicitud:', error);
                alert('❌ Error al enviar la solicitud.');
            }
        });
    }
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Documento listo - Inicializando panel de arrendatario');
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || usuario.rol !== 'Arrendatario') {
        window.location.href = 'ycw.html';
        return;
    }

    console.log('Usuario arrendatario:', usuario);
    
    document.getElementById('nombreUsuario').textContent = usuario.nombre;
    document.getElementById('emailUsuario').textContent = usuario.correo;
    document.getElementById('cedulaUsuario').textContent = `Cédula: ${usuario.documento}`;
    
    cargarContrato();
    
    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        localStorage.removeItem('usuario');
        window.location.href = 'ycw.html';
    });

    inicializarFormularioSolicitudes();
    
    console.log('✅ Inicialización completada');
});