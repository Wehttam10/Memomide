<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
$pdo = db();
$subjectId = (int) ($_GET['id'] ?? 0);
$subject = get_subject($subjectId, (int) $user['id']);
if (!$subject) redirect('subjects.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (($_POST['action'] ?? '') === 'save_subject') {
        $stmt = $pdo->prepare('UPDATE subjects SET name = ?, description = ? WHERE id = ? AND user_id = ?');
        $stmt->execute([trim($_POST['name'] ?? ''), trim($_POST['description'] ?? ''), $subjectId, $user['id']]);
        flash('Subject saved.');
    }
    if (($_POST['action'] ?? '') === 'add_topic') {
        $stmt = $pdo->prepare('INSERT INTO topics (subject_id, title, description, status) VALUES (?, ?, ?, ?)');
        $stmt->execute([$subjectId, trim($_POST['title'] ?? ''), trim($_POST['description'] ?? ''), status_for_score(50)]);
        flash('Topic added.');
    }
    if (($_POST['action'] ?? '') === 'delete_topic') {
        $stmt = $pdo->prepare('DELETE t FROM topics t JOIN subjects s ON s.id = t.subject_id WHERE t.id = ? AND s.user_id = ?');
        $stmt->execute([(int) $_POST['topic_id'], $user['id']]);
        flash('Topic deleted.');
    }
    redirect('subject.php?id=' . $subjectId);
}

$stmt = $pdo->prepare('SELECT * FROM topics WHERE subject_id = ? ORDER BY created_at DESC');
$stmt->execute([$subjectId]);
$topics = $stmt->fetchAll();
$subject = get_subject($subjectId, (int) $user['id']);

render_header($subject['name'], $user);
?>
<div class="space-y-6">
  <form method="post" class="panel grid gap-3 md:grid-cols-[1fr_auto]">
    <input type="hidden" name="action" value="save_subject">
    <div class="space-y-3">
      <input class="field text-lg font-bold" name="name" value="<?= h($subject['name']) ?>">
      <textarea class="field" name="description"><?= h($subject['description']) ?></textarea>
    </div>
    <button class="btn-secondary self-start">Save</button>
  </form>

  <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
    <section class="panel">
      <h2 class="text-xl font-bold">Topics</h2>
      <p class="text-sm text-slate-500">Each topic can hold notes, generated questions, and memory scores.</p>
      <div class="mt-4 space-y-3">
        <?php foreach ($topics as $topic): ?>
          <div class="rounded-lg border border-teal/15 bg-white/80 p-4 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div><a href="topic.php?id=<?= (int) $topic['id'] ?>" class="font-bold hover:text-teal"><?= h($topic['title']) ?></a><p class="text-sm text-slate-500"><?= h($topic['description']) ?></p></div>
              <span class="status-badge status-<?= strtolower(h($topic['status'])) ?>"><?= h($topic['status']) ?></span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <a class="btn-secondary" href="notes.php?topic_id=<?= (int) $topic['id'] ?>">Notes</a>
              <a class="btn-primary" href="practice.php?topic_id=<?= (int) $topic['id'] ?>">Practice</a>
              <form method="post"><input type="hidden" name="action" value="delete_topic"><input type="hidden" name="topic_id" value="<?= (int) $topic['id'] ?>"><button class="btn-secondary">Delete</button></form>
            </div>
          </div>
        <?php endforeach; ?>
        <?php if (!$topics): ?><p class="text-sm text-slate-500">No topics in this subject yet.</p><?php endif; ?>
      </div>
    </section>
    <form method="post" class="panel space-y-3 lg:sticky lg:top-24 lg:self-start">
      <input type="hidden" name="action" value="add_topic">
      <h3 class="font-bold">Create topic</h3>
      <input class="field" name="title" placeholder="Topic title" required>
      <textarea class="field min-h-28" name="description" placeholder="Description"></textarea>
      <button class="btn-primary w-full">Add topic</button>
    </form>
  </div>
</div>
<?php render_footer(); ?>

