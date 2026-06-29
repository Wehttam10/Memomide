import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile/services/auth_service.dart';
import 'package:mobile/services/api_client.dart';
import 'package:fl_chart/fl_chart.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;
  String? _error;
  Map<String, dynamic>? _summary;
  Map<String, dynamic>? _aiStatus;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      final summary = await ApiClient.get('/api/v1/dashboard/summary');
      Map<String, dynamic>? aiStatus;
      try {
        aiStatus = await ApiClient.get('/api/v1/dashboard/ai-status');
      } catch (e) {
        aiStatus = {'provider': 'mock', 'has_api_key': false, 'mode': 'mock'};
      }
      
      if (mounted) {
        setState(() {
          _summary = summary;
          _aiStatus = aiStatus;
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
            ElevatedButton(onPressed: _fetchData, child: const Text('Retry'))
          ],
        ),
      );
    }
    
    final user = context.watch<AuthService>().user;
    final totalSubjects = _summary?['total_subjects'] ?? 0;
    final totalTopics = _summary?['total_topics'] ?? 0;
    final weakTopics = _summary?['weak_topics'] ?? 0;
    final dueToday = _summary?['due_reviews_today'] ?? 0;
    final avgScore = _summary?['average_memory_health_score'] ?? 0;
    final memoryScores = List.from(_summary?['topic_memory_health'] ?? []);

    return RefreshIndicator(
      onRefresh: _fetchData,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome, ${user?['name'] ?? 'Student'}',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            
            // Stats Grid
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.5,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              children: [
                _buildStatCard('Subjects', totalSubjects.toString(), Icons.book),
                _buildStatCard('Topics', totalTopics.toString(), Icons.layers),
                _buildStatCard('Weak Topics', weakTopics.toString(), Icons.warning, color: Colors.orange),
                _buildStatCard('Due Today', dueToday.toString(), Icons.schedule, color: Colors.red),
                _buildStatCard('Avg Score', '${avgScore.round()}%', Icons.trending_up, color: Colors.green),
              ],
            ),
            
            const SizedBox(height: 24),
            const Text('Memory Health by Topic', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            
            // Chart
            if (memoryScores.isNotEmpty)
              SizedBox(
                height: 200,
                child: LineChart(
                  LineChartData(
                    gridData: const FlGridData(show: false),
                    titlesData: FlTitlesData(
                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: true, reservedSize: 40)),
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (value, meta) {
                            if (value.toInt() >= 0 && value.toInt() < memoryScores.length) {
                              final name = memoryScores[value.toInt()]['name'] as String;
                              return Padding(
                                padding: const EdgeInsets.only(top: 8.0),
                                child: Text(name.length > 5 ? name.substring(0, 5) + '..' : name, style: const TextStyle(fontSize: 10)),
                              );
                            }
                            return const Text('');
                          },
                        ),
                      ),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    ),
                    borderData: FlBorderData(show: false),
                    lineBarsData: [
                      LineChartBarData(
                        spots: memoryScores.asMap().entries.map((e) => FlSpot(e.key.toDouble(), (e.value['score'] as num).toDouble())).toList(),
                        isCurved: true,
                        color: Colors.indigo,
                        barWidth: 3,
                        belowBarData: BarAreaData(
                          show: true,
                          color: Colors.indigo.withOpacity(0.2),
                        ),
                      ),
                    ],
                  ),
                ),
              )
            else
              const Center(child: Padding(
                padding: EdgeInsets.all(20.0),
                child: Text('No topics tracked yet.'),
              )),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, {Color color = Colors.indigo}) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const Spacer(),
            Text(
              value,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
