<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
$topicId = (int) ($_GET['id'] ?? 0);
$topic = get_topic($topicId, (int) $user['id']);
if (!$topic) redirect('subjects.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = db()->prepare('UPDATE topics t JOIN subjects s ON s.id = t.subject_id SET t.title = ?, t.description = ? WHERE t.id = ? AND s.user_id = ?');
    $stmt->execute([trim($_POST['title'] ?? ''), trim($_POST['description'] ?? ''), $topicId, $user['id']]);
    flash('Topic saved.');
    redirect('topic.php?id=' . $topicId);
}

render_header($topic['title'], $user);
?>
<div class="space-y-6">
  <form method="post" class="panel space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <input class="field max-w-xl text-xl font-bold" name="title" value="<?= h($topic['title']) ?>">
      <span class="status-badge status-<?= strtolower(h($topic['status'])) ?>"><?= h($topic['status']) ?></span>
    </div>
    <textarea class="field" name="description"><?= h($topic['description']) ?></textarea>
    <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
      <span><?= round((float) $topic['memory_health_score']) ?>% memory health</span>
      <span>Next review: <?= $topic['next_review_date'] ? h(date('M j, Y', strtotime($topic['next_review_date']))) : 'Not scheduled' ?></span>
    </div>
    <button class="btn-secondary">Save topic</button>
  </form>
  <div class="flex flex-wrap gap-3">
    <a class="btn-secondary" href="notes.php?topic_id=<?= $topicId ?>">Manage notes</a>
    <a class="btn-primary" href="practice.php?topic_id=<?= $topicId ?>">Practice questions</a>
  </div>
</div>
<?php render_footer(); ?>

