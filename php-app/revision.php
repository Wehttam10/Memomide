<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
$stmt = db()->prepare(
    'SELECT t.*, s.name AS subject_name
     FROM topics t
     JOIN subjects s ON s.id = t.subject_id
     WHERE s.user_id = ? AND t.next_review_date IS NOT NULL AND t.next_review_date <= ?
     ORDER BY FIELD(t.status, "Critical", "Weak", "Good", "Strong"), t.next_review_date ASC'
);
$stmt->execute([$user['id'], date('Y-m-d 23:59:59')]);
$topics = $stmt->fetchAll();
$criticalCount = count(array_filter($topics, fn($t) => $t['status'] === 'Critical'));
$weakCount = count(array_filter($topics, fn($t) => $t['status'] === 'Weak'));

render_header('Revision', $user);
?>
<div class="space-y-6">
  <section class="celebration-card relative overflow-hidden rounded-2xl p-6 shadow-sm sm:p-7">
    <div class="relative flex flex-wrap items-end justify-between gap-5">
      <div>
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 backdrop-blur">Spaced repetition</div>
        <h2 class="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">Today's <span class="bg-gradient-to-r from-violet-600 via-teal to-amber bg-clip-text text-transparent">revision queue</span></h2>
        <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">Critical and weak topics are prioritized before routine due reviews.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 text-xs font-bold text-ink shadow-sm ring-1 ring-violet-100"><?= count($topics) ?> ready to review</span>
          <?php if ($criticalCount): ?><span class="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 ring-1 ring-rose-200"><?= $criticalCount ?> critical</span><?php endif; ?>
          <?php if ($weakCount): ?><span class="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 ring-1 ring-yellow-200"><?= $weakCount ?> weak</span><?php endif; ?>
        </div>
      </div>
      <div class="rounded-2xl bg-white/70 px-5 py-4 text-center shadow-sm ring-1 ring-violet-100 backdrop-blur"><p class="text-[11px] font-bold uppercase tracking-wider text-violet-600">Queue size</p><p class="mt-1 text-4xl font-black leading-none text-ink"><?= count($topics) ?></p></div>
    </div>
  </section>
  <section class="panel rounded-2xl">
    <?php if ($topics): ?>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[860px] text-left text-sm">
          <thead class="table-head"><tr><th class="table-cell">Topic</th><th class="table-cell">Subject</th><th class="table-cell">Health</th><th class="table-cell">Status</th><th class="table-cell">Next review</th><th class="table-cell"></th></tr></thead>
          <tbody class="divide-y divide-slate-100">
          <?php foreach ($topics as $topic): ?>
            <tr class="bg-white/75 transition hover:bg-white">
              <td class="table-cell font-bold text-ink"><?= h($topic['title']) ?></td>
              <td class="table-cell text-slate-600"><?= h($topic['subject_name']) ?></td>
              <td class="table-cell"><?= round((float) $topic['memory_health_score']) ?>%</td>
              <td class="table-cell"><span class="status-badge status-<?= strtolower(h($topic['status'])) ?>"><?= h($topic['status']) ?></span></td>
              <td class="table-cell text-slate-600"><?= h(date('M j, Y', strtotime($topic['next_review_date']))) ?></td>
              <td class="table-cell text-right"><a class="text-sm font-bold text-violet-600 hover:text-violet-700" href="practice.php?topic_id=<?= (int) $topic['id'] ?>">Practice</a></td>
            </tr>
          <?php endforeach; ?>
          </tbody>
        </table>
      </div>
    <?php else: ?>
      <p class="text-sm text-slate-500">Nothing due today. New reviews will appear here after answering practice questions.</p>
    <?php endif; ?>
  </section>
</div>
<?php render_footer(); ?>

