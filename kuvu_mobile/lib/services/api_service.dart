import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/empresa.dart';

class ApiService {
  static const String baseUrl = 'http://192.168.1.11:3000';

  static Future<List<Empresa>> getEmpresas() async {
    final res = await http.get(Uri.parse('$baseUrl/api/empresas'));
    final List data = jsonDecode(res.body);
    return data.map((e) => Empresa.fromJson(e)).toList();
  }

  static Future<Map<String, dynamic>> login(String correo, String documento, int empresaId) async {
    final res = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'correo': correo, 'documento': documento, 'empresa_id': empresaId}),
    );
    return jsonDecode(res.body);
  }
  static Future<List> getLocales(int empresaId) async {
    final res = await http.get(Uri.parse('$baseUrl/api/locales?empresa_id=$empresaId'));
    return jsonDecode(res.body);
  }
static Future<List> getContratos(int empresaId) async {
  final res = await http.get(Uri.parse('$baseUrl/api/contratos?empresa_id=$empresaId'));
  return jsonDecode(res.body);
  }
static Future<List> getPagos(int empresaId) async {
  final res = await http.get(Uri.parse('$baseUrl/api/pagos?empresa_id=$empresaId'));
  return jsonDecode(res.body);
}
static Future<List> getMantenimiento(int empresaId) async {
  final res = await http.get(Uri.parse('$baseUrl/api/mantenimiento?empresa_id=$empresaId'));
  return jsonDecode(res.body);
}
static Future<List> getUsuarios(int empresaId) async {
  final res = await http.get(Uri.parse('$baseUrl/api/usuarios?empresa_id=$empresaId'));
  return jsonDecode(res.body);
}
  }
