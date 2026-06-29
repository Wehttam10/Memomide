import 'package:flutter/material.dart';
import 'package:mobile/services/api_client.dart';

class AuthService extends ChangeNotifier {
  bool _isAuthenticated = false;
  Map<String, dynamic>? _user;
  bool _isLoading = true;

  bool get isAuthenticated => _isAuthenticated;
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;

  AuthService() {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await ApiClient.getToken();
    if (token != null) {
      try {
        await fetchUser();
      } catch (e) {
        _isAuthenticated = false;
        _user = null;
        await ApiClient.clearToken();
      }
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> fetchUser() async {
    final data = await ApiClient.get('/api/v1/auth/me');
    _user = data;
    _isAuthenticated = true;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await ApiClient.postForm('/api/v1/auth/login', body: {
        'username': email,
        'password': password,
      });
      await ApiClient.setToken(data['access_token']);
      await fetchUser();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(String name, String email, String password) async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiClient.post('/api/v1/auth/register', body: {
        'name': name,
        'email': email,
        'password': password,
      });
      await login(email, password);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await ApiClient.clearToken();
    _isAuthenticated = false;
    _user = null;
    notifyListeners();
  }
}
