import 'package:flutter/material.dart';
import 'screens/landing_screen.dart';

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
      home: const LandingScreen(),
    );
  }
}