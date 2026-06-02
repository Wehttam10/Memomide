<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (($_POST['action'] ?? '') === 'create') {
        $stmt = $pdo->prepare('INSERT INTO subjects (user_id, name, description) VALUES (?, ?, ?)');
        $stmt->execute([$user['id'], trim($_POST['name'] ?? ''), trim($_POST['description'] ?? '')]);
        flash('Subject created.');
    }
    if (($_POST['action'] ?? '') === 'delete') {
        $stmt = $pdo->prepare('DELETE FROM subjects WHERE id = ? AND user_id = ?');
        $stmt->execute([(int) $_POST['subject_id'], $user['id']]);
        flash('Subject deleted.');
    }
    redirect('subjects.php');
}

$stmt = $pdo->prepare('SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at DESC');
$stmt->execute([$user['id']]);
$subjects = $stmt->fetchAll();

render_header('Subjects', $user);
?>
<div class="space-y-6">
  <section class="celebration-card relative overflow-hidden rounded-2xl p-6 shadow-sm sm:p-7">
    <div class="relative flex flex-wrap items-end justify-between gap-4">
      <div>
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 backdrop-blur">Study library</div>
        <h2 class="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">Your <span class="bg-gradient-to-r from-violet-600 via-teal to-amber bg-clip-text text-transparent">subjects</span></h2>
        <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">Organize topics by course, module, or exam paper.</p>
      </div>
      <div class="rounded-2xl bg-white/70 px-4 py-3 text-center shadow-sm ring-1 ring-violet-100 backdrop-blur"><p class="text-[11px] font-bold uppercase tracking-wider text-violet-600">In library</p><p class="mt-1 text-3xl font-black text-ink"><?= count($subjects) ?></p></div>
    </div>
  </section>

  <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
    <section class="space-y-4">
      <?php if ($subjects): ?>
        <div class="grid gap-4 md:grid-cols-2">
          <?php foreach ($subjects as $subject): ?>
            <div class="panel relative overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
              <div class="stat-stripe stat-stripe-violet"></div>
              <a href="subject.php?id=<?= (int) $subject['id'] ?>" class="text-lg font-black text-ink hover:text-violet-600"><?= h($subject['name']) ?></a>
              <p class="mt-1 min-h-10 text-sm leading-6 text-slate-500"><?= h($subject['description'] ?: 'No description yet.') ?></p>
              <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
                <a class="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-700" href="subject.php?id=<?= (int) $subject['id'] ?>">Open subject</a>
                <form method="post">
                  <input type="hidden" name="action" value="delete">
                  <input type="hidden" name="subject_id" value="<?= (int) $subject['id'] ?>">
                  <button class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600" type="submit">Delete</button>
                </form>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      <?php else: ?>
        <div class="panel rounded-2xl text-sm text-slate-500">No subjects yet. Create your first subject to start adding topics and notes.</div>
      <?php endif; ?>
    </section>

    <form method="post" class="panel space-y-3 rounded-2xl lg:sticky lg:top-24 lg:self-start">
      <input type="hidden" name="action" value="create">
      <h3 class="text-lg font-black text-ink">Create subject</h3>
      <p class="text-sm text-slate-500">Give it a clear name. It is the anchor for every topic underneath.</p>
      <input class="field-vibrant" name="name" placeholder="Subject name" required>
      <textarea class="field-vibrant min-h-28" name="description" placeholder="Description (optional)"></textarea>
      <button class="btn-vibrant w-full">Add subject</button>
    </form>
  </div>
</div>
<?php render_footer(); ?>

