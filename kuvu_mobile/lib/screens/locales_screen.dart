import 'package:flutter/material.dart';
import '../services/api_service.dart';

class LocalesScreen extends StatefulWidget {
  final Map<String, dynamic> empresa;
  const LocalesScreen({super.key, required this.empresa});

  @override
  State<LocalesScreen> createState() => _LocalesScreenState();
}

class _LocalesScreenState extends State<LocalesScreen> {
  List locales = [];
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
      final data = await ApiService.getLocales(widget.empresa['id']);
      setState(() { locales = data; cargando = false; });
    } catch (_) {
      setState(() => cargando = false);
    }
  }

  String _estadoLabel(String? estado) {
    switch (estado) {
      case 'disponible': return 'Disponible';
      case 'ocupado': return 'Ocupado';
      case 'mantenimiento': return 'Mantenimiento';
      default: return estado ?? '';
    }
  }

  Color _estadoColor(String? estado) {
    switch (estado) {
      case 'disponible': return const Color(0xFF059669);
      case 'ocupado': return const Color(0xFFdc2626);
      case 'mantenimiento': return const Color(0xFFd97706);
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final empColor = hexColor(widget.empresa['color_primario'] ?? '#3a6fd8');

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
              Icon(Icons.home_work_outlined, color: empColor, size: 22),
              const SizedBox(width: 10),
              const Text('Locales', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: empColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: empColor.withOpacity(0.3)),
                ),
                child: Text('${locales.length} locales', style: TextStyle(color: empColor, fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ]),
          ),

          // Lista
          Expanded(
            child: cargando
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF3a6fd8)))
              : locales.isEmpty
                ? Center(child: Text('No hay locales registrados.', style: TextStyle(color: Colors.white.withOpacity(0.4))))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: locales.length,
                    itemBuilder: (_, i) {
                      final l = locales[i];
                      final estadoColor = _estadoColor(l['estado']);
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
                                color: empColor.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: empColor.withOpacity(0.3)),
                              ),
                              child: Icon(Icons.home_work_outlined, color: empColor, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(l['nombre'] ?? '', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                              Text(l['direccion'] ?? '', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                            ])),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: estadoColor.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: estadoColor.withOpacity(0.4)),
                              ),
                              child: Text(_estadoLabel(l['estado']), style: TextStyle(color: estadoColor, fontSize: 11, fontWeight: FontWeight.w600)),
                            ),
                          ]),
                          const SizedBox(height: 12),
                          const Divider(color: Colors.white12),
                          const SizedBox(height: 8),
                          Row(children: [
                            _infoChip(Icons.straighten, '${l['area'] ?? '-'} m²'),
                            const SizedBox(width: 8),
                            _infoChip(Icons.attach_money, '\$${l['canon_mensual'] ?? '-'}'),
                            const SizedBox(width: 8),
                            _infoChip(Icons.category_outlined, l['tipo'] ?? '-'),
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

  Widget _infoChip(IconData icon, String text) {
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