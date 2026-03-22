// Manejo global de errores de fetch
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    try {
        const response = await originalFetch(...args);
        if (!response.ok) {
            console.error(`Error HTTP ${response.status} en:`, args[0]);
        }
        return response;
    } catch (error) {
        console.error('Error de red en fetch:', error);
        throw error;
    }
};

// Verificar autenticacion
const usuario = JSON.parse(localStorage.getItem('usuario'));

if (!usuario || usuario.rol !== 'Administrador') {
    window.location.href = 'ycw.html';
}

document.getElementById('userName').textContent = usuario.nombre;

// Funcion para cerrar sesion
function logout() {
    localStorage.removeItem('usuario');
    window.location.href = 'ycw.html';
}

function showTab(tabName, event = null) {
    console.log(' Cambiando a tab:', tabName);
    
    try {
        // 1. Ocultar TODOS los tab-content
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none'; // ← IMPORTANTE: Forzar display none
        });
        
        // 2. Remover clase active de TODOS los botones tab
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // 3. Mostrar SOLO el tab seleccionado
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.classList.add('active');
            selectedTab.style.display = 'block'; // ← Mostrar el contenido
            console.log(' Tab mostrado:', tabName);
        } else {
            console.error(' Tab no encontrado:', tabName);
            return;
        }

        // 4. Activar el botón del tab correspondiente
        if (event && event.target) {
            event.target.classList.add('active');
        } else {
            // Si no hay evento, buscar el botón por el texto
            const tabButtons = document.querySelectorAll('.tab');
            tabButtons.forEach(button => {
                const buttonText = button.textContent.toLowerCase();
                if (buttonText.includes(tabName.toLowerCase())) {
                    button.classList.add('active');
                }
            });
        }

        // 5. Cargar datos específicos del tab
        switch(tabName) {
            case 'locales':
                console.log('🏢 Cargando locales...');
                cargarLocales();
                break;
            case 'arrendatarios':
                console.log('👥 Cargando arrendatarios...');
                cargarArrendatarios();
                break;
            case 'contratos':
                console.log('📄 Cargando contratos...');
                cargarContratos();
                break;
            case 'pagos':
                console.log('💰 Cargando pagos...');
                cargarTodosLosPagos();
                break;
            case 'mantenimiento':
                console.log('🔧 Cargando mantenimiento...');
                cargarMantenimiento();
                break;
            case 'servicios':
                console.log('⚡ Cargando servicios...');
                cargarServicios();
                break;
        }
        
    } catch (error) {
        console.error(' Error en showTab:', error);
    }
}

// Modales
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    try {
        // Si el modal fue insertado dinámicamente (tiene display inline) o tiene dataset.dynamic -> remover del DOM
        if (modal.hasAttribute('data-dynamic') || (modal.style && modal.style.display)) {
            modal.remove();
            return;
        }

        // Si es un modal "estático" controlado por clase, quitar la clase active
        modal.classList.remove('active');

        // Asegurar que no quede visible por inline style
        if (modal.style && modal.style.display && modal.style.display !== 'none') {
            modal.style.display = 'none';
        }
    } catch (err) {
        // Fallback: eliminar si algo falla
        try { modal.remove(); } catch (e) { /* no-op */ }
    }
}

async function cargarEstadisticas() {
    try {
        console.log('📊 Cargando estadísticas...');
        
        // Cargar locales
        const localesResponse = await fetch('http://localhost:3000/api/locales');
        const locales = await localesResponse.json();
        
        // Cargar arrendatarios
        const arrendatariosResponse = await fetch('http://localhost:3000/api/arrendatarios');
        const arrendatarios = await arrendatariosResponse.json();
        
        // Cargar contratos
        const contratosResponse = await fetch('http://localhost:3000/api/contratos');
        const contratos = await contratosResponse.json();
        
        // Cargar pagos
        const pagosResponse = await fetch('http://localhost:3000/api/pagos');
        const pagos = await pagosResponse.json();
        
        // Actualizar la interfaz
        document.getElementById('totalLocales').textContent = locales.length;
        document.getElementById('totalArrendatarios').textContent = arrendatarios.length;
        document.getElementById('totalContratos').textContent = contratos.length;
        document.getElementById('totalPagos').textContent = pagos.length;
        
        console.log(' Estadísticas cargadas correctamente');
    } catch (error) {
        console.error(' Error cargando estadísticas:', error);
        // Mostrar valores por defecto en caso de error
        document.getElementById('totalLocales').textContent = '0';
        document.getElementById('totalArrendatarios').textContent = '0';
        document.getElementById('totalContratos').textContent = '0';
        document.getElementById('totalPagos').textContent = '0';
    }
}


// Función para cargar locales (CORREGIDA)
async function cargarLocales() {
    try {
        console.log('🏢 Cargando locales...');
        
        const response = await fetch('http://localhost:3000/api/locales');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const locales = await response.json();
        
        const tbody = document.getElementById('localesBody');
        if (!tbody) {
            console.error(' No se encontró el tbody con id "localesBody"');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (locales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No hay locales registrados</td></tr>';
            return;
        }
        
        locales.forEach(local => {
            tbody.innerHTML += `
                <tr>
                    <td>${local.idLocal}</td>
                    <td>${local.direccion}</td>
                    <td>${parseFloat(local.area).toLocaleString('es-CO')} m²</td>
                    <td>$${parseFloat(local.valorArriendo).toLocaleString('es-CO')}</td>
                    <td>
                        <button class="btn btn-primary" onclick="editarLocal(${local.idLocal})">Editar</button>
                        <button class="btn btn-danger" onclick="eliminarLocal(${local.idLocal})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
        console.log(' Locales cargados correctamente');
    } catch (error) {
        console.error(' Error cargando locales:', error);
        const tbody = document.getElementById('localesBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error cargando locales: ' + error.message + '</td></tr>';
        }
    }
}

// Función para abrir el modal de edición
async function editarLocal(id) {
    try {
        console.log('✏️ Editando local ID:', id);
        
        const response = await fetch(`http://localhost:3000/api/locales/${id}`);
        const local = await response.json();
        
        console.log('📄 Datos del local:', local);
        
        // Llenar el formulario con los datos actuales
        document.getElementById('editarIdLocal').value = local.idLocal;
        document.getElementById('editarDireccion').value = local.direccion;
        document.getElementById('editarArea').value = local.area;
        document.getElementById('editarValorArriendo').value = local.valorArriendo;
        
        // Mostrar el modal
        showModal('modalEditarLocal');
        
    } catch (error) {
        console.error(' Error cargando datos del local:', error);
        alert('Error al cargar los datos del local: ' + error.message);
    }
}

async function cargarArrendatarios() {
    try {
        console.log('👥 Cargando arrendatarios...');
        
        const response = await fetch('http://localhost:3000/api/arrendatarios');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const arrendatarios = await response.json();
        console.log('📦 Arrendatarios recibidos:', arrendatarios);
        
        const tbody = document.querySelector('#tablaArrendatarios tbody');
        if (!tbody) {
            console.error(' No se encontró el tbody de arrendatarios');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (arrendatarios.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No hay arrendatarios registrados</td></tr>';
            console.log('ℹ️ No hay arrendatarios para mostrar');
            return;
        }
        
        // Ordenar arrendatarios por ID ascendente
        const arrendatariosOrdenados = arrendatarios.sort((a, b) => a.idUsuario - b.idUsuario);
        
        arrendatariosOrdenados.forEach((arr, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${arr.nombre || 'N/A'}</td>
                    <td>${arr.documento || 'N/A'}</td>
                    <td>${arr.telefono || 'N/A'}</td>
                    <td>${arr.correo || 'N/A'}</td>
                    <td>
                        <button class="btn btn-primary" onclick="editarArrendatario(${arr.idUsuario})">Editar</button>
                        <button class="btn btn-danger" onclick="eliminarArrendatario(${arr.idUsuario})">Eliminar</button>
                    </td>
                </tr>
            `;
        });
        
        console.log(' Arrendatarios cargados correctamente en la tabla');
        
    } catch (error) {
        console.error(' Error cargando arrendatarios:', error);
        const tbody = document.querySelector('#tablaArrendatarios tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Error cargando arrendatarios</td></tr>';
        }
    }
}

// Función para abrir el modal de edición de arrendatario
async function editarArrendatario(id) {
    try {
        console.log('✏️ Editando arrendatario ID:', id);
        
        const response = await fetch(`http://localhost:3000/api/arrendatarios/${id}`);
        const arrendatario = await response.json();
        
        console.log('📄 Datos del arrendatario:', arrendatario);
        
        // Llenar el formulario con los datos actuales
        document.getElementById('editarIdArrendatario').value = arrendatario.idUsuario;
        document.getElementById('editarNombreArr').value = arrendatario.nombre;
        document.getElementById('editarDocumentoArr').value = arrendatario.documento;
        document.getElementById('editarTelefonoArr').value = arrendatario.telefono;
        document.getElementById('editarCorreoArr').value = arrendatario.correo;
        
        // Mostrar el modal
        showModal('modalEditarArrendatario');
        
    } catch (error) {
        console.error(' Error cargando datos del arrendatario:', error);
        alert('Error al cargar los datos del arrendatario: ' + error.message);
    }
}

// Formulario editar arrendatario
document.getElementById('formEditarArrendatario').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editarIdArrendatario').value;
    const datosActualizados = {
        nombre: document.getElementById('editarNombreArr').value,
        documento: document.getElementById('editarDocumentoArr').value,
        telefono: document.getElementById('editarTelefonoArr').value,
        correo: document.getElementById('editarCorreoArr').value
    };
    
    console.log('📍 Actualizando arrendatario ID:', id, 'Datos:', datosActualizados);
    
    try {
        const response = await fetch(`http://localhost:3000/api/arrendatarios/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        
        const data = await response.json();
        console.log('📨 Respuesta del servidor:', data);
        
        if (data.success) {
            alert('✅ Arrendatario actualizado exitosamente');
            closeModal('modalEditarArrendatario');
            cargarArrendatarios(); // Recargar la tabla
        } else {
            alert(' Error: ' + (data.error || 'Error al actualizar'));
        }
    } catch (error) {
        console.error(' Error completo:', error);
        alert('Error al actualizar arrendatario: ' + error.message);
    }
});


// Función para cargar pagos (arreglada)
async function cargarPagos() {
    try {
        console.log('💰 Cargando pagos...');
        
        const response = await fetch('/api/pagos');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const pagos = await response.json();
        
        const tbody = document.getElementById('pagosBody');
        tbody.innerHTML = '';
        
        pagos.forEach(pago => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pago.idPago}</td>
                <td>${new Date(pago.fechaPago).toLocaleDateString()}</td>
                <td>${parseFloat(pago.montoTotal).toLocaleString('es-CO', {
                    style: 'currency',
                    currency: 'COP'
                })}</td>
                <td>${pago.tipoPago}</td>
                <td>${pago.metodoPago}</td>
                <td>${pago.idArrendatario}</td>
                <td>${pago.idLocal}</td>
                <td><span class="badge ${pago.estado === 'completado' ? 'bg-success' : pago.estado === 'pendiente' ? 'bg-warning' : 'bg-danger'}">${pago.estado}</span></td>
                <td>${pago.comprobante || 'N/A'}</td>
            `;
            tbody.appendChild(tr);
        });
        
        console.log(' Pagos cargados correctamente');
    } catch (error) {
        console.error(' Error cargando pagos:', error);
        const tbody = document.getElementById('pagosBody');
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error cargando pagos</td></tr>';
    }
}


// Función auxiliar para obtener badge del tipo de pago - NUEVA
function obtenerBadgeTipoPago(tipoPago) {
    if (!tipoPago) return 'No especificado';
    
    const tipo = tipoPago.toString().toLowerCase().trim();
    
    const badges = {
        'arriendo': '<span style="background: #e3f2fd; color: #1565c0; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">🏠 Arriendo</span>',
        'servicios': '<span style="background: #e8f5e8; color: #2e7d32; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">⚡ Servicios</span>',
        'ambos': '<span style="background: #fff3e0; color: #ef6c00; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">🏠⚡ Ambos</span>',
        'arriendo + servicios': '<span style="background: #fff3e0; color: #ef6c00; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">🏠⚡ Ambos</span>',
        'arriendoservicios': '<span style="background: #fff3e0; color: #ef6c00; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">🏠⚡ Ambos</span>'
    };
    
    // Buscar coincidencias parciales
    if (tipo.includes('arriendo') && tipo.includes('servicio')) {
        return badges['ambos'];
    } else if (tipo.includes('arriendo')) {
        return badges['arriendo'];
    } else if (tipo.includes('servicio')) {
        return badges['servicios'];
    }
    
    return badges[tipo] || `<span style="background: #f1f5f9; color: #64748b; padding: 6px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${tipoPago}</span>`;
}


async function cargarTodosLosPagos() {
    try {
        console.log('💰 Cargando todos los pagos...');
        
        const response = await fetch('http://localhost:3000/api/pagos');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const pagos = await response.json();
        console.log(' Pagos recibidos:', pagos.length);
        
        // Buscar el tbody correcto
        const tbody = document.querySelector('#tablaPagos tbody');
        
        if (!tbody) {
            console.error(' No se encontró la tabla de pagos');
            return;
        }
        
        // Mostrar pagos en la tabla
        mostrarPagosEnTabla(pagos, tbody);
        
    } catch (error) {
        console.error(' Error cargando todos los pagos:', error);
        const tbody = document.querySelector('#tablaPagos tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #dc2626; padding: 40px;">
                        ❌ Error al cargar los pagos: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

// Función para mostrar pagos en la tabla - ACTUALIZADA
function mostrarPagosEnTabla(pagos, tbody) {
    if (!tbody) {
        tbody = document.querySelector('#tablaPagos tbody') || 
                document.getElementById('tablaTodosLosPagos');
    }
    
    if (!tbody) {
        console.error(' No se encontró tbody para mostrar pagos');
        return;
    }
    
    if (pagos && pagos.length > 0) {
        tbody.innerHTML = '';
        
        pagos.forEach(pago => {
            const tipoPagoBadge = obtenerBadgeTipoPago(pago.tipoPago);
            
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${pago.nombreArrendatario || 'N/A'}</td>
                    <td style="color: #64748b;">${pago.documentoArrendatario || 'N/A'}</td>
                    <td>${pago.direccion || 'No especificado'}</td>
                    <td style="color: #475569;">${pago.fechaPago ? new Date(pago.fechaPago).toLocaleDateString() : 'N/A'}</td>
                    <td style="font-weight: 600; color: #059669;">$${Number(pago.monto || pago.montoTotal || 0).toLocaleString()}</td>
                    <td>${tipoPagoBadge}</td>
                    <td><span class="estado-al-dia">${pago.estado === 'completado' ? 'PAGADO' : pago.estado || 'PAGADO'}</span></td>
                </tr>
            `;
        });
    } else {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                    📭 No hay pagos registrados en el sistema
                </td>
            </tr>
        `;
    }
}


function mostrarPagosEnTabla(pagos, tbody = null) {
    if (!tbody) {
        tbody = document.querySelector('#tablaPagos tbody');
    }
    
    if (!tbody) {
        console.error(' No se encontró tbody para mostrar pagos');
        return;
    }
    
    if (pagos && pagos.length > 0) {
        tbody.innerHTML = '';
        
        pagos.forEach(pago => {
            const tipoPagoBadge = obtenerBadgeTipoPago(pago.tipoPago || pago.tipo);
            
            tbody.innerHTML += `
                <tr>
                    <td style="font-weight: 500;">${pago.nombreArrendatario || pago.idArrendatario || 'N/A'}</td>
                    <td style="color: #64748b;">${pago.documentoArrendatario || 'N/A'}</td>
                    <td>${pago.direccion || 'No especificado'}</td>
                    <td style="color: #475569;">${new Date(pago.fechaPago).toLocaleDateString()}</td>
                    <td style="font-weight: 600; color: #059669;">$${Number(pago.montoTotal || pago.monto || 0).toLocaleString()}</td>
                    <td>${tipoPagoBadge}</td>
                    <td><span class="estado-al-dia">${pago.estado === 'completado' ? 'PAGADO' : pago.estado || 'PAGADO'}</span></td>
                </tr>
            `;
        });
    } else {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #64748b;">
                    📭 No hay pagos registrados en el sistema
                </td>
            </tr>
        `;
    }
}

// Función para cargar el filtro de arrendatarios
function cargarFiltroArrendatarios(pagos) {
    const selectFiltro = document.getElementById('filtroArrendatario');
    
    if (!selectFiltro) {
        console.log('ℹ️ No se encontró el filtro de arrendatarios');
        return;
    }
    
    // Obtener arrendatarios únicos de los pagos
    const arrendatariosUnicos = [];
    const arrendatariosMap = new Map();
    
    pagos.forEach(pago => {
        if (pago.nombreArrendatario && pago.documentoArrendatario) {
            const key = `${pago.nombreArrendatario}-${pago.documentoArrendatario}`;
            if (!arrendatariosMap.has(key)) {
                arrendatariosMap.set(key, true);
                arrendatariosUnicos.push({
                    nombre: pago.nombreArrendatario,
                    documento: pago.documentoArrendatario
                });
            }
        }
    });
    
    // Limpiar y llenar el select
    selectFiltro.innerHTML = '<option value="">Todos los arrendatarios</option>';
    
    arrendatariosUnicos.forEach(arrendatario => {
        selectFiltro.innerHTML += `
            <option value="${arrendatario.documento}">
                ${arrendatario.nombre} - ${arrendatario.documento}
            </option>
        `;
    });
}

// 1️⃣ FUNCIÓN: Generar Modal del Reporte
function generarReporteMora() {
    console.log('📊 [FRONTEND] Generando modal de reporte...');
    
    // Eliminar modal existente
    const modalExistente = document.getElementById('modalReporteMora');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    const hoy = new Date();
    const mesActual = hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    
    const reporteHTML = `
        <div class="modal active" id="modalReporteMora" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 10000; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
            <div class="modal-content" id="contenidoReporte" style="max-width: 1100px; width: 95%; max-height: 90vh; overflow-y: auto; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                
                <!-- HEADER -->
                <div class="modal-header" style="padding: 25px 30px; border-bottom: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%); border-radius: 20px 20px 0 0;">
                    <h2 style="margin: 0; color: white; font-size: 1.8em; display: flex; align-items: center; gap: 12px;">
                        <span>📊</span> Reporte de Pagos del Mes
                    </h2>
                    <button onclick="cerrarReporteMora()" style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); color: white; font-size: 28px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">&times;</button>
                </div>
                
                <!-- BODY -->
                <div class="modal-body" style="padding: 30px;">
                    
                    <!-- INFO DEL REPORTE -->
                    <div style="margin-bottom: 25px; padding: 20px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #0f766e;">
                        <p style="margin: 0; font-size: 1.05em;"><strong>📅 Fecha del reporte:</strong> ${hoy.toLocaleDateString()}</p>
                        <p style="margin: 8px 0 0 0; font-size: 1.05em;"><strong>📆 Mes evaluado:</strong> ${mesActual}</p>
                        <p style="margin: 8px 0 0 0; font-size: 0.95em; color: #64748b;"><strong>⏰ Fecha límite:</strong> Día 5 de cada mes</p>
                    </div>
                    
                    <!-- SECCIÓN PENDIENTES -->
                    <div style="background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border-left: 5px solid #f97316; border-radius: 15px; padding: 25px; margin-bottom: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <h3 style="color: #9a3412; margin: 0 0 15px 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
                            <span>⏳</span> Arrendatarios con Pagos Pendientes
                        </h3>
                        <p style="color: #7c2d12; margin: 0 0 20px 0;">Arrendatarios que aún tienen pagos por realizar este mes</p>
                        
                        <div id="listaPendientes" style="margin-top: 20px;">
                            <div style="text-align: center; padding: 30px;">
                                <div class="spinner" style="border: 4px solid #f1f5f9; border-top: 4px solid #f97316; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                                <p style="color: #64748b; font-style: italic;">Cargando información...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SECCIÓN AL DÍA -->
                    <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 5px solid #10b981; border-radius: 15px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                        <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
                            <span>✅</span> Arrendatarios al Día
                        </h3>
                        <p style="color: #047857; margin: 0 0 20px 0;">Arrendatarios que completaron todos sus pagos del mes</p>
                        
                        <div id="listaAlDia" style="margin-top: 20px;">
                            <div style="text-align: center; padding: 30px;">
                                <div class="spinner" style="border: 4px solid #f1f5f9; border-top: 4px solid #10b981; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                                <p style="color: #64748b; font-style: italic;">Cargando información...</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- BOTONES -->
                    <div style="margin-top: 30px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-danger" onclick="descargarReportePDF()" style="padding: 12px 28px; font-size: 1em; display: flex; align-items: center; gap: 8px;">
                            <span>📄</span> Descargar PDF
                        </button>
                        <button class="btn" onclick="cerrarReporteMora()" style="padding: 12px 28px; font-size: 1em; background: #6b7280; color: white;">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', reporteHTML);
    console.log('✅ [FRONTEND] Modal insertado');
    
    // Cargar datos
    setTimeout(() => {
        cargarDatosReportePagos();
    }, 150);
}

// Función para verificar qué elementos existen (debug)
function verificarElementosPagos() {
    console.log('🔍 Verificando elementos de pagos:');
    console.log('- tablaTodosLosPagos:', document.getElementById('tablaTodosLosPagos'));
    console.log('- tablaPagos:', document.getElementById('tablaPagos'));
    console.log('- tbody de tablaPagos:', document.querySelector('#tablaPagos tbody'));
    console.log('- filtroArrendatario:', document.getElementById('filtroArrendatario'));
    console.log('- filtroTipoPago:', document.getElementById('filtroTipoPago'));
}

// 4️⃣ FUNCIÓN: Cerrar Modal
function cerrarReporteMora() {
    const modal = document.getElementById('modalReporteMora');
    if (modal) {
        modal.remove();
        console.log('✅ [FRONTEND] Modal cerrado');
    }
}

// 2️⃣ FUNCIÓN: Cargar Datos del Reporte
async function cargarDatosReportePagos() {
    try {
        console.log('📊 [FRONTEND] Cargando datos del reporte...');
        
        const response = await fetch('http://localhost:3000/api/pagos/reporte-pagos-mes');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 [FRONTEND] Datos recibidos:', data);
        
        const listaPendientes = document.getElementById('listaPendientes');
        const listaAlDia = document.getElementById('listaAlDia');
        
        if (!listaPendientes || !listaAlDia) {
            console.error('❌ [FRONTEND] No se encontraron los contenedores');
            return;
        }
        
        // 🔴 RENDERIZAR PENDIENTES
        if (data.pendientes && data.pendientes.length > 0) {
            listaPendientes.innerHTML = `
                <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <strong style="font-size: 1.1em;">⚠️ Total con pagos pendientes: ${data.pendientes.length}</strong>
                </div>
            ` + data.pendientes.map(arr => `
                <div style="background: #fee2e2; border: 2px solid #fca5a5; border-radius: 12px; padding: 20px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <strong style="font-size: 1.2em; color: #991b1b;">👤 ${arr.nombre}</strong><br>
                            <small style="color: #7c2d12;">📄 ${arr.documento}</small><br>
                            <small style="color: #7c2d12;">🏢 ${arr.direccion}</small>
                        </div>
                        <div>
                            <span style="background: #dc2626; color: white; padding: 8px 16px; border-radius: 25px; font-weight: bold;">
                                ⏳ PENDIENTE
                            </span>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                        <strong style="color: #dc2626; font-size: 1.3em;">💰 Total Pendiente: $${Number(arr.totalPendiente).toLocaleString()}</strong>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px;">
                        <strong style="color: #92400e;">⚠️ Conceptos pendientes: ${arr.conceptosPendientes}</strong><br>
                        <div style="margin-top: 8px;">
                            ${arr.montoArriendo > 0 ? `<div>🏠 Arriendo: <strong>$${Number(arr.montoArriendo).toLocaleString()}</strong></div>` : ''}
                            ${arr.montoServicios > 0 ? `<div>⚡ Servicios: <strong>$${Number(arr.montoServicios).toLocaleString()}</strong></div>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            listaPendientes.innerHTML = `
                <div style="text-align: center; padding: 40px; background: #d1f4dd; border: 2px solid #10b981; border-radius: 15px;">
                    <div style="font-size: 4em; margin-bottom: 15px;">🎉</div>
                    <strong style="color: #065f46; font-size: 1.4em;">¡Excelente!</strong>
                    <p style="color: #047857; margin: 10px 0 0 0;">No hay pagos pendientes este mes</p>
                </div>
            `;
        }
        
        // ✅ RENDERIZAR AL DÍA
        if (data.alDia && data.alDia.length > 0) {
            listaAlDia.innerHTML = `
                <div style="background: #d1f4dd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <strong style="font-size: 1.1em; color: #065f46;">✅ Total al día: ${data.alDia.length}</strong>
                </div>
            ` + data.alDia.map(arr => `
                <div style="background: #ecfdf5; border: 2px solid #6ee7b7; border-radius: 10px; padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 2em;">✅</div>
                        <div style="flex: 1;">
                            <strong style="color: #065f46; font-size: 1.1em;">👤 ${arr.nombre}</strong><br>
                            <small style="color: #047857;">📄 ${arr.documento}</small><br>
                            <small style="color: #047857;">🏢 ${arr.direccion}</small><br>
                            <div style="margin-top: 8px;">
                                ${arr.pagadoArriendo ? '<span style="background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 12px; font-size: 0.85em; margin-right: 5px;">✅ Arriendo</span>' : ''}
                                ${arr.tieneServicios && arr.pagadoServicios ? '<span style="background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 12px; font-size: 0.85em;">✅ Servicios</span>' : ''}
                                ${!arr.tieneServicios ? '<span style="background: #e5e7eb; color: #6b7280; padding: 4px 10px; border-radius: 12px; font-size: 0.85em;">Sin servicios</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            listaAlDia.innerHTML = `
                <div style="text-align: center; padding: 30px; background: #fef3c7; border: 2px solid #fbbf24; border-radius: 12px;">
                    <div style="font-size: 2.5em; margin-bottom: 10px;">⚠️</div>
                    <p style="color: #92400e; margin: 0;">No hay registros de arrendatarios al día</p>
                </div>
            `;
        }
        
        console.log('✅ [FRONTEND] Reporte cargado exitosamente');
        
    } catch (error) {
        console.error('❌ [FRONTEND] Error:', error);
        
        const listaPendientes = document.getElementById('listaPendientes');
        const listaAlDia = document.getElementById('listaAlDia');
        
        if (listaPendientes) {
            listaPendientes.innerHTML = `<div style="text-align: center; padding: 40px; color: #dc2626;"><strong>❌ Error al cargar datos</strong><p>${error.message}</p></div>`;
        }
        if (listaAlDia) {
            listaAlDia.innerHTML = `<div style="text-align: center; padding: 40px; color: #dc2626;"><strong>❌ Error al cargar datos</strong><p>${error.message}</p></div>`;
        }
    }
}

// Funciones auxiliares para el reporte
function imprimirReporte() {
    window.print();
}

// 3️⃣ FUNCIÓN: Descargar PDF
function descargarReportePDF() {
    console.log('📄 [FRONTEND] Iniciando descarga de PDF...');
    
    // Ocultar botones antes de imprimir
    const botones = document.querySelectorAll('#modalReporteMora .btn');
    botones.forEach(btn => btn.style.display = 'none');
    
    // Agregar estilos para impresión
    const estiloPDF = document.createElement('style');
    estiloPDF.id = 'estiloPDF';
    estiloPDF.innerHTML = `
        @media print {
            body * {
                visibility: hidden;
            }
            #modalReporteMora, #modalReporteMora * {
                visibility: visible;
            }
            #modalReporteMora {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white !important;
            }
            .spinner {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(estiloPDF);
    
    // Abrir diálogo de impresión
    setTimeout(() => {
        window.print();
        
        // Restaurar después de imprimir
        setTimeout(() => {
            botones.forEach(btn => btn.style.display = '');
            const estiloTemp = document.getElementById('estiloPDF');
            if (estiloTemp) estiloTemp.remove();
        }, 500);
    }, 300);
}

async function cargarDatosMora() {
    try {
        const response = await fetch('http://localhost:3000/api/pagos/reporte-mora');
        const data = await response.json();
        
        const listaMora = document.getElementById('listaMora');
        const listaAlDia = document.getElementById('listaAlDia');
        
        if (!listaMora || !listaAlDia) return;
        
        // 🔴 MOROSOS
        if (data.morosos && data.morosos.length > 0) {
            listaMora.innerHTML = `
                <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                    <strong>⚠️ Total de morosos: ${data.morosos.length}</strong><br>
                    <small>Fecha límite de pago: Día ${data.diaLimitePago} de cada mes</small>
                </div>
            ` + data.morosos.map(moroso => `
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <strong style="font-size: 1.1em;">👤 ${moroso.nombre}</strong><br>
                            <small style="color: #666;">📄 ${moroso.documento}</small><br>
                            <small style="color: #666;">🏢 ${moroso.direccion}</small>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: #dc3545; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.85em; font-weight: bold;">
                                📅 ${moroso.diasMora} día${moroso.diasMora > 1 ? 's' : ''} de mora
                            </span>
                        </div>
                    </div>
                    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f5c6cb;">
                        <strong style="color: #dc3545; font-size: 1.1em;">💰 Deuda Total: ${Number(moroso.deudaTotal).toLocaleString()}</strong><br>
                        <div style="margin-top: 8px; background: #fff; padding: 10px; border-radius: 5px;">
                            <strong>⚠️ Conceptos pendientes:</strong> ${moroso.conceptosPendientes}<br>
                            <small style="color: #666;">
                                ${moroso.montoArriendo > 0 ? `🏠 Arriendo: ${Number(moroso.montoArriendo).toLocaleString()}` : ''}
                                ${moroso.montoArriendo > 0 && moroso.montoServicios > 0 ? ' | ' : ''}
                                ${moroso.montoServicios > 0 ? `⚡ Servicios: ${Number(moroso.montoServicios).toLocaleString()}` : ''}
                            </small>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            listaMora.innerHTML = `
                <div style="text-align: center; padding: 30px; background: #d1e7dd; border: 1px solid #badbcc; border-radius: 10px;">
                    <div style="font-size: 3em; margin-bottom: 10px;">✅</div>
                    <strong style="color: #0f5132; font-size: 1.2em;">¡Excelente!</strong>
                    <p style="color: #0f5132; margin: 10px 0 0 0;">No hay arrendatarios en mora</p>
                </div>
            `;
        }
        
        // ✅ AL DÍA
        if (data.alDia && data.alDia.length > 0) {
            listaAlDia.innerHTML = data.alDia.map(alDia => `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                    <strong>👤 ${alDia.nombre}</strong><br>
                    <small>🏢 ${alDia.direccion}</small><br>
                    <small style="color: #155724;">✅ Último pago: ${new Date(alDia.ultimoPago).toLocaleDateString()}</small>
                </div>
            `).join('');
        } else {
            listaAlDia.innerHTML = `
                <div style="text-align: center; padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
                    <p style="color: #856404; margin: 0;">
                        ℹ️ No hay arrendatarios al día registrados este mes
                    </p>
                </div>
            `;
        }
        
        console.log('✅ Reporte de mora cargado:', data.morosos.length, 'morosos,', data.alDia.length, 'al día');
        
    } catch (error) {
        console.error('❌ Error cargando datos de mora:', error);
        const listaMora = document.getElementById('listaMora');
        const listaAlDia = document.getElementById('listaAlDia');
        
        if (listaMora) {
            listaMora.innerHTML = '<p style="text-align: center; color: red;">❌ Error cargando datos de morosos</p>';
        }
        if (listaAlDia) {
            listaAlDia.innerHTML = '<p style="text-align: center; color: red;">❌ Error cargando datos</p>';
        }
    }
}


async function cargarServicios() {
    console.log('🔍 Iniciando carga de servicios...');
    
    try {
        // Primero probar si la ruta existe
        const testResponse = await fetch('http://localhost:3000/api/servicios-por-local');
        
        if (!testResponse.ok) {
            throw new Error(`Error HTTP: ${testResponse.status} - La ruta no existe`);
        }
        
        const serviciosPorLocal = await testResponse.json();
        console.log('📊 Datos recibidos:', serviciosPorLocal);
        
        const tbody = document.querySelector('#tablaServicios tbody');
        tbody.innerHTML = '';
        
        if (serviciosPorLocal.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No hay servicios registrados</td></tr>';
            return;
        }
        
        serviciosPorLocal.forEach(local => {
            let serviciosHTML = '';
            let valorTotal = local.valorTotalServicios || 0;
            
            if (local.servicios && local.servicios !== 'Sin servicios') {
                serviciosHTML = local.servicios.split(', ').map(servicio => {
                    const emoji = servicio.includes('Agua') ? '💧' : 
                                 servicio.includes('Luz') ? '💡' : 
                                 servicio.includes('Internet') ? '🌐' : '⚡';
                    return `${emoji} ${servicio}`;
                }).join(', ');
            } else {
                serviciosHTML = 'Sin servicios asignados';
            }
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>Local #${local.idLocal}</strong></td>
                    <td>${local.direccion}</td>
                    <td>${serviciosHTML}</td>
                    <td><strong>$${Number(valorTotal).toLocaleString()}</strong></td>
                </tr>
            `;
        });
        
        console.log(' Tabla de servicios cargada exitosamente');
        
    } catch (error) {
        console.error(' Error cargando servicios:', error);
        const tbody = document.querySelector('#tablaServicios tbody');
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align:center; color: red; padding: 40px;">
                    <h3>Error: Ruta no encontrada</h3>
                    <p>${error.message}</p>
                    <small>Verifica que hayas agregado las rutas al server.js</small>
                </td>
            </tr>
        `;
    }
}

// Función para mostrar el modal de agregar servicio
function mostrarModalAgregarServicio() {
    console.log('📍 Abriendo modal para agregar servicio...');
    cargarDatosParaAgregarServicio();
    showModal('modalAgregarServicio');
}

// Función mejorada para cargar datos en el modal
async function cargarDatosParaAgregarServicio() {
    try {
        console.log('📥 Cargando datos para modal...');
        
        // Cargar locales disponibles
        const responseLocales = await fetch('http://localhost:3000/api/locales');
        const locales = await responseLocales.json();
        
        const selectLocal = document.getElementById('selectLocalServicio');
        selectLocal.innerHTML = '<option value="">Seleccionar local...</option>';
        locales.forEach(local => {
            selectLocal.innerHTML += `<option value="${local.idLocal}">Local #${local.idLocal} - ${local.direccion}</option>`;
        });

        // Cargar servicios disponibles y servicios ya asignados
        const [serviciosResponse, serviciosAsignadosResponse] = await Promise.all([
            fetch('http://localhost:3000/api/servicios-disponibles'),
            fetch('http://localhost:3000/api/servicios-por-local')
        ]);
        
        const servicios = await serviciosResponse.json();
        const serviciosAsignados = await serviciosAsignadosResponse.json();
        
        const selectServicio = document.getElementById('selectServicioDisponible');
        selectServicio.innerHTML = '<option value="">Seleccionar servicio...</option>';
        
        servicios.forEach(servicio => {
            // Verificar si el servicio ya está asignado a algún local
            const yaAsignado = serviciosAsignados.some(local => 
                local.servicios && local.servicios.includes(servicio.nombreServicio)
            );
            
            if (!yaAsignado) {
                selectServicio.innerHTML += `<option value="${servicio.id}">${servicio.nombreServicio} - $${Number(servicio.valorServicio).toLocaleString()}</option>`;
            }
        });
        
        console.log(' Datos cargados en modal');
        
    } catch (error) {
        console.error(' Error cargando datos para modal:', error);
        alert('Error al cargar los datos: ' + error.message);
    }
}

// Manejar el envío del formulario de agregar servicio
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('formAgregarServicio').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const idLocal = document.getElementById('selectLocalServicio').value;
        const idServicio = document.getElementById('selectServicioDisponible').value;
        
        if (!idLocal || !idServicio) {
            alert('Por favor selecciona un local y un servicio');
            return;
        }
        
        console.log('📍 Enviando datos:', { idLocal, idServicio });
        
        try {
            const response = await fetch('http://localhost:3000/api/servicios-por-local', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idLocal: parseInt(idLocal),
                    idServicio: parseInt(idServicio)
                })
            });
            
            const result = await response.json();
            console.log('📨 Respuesta del servidor:', result);
            
            if (result.success) {
                alert('✅ ' + result.message);
                closeModal('modalAgregarServicio');
                cargarServicios(); // Recargar la tabla
            } else {
                alert(' ' + result.error);
            }
            
        } catch (error) {
            console.error(' Error completo:', error);
            alert('Error al agregar servicio: ' + error.message);
        }
    });
});

// Función para cargar datos en los selectores del modal
async function cargarDatosParaAgregarServicio() {
    try {
        console.log('📥 [FRONTEND] Cargando datos para modal...');
        
        // Cargar locales
        const responseLocales = await fetch('http://localhost:3000/api/locales');
        const locales = await responseLocales.json();
        
        const selectLocal = document.getElementById('selectLocalServicio');
        selectLocal.innerHTML = '<option value="">Seleccionar local...</option>';
        locales.forEach(local => {
            selectLocal.innerHTML += `<option value="${local.idLocal}">Local #${local.idLocal} - ${local.direccion}</option>`;
        });

        // Cargar servicios disponibles
        const responseServicios = await fetch('http://localhost:3000/api/servicios-disponibles');
        const servicios = await responseServicios.json();
        
        const selectServicio = document.getElementById('selectServicioDisponible');
        selectServicio.innerHTML = '<option value="">Seleccionar servicio...</option>';
        servicios.forEach(servicio => {
            selectServicio.innerHTML += `<option value="${servicio.id}">${servicio.nombreServicio} - $${Number(servicio.valorServicio).toLocaleString()}</option>`;
        });
        
        console.log(' [FRONTEND] Datos cargados en modal');
        
    } catch (error) {
        console.error(' [FRONTEND] Error cargando datos para modal:', error);
        alert('Error al cargar los datos: ' + error.message);
    }
}

// Manejar el envío del formulario de agregar servicio
document.addEventListener('submit', async function(e) {
    if (e.target.id === 'formAgregarServicio') {
        e.preventDefault();
        
        const idLocal = document.getElementById('selectLocal').value;
        const idServicio = document.getElementById('selectServicio').value;
        
        if (!idLocal || !idServicio) {
            alert(' Por favor selecciona un local y un servicio');
            return;
        }
        
        console.log('📍 Enviando a nueva ruta:', { idLocal, idServicio });
        
        try {
            const response = await fetch('http://localhost:3000/api/agregar-servicio-local', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idLocal: parseInt(idLocal),
                    idServicio: parseInt(idServicio)
                })
            });
            
            console.log('📨 Status de respuesta:', response.status);
            
            // Leer la respuesta como texto primero
            const responseText = await response.text();
            console.log('📄 Respuesta del servidor:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (parseError) {
                console.error(' No se pudo parsear JSON:', responseText);
                throw new Error('El servidor no devolvió JSON válido');
            }
            
            if (result.success) {
                alert('✅ Servicio agregado exitosamente');
                closeModal('modalAgregarServicio');
                cargarServicios(); // Recargar tabla
            } else {
                alert(' Error: ' + (result.error || 'Error desconocido'));
            }
            
        } catch (error) {
            console.error(' Error completo:', error);
            alert('Error: ' + error.message);
        }
    }
});

// Formulario anadir local
document.getElementById('formLocal').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    console.log('👤 Usuario actual:', usuario); // ← Verifica qué datos tienes
    
    const datosLocal = {
        direccion: document.getElementById('direccion').value,
        area: parseFloat(document.getElementById('area').value),
        valorArriendo: parseFloat(document.getElementById('valorArriendo').value),
        idAdministrador: usuario.idUsuario // ← CAMBIA usuario.id por usuario.idUsuario
    };
    
    console.log('📍 Enviando datos:', datosLocal);
    
    try {
        const response = await fetch('http://localhost:3000/api/locales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosLocal)
        });
        
        const data = await response.json();
        console.log('📨 Respuesta del servidor:', data);
        
        if (data.success) {
            alert('Local anadido exitosamente');
            closeModal('modalLocal');
            cargarLocales();
            cargarEstadisticas();
            document.getElementById('formLocal').reset();
        } else {
            alert('Error: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error(' Error completo:', error);
        alert('Error al anadir local: ' + error.message);
    }
});

// Formulario anadir arrendatario
document.getElementById('formArrendatario').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const datosArr = {
        nombre: document.getElementById('nombreArr').value,
        documento: document.getElementById('documentoArr').value,
        telefono: document.getElementById('telefonoArr').value,
        correo: document.getElementById('correoArr').value
    };
    
    try {
        const response = await fetch('http://localhost:3000/api/arrendatarios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosArr)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Arrendatario anadido exitosamente');
            closeModal('modalArrendatario');
            cargarArrendatarios();
            cargarEstadisticas();
            document.getElementById('formArrendatario').reset();
        }
    } catch (error) {
        alert('Error al anadir arrendatario: ' + error.message);
    }
});

// Eliminar local
async function eliminarLocal(id) {
    console.log('🗑️ Intentando eliminar local ID:', id);
    
    if (!confirm('¿Estás seguro de eliminar este local?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/locales/${id}`, {
            method: 'DELETE'
        });
        
        console.log('📨 Respuesta del servidor:', response);
        
        const data = await response.json();
        console.log('📄 Datos de respuesta:', data);
        
        if (data.success) {
            alert('✅ Local eliminado exitosamente');
            cargarLocales();
            cargarEstadisticas();
        } else {
            alert(' Error: ' + (data.error || 'Error al eliminar'));
        }
    } catch (error) {
        console.error(' Error completo:', error);
        alert('Error al eliminar: ' + error.message);
    }
}

// Formulario editar local
document.getElementById('formEditarLocal').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const id = document.getElementById('editarIdLocal').value;
    
    const datosActualizados = {
        direccion: document.getElementById('editarDireccion').value,
        area: parseFloat(document.getElementById('editarArea').value),
        valorArriendo: parseFloat(document.getElementById('editarValorArriendo').value),
        idAdministrador: usuario.idUsuario // ← AGREGAR ESTE CAMPO
    };
    
    console.log('📍 Actualizando local ID:', id, 'Datos:', datosActualizados);
    
    try {
        const response = await fetch(`http://localhost:3000/api/locales/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        
        const data = await response.json();
        console.log('📨 Respuesta del servidor:', data);
        
        if (data.success) {
            alert('✅ Local actualizado exitosamente');
            closeModal('modalEditarLocal');
            cargarLocales(); // Recargar la tabla
        } else {
            alert(' Error: ' + (data.error || 'Error al actualizar'));
        }
    } catch (error) {
        console.error(' Error completo:', error);
        alert('Error al actualizar local: ' + error.message);
    }
});

// Función para reorganizar la tabla después de eliminar
async function reorganizarLocales() {
    try {
        const response = await fetch('http://localhost:3000/api/locales/reorganizar', {
            method: 'POST'
        });
        const data = await response.json();
        if (data.success) {
            console.log(' IDs reorganizados');
            cargarLocales();
        }
    } catch (error) {
        console.error('Error reorganizando IDs:', error);
    }
}

// Eliminar arrendatario
async function eliminarArrendatario(id) {
    if (!confirm('Estas seguro de eliminar este arrendatario?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/arrendatarios/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Arrendatario eliminado');
            cargarArrendatarios();
            cargarEstadisticas();
        }
    } catch (error) {
        alert('Error al eliminar: ' + error.message);
    }
}

// Función para ver detalles completos del contrato
async function verContrato(idContrato) {
    try {
        const response = await fetch(`http://localhost:3000/api/contratos/${idContrato}`);
        const contrato = await response.json();
        
        if (contrato) {
            mostrarModalContrato(contrato);
        } else {
            alert('No se pudo cargar la información del contrato');
        }
    } catch (error) {
        console.error('Error cargando contrato:', error);
        alert('Error al cargar los detalles del contrato');
    }
}

// Función para mostrar modal con detalles del contrato
function mostrarModalContrato(contrato) {
    const modalHTML = `
        <div class="modal active" id="modalContrato">
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>📄 Detalles del Contrato #${contrato.id}</h3>
                    <button class="close-btn" onclick="closeModal('modalContrato')">×</button>
                </div>
                <div class="modal-body">
                    <div class="info-grid" style="display: grid; gap: 15px;">
                        <div class="info-section">
                            <h4>🏠 Información del Local</h4>
                            <p><strong>Dirección:</strong> ${contrato.direccion || 'No especificada'}</p>
                            <p><strong>Área:</strong> ${contrato.area || 'N/A'} m²</p>
                            <p><strong>Valor Arriendo:</strong> $${Number(contrato.valorArriendo || 0).toLocaleString()}</p>
                        </div>
                        
                        <div class="info-section">
                            <h4>👤 Información del Arrendatario</h4>
                            <p><strong>Nombre:</strong> ${contrato.nombreArrendatario || 'No especificado'}</p>
                        </div>
                        
                        <div class="info-section">
                            <h4>📅 Periodo del Contrato</h4>
                            <p><strong>Fecha Inicio:</strong> ${new Date(contrato.fechaInicio).toLocaleDateString()}</p>
                            <p><strong>Fecha Fin:</strong> ${new Date(contrato.fechaFin).toLocaleDateString()}</p>
                            <p><strong>Duración:</strong> ${calcularDuracionContrato(contrato.fechaInicio, contrato.fechaFin)}</p>
                            <p><strong>Estado:</strong> <span class="estado-activo">${obtenerEstadoContrato(contrato.fechaFin)}</span></p>
                        </div>
                        
                        <div class="info-section">
                            <h4>📝 Condiciones Especiales</h4>
                            <p>${contrato.condiciones || 'Pago mensual anticipado. No incluye servicios adicionales.'}</p>
                        </div>
                        
                        <div class="info-section">
                            <h4>💰 Resumen Financiero</h4>
                            <p><strong>Valor Mensual:</strong> $${Number(contrato.valorArriendo || 0).toLocaleString()}</p>
                            <p><strong>Total Contrato:</strong> $${calcularTotalContrato(contrato.fechaInicio, contrato.fechaFin, contrato.valorArriendo)}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="imprimirContrato(${contrato.id})">🖨️ Imprimir</button>
                    <button class="btn btn-success" onclick="renovarContrato(${contrato.id})">🔄 Renovar</button>
                    <button class="btn btn-danger" onclick="finalizarContrato(${contrato.id})">⏹️ Finalizar</button>
                    <button class="btn" onclick="closeModal('modalContrato')">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    // Agregar el modal al body si no existe
    if (!document.getElementById('modalContrato')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    } else {
        document.getElementById('modalContrato').innerHTML = modalHTML;
    }
}

// Cargar datos para formulario de nuevo contrato
async function cargarDatosContrato() {
    try {
        // Cargar locales disponibles
        const responseLocales = await fetch('http://localhost:3000/api/locales');
        const locales = await responseLocales.json();
        
        const selectLocal = document.getElementById('idLocal');
        selectLocal.innerHTML = '<option value="">Seleccionar local...</option>';
        locales.forEach(local => {
            selectLocal.innerHTML += `<option value="${local.idLocal}">${local.direccion} - $${Number(local.valorArriendo).toLocaleString()}</option>`;
        });

        // Cargar arrendatarios
        const responseArrendatarios = await fetch('http://localhost:3000/api/arrendatarios');
        const arrendatarios = await responseArrendatarios.json();
        
        const selectArrendatario = document.getElementById('idArrendatario');
        selectArrendatario.innerHTML = '<option value="">Seleccionar arrendatario...</option>';
        arrendatarios.forEach(arr => {
            selectArrendatario.innerHTML += `<option value="${arr.idUsuario}">${arr.nombre} - ${arr.documento}</option>`;
        });
    } catch (error) {
        console.error('Error cargando datos para contrato:', error);
    }
}

// Formulario nuevo contrato
document.getElementById('formContratoNuevo').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    const datosContrato = {
        fechaInicio: document.getElementById('fechaInicio').value,
        fechaFin: document.getElementById('fechaFin').value,
        condiciones: document.getElementById('condiciones').value,
        idLocal: document.getElementById('idLocal').value,
        idArrendatario: document.getElementById('idArrendatario').value,
        idAdministrador: usuario.idUsuario
    };
    
    console.log('📍 Enviando datos contrato:', datosContrato);
    
    try {
        const response = await fetch('http://localhost:3000/api/contratos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosContrato)
        });
        
        const data = await response.json();
        console.log('📨 Respuesta del servidor:', data);
        
        if (data.success) {
            alert('✅ Contrato creado exitosamente');
            closeModal('modalContratoNuevo');
            cargarContratos();
            cargarEstadisticas();
            document.getElementById('formContratoNuevo').reset();
        } else {
            alert(' Error: ' + (data.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error(' Error completo:', error);
        alert('Error al crear contrato: ' + error.message);
    }
});

// Función corregida y unificada:
async function cargarContratos() {
    try {
        console.log('📄 Cargando contratos...');
        const response = await fetch('http://localhost:3000/api/contratos');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const contratos = await response.json();
        
        const tbody = document.querySelector('#tablaContratos tbody');
        if (!tbody) {
            console.error(' No se encontró la tabla de contratos');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (contratos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No hay contratos registrados</td></tr>';
            return;
        }
        
        // Ordenar contratos por ID ascendente
        const contratosOrdenados = contratos.sort((a, b) => a.id - b.id);
        
        contratosOrdenados.forEach((contrato, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${contrato.direccion || 'N/A'}</td>
                    <td>${contrato.nombreArrendatario || 'N/A'}</td>
                    <td>${new Date(contrato.fechaInicio).toLocaleDateString()}</td>
                    <td>${new Date(contrato.fechaFin).toLocaleDateString()}</td>
                    <td>
                        <button class="btn btn-primary" onclick="verContrato(${contrato.id})">Ver</button>
                        <button class="btn btn-warning" onclick="editarContrato(${contrato.id})">Actualizar</button>
                    </td>
                </tr>
            `;
        });
        
        console.log(' Contratos cargados correctamente');
    } catch (error) {
        console.error(' Error cargando contratos:', error);
        const tbody = document.querySelector('#tablaContratos tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">Error cargando contratos</td></tr>';
        }
    }
}

// Función para abrir el modal de edición de contrato
async function editarContrato(id) {
    try {
        console.log('✏️ Editando contrato ID:', id);
        
        const response = await fetch(`http://localhost:3000/api/contratos/${id}`);
        const contrato = await response.json();
        
        console.log('📄 Datos del contrato:', contrato);
        
        // Llenar el formulario con los datos actuales
        document.getElementById('editarIdContrato').value = contrato.id;
        document.getElementById('editarFechaInicio').value = contrato.fechaInicio;
        document.getElementById('editarFechaFin').value = contrato.fechaFin;
        document.getElementById('editarCondiciones').value = contrato.condiciones || '';
        
        // Mostrar el modal
        showModal('modalEditarContrato');
        
    } catch (error) {
        console.error(' Error cargando datos del contrato:', error);
        alert('Error al cargar los datos del contrato: ' + error.message);
    }
}

// Formulario editar contrato
document.getElementById('formEditarContrato').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editarIdContrato').value;
    const datosActualizados = {
        fechaInicio: document.getElementById('editarFechaInicio').value,
        fechaFin: document.getElementById('editarFechaFin').value,
        condiciones: document.getElementById('editarCondiciones').value
    };
    
    console.log('📍 Actualizando contrato ID:', id, 'Datos:', datosActualizados);
    
    try {
        const response = await fetch(`http://localhost:3000/api/contratos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosActualizados)
        });
        
        const data = await response.json();
        console.log('📨 Respuesta del servidor:', data);
        
        if (data.success) {
            alert('✅ Contrato actualizado exitosamente');
            closeModal('modalEditarContrato');
            cargarContratos(); // Recargar la tabla
        } else {
            alert(' Error: ' + (data.error || 'Error al actualizar'));
        }
    } catch (error) {
        console.error(' Error completo:', error);
        alert('Error al actualizar contrato: ' + error.message);
    }
});

// Funciones auxiliares
function calcularDuracionContrato(fechaInicio, fechaFin) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin - inicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const meses = Math.floor(diffDays /  30);
    const dias = diffDays % 30;
    
    return `${meses} meses y ${dias} días`;
}

function obtenerEstadoContrato(fechaFin) {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    return hoy <= fin ? 'ACTIVO' : 'VENCIDO';
}

function calcularTotalContrato(fechaInicio, fechaFin, valorMensual) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diffTime = Math.abs(fin - inicio);
    const diffMeses = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    return Number(valorMensual * diffMeses).toLocaleString();
}

// ==========================================
// FUNCIÓN AUXILIAR PARA EMOJIS DE TABS
// ==========================================

function getTabEmoji(tabName) {
    const emojis = {
        'locales': '🏢',
        'arrendatarios': '👥', 
        'contratos': '📄',
        'pagos': '💰',
        'mantenimiento': '🔧',
        'servicios': '⚡'
    };
    return emojis[tabName] || '';
}

// Funciones de acciones del contrato
function imprimirContrato(idContrato) {
    alert(`Imprimiendo contrato #${idContrato}...`);
    // Aquí iría la lógica para imprimir el contrato
}

function renovarContrato(idContrato) {
    const nuevaFecha = prompt('Ingrese la nueva fecha de finalización (YYYY-MM-DD):');
    if (nuevaFecha) {
        alert(`Contrato #${idContrato} será renovado hasta ${nuevaFecha}`);
        // Aquí iría la lógica para renovar el contrato
    }
}

function finalizarContrato(idContrato) {
    if (confirm('¿Está seguro de que desea finalizar este contrato? Esta acción no se puede deshacer.')) {
        alert(`Contrato #${idContrato} finalizado`);
        // Aquí iría la lógica para finalizar el contrato
        closeModal('modalContrato');
        cargarContratos(); // Recargar la lista
    }
}

// Función para ver detalles completos del contrato
async function verContrato(idContrato) {
    try {
        console.log('🔍 Solicitando contrato ID:', idContrato);
        
        const response = await fetch(`http://localhost:3000/api/contratos/${idContrato}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const contrato = await response.json();
        console.log('📄 Contrato recibido:', contrato);
        
        if (contrato) {
            mostrarModalContrato(contrato);
        } else {
            alert('No se pudo cargar la información del contrato');
        }
    } catch (error) {
        console.error(' Error cargando contrato:', error);
        alert('Error al cargar los detalles del contrato: ' + error.message);
    }
}

// Función simplificada para mostrar modal
function mostrarModalContrato(contrato) {
    const modalHTML = `
        <div class="modal active" id="modalContrato" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
            <div style="background: white; border-radius: 10px; padding: 0; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="padding: 20px; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa;">
                    <h3 style="margin: 0; color: #333;">📄 Contrato #${contrato.id || contrato.idContrato}</h3>
                    <button onclick="closeModal('modalContrato')" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
                </div>
                
                <div style="padding: 20px;">
                    <div style="display: grid; gap: 15px;">
                        <!-- Información Básica -->
                        <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <h4 style="margin: 0 0 10px 0; color: #333;">📋 Información Básica</h4>
                            <p><strong>ID:</strong> ${contrato.id || contrato.idContrato}</p>
                            <p><strong>Dirección:</strong> ${contrato.direccion || 'No especificada'}</p>
                            <p><strong>Arrendatario:</strong> ${contrato.nombreArrendatario || 'No especificado'}</p>
                        </div>
                        
                        <!-- Fechas -->
                        <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <h4 style="margin: 0 0 10px 0; color: #333;">📅 Fechas del Contrato</h4>
                            <p><strong>Inicio:</strong> ${new Date(contrato.fechaInicio).toLocaleDateString()}</p>
                            <p><strong>Fin:</strong> ${new Date(contrato.fechaFin).toLocaleDateString()}</p>
                            <p><strong>Duración:</strong> ${calcularDuracionContrato(contrato.fechaInicio, contrato.fechaFin)}</p>
                        </div>
                        
                        <!-- Condiciones -->
                        <div style="padding: 15px; background: #f8f9fa; border-radius: 8px;">
                            <h4 style="margin: 0 0 10px 0; color: #333;">📝 Condiciones</h4>
                            <p>${contrato.condiciones || 'Pago mensual anticipado'}</p>
                        </div>
                    </div>
                </div>
                
                <div style="padding: 15px 20px; border-top: 1px solid #dee2e6; display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn btn-primary" onclick="closeModal('modalContrato')">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    // Remover modal existente si hay
    const existingModal = document.getElementById('modalContrato');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Agregar nuevo modal
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Función para cerrar el modal
function closeModalContrato() {
    const modal = document.getElementById('modalContrato');
    if (modal) {
        modal.remove();
    }
}

// Función auxiliar para calcular duración
function calcularDuracionContrato(fechaInicio, fechaFin) {
    try {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const diffTime = Math.abs(fin - inicio);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const meses = Math.floor(diffDays / 30);
        const dias = diffDays % 30;
        
        return `${meses} meses y ${dias} días`;
    } catch (error) {
        return 'No calculable';
    }
}

// ==========================================
// FUNCIONES PARA MANTENIMIENTO
// ==========================================

async function cargarMantenimiento() {
    console.log('🛠️ INICIANDO cargarMantenimiento...');
    
    try {
        console.log('📡 Haciendo fetch a la API...');
        const response = await fetch('http://localhost:3000/api/mantenimiento/solicitudes');
        console.log('📡 Respuesta HTTP:', response.status, response.statusText);
        
        // Verificar si la respuesta es OK
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const solicitudes = await response.json();
        console.log('📊 Solicitudes recibidas:', solicitudes);
        
        const tbody = document.querySelector('#tablaMantenimiento tbody');
        console.log('🎯 Tabla encontrada:', tbody);
        
        if (!tbody) {
            console.error(' NO se encontró la tabla #tablaMantenimiento tbody');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (!solicitudes || solicitudes.length === 0) {
            console.log('ℹ️ No hay solicitudes');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px; color: #94a3b8;">No hay solicitudes de mantenimiento</td></tr>';
            return;
        }
        
        console.log(`📝 Renderizando ${solicitudes.length} solicitudes...`);
        solicitudes.forEach(s => {
            const prioridadBadge = obtenerBadgePrioridad(s.prioridad);
            const estadoBadge = obtenerBadgeEstado(s.estado);
            
            tbody.innerHTML += `
                <tr>
                    <td><strong>${s.local_nombre || 'Sin local'}</strong></td>
                    <td>${s.tipo_servicio || 'Sin tipo'}</td>
                    <td>${s.descripcion || 'Sin descripción'}</td>
                    <td>${prioridadBadge}</td>
                    <td>${estadoBadge}</td>
                    <td>
                        <button class="btn btn-primary" onclick="cambiarEstadoMantenimiento(${s.id}, '${s.estado}')" style="padding: 8px 16px; font-size: 12px;">
                            Cambiar Estado
                        </button>
                    </td>
                </tr>
            `;
        });
        
        console.log(' Mantenimiento cargado exitosamente');
        
    } catch (error) {
        console.error(' Error cargando mantenimiento:', error);
        const tbody = document.querySelector('#tablaMantenimiento tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 40px; color: #ef4444;">Error al cargar las solicitudes: ' + error.message + '</td></tr>';
        }
    }
}

// ==========================================
// FUNCIONES AUXILIARES PARA BADGES
// ==========================================

function obtenerBadgePrioridad(prioridad) {
    const badges = {
        'urgente': '<span style="background: #fee; color: #c00; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">🔴 URGENTE</span>',
        'normal': '<span style="background: #fff4e6; color: #e67e22; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">🟡 NORMAL</span>',
        'baja': '<span style="background: #f0f0f0; color: #666; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">⚪ BAJA</span>'
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

function cambiarEstadoMantenimiento(id, estadoActual) {
    console.log('🔧 Abriendo modal para solicitud ID:', id, 'Estado actual:', estadoActual);
    
    // Guardar el ID en el campo oculto
    document.getElementById('idMantenimiento').value = id;
    
    // Mostrar el estado actual
    const estadosTexto = {
        'pendiente': '⏳ Pendiente',
        'en_proceso': '⚙️ En Proceso',
        'completado': '✅ Completado',
        'cancelado': '❌ Cancelado'
    };
    document.getElementById('estadoActualMantenimiento').value = estadosTexto[estadoActual] || estadoActual;
    
    // Limpiar campos
    document.getElementById('nuevoEstadoMantenimiento').value = '';
    
    // Mostrar modal
    showModal('modalEstadoMantenimiento');
    
    console.log(' Modal de estado abierto');
}

// ========================================
// INICIALIZACIÓN DE FILTROS AL CARGAR LA PÁGINA
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM cargado - Inicializando filtros...');
    inicializarFiltrosAdmin();
});

function inicializarFiltrosAdmin() {
    console.log('🔍 Inicializando filtros del admin...');
    
    // FILTRO ARRENDATARIOS (por documento)
    const inputArrendatarios = document.getElementById('filtroDocumentoArrendatarios');
    const btnBuscarArrendatarios = document.getElementById('btnBuscarArrendatarios');
    const btnLimpiarArrendatarios = document.getElementById('btnLimpiarArrendatarios');

    if (inputArrendatarios) {
        console.log('✅ Filtro de Arrendatarios encontrado');
        btnBuscarArrendatarios?.addEventListener('click', () => {
            console.log('🔎 Buscando arrendatarios...');
            aplicarFiltroArrendatarios();
        });
        inputArrendatarios.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                console.log('⏎ Enter presionado en Arrendatarios');
                aplicarFiltroArrendatarios();
            }
        });
        btnLimpiarArrendatarios?.addEventListener('click', () => {
            console.log('🗑️ Limpiando filtro de Arrendatarios');
            inputArrendatarios.value = '';
            aplicarFiltroArrendatarios(true);
        });
    } else {
        console.warn('❌ Filtro de Arrendatarios NO encontrado');
    }

    // FILTRO CONTRATOS (por nombre del arrendatario)
    const inputContratos = document.getElementById('filtroNombreArrendatario');
    const btnBuscarContratos = document.getElementById('btnBuscarContratos');
    const btnLimpiarContratos = document.getElementById('btnLimpiarContratos');

    if (inputContratos) {
        console.log('✅ Filtro de Contratos encontrado');
        btnBuscarContratos?.addEventListener('click', () => {
            console.log('🔎 Buscando contratos por nombre...');
            aplicarFiltroContratos();
        });
        inputContratos.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                console.log('⏎ Enter presionado en Contratos');
                aplicarFiltroContratos();
            }
        });
        btnLimpiarContratos?.addEventListener('click', () => {
            console.log('🗑️ Limpiando filtro de Contratos');
            inputContratos.value = '';
            aplicarFiltroContratos(true);
        });
    } else {
        console.warn('❌ Filtro de Contratos NO encontrado');
    }
}

/**
 * Filtra la tabla de ARRENDATARIOS por documento
 * Estructura: ID(0) | Nombre(1) | Documento(2) | Telefono(3) | Correo(4) | Acciones(5)
 */
function aplicarFiltroArrendatarios(limpiar = false) {
    const input = document.getElementById('filtroDocumentoArrendatarios');
    const tabla = document.getElementById('tablaArrendatarios');
    
    if (!tabla) {
        console.error('❌ Tabla de arrendatarios no encontrada');
        return;
    }

    const valor = limpiar ? '' : (input?.value.trim() || '');
    const tbody = tabla.querySelector('tbody');

    if (!tbody) {
        console.error('❌ tbody de arrendatarios no encontrado');
        return;
    }

    let contadorResultados = 0;
    let filasOcultas = 0;

    Array.from(tbody.querySelectorAll('tr')).forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        
        // Obtén el documento de la columna índice 2
        const documento = (celdas[2]?.textContent.trim() || '').toLowerCase();
        const valorBusqueda = valor.toLowerCase();

        const coincide = valor === '' || (documento && documento.includes(valorBusqueda));
        
        if (coincide) {
            fila.style.display = '';
            contadorResultados++;
        } else {
            fila.style.display = 'none';
            filasOcultas++;
        }
    });

    // Mostrar mensaje si no hay resultados
    mostrarMensajeSinResultados(tabla, valor, contadorResultados, 'documento');
    
    console.log(`📊 Arrendatarios: ${contadorResultados} resultados, ${filasOcultas} ocultos`);
}

/**
 * Filtra la tabla de CONTRATOS por NOMBRE del arrendatario
 * Estructura: ID(0) | Local(1) | Arrendatario(2) | FechaInicio(3) | FechaFin(4) | Acciones(5)
 * Busca en columna índice 2 (Arrendatario - el nombre)
 */
function aplicarFiltroContratos(limpiar = false) {
    const input = document.getElementById('filtroNombreArrendatario');
    const tabla = document.getElementById('tablaContratos');
    
    if (!tabla) {
        console.error('❌ Tabla de contratos no encontrada');
        return;
    }

    const valor = limpiar ? '' : (input?.value.trim() || '');
    const tbody = tabla.querySelector('tbody');

    if (!tbody) {
        console.error('❌ tbody de contratos no encontrado');
        return;
    }

    let contadorResultados = 0;
    let filasOcultas = 0;

    console.log(`🔍 Buscando: "${valor}" en tabla de contratos`);

    Array.from(tbody.querySelectorAll('tr')).forEach((fila, index) => {
        const celdas = fila.querySelectorAll('td');
        
        // Obtén el nombre del arrendatario de la columna índice 2
        const nombreArrendatario = (celdas[2]?.textContent.trim() || '').toLowerCase();
        const valorBusqueda = valor.toLowerCase();

        console.log(`Fila ${index}: "${nombreArrendatario}" vs "${valorBusqueda}"`);

        // Comparar si el nombre incluye el valor de búsqueda
        const coincide = valor === '' || (nombreArrendatario && nombreArrendatario.includes(valorBusqueda));
        
        if (coincide) {
            fila.style.display = '';
            contadorResultados++;
            console.log(`✅ Fila ${index} MOSTRADA`);
        } else {
            fila.style.display = 'none';
            filasOcultas++;
            console.log(`❌ Fila ${index} OCULTA`);
        }
    });

    // Mostrar mensaje si no hay resultados
    mostrarMensajeSinResultados(tabla, valor, contadorResultados, 'arrendatario');
    
    console.log(`📊 Contratos: ${contadorResultados} resultados, ${filasOcultas} ocultos`);
}

/**
 * Muestra un mensaje cuando no hay resultados en las búsquedas
 */
function mostrarMensajeSinResultados(tabla, valor, contadorResultados, tipo = 'documento') {
    // Elimina mensaje anterior si existe
    const tablaParent = tabla.parentNode;
    let mensajeDiv = tablaParent.querySelector('.filtro-sin-resultados');
    
    if (mensajeDiv) {
        mensajeDiv.remove();
    }

    // Si hay valor buscado pero sin resultados, muestra aviso
    if (valor !== '' && contadorResultados === 0) {
        const div = document.createElement('div');
        div.className = 'filtro-sin-resultados';
        div.style.cssText = 'margin-top:20px; padding:20px; background:#fef3c7; border:2px solid #fcd34d; border-radius:10px; color:#92400e; text-align:center; font-weight:600; font-size:16px;';
        
        let mensajeTexto = '';
        if (tipo === 'documento') {
            mensajeTexto = `❌ No se encontraron arrendatarios con documento: <strong>"${valor}"</strong>`;
        } else if (tipo === 'arrendatario') {
            mensajeTexto = `❌ No se encontraron contratos para: <strong>"${valor}"</strong>`;
        }
        
        div.innerHTML = mensajeTexto;
        tablaParent.insertBefore(div, tabla.nextSibling);
    }
}

// ==========================================
// EVENT LISTENER PARA FORMULARIO DE ESTADO MANTENIMIENTO
// ==========================================

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFormularioEstado);
} else {
    inicializarFormularioEstado();
}

function inicializarFormularioEstado() {
    const formEstado = document.getElementById('formEstadoMantenimiento');
    
    if (formEstado) {
        formEstado.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const id = document.getElementById('idMantenimiento').value;
            const nuevoEstado = document.getElementById('nuevoEstadoMantenimiento').value;
            
            console.log('📝 Enviando actualización:', { id, nuevoEstado });
            
            if (!nuevoEstado) {
                alert(' Por favor selecciona un estado');
                return;
            }
            
            try {
                const response = await fetch('http://localhost:3000/api/mantenimiento/actualizar-estado', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        id: parseInt(id), 
                        estado: nuevoEstado
                    })
                });

                const data = await response.json();
                console.log('📨 Respuesta del servidor:', data);
                
                if (data.success) {
                    alert(' Estado actualizado correctamente');
                    closeModal('modalEstadoMantenimiento');
                    cargarMantenimiento();
                } else {
                    alert(' Error: ' + data.message);
                }
            } catch (error) {
                console.error(' Error completo:', error);
                alert(' Error al actualizar: ' + error.message);
            }
        });
        
        console.log(' Event listener agregado al formulario de estado');
    } else {
        console.log(' Formulario de estado no encontrado');
    }
}

// AGREGAR al final de admin.js
document.addEventListener('DOMContentLoaded', function() {
    console.log(' Dashboard Administrador cargado');
    
    // Asegurar que el tab de locales esté activo al inicio
    const tabLocales = document.getElementById('locales');
    if (tabLocales && tabLocales.classList.contains('active')) {
        console.log(' Tab de locales activo por defecto');
    }
    
    // Cargar datos iniciales
    cargarEstadisticas();
    cargarLocales();
    
    // Precargar datos para formularios modales
    setTimeout(() => {
        cargarDatosContrato();
        cargarDatosParaAgregarServicio();
    }, 1000);
});

(function initGlobalModalCloseHandlers() {
    // Cerrar al hacer click en botones de cierre o en el overlay (.modal)
    document.addEventListener('click', (e) => {
        const target = e.target;

        // 1) Click en la "X" u otro elemento con clase .close dentro de un modal
        if (target.closest && target.closest('.modal') && (target.classList.contains('close') || target.closest('.close'))) {
            const modal = target.closest('.modal');
            if (modal) {
                if (typeof closeModal === 'function' && modal.id) {
                    // usa la función existente si está disponible
                    try { closeModal(modal.id); } catch (err) { modal.remove(); }
                } else {
                    modal.remove();
                }
            }
            return;
        }

        // 2) Click en botones con id que empiecen por cerrarDetallesContrato (compatibilidad)
        if (target.id && target.id.startsWith('cerrarDetallesContrato')) {
            const modal = document.getElementById('modalDetallesContrato') || target.closest('.modal');
            if (modal) {
                if (typeof closeModal === 'function' && modal.id) {
                    try { closeModal(modal.id); } catch (err) { modal.remove(); }
                } else {
                    modal.remove();
                }
            }
            return;
        }

        // 3) Click en el overlay (fuera del contenido)
        if (target.classList && target.classList.contains('modal')) {
            const modal = target;
            if (typeof closeModal === 'function' && modal.id) {
                try { closeModal(modal.id); } catch (err) { modal.remove(); }
            } else {
                modal.remove();
            }
            return;
        }
    });

    // Cerrar al presionar ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = Array.from(document.querySelectorAll('.modal'));
            modals.forEach(modal => {
                if (typeof closeModal === 'function' && modal.id) {
                    try { closeModal(modal.id); } catch (err) { modal.remove(); }
                } else {
                    modal.remove();
                }
            });
        }
    });
})();
