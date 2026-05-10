import 'package:flutter/material.dart';
import '../services/api_service.dart';

class UsuariosScreen extends StatefulWidget {
  final Map<String, dynamic> empresa;
  const UsuariosScreen({super.key, required this.empresa});

  @override
  State<UsuariosScreen> createState() => _UsuariosScreenState();
}

class _UsuariosScreenState extends State<UsuariosScreen> {
  List usuarios = [];
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
      final data = await ApiService.getUsuarios(widget.empresa['id']);
      setState(() { usuarios = data; cargando = false; });
    } catch (_) {
      setState(() => cargando = false);
    }
  }

  Color _rolColor(int? idRol) {
    switch (idRol) {
      case 1: return const Color(0xFF3a6fd8);
      case 2: return const Color(0xFF059669);
      default: return Colors.grey;
    }
  }

  IconData _rolIcon(int? idRol) {
    switch (idRol) {
      case 1: return Icons.admin_panel_settings_outlined;
      case 2: return Icons.person_outline;
      default: return Icons.person_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final empColor = hexColor(widget.empresa['color_primario'] ?? '#dc2626');

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
              const Icon(Icons.people_outline, color: Color(0xFFdc2626), size: 22),
              const SizedBox(width: 10),
              const Text('Usuarios', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFdc2626).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFdc2626).withOpacity(0.3)),
                ),
                child: Text('${usuarios.length} usuarios', style: const TextStyle(color: Color(0xFFdc2626), fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ]),
          ),

          // Lista
          Expanded(
            child: cargando
              ? const Center(child: CircularProgressIndicator(color: Color(0xFFdc2626)))
              : usuarios.isEmpty
                ? Center(child: Text('No hay usuarios registrados.', style: TextStyle(color: Colors.white.withOpacity(0.4))))
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: usuarios.length,
                    itemBuilder: (_, i) {
                      final u = usuarios[i];
                      final rolColor = _rolColor(u['idRol']);
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.1)),
                        ),
                        padding: const EdgeInsets.all(16),
                        child: Row(children: [
                          Container(
                            width: 48, height: 48,
                            decoration: BoxDecoration(
                              color: rolColor.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: rolColor.withOpacity(0.3)),
                            ),
                            child: Center(
                              child: Text(u['nombre'][0].toUpperCase(),
                                style: TextStyle(color: rolColor, fontSize: 20, fontWeight: FontWeight.w900)),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(u['nombre'] ?? '-', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                            const SizedBox(height: 2),
                            Text(u['correo'] ?? '-', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                            const SizedBox(height: 6),
                            Row(children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: rolColor.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(color: rolColor.withOpacity(0.4)),
                                ),
                                child: Row(mainAxisSize: MainAxisSize.min, children: [
                                  Icon(_rolIcon(u['idRol']), color: rolColor, size: 11),
                                  const SizedBox(width: 4),
                                  Text(u['nombreRol'] ?? '-', style: TextStyle(color: rolColor, fontSize: 11, fontWeight: FontWeight.w600)),
                                ]),
                              ),
                              const SizedBox(width: 8),
                              Icon(Icons.phone_outlined, color: Colors.white.withOpacity(0.3), size: 13),
                              const SizedBox(width: 4),
                              Text(u['telefono'] ?? '-', style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12)),
                            ]),
                          ])),
                        ]),
                      );
                    },
                  ),
          ),
        ])),
      ]),
    );
  }
}