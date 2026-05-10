class Empresa {
  final int id;
  final String nombre, subdominio, colorPrimario, colorSecundario, colorTexto, slogan;

  Empresa({required this.id, required this.nombre, required this.subdominio,
    required this.colorPrimario, required this.colorSecundario,
    required this.colorTexto, required this.slogan});

  factory Empresa.fromJson(Map<String, dynamic> j) => Empresa(
    id: j['id'],
    nombre: j['nombre'] ?? '',
    subdominio: j['subdominio'] ?? '',
    colorPrimario: j['color_primario'] ?? '#3a6fd8',
    colorSecundario: j['color_secundario'] ?? '#7c3aed',
    colorTexto: j['color_texto'] ?? '#FFFFFF',
    slogan: j['slogan'] ?? '',
  );
}