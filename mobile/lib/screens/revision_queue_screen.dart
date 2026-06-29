import 'package:flutter/material.dart';
import 'package:mobile/services/api_client.dart';
import 'package:mobile/screens/practice_screen.dart';

class RevisionQueueScreen extends StatefulWidget {
  const RevisionQueueScreen({super.key});

  @override
  State<RevisionQueueScreen> createState() => _RevisionQueueScreenState();
}

class _RevisionQueueScreenState extends State<RevisionQueueScreen> {
  bool _isLoading = true;
  String? _error;
  List<dynamic> _queue = [];

  @override
  void initState() {
    super.initState();
    _fetchQueue();
  }

  Future<void> _fetchQueue() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final queue = await ApiClient.get('/api/v1/dashboard/due');
      if (mounted) {
        setState(() {
          _queue = queue;
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
        title: const Text('Revision Queue'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Error: $_error', style: const TextStyle(color: Colors.red)),
                      ElevatedButton(onPressed: _fetchQueue, child: const Text('Retry'))
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _fetchQueue,
                  child: _queue.isEmpty
                      ? const Center(child: Text('You are all caught up!'))
                      : ListView.builder(
                          padding: const EdgeInsets.all(8.0),
                          itemCount: _queue.length,
                          itemBuilder: (context, index) {
                            final item = _queue[index];
                            return Card(
                              child: ListTile(
                                title: Text(item['title'] ?? 'Unknown Topic', style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('Subject: ${item['subject_name']} • Memory: ${item['memory_health_score']?.round() ?? 0}%'),
                                trailing: ElevatedButton(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => PracticeScreen(
                                          topicId: item['id'],
                                          topicTitle: item['title'],
                                        ),
                                      ),
                                    ).then((_) => _fetchQueue());
                                  },
                                  child: const Text('Practice'),
                                ),
                              ),
                            );
                          },
                        ),
                ),
    );
  }
}
