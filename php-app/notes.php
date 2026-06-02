<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
$pdo = db();
$topicId = (int) ($_GET['topic_id'] ?? 0);
$topic = get_topic($topicId, (int) $user['id']);
if (!$topic) redirect('subjects.php');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (($_POST['action'] ?? '') === 'add_note') {
        $stmt = $pdo->prepare('INSERT INTO notes (topic_id, content) VALUES (?, ?)');
        $stmt->execute([$topicId, trim($_POST['content'] ?? '')]);
        flash('Note saved.');
    }
    if (($_POST['action'] ?? '') === 'delete_note') {
        $stmt = $pdo->prepare('DELETE n FROM notes n JOIN topics t ON t.id = n.topic_id JOIN subjects s ON s.id = t.subject_id WHERE n.id = ? AND s.user_id = ?');
        $stmt->execute([(int) $_POST['note_id'], $user['id']]);
        flash('Note deleted.');
    }
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
            flash('5 questions generated with Mock AI fallback.');
        }
    }
    redirect('notes.php?topic_id=' . $topicId);
}

$stmt = $pdo->prepare('SELECT * FROM notes WHERE topic_id = ? ORDER BY created_at DESC');
$stmt->execute([$topicId]);
$notes = $stmt->fetchAll();

render_header($topic['title'] . ' notes', $user);
?>
<div class="grid gap-6 lg:grid-cols-[1fr_380px]">
  <section class="panel">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold"><?= h($topic['title']) ?> notes</h2>
        <p class="text-sm text-slate-500">Manual notes for this PHP/MySQL version.</p>
      </div>
      <form method="post">
        <input type="hidden" name="action" value="generate">
        <button class="btn-primary" <?= !$notes ? 'disabled' : '' ?>>Generate Questions</button>
      </form>
    </div>
    <div class="mt-4 rounded-lg border border-teal/15 bg-[#edf8f5] p-4 text-sm">
      <span class="font-semibold text-slate-700">AI Mode: Mock</span>
      <span class="ml-2 text-slate-500">Generated questions use the PHP mock generator.</span>
    </div>
    <div class="mt-5 space-y-3">
      <?php foreach ($notes as $note): ?>
        <article class="rounded-lg border border-teal/15 bg-white/80 p-4 shadow-sm">
          <p class="whitespace-pre-wrap text-sm leading-6 text-slate-700"><?= h($note['content']) ?></p>
          <form method="post" class="mt-3"><input type="hidden" name="action" value="delete_note"><input type="hidden" name="note_id" value="<?= (int) $note['id'] ?>"><button class="btn-secondary">Delete</button></form>
        </article>
      <?php endforeach; ?>
      <?php if (!$notes): ?><p class="text-sm text-slate-500">No notes yet. Add text notes first.</p><?php endif; ?>
    </div>
  </section>
  <form method="post" class="panel space-y-3 lg:sticky lg:top-24 lg:self-start">
    <input type="hidden" name="action" value="add_note">
    <h3 class="font-bold">Add note</h3>
    <textarea class="field min-h-72" name="content" placeholder="Paste or write study notes here..." required></textarea>
    <button class="btn-primary w-full">Save note</button>
  </form>
</div>
<?php render_footer(); ?>

