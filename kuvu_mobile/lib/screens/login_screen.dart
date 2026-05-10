import 'package:flutter/material.dart';
import '../models/empresa.dart';
import '../services/api_service.dart';
import 'dashboard_screen.dart';

Color hexColor(String hex) {
  hex = hex.replaceAll('#', '');
  if (hex.length == 6) hex = 'FF$hex';
  return Color(int.parse(hex, radix: 16));
}

class LoginScreen extends StatefulWidget {
  final Empresa empresa;
  const LoginScreen({super.key, required this.empresa});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _correoCtrl = TextEditingController();
  final _docCtrl = TextEditingController();
  bool cargando = false;
  String error = '';

  Future<void> _login() async {
    if (_correoCtrl.text.isEmpty || _docCtrl.text.isEmpty) {
      setState(() => error = 'Ingresa tu correo y número de documento.');
      return;
    }
    setState(() { cargando = true; error = ''; });
    try {
      final resp = await ApiService.login(
        _correoCtrl.text.trim(),
        _docCtrl.text.trim(),
        widget.empresa.id,
      );
      if (resp['ok'] == true) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => DashboardScreen(
              usuario: resp['usuario'],
              empresa: resp['empresa'],
            ),
          ),
        );
      } else {
        setState(() => error = 'Correo o documento incorrecto.');
      }
    } catch (_) {
      setState(() => error = 'Error de conexión. Verifica el backend.');
    }
    setState(() => cargando = false);
  }

  @override
  Widget build(BuildContext context) {
    final empColor = hexColor(widget.empresa.colorPrimario);

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
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(children: [
                // Logo
                Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      gradient: const LinearGradient(colors: [Color(0xFF3a6fd8), Color(0xFF7c3aed)]),
                      boxShadow: [BoxShadow(color: const Color(0xFF3a6fd8).withOpacity(0.4), blurRadius: 16, offset: const Offset(0, 6))],
                    ),
                    child: const Center(child: Text('K', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900))),
                  ),
                  const SizedBox(width: 12),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('KUVU', style: TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900, letterSpacing: 6)),
                    Text('GESTIÓN INTELIGENTE DE PROPIEDADES', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 7, letterSpacing: 2)),
                  ]),
                ]),
                const SizedBox(height: 28),

                // Card
                Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(maxWidth: 480),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.07),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.15)),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 32, offset: const Offset(0, 8))],
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [

                    // Botón volver
                    GestureDetector(
                      onTap: () => Navigator.pop(context),
                      child: Row(children: [
                        Icon(Icons.chevron_left, color: Colors.white.withOpacity(0.4), size: 18),
                        Text('Cambiar empresa', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13)),
                      ]),
                    ),
                    const SizedBox(height: 16),

                    // Badge empresa
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: empColor.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(100),
                        border: Border.all(color: empColor.withOpacity(0.4)),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(width: 8, height: 8, decoration: BoxDecoration(color: empColor, shape: BoxShape.circle)),
                        const SizedBox(width: 8),
                        Text(widget.empresa.nombre, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                      ]),
                    ),
                    const SizedBox(height: 16),

                    const Text('Ingresa tus datos', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text('Usa tu correo y número de cédula', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                    const SizedBox(height: 20),

                    // Campo correo
                    _campo(controller: _correoCtrl, hint: 'correo@ejemplo.com', label: 'CORREO ELECTRÓNICO', icon: Icons.email_outlined),
                    const SizedBox(height: 12),

                    // Campo documento
                    _campo(controller: _docCtrl, hint: 'Ej: 1128074279', label: 'NÚMERO DE DOCUMENTO', icon: Icons.badge_outlined),
                    const SizedBox(height: 16),

                    // Error
                    if (error.isNotEmpty)
                      Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.red.withOpacity(0.3)),
                        ),
                        child: Row(children: [
                          const Icon(Icons.warning_amber_rounded, color: Color(0xFFfca5a5), size: 16),
                          const SizedBox(width: 8),
                          Expanded(child: Text(error, style: const TextStyle(color: Color(0xFFfca5a5), fontSize: 13))),
                        ]),
                      ),

                    // Botón login
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFF3a6fd8), Color(0xFF7c3aed)]),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [BoxShadow(color: const Color(0xFF3a6fd8).withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 6))],
                        ),
                        child: ElevatedButton(
                          onPressed: cargando ? null : _login,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.transparent,
                            shadowColor: Colors.transparent,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: cargando
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('Ingresar al sistema', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ),
                  ]),
                ),
                const SizedBox(height: 20),
                Text('© 2026 KUVU · YCW', style: TextStyle(color: Colors.white.withOpacity(0.2), fontSize: 11, letterSpacing: 1)),
              ]),
            ),
          ),
        ),
      ]),
    );
  }

  Widget _campo({required TextEditingController controller, required String hint, required String label, required IconData icon}) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(label, style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
      const SizedBox(height: 6),
      Container(
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white.withOpacity(0.15)),
        ),
        child: TextField(
          controller: controller,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(color: Colors.white.withOpacity(0.25)),
            prefixIcon: Icon(icon, color: Colors.white.withOpacity(0.3), size: 18),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
      ),
    ]);
  }
}