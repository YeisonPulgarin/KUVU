import 'package:flutter/material.dart';
import '../services/api_service.dart';

class MantenimientoScreen extends StatefulWidget {
  final Map<String, dynamic> empresa;
  const MantenimientoScreen({super.key, required this.empresa});

  @override
  State<MantenimientoScreen> createState() => _MantenimientoScreenState();
}

class _MantenimientoScreenState extends State<MantenimientoScreen> {
  List items = [];
  bool cargando = true;

  Color hexColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  @override
  void initState() {
    super.initState();
    _cargar();
  }

  Future<void> _cargar() async {
    try {
      final data = await ApiService.getMantenimiento(widget.empresa['id']);
      setState(() { items = data; cargando = false; });
    } catch (_) {
      setState(() => cargando = false);
    }
  }

  String _formatFecha(String? fecha) {
    if (fecha == null) return '-';
    return fecha.substring(0, 10);
  }

  Color _prioridadColor(String? prioridad) {
    switch (prioridad) {
      case 'urgente': return const Color(0xFFdc2626);
      case 'alta': return const Color(0xFFd97706);
      case 'media': return const Color(0xFF3a6fd8);
      case 'baja': return const Color(0xFF059669);
      default: return Colors.grey;
    }
  }

  Color _estadoColor(String? estado) {
    switch (estado) {
      case 'pendiente': return const Color(0xFFd97706);
      case 'en_proceso': return const Color(0xFF3a6fd8);
      case 'completado': return const Color(0xFF059669);
      default: return Colors.grey;
    }
  }

  IconData _tipoIcon(String? tipo) {
    switch (tipo?.toLowerCase()) {
      case 'plomería': return Icons.plumbing;
      case 'electricidad': return Icons.electrical_services;
      case 'pintura': return Icons.format_paint;
      default: return Icons.build_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final empColor = hexColor(widget.empresa['color_primario'] ?? '#d97706');

    return Scaffold(
      backgroundColor: const Color(0xFF07051A),
      body: Stack(children: [
        Container(
          decoration: const BoxDecoration(
            gradient: RadialGradient(
              center: Alignment(0.6, 0.8),
              radius: 1.2,
              colors: [Color(0xFF1a0a2e), Color(0xFF07051A)],
            ),
          ),
        ),
        SafeArea(child: Column(children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.1))),
            ),
            child: Row(children: [
              GestureDetector(
                onTap: () => Navigator.pop(context),
                child: Icon(Icons.arrow_back_ios, color: Colors.white.withOpacity(0.6), size: 20),
              ),
              const SizedBox(width: 12),
              const Icon(Icons.build_outlined, color: Color(0xFFd97706), size: 22),
              const SizedBox(width: 10),
              const Text('Mantenimiento', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFd97706).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFd97706).withOpacity(0.3)),
                ),
                child: Text('${items.length} solicitudes', style: const TextStyle(color: Color(0xFFd97706), fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ]),
          ),

          // Lista
          Expanded(
            child: cargando
              ? const Center(child: CircularProgressIndicator(color: Color(0xFFd97706)))
              : items.isEmpty
                ? Center(child: Text('No hay solicitudes registradas.', style: TextStyle(color: Colors.white.withOpacity(0.4))))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: items.length,
                    itemBuilder: (_, i) {
                      final m = items[i];
                      final prioridadColor = _prioridadColor(m['prioridad']);
                      final estadoColor = _estadoColor(m['estado']);
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.1)),
                        ),
                        padding: const EdgeInsets.all(16),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Row(children: [
                            Container(
                              width: 42, height: 42,
                              decoration: BoxDecoration(
                                color: prioridadColor.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: prioridadColor.withOpacity(0.3)),
                              ),
                              child: Icon(_tipoIcon(m['tipoMantenimiento']), color: prioridadColor, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(m['tipoMantenimiento'] ?? '-',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                              Text(m['nombreArrendatario'] ?? '-', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                            ])),
                            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: prioridadColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: prioridadColor.withOpacity(0.4)),
                                ),
                                child: Text(m['prioridad'] ?? '', style: TextStyle(color: prioridadColor, fontSize: 10, fontWeight: FontWeight.w700)),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: estadoColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: estadoColor.withOpacity(0.4)),
                                ),
                                child: Text(m['estado'] ?? '', style: TextStyle(color: estadoColor, fontSize: 10, fontWeight: FontWeight.w600)),
                              ),
                            ]),
                          ]),
                          const SizedBox(height: 10),
                          Text(m['descripcion'] ?? '', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13)),
                          const SizedBox(height: 10),
                          const Divider(color: Colors.white12),
                          const SizedBox(height: 8),
                          Wrap(spacing: 8, runSpacing: 8, children: [
                            _chip(Icons.calendar_today_outlined, _formatFecha(m['fecha_creacion']?.toString())),
                            _chip(Icons.location_on_outlined, m['direccionLocal'] ?? '-'),
                            _chip(Icons.admin_panel_settings_outlined, m['nombreAdministrador'] ?? '-'),
                          ]),
                        ]),
                      );
                    },
                  ),
          ),
        ])),
      ]),
    );
  }

  Widget _chip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, color: Colors.white.withOpacity(0.4), size: 13),
        const SizedBox(width: 4),
        Text(text, style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 11)),
      ]),
    );
  }
}