import 'package:flutter/material.dart';
import 'package:mobile/services/api_client.dart';
import 'package:mobile/screens/topic_detail_screen.dart';

class SubjectDetailScreen extends StatefulWidget {
  final int subjectId;
  final String subjectName;

  const SubjectDetailScreen({
    super.key,
    required this.subjectId,
    required this.subjectName,
  });

  @override
  State<SubjectDetailScreen> createState() => _SubjectDetailScreenState();
}

class _SubjectDetailScreenState extends State<SubjectDetailScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _topics = [];

  @override
  void initState() {
    super.initState();
    _fetchTopics();
  }

  Future<void> _fetchTopics() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final subject = await ApiClient.get('/api/v1/subjects/${widget.subjectId}');
      if (mounted) {
        setState(() {
          _topics = subject['topics'] ?? [];
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
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.subjectName),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Error: $_error', style: const TextStyle(color: Colors.red)),
                      ElevatedButton(onPressed: _fetchTopics, child: const Text('Retry'))
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchTopics,
                  child: _topics.isEmpty
                      ? const Center(child: Text('No topics in this subject yet.'))
                      : ListView.builder(
                          padding: const EdgeInsets.all(8.0),
                          itemCount: _topics.length,
                          itemBuilder: (context, index) {
                            final topic = _topics[index];
                            return Card(
                              child: ListTile(
                                title: Text(topic['title'] ?? 'Unknown Topic', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Memory Health: ${topic['memory_health_score']?.round() ?? 0}%'),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => TopicDetailScreen(
                                        topicId: topic['id'],
                                        topicTitle: topic['title'],
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
