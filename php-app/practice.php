<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
$pdo = db();
$topicId = (int) ($_GET['topic_id'] ?? 0);
$topic = get_topic($topicId, (int) $user['id']);
if (!$topic) redirect('subjects.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (($_POST['action'] ?? '') === 'generate') {
        $stmt = $pdo->prepare('SELECT content FROM notes WHERE topic_id = ?');
        $stmt->execute([$topicId]);
        $notesText = implode("\n", array_column($stmt->fetchAll(), 'content'));
        if (trim($notesText) === '') {
            flash('Add notes before generating questions.');
        } else {
            $pdo->prepare('DELETE q FROM questions q LEFT JOIN attempts a ON a.question_id = q.id WHERE q.topic_id = ? AND a.id IS NULL')->execute([$topicId]);
            $insert = $pdo->prepare('INSERT INTO questions (topic_id, question_text, expected_answer, question_type, difficulty) VALUES (?, ?, ?, ?, ?)');
            foreach (generate_mock_questions($notesText) as $question) {
                $insert->execute([$topicId, $question['question_text'], $question['expected_answer'], $question['question_type'], $question['difficulty']]);
            }
            flash('Questions generated.');
        }
    }
    if (($_POST['action'] ?? '') === 'submit') {
        $questionId = (int) $_POST['question_id'];
        $stmt = $pdo->prepare(
            'SELECT q.* FROM questions q
             JOIN topics t ON t.id = q.topic_id
             JOIN subjects s ON s.id = t.subject_id
             WHERE q.id = ? AND t.id = ? AND s.user_id = ?'
        );
        $stmt->execute([$questionId, $topicId, $user['id']]);
        $question = $stmt->fetch();
        if ($question) {
            $grade = grade_answer($question['expected_answer'], $_POST['student_answer'] ?? '');
            $stmt = $pdo->prepare('INSERT INTO attempts (question_id, user_id, student_answer, score, feedback, missing_points, corrected_answer) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$questionId, $user['id'], $_POST['student_answer'] ?? '', $grade['score'], $grade['feedback'], $grade['missing_points'], $grade['corrected_answer']]);
            [$newScore, $status] = update_memory_score((float) $topic['memory_health_score'], (float) $grade['score']);
            $interval = interval_for_score((float) $grade['score']);
            $nextReview = date('Y-m-d H:i:s', strtotime('+' . $interval . ' days'));
            $pdo->prepare('UPDATE topics SET memory_health_score = ?, status = ?, next_review_date = ? WHERE id = ?')->execute([$newScore, $status, $nextReview, $topicId]);
            $pdo->prepare(
                'INSERT INTO review_schedules (topic_id, user_id, next_review_date, last_review_date, interval_days, status)
                 VALUES (?, ?, ?, NOW(), ?, ?)
                 ON DUPLICATE KEY UPDATE next_review_date = VALUES(next_review_date), last_review_date = NOW(), interval_days = VALUES(interval_days), status = VALUES(status)'
            )->execute([$topicId, $user['id'], $nextReview, $interval, $status]);
            flash('Answer submitted.');
        }
    }
    redirect('practice.php?topic_id=' . $topicId);
}

$topic = get_topic($topicId, (int) $user['id']);
$stmt = $pdo->prepare('SELECT * FROM questions WHERE topic_id = ? ORDER BY created_at DESC');
$stmt->execute([$topicId]);
$questions = $stmt->fetchAll();
$stmt = $pdo->prepare(
    'SELECT a.* FROM attempts a
     JOIN questions q ON q.id = a.question_id
     WHERE q.topic_id = ? AND a.user_id = ?
     ORDER BY a.created_at DESC'
);
$stmt->execute([$topicId, $user['id']]);
$attempts = $stmt->fetchAll();

render_header($topic['title'] . ' practice', $user);
?>
<div class="space-y-6">
  <section class="celebration-card rounded-lg border border-teal/15 p-5 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-teal">Focus session</div>
        <h2 class="mt-3 text-2xl font-bold"><?= h($topic['title']) ?> practice</h2>
        <p class="text-sm text-slate-500">Memory health: <?= round((float) $topic['memory_health_score']) ?>%. Next review: <?= $topic['next_review_date'] ? h(date('M j, Y', strtotime($topic['next_review_date']))) : 'Not scheduled' ?></p>
      </div>
      <div class="flex items-center gap-2">
        <span class="status-badge status-<?= strtolower(h($topic['status'])) ?>"><?= h($topic['status']) ?></span>
        <form method="post"><input type="hidden" name="action" value="generate"><button class="btn-secondary">Generate</button></form>
      </div>
    </div>
  </section>

  <?php if (!$questions): ?>
    <section class="panel text-sm text-slate-500">No questions yet. Add notes for this topic, then generate questions to begin practice.</section>
  <?php endif; ?>

  <div class="space-y-4">
    <?php foreach ($questions as $question): ?>
      <section class="panel space-y-3">
        <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <span class="rounded-full bg-teal/10 px-2.5 py-1 text-teal"><?= h(str_replace('_', ' ', $question['question_type'])) ?></span>
          <span class="rounded-full bg-amber/10 px-2.5 py-1 text-amber"><?= h($question['difficulty']) ?></span>
        </div>
        <h3 class="text-lg font-bold"><?= h($question['question_text']) ?></h3>
        <form method="post" class="space-y-3">
          <input type="hidden" name="action" value="submit">
          <input type="hidden" name="question_id" value="<?= (int) $question['id'] ?>">
          <textarea class="field min-h-28" name="student_answer" placeholder="Type your answer..." required></textarea>
          <button class="btn-primary">Submit answer</button>
        </form>
      </section>
    <?php endforeach; ?>
  </div>

  <section class="panel">
    <h3 class="font-bold">Attempt history</h3>
    <div class="mt-3 grid gap-2 md:grid-cols-2">
      <?php foreach ($attempts as $attempt): ?>
        <div class="rounded-md border border-teal/15 bg-white/80 p-3 text-sm">
          <span class="font-semibold"><?= h((string) $attempt['score']) ?>/10</span> - <?= h($attempt['feedback']) ?>
          <p class="mt-2 whitespace-pre-wrap text-xs text-slate-500"><?= h($attempt['missing_points']) ?></p>
        </div>
      <?php endforeach; ?>
      <?php if (!$attempts): ?><p class="text-sm text-slate-500">Submit an answer to see grading feedback and memory score updates.</p><?php endif; ?>
    </div>
  </section>
</div>
<?php render_footer(); ?>

