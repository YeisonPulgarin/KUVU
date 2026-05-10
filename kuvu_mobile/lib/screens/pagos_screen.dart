import 'package:flutter/material.dart';
import '../services/api_service.dart';

class PagosScreen extends StatefulWidget {
  final Map<String, dynamic> empresa;
  const PagosScreen({super.key, required this.empresa});

  @override
  State<PagosScreen> createState() => _PagosScreenState();
}

class _PagosScreenState extends State<PagosScreen> {
  List pagos = [];
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
      final data = await ApiService.getPagos(widget.empresa['id']);
      setState(() { pagos = data; cargando = false; });
    } catch (_) {
      setState(() => cargando = false);
    }
  }

  String _formatFecha(String? fecha) {
    if (fecha == null) return '-';
    return fecha.substring(0, 10);
  }

  IconData _metodoPagoIcon(String? metodo) {
    switch (metodo) {
      case 'tarjeta': return Icons.credit_card;
      case 'transferencia': return Icons.account_balance;
      case 'efectivo': return Icons.payments;
      default: return Icons.attach_money;
    }
  }

  @override
  Widget build(BuildContext context) {
    final empColor = hexColor(widget.empresa['color_primario'] ?? '#059669');

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
              const Icon(Icons.payments_outlined, color: Color(0xFF059669), size: 22),
              const SizedBox(width: 10),
              const Text('Pagos', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF059669).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF059669).withOpacity(0.3)),
                ),
                child: Text('${pagos.length} pagos', style: const TextStyle(color: Color(0xFF059669), fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ]),
          ),

          // Lista
          Expanded(
            child: cargando
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
              : pagos.isEmpty
                ? Center(child: Text('No hay pagos registrados.', style: TextStyle(color: Colors.white.withOpacity(0.4))))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: pagos.length,
                    itemBuilder: (_, i) {
                      final p = pagos[i];
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
                                color: const Color(0xFF059669).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFF059669).withOpacity(0.3)),
                              ),
                              child: Icon(_metodoPagoIcon(p['metodoPago']), color: const Color(0xFF059669), size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(p['nombreArrendatario'] ?? '-',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                              Text(p['descripcion'] ?? '-', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                            ])),
                            Text('\$${p['monto'] ?? '-'}',
                              style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.w800, fontSize: 15)),
                          ]),
                          const SizedBox(height: 12),
                          const Divider(color: Colors.white12),
                          const SizedBox(height: 8),
                          Wrap(spacing: 8, runSpacing: 8, children: [
                            _chip(Icons.calendar_today_outlined, _formatFecha(p['fechaPago']?.toString())),
                            _chip(Icons.category_outlined, p['tipo'] ?? '-'),
                            _chip(_metodoPagoIcon(p['metodoPago']), p['metodoPago'] ?? '-'),
                            _chip(Icons.location_on_outlined, p['direccionLocal'] ?? '-'),
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