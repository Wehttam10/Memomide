import 'package:flutter/material.dart';
import 'package:mobile/services/api_client.dart';
import 'package:mobile/screens/subject_detail_screen.dart';

class SubjectsScreen extends StatefulWidget {
  const SubjectsScreen({super.key});

  @override
  State<SubjectsScreen> createState() => _SubjectsScreenState();
}

class _SubjectsScreenState extends State<SubjectsScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _subjects = [];

  @override
  void initState() {
    super.initState();
    _fetchSubjects();
  }

  Future<void> _fetchSubjects() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final subjects = await ApiClient.get('/api/v1/subjects');
      if (mounted) {
        setState(() {
          _subjects = subjects;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Error: $_error', style: const TextStyle(color: Colors.red)),
            ElevatedButton(onPressed: _fetchSubjects, child: const Text('Retry'))
          ],
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Subjects'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Implement create subject dialog
            },
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchSubjects,
        child: _subjects.isEmpty
            ? const Center(child: Text('No subjects yet.'))
            : ListView.builder(
                padding: const EdgeInsets.all(8.0),
                itemCount: _subjects.length,
                itemBuilder: (context, index) {
                  final subject = _subjects[index];
                  return Card(
                    child: ListTile(
                      title: Text(subject['name'] ?? 'Unknown Subject', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(subject['description'] ?? ''),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => SubjectDetailScreen(
                              subjectId: subject['id'],
                              subjectName: subject['name'],
                            ),
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
      ),
    );
  }
}
