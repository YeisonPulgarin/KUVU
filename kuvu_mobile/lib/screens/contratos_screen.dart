import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ContratosScreen extends StatefulWidget {
  final Map<String, dynamic> empresa;
  const ContratosScreen({super.key, required this.empresa});

  @override
  State<ContratosScreen> createState() => _ContratosScreenState();
}

class _ContratosScreenState extends State<ContratosScreen> {
  List contratos = [];
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
      final data = await ApiService.getContratos(widget.empresa['id']);
      setState(() { contratos = data; cargando = false; });
    } catch (_) {
      setState(() => cargando = false);
    }
  }

  String _formatFecha(String? fecha) {
    if (fecha == null) return '-';
    return fecha.substring(0, 10);
  }

  @override
  Widget build(BuildContext context) {
    final empColor = hexColor(widget.empresa['color_primario'] ?? '#7c3aed');

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
              Icon(Icons.description_outlined, color: empColor, size: 22),
              const SizedBox(width: 10),
              const Text('Contratos', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: empColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: empColor.withOpacity(0.3)),
                ),
                child: Text('${contratos.length} contratos', style: TextStyle(color: empColor, fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ]),
          ),

          // Lista
          Expanded(
            child: cargando
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF7c3aed)))
              : contratos.isEmpty
                ? Center(child: Text('No hay contratos registrados.', style: TextStyle(color: Colors.white.withOpacity(0.4))))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: contratos.length,
                    itemBuilder: (_, i) {
                      final c = contratos[i];
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
                              child: Icon(Icons.description_outlined, color: empColor, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(c['nombreArrendatario'] ?? 'Contrato #${c['idContrato']}',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                              Text(c['direccionLocal'] ?? '', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                            ])),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: const Color(0xFF059669).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFF059669).withOpacity(0.4)),
                              ),
                              child: Text(c['nombreAdministrador'] ?? '', style: const TextStyle(color: Color(0xFF059669), fontSize: 11, fontWeight: FontWeight.w600)),
                            ),
                          ]),
                          const SizedBox(height: 12),
                          const Divider(color: Colors.white12),
                          const SizedBox(height: 8),
                          Wrap(spacing: 8, runSpacing: 8, children: [
                            _chip(Icons.calendar_today_outlined, 'Inicio: ${_formatFecha(c['fechaInicio']?.toString())}'),
                            _chip(Icons.event_outlined, 'Fin: ${_formatFecha(c['fechaFin']?.toString())}'),
                            _chip(Icons.attach_money, '\$${c['valorArriendo'] ?? '-'}'),
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