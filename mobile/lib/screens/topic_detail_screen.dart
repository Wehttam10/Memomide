import 'package:flutter/material.dart';
import 'package:mobile/services/api_client.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:mobile/screens/practice_screen.dart';

class TopicDetailScreen extends StatefulWidget {
  final int topicId;
  final String topicTitle;

  const TopicDetailScreen({
    super.key,
    required this.topicId,
    required this.topicTitle,
  });

  @override
  State<TopicDetailScreen> createState() => _TopicDetailScreenState();
}

class _TopicDetailScreenState extends State<TopicDetailScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _topic;

  @override
  void initState() {
    super.initState();
    _fetchTopic();
  }

  Future<void> _fetchTopic() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final topic = await ApiClient.get('/api/v1/topics/${widget.topicId}');
      if (mounted) {
        setState(() {
          _topic = topic;
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
        title: Text(widget.topicTitle),
        actions: [
          IconButton(
            icon: const Icon(Icons.psychology),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => PracticeScreen(topicId: widget.topicId, topicTitle: widget.topicTitle),
                ),
              );
            },
          )
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Error: $_error', style: const TextStyle(color: Colors.red)),
                      ElevatedButton(onPressed: _fetchTopic, child: const Text('Retry'))
                    ],
                  ),
                )
              : Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Card(
                        color: Colors.indigo.shade50,
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Memory Health', style: TextStyle(fontWeight: FontWeight.bold)),
                                  Text('${_topic?['memory_health_score']?.round() ?? 0}%', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                                ],
                              ),
                              ElevatedButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(
                                      builder: (context) => PracticeScreen(topicId: widget.topicId, topicTitle: widget.topicTitle),
                                    ),
                                  );
                                },
                                icon: const Icon(Icons.psychology),
                                label: const Text('Practice'),
                              )
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text('Notes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 8),
                      Expanded(
                        child: _topic?['notes'] != null && _topic!['notes'].toString().isNotEmpty
                            ? Markdown(data: _topic!['notes'])
                            : const Center(child: Text('No notes available. Please add them from the web dashboard.')),
                      ),
                    ],
                  ),
                ),
    );
  }
}
