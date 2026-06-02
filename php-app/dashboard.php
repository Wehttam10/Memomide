<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
$pdo = db();

$totalSubjects = (int) $pdo->query('SELECT COUNT(*) FROM subjects WHERE user_id = ' . (int) $user['id'])->fetchColumn();
$stmt = $pdo->prepare('SELECT t.* FROM topics t JOIN subjects s ON s.id = t.subject_id WHERE s.user_id = ? ORDER BY t.created_at DESC');
$stmt->execute([$user['id']]);
$topics = $stmt->fetchAll();
$totalTopics = count($topics);
$weakTopics = count(array_filter($topics, fn($t) => in_array($t['status'], ['Weak', 'Critical'], true)));
$todayEnd = date('Y-m-d 23:59:59');
$dueToday = count(array_filter($topics, fn($t) => $t['next_review_date'] && $t['next_review_date'] <= $todayEnd));
$average = $totalTopics ? round(array_sum(array_map(fn($t) => (float) $t['memory_health_score'], $topics)) / $totalTopics) : 0;

$stmt = $pdo->prepare(
    'SELECT a.*, q.question_text
     FROM attempts a
     JOIN questions q ON q.id = a.question_id
     JOIN topics t ON t.id = q.topic_id
     JOIN subjects s ON s.id = t.subject_id
     WHERE a.user_id = ? AND s.user_id = ?
     ORDER BY a.created_at DESC
     LIMIT 5'
);
$stmt->execute([$user['id'], $user['id']]);
$recentAttempts = $stmt->fetchAll();
$weakest = $topics;
usort($weakest, fn($a, $b) => $a['memory_health_score'] <=> $b['memory_health_score']);
$weakest = array_slice($weakest, 0, 5);
$nextBadgeTarget = $weakest[0]['id'] ?? null;

render_header('Dashboard', $user);
?>
<div class="space-y-6">
  <section class="celebration-card relative overflow-hidden rounded-2xl shadow-sm">
    <div class="relative grid gap-0 lg:grid-cols-[1fr_360px]">
      <div class="p-6 sm:p-8">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 backdrop-blur">Ready to study?</div>
        <h2 class="mt-4 text-3xl font-black leading-tight text-ink sm:text-4xl">Your memory dashboard, <span class="bg-gradient-to-r from-violet-600 via-teal to-amber bg-clip-text text-transparent">in living colour.</span></h2>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Track weak topics, review timing, answer quality, and progress from one focused study workspace.</p>
        <div class="mt-5 flex flex-wrap gap-3">
          <a href="revision.php" class="btn-vibrant">Start revision</a>
          <a href="subjects.php" class="btn-secondary">Manage subjects</a>
        </div>
      </div>
      <div class="relative border-t border-white/40 bg-white/35 p-6 backdrop-blur lg:border-l lg:border-t-0">
        <p class="text-xs font-bold uppercase tracking-wider text-violet-700">Memory pulse</p>
        <div class="mt-5 text-center">
          <p class="text-6xl font-black text-ink"><?= $average ?>%</p>
          <p class="mt-2 text-sm font-bold text-ink"><?= $dueToday > 0 ? 'Clear today\'s review queue' : ($weakTopics > 0 ? 'Rescue one weak topic' : 'Generate a fresh practice set') ?></p>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-coral/15 p-3 text-center ring-1 ring-coral/25"><p class="text-[10px] font-bold uppercase tracking-wider text-coral">Due today</p><p class="mt-1 text-2xl font-black text-ink"><?= $dueToday ?></p></div>
          <div class="rounded-xl bg-amber/15 p-3 text-center ring-1 ring-amber/30"><p class="text-[10px] font-bold uppercase tracking-wider text-amber">Weak</p><p class="mt-1 text-2xl font-black text-ink"><?= $weakTopics ?></p></div>
        </div>
      </div>
    </div>
  </section>

  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    <div class="panel relative min-h-[118px] overflow-hidden rounded-2xl"><div class="stat-stripe stat-stripe-teal"></div><p class="text-xs font-bold uppercase tracking-wide text-slate-500">Subjects</p><p class="mt-2 text-3xl font-black text-ink"><?= $totalSubjects ?></p><p class="text-xs text-slate-500">Study areas</p></div>
    <div class="panel relative min-h-[118px] overflow-hidden rounded-2xl"><div class="stat-stripe stat-stripe-violet"></div><p class="text-xs font-bold uppercase tracking-wide text-slate-500">Topics</p><p class="mt-2 text-3xl font-black text-ink"><?= $totalTopics ?></p><p class="text-xs text-slate-500">Tracked concepts</p></div>
    <div class="panel relative min-h-[118px] overflow-hidden rounded-2xl"><div class="stat-stripe stat-stripe-amber"></div><p class="text-xs font-bold uppercase tracking-wide text-slate-500">Weak topics</p><p class="mt-2 text-3xl font-black text-ink"><?= $weakTopics ?></p><p class="text-xs text-slate-500">Weak or critical</p></div>
    <div class="panel relative min-h-[118px] overflow-hidden rounded-2xl"><div class="stat-stripe stat-stripe-coral"></div><p class="text-xs font-bold uppercase tracking-wide text-slate-500">Due today</p><p class="mt-2 text-3xl font-black text-ink"><?= $dueToday ?></p><p class="text-xs text-slate-500">Ready to review</p></div>
    <div class="panel relative min-h-[118px] overflow-hidden rounded-2xl"><div class="stat-stripe stat-stripe-ink"></div><p class="text-xs font-bold uppercase tracking-wide text-slate-500">Average score</p><p class="mt-2 text-3xl font-black text-ink"><?= $average ?>%</p><p class="text-xs text-slate-500">Memory health</p></div>
  </div>

  <div class="grid gap-4 lg:grid-cols-3">
    <a href="subjects.php" class="action-tile action-tile-violet"><p class="text-base font-black">Add richer notes</p><p class="mt-1 text-sm opacity-90">Better notes produce better questions.</p></a>
    <a href="revision.php" class="action-tile action-tile-coral"><p class="text-base font-black">Keep the streak alive</p><p class="mt-1 text-sm opacity-90">Review due topics before they pile up.</p></a>
    <a href="<?= $nextBadgeTarget ? 'practice.php?topic_id=' . (int) $nextBadgeTarget : 'subjects.php' ?>" class="action-tile action-tile-amber"><p class="text-base font-black">Next badge</p><p class="mt-1 text-sm opacity-90">Score 8+ to push a topic toward Strong.</p></a>
  </div>

  <div class="grid gap-6 xl:grid-cols-3">
    <section class="panel xl:col-span-2">
      <h3 class="text-lg font-bold">Memory health by topic</h3>
      <div class="mt-4 space-y-3">
        <?php foreach ($topics as $topic): ?>
          <div>
            <div class="flex justify-between text-sm"><span class="font-semibold"><?= h($topic['title']) ?></span><span><?= round((float) $topic['memory_health_score']) ?>%</span></div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div class="h-full rounded-full bg-teal" style="width: <?= max(6, round((float) $topic['memory_health_score'])) ?>%"></div></div>
          </div>
        <?php endforeach; ?>
        <?php if (!$topics): ?><p class="text-sm text-slate-500">Create a subject and topic to begin tracking memory health.</p><?php endif; ?>
      </div>
    </section>
    <section class="panel">
      <h3 class="text-lg font-bold">Weakest topics</h3>
      <div class="mt-4 space-y-3">
        <?php foreach ($weakest as $topic): ?>
          <a class="topic-row topic-row-amber" href="practice.php?topic_id=<?= (int) $topic['id'] ?>"><p class="font-bold text-ink"><?= h($topic['title']) ?></p><p class="text-sm text-slate-500"><?= round((float) $topic['memory_health_score']) ?>% memory health</p></a>
        <?php endforeach; ?>
        <?php if (!$weakest): ?><p class="text-sm text-slate-500">No weak topics yet.</p><?php endif; ?>
      </div>
    </section>
  </div>

  <section class="panel">
    <h3 class="text-lg font-bold">Recent attempts</h3>
    <div class="mt-4 overflow-hidden rounded-xl border border-white/60">
      <table class="w-full min-w-[720px] text-left text-sm">
        <thead class="table-head"><tr><th class="table-cell">Answer</th><th class="table-cell">Score</th><th class="table-cell">Feedback</th><th class="table-cell">Date</th></tr></thead>
        <tbody class="divide-y divide-slate-100">
        <?php foreach ($recentAttempts as $attempt): ?>
          <tr class="bg-white/70"><td class="table-cell max-w-md truncate font-medium text-ink"><?= h($attempt['student_answer']) ?></td><td class="table-cell"><?= h((string) $attempt['score']) ?>/10</td><td class="table-cell text-slate-600"><?= h($attempt['feedback']) ?></td><td class="table-cell text-slate-500"><?= h(date('M j, Y', strtotime($attempt['created_at']))) ?></td></tr>
        <?php endforeach; ?>
        </tbody>
      </table>
      <?php if (!$recentAttempts): ?><p class="p-4 text-sm text-slate-500">Generated questions and submitted answers will appear here.</p><?php endif; ?>
    </div>
  </section>
</div>
<?php render_footer(); ?>
