import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

void main() {
  runApp(const KuvuApp());
}

class KuvuApp extends StatelessWidget {
  const KuvuApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'KUVU',
      debugShowCheckedModeBanner: false,
      home: const LandingPage(),
    );
  }
}

class Empresa {
  final int id;
  final String nombre, subdominio, colorPrimario, slogan;
  Empresa({required this.id, required this.nombre, required this.subdominio, required this.colorPrimario, required this.slogan});
  factory Empresa.fromJson(Map<String, dynamic> j) => Empresa(
    id: j['id'], nombre: j['nombre'], subdominio: j['subdominio'] ?? '',
    colorPrimario: j['color_primario'] ?? '#3a6fd8', slogan: j['slogan'] ?? '',
  );
}

Color hexColor(String hex) {
  hex = hex.replaceAll('#', '');
  if (hex.length == 6) hex = 'FF$hex';
  return Color(int.parse(hex, radix: 16));
}

class LandingPage extends StatefulWidget {
  const LandingPage({super.key});
  @override
  State<LandingPage> createState() => _LandingPageState();
}

class _LandingPageState extends State<LandingPage> {
  List<Empresa> empresas = [];
  List<Empresa> filtradas = [];
  bool cargando = true;
  final _ctrl = TextEditingController();

  // ⚠️ Cambia esta IP por la IP de tu PC en la red WiFi
  static const String baseUrl = 'http://192.168.1.11:3000';

  @override
  void initState() {
    super.initState();
    _cargarEmpresas();
    _ctrl.addListener(() {
      final q = _ctrl.text.toLowerCase();
      setState(() {
        filtradas = q.isEmpty ? empresas : empresas.where((e) => e.nombre.toLowerCase().contains(q)).toList();
      });
    });
  }

  Future<void> _cargarEmpresas() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/empresas'));
      final List data = jsonDecode(res.body);
      setState(() {
        empresas = data.map((e) => Empresa.fromJson(e)).toList();
        filtradas = empresas;
        cargando = false;
      });
    } catch (_) {
      setState(() => cargando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF07051A),
      body: Stack(children: [
        // Fondo degradado
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
                // ── Logo KUVU ──
                Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Container(
                    width: 48, height: 48,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(14),
                      gradient: const LinearGradient(
                        colors: [Color(0xFF3a6fd8), Color(0xFF7c3aed)],
                      ),
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

                // ── Card glassmorphism ──
                Container(
                  width: double.infinity,
                  constraints: const BoxConstraints(maxWidth: 480),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.07),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.15)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 32, offset: const Offset(0, 8)),
                    ],
                  ),
                  padding: const EdgeInsets.all(24),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Accede a tu empresa', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Text('Escribe el nombre de tu inmobiliaria para continuar', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 13)),
                    const SizedBox(height: 16),

                    // Buscador
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withOpacity(0.15)),
                      ),
                      child: TextField(
                        controller: _ctrl,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Ej: Amarilo, Nido Rent...',
                          hintStyle: TextStyle(color: Colors.white.withOpacity(0.25)),
                          prefixIcon: Icon(Icons.search, color: Colors.white.withOpacity(0.35), size: 20),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(vertical: 14),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Lista empresas
                    if (cargando)
                      ...List.generate(3, (_) => _skeleton())
                    else if (filtradas.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 20),
                        child: Center(child: Text('No se encontró ninguna empresa.', style: TextStyle(color: Colors.white.withOpacity(0.35), fontSize: 13))),
                      )
                    else
                      ...filtradas.map((e) => _empresaRow(e)),
                  ]),
                ),

                const SizedBox(height: 20),
                Text('© 2025 KUVU · YCW', style: TextStyle(color: Colors.white.withOpacity(0.2), fontSize: 11, letterSpacing: 1)),
              ]),
            ),
          ),
        ),
      ]),
    );
  }

  Widget _empresaRow(Empresa e) {
    final color = hexColor(e.colorPrimario);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: ListTile(
        onTap: () {},
        leading: Container(
          width: 36, height: 36,
          decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(10)),
          child: Center(child: Text(e.nombre[0].toUpperCase(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15))),
        ),
        title: Text(e.nombre, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
        subtitle: Text(e.slogan, style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 11)),
        trailing: Icon(Icons.chevron_right, color: Colors.white.withOpacity(0.25)),
      ),
    );
  }

  Widget _skeleton() {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      height: 62,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
      ),
    );
  }
}