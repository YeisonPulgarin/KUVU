import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ReportesScreen extends StatefulWidget {
  final Map<String, dynamic> empresa;
  const ReportesScreen({super.key, required this.empresa});

  @override
  State<ReportesScreen> createState() => _ReportesScreenState();
}

class _ReportesScreenState extends State<ReportesScreen> {
  bool cargando = true;
  int totalLocales = 0;
  int totalContratos = 0;
  int totalPagos = 0;
  int totalMantenimiento = 0;
  int totalUsuarios = 0;
  double totalIngresos = 0;

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
      final empresaId = widget.empresa['id'];
      final results = await Future.wait([
        ApiService.getLocales(empresaId),
        ApiService.getContratos(empresaId),
        ApiService.getPagos(empresaId),
        ApiService.getMantenimiento(empresaId),
        ApiService.getUsuarios(empresaId),
      ]);

      double ingresos = 0;
      for (final p in results[2]) {
        ingresos += double.tryParse(p['monto']?.toString() ?? '0') ?? 0;
      }

      setState(() {
        totalLocales = results[0].length;
        totalContratos = results[1].length;
        totalPagos = results[2].length;
        totalMantenimiento = results[3].length;
        totalUsuarios = results[4].length;
        totalIngresos = ingresos;
        cargando = false;
      });
    } catch (_) {
      setState(() => cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final empColor = hexColor(widget.empresa['color_primario'] ?? '#0891b2');

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
              const Icon(Icons.bar_chart_outlined, color: Color(0xFF0891b2), size: 22),
              const SizedBox(width: 10),
              const Text('Reportes', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
            ]),
          ),

          Expanded(
            child: cargando
              ? const Center(child: CircularProgressIndicator(color: Color(0xFF0891b2)))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

                    // Total ingresos
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        gradient: LinearGradient(
                          colors: [empColor.withOpacity(0.3), empColor.withOpacity(0.1)],
                          begin: Alignment.topLeft,
                        ),
                        border: Border.all(color: empColor.withOpacity(0.3)),
                      ),
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text('Total ingresos', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 13)),
                        const SizedBox(height: 6),
                        Text('\$${totalIngresos.toStringAsFixed(0)}',
                          style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 4),
                        Text('$totalPagos pagos registrados', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                      ]),
                    ),
                    const SizedBox(height: 16),

                    Text('Resumen general', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12, letterSpacing: 1, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 12),

                    // Grid resumen
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 1.4,
                      children: [
                        _statCard(icon: Icons.home_work_outlined, label: 'Locales', value: '$totalLocales', color: const Color(0xFF3a6fd8)),
                        _statCard(icon: Icons.description_outlined, label: 'Contratos', value: '$totalContratos', color: const Color(0xFF7c3aed)),
                        _statCard(icon: Icons.build_outlined, label: 'Mantenimiento', value: '$totalMantenimiento', color: const Color(0xFFd97706)),
                        _statCard(icon: Icons.people_outline, label: 'Usuarios', value: '$totalUsuarios', color: const Color(0xFFdc2626)),
                      ],
                    ),
                  ]),
                ),
          ),
        ])),
      ]),
    );
  }

  Widget _statCard({required IconData icon, required String label, required String value, required Color color}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 36, height: 36,
          decoration: BoxDecoration(
            color: color.withOpacity(0.15),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Icon(icon, color: color, size: 18),
        ),
        const Spacer(),
        Text(value, style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900)),
        Text(label, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
      ]),
    );
  }
}