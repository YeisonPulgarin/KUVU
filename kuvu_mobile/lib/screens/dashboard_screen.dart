import 'package:flutter/material.dart';
import 'locales_screen.dart';
import 'contratos_screen.dart';
import 'pagos_screen.dart';
import 'mantenimiento_screen.dart';
import 'usuarios_screen.dart';

class DashboardScreen extends StatelessWidget {
  final Map<String, dynamic> usuario;
  final Map<String, dynamic> empresa;

  const DashboardScreen({super.key, required this.usuario, required this.empresa});

  Color hexColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) hex = 'FF$hex';
    return Color(int.parse(hex, radix: 16));
  }

  @override
  Widget build(BuildContext context) {
    final empColor = hexColor(empresa['color_primario'] ?? '#3a6fd8');
    final nombreUsuario = usuario['nombre'] ?? '';
    final nombreEmpresa = empresa['nombre'] ?? '';
    final rol = usuario['nombreRol'] ?? '';

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
        SafeArea(
          child: Column(children: [
            // Navbar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.1))),
              ),
              child: Row(children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    gradient: const LinearGradient(colors: [Color(0xFF3a6fd8), Color(0xFF7c3aed)]),
                  ),
                  child: const Center(child: Text('K', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16))),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('KUVU', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14, letterSpacing: 4)),
                    Text(nombreEmpresa, style: TextStyle(color: empColor, fontSize: 11, fontWeight: FontWeight.w600)),
                  ]),
                ),
                GestureDetector(
                  onTap: () => Navigator.popUntil(context, (route) => route.isFirst),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.08),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.white.withOpacity(0.15)),
                    ),
                    child: Text('Salir', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 12)),
                  ),
                ),
              ]),
            ),

            // Contenido
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  // Bienvenida
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.07),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white.withOpacity(0.12)),
                      gradient: LinearGradient(
                        colors: [empColor.withOpacity(0.15), Colors.transparent],
                        begin: Alignment.topLeft,
                      ),
                    ),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text('¡Bienvenido,', style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 14)),
                      Text(nombreUsuario, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: empColor.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: empColor.withOpacity(0.4)),
                        ),
                        child: Text(rol, style: TextStyle(color: empColor, fontSize: 11, fontWeight: FontWeight.w700)),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 20),

                  Text('Módulos', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 12, letterSpacing: 1, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 12),

                  // Grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.3,
                    children: [
                      _modulo(context, icon: Icons.home_work_outlined, label: 'Locales', color: const Color(0xFF3a6fd8), onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => LocalesScreen(empresa: empresa)));
                      }),
                      _modulo(context, icon: Icons.description_outlined, label: 'Contratos', color: const Color(0xFF7c3aed), onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => ContratosScreen(empresa: empresa)));
                      }),
                      _modulo(context, icon: Icons.payments_outlined, label: 'Pagos', color: const Color(0xFF059669), onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => PagosScreen(empresa: empresa)));
                      }),
                      _modulo(context, icon: Icons.build_outlined, label: 'Mantenimiento', color: const Color(0xFFd97706), onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => MantenimientoScreen(empresa: empresa)));
                      }),
                      _modulo(context, icon: Icons.people_outline, label: 'Usuarios', color: const Color(0xFFdc2626), onTap: () {
                        Navigator.push(context, MaterialPageRoute(builder: (_) => UsuariosScreen(empresa: empresa)));
                      }),
                      _modulo(context, icon: Icons.bar_chart_outlined, label: 'Reportes', color: const Color(0xFF0891b2)),
                    ],
                  ),
                ]),
              ),
            ),
          ]),
        ),
      ]),
    );
  }

  Widget _modulo(BuildContext context, {required IconData icon, required String label, required Color color, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            width: 44, height: 44,
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: color.withOpacity(0.3)),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          const SizedBox(height: 10),
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
        ]),
      ),
    );
  }
}