import 'package:flutter/material.dart';
import 'package:mobile/services/api_client.dart';
import 'package:flutter_markdown/flutter_markdown.dart';

class PracticeScreen extends StatefulWidget {
  final int topicId;
  final String topicTitle;

  const PracticeScreen({
    super.key,
    required this.topicId,
    required this.topicTitle,
  });

  @override
  State<PracticeScreen> createState() => _PracticeScreenState();
}

class _PracticeScreenState extends State<PracticeScreen> {
  bool _isLoading = false;
  String? _error;
  String? _question;
  Map<String, dynamic>? _result;
  final _answerController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _generateQuestion();
  }

  Future<void> _generateQuestion() async {
    setState(() {
      _isLoading = true;
      _error = null;
      _question = null;
      _result = null;
      _answerController.clear();
    });
    
    try {
      final res = await ApiClient.post('/api/v1/questions/generate/${widget.topicId}');
      if (mounted) {
        setState(() {
          _question = res['question'];
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

  Future<void> _submitAnswer() async {
    if (_answerController.text.trim().isEmpty) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await ApiClient.post('/api/v1/questions/submit/${widget.topicId}', body: {
        'question': _question,
        'student_answer': _answerController.text,
      });
      if (mounted) {
        setState(() {
          _result = res;
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
        title: Text('Practice: ${widget.topicTitle}'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Error: $_error', style: const TextStyle(color: Colors.red)),
                        const SizedBox(height: 16),
                        ElevatedButton(onPressed: _generateQuestion, child: const Text('Try Again'))
                      ],
                    ),
                  ),
                )
              : _result != null
                  ? _buildResultView()
                  : _buildQuestionView(),
    );
  }

  Widget _buildQuestionView() {
    if (_question == null) return const SizedBox.shrink();
    
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Question', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            color: Colors.amber.shade50,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(_question!, style: const TextStyle(fontSize: 16)),
            ),
          ),
          const SizedBox(height: 24),
          const Text('Your Answer', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          TextField(
            controller: _answerController,
            maxLines: 5,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'Type your answer here...',
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _submitAnswer,
            child: const Text('Submit Answer'),
          )
        ],
      ),
    );
  }

  Widget _buildResultView() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Card(
            color: _result!['score'] >= 8 ? Colors.green.shade50 : (_result!['score'] >= 5 ? Colors.orange.shade50 : Colors.red.shade50),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Text('Score: ${_result!['score']}/10', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text(_result!['feedback'] ?? '', style: const TextStyle(fontSize: 16)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          if (_result!['missing_points'] != null && (_result!['missing_points'] as List).isNotEmpty) ...[
            const Text('Missing Points', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ...(_result!['missing_points'] as List).map((p) => ListTile(
                  leading: const Icon(Icons.warning, color: Colors.orange),
                  title: Text(p),
                )),
            const SizedBox(height: 16),
          ],
          const Text('Corrected Answer', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: MarkdownBody(data: _result!['corrected_answer'] ?? ''),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _generateQuestion,
            child: const Text('Next Question'),
          ),
        ],
      ),
    );
  }
}
