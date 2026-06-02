<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
$pdo = db();

$query = trim($_GET['q'] ?? '');
$subjects = [];
$topics = [];
$notes = [];

if ($query !== '') {
    $likeQuery = '%' . $query . '%';

    // 1. Search Subjects
    $stmt = $pdo->prepare('SELECT * FROM subjects WHERE user_id = ? AND (name LIKE ? OR description LIKE ?) ORDER BY name ASC');
    $stmt->execute([$user['id'], $likeQuery, $likeQuery]);
    $subjects = $stmt->fetchAll();

    // 2. Search Topics
    $stmt = $pdo->prepare('SELECT t.*, s.name AS subject_name FROM topics t JOIN subjects s ON s.id = t.subject_id WHERE s.user_id = ? AND (t.title LIKE ? OR t.description LIKE ?) ORDER BY t.title ASC');
    $stmt->execute([$user['id'], $likeQuery, $likeQuery]);
    $topics = $stmt->fetchAll();

    // 3. Search Notes
    $stmt = $pdo->prepare('SELECT n.*, t.title AS topic_title, s.id AS subject_id, s.name AS subject_name FROM notes n JOIN topics t ON t.id = n.topic_id JOIN subjects s ON s.id = t.subject_id WHERE s.user_id = ? AND n.content LIKE ? ORDER BY t.title ASC');
    $stmt->execute([$user['id'], $likeQuery]);
    $notes = $stmt->fetchAll();
}

render_header('Search Results', $user);
?>
<div class="space-y-6">
  <!-- Header Card -->
  <section class="celebration-card relative overflow-hidden rounded-2xl p-6 shadow-sm sm:p-7">
    <div class="relative flex flex-wrap items-end justify-between gap-4">
      <div>
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700 backdrop-blur">Workspace search</div>
        <h2 class="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">Search <span class="bg-gradient-to-r from-violet-600 via-teal to-amber bg-clip-text text-transparent">results</span></h2>
        <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          <?php if ($query !== ''): ?>
            Showing results for "<?= h($query) ?>"
          <?php else: ?>
            Enter a search term above to search your library.
          <?php endif; ?>
        </p>
      </div>
      <?php if ($query !== ''): ?>
        <div class="rounded-2xl bg-white/70 px-4 py-3 text-center shadow-sm ring-1 ring-violet-100 backdrop-blur">
          <p class="text-[11px] font-bold uppercase tracking-wider text-violet-600">Total matches</p>
          <p class="mt-1 text-3xl font-black text-ink"><?= count($subjects) + count($topics) + count($notes) ?></p>
        </div>
      <?php endif; ?>
    </div>
  </section>

  <?php if ($query === ''): ?>
    <div class="panel rounded-2xl text-center py-12 text-slate-500">
      <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 class="mt-4 text-lg font-bold text-ink">Search MemoMind</h3>
      <p class="mt-2 text-sm text-slate-500">Use the top search bar or enter a keyword to find subjects, topics, or notes contents.</p>
    </div>
  <?php elseif (empty($subjects) && empty($topics) && empty($notes)): ?>
    <div class="panel rounded-2xl text-center py-12 text-slate-500">
      <svg class="mx-auto h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-4 text-lg font-bold text-ink">No results found</h3>
      <p class="mt-2 text-sm text-slate-500">We couldn't find anything matching "<?= h($query) ?>". Try different keywords.</p>
    </div>
  <?php else: ?>
    <!-- Search Results Grid -->
    <div class="space-y-8">
      
      <!-- Subjects Section -->
      <?php if (!empty($subjects)): ?>
        <div class="space-y-3">
          <h3 class="text-lg font-black text-ink flex items-center gap-2">
            <svg class="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Subjects (<?= count($subjects) ?>)
          </h3>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <?php foreach ($subjects as $subject): ?>
              <div class="panel relative overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
                <div class="stat-stripe stat-stripe-violet"></div>
                <a href="subject.php?id=<?= (int) $subject['id'] ?>" class="text-lg font-black text-ink hover:text-violet-600"><?= h($subject['name']) ?></a>
                <p class="mt-1 text-sm leading-6 text-slate-500"><?= h($subject['description'] ?: 'No description yet.') ?></p>
                <div class="mt-4">
                  <a class="text-sm font-bold text-violet-600 hover:text-violet-700" href="subject.php?id=<?= (int) $subject['id'] ?>">Open subject &rarr;</a>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
      <?php endif; ?>

      <!-- Topics Section -->
      <?php if (!empty($topics)): ?>
        <div class="space-y-3">
          <h3 class="text-lg font-black text-ink flex items-center gap-2">
            <svg class="h-5 w-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Topics (<?= count($topics) ?>)
          </h3>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <?php foreach ($topics as $topic): ?>
              <div class="panel relative overflow-hidden rounded-2xl transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
                <div class="stat-stripe stat-stripe-teal"></div>
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400"><?= h($topic['subject_name']) ?></span>
                <a href="topic.php?id=<?= (int) $topic['id'] ?>" class="block text-lg font-black text-ink hover:text-teal"><?= h($topic['title']) ?></a>
                <p class="mt-1 text-sm leading-6 text-slate-500"><?= h($topic['description'] ?: 'No description yet.') ?></p>
                <div class="mt-4 flex items-center justify-between">
                  <span class="status-badge status-<?= strtolower(h($topic['status'])) ?>"><?= h($topic['status']) ?></span>
                  <a class="text-sm font-bold text-teal hover:text-teal/80" href="topic.php?id=<?= (int) $topic['id'] ?>">Open topic &rarr;</a>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
      <?php endif; ?>

      <!-- Notes Section -->
      <?php if (!empty($notes)): ?>
        <div class="space-y-3">
          <h3 class="text-lg font-black text-ink flex items-center gap-2">
            <svg class="h-5 w-5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Notes matches (<?= count($notes) ?>)
          </h3>
          <div class="space-y-3">
            <?php foreach ($notes as $note): ?>
              <div class="panel relative overflow-hidden rounded-2xl transition hover:bg-white hover:shadow-md p-5">
                <div class="stat-stripe stat-stripe-amber"></div>
                <div class="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400"><?= h($note['subject_name']) ?> &rarr; <?= h($note['topic_title']) ?></span>
                    <h4 class="text-base font-bold text-ink mt-0.5">Notes content match</h4>
                  </div>
                  <a class="btn-secondary px-3 py-1.5 text-xs" href="notes.php?topic_id=<?= (int) $note['topic_id'] ?>">View full notes</a>
                </div>
                <!-- Snippet highlighting matching text -->
                <div class="mt-3 bg-slate-50/60 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 font-mono whitespace-pre-wrap">
                  <?php
                  $content = $note['content'];
                  $pos = mb_stripos($content, $query);
                  $start = max(0, $pos - 80);
                  $length = mb_strlen($query) + 160;
                  $snippet = mb_substr($content, $start, $length);
                  $ellipsis_start = $start > 0 ? '...' : '';
                  $ellipsis_end = ($start + $length) < mb_strlen($content) ? '...' : '';
                  $safe_snippet = h($ellipsis_start . $snippet . $ellipsis_end);
                  // Highlight query case-insensitively
                  echo preg_replace('/(' . preg_quote(h($query), '/') . ')/i', '<mark class="bg-yellow-100 text-yellow-800 px-0.5 rounded font-bold">$1</mark>', $safe_snippet);
                  ?>
                </div>
              </div>
            <?php endforeach; ?>
          </div>
        </div>
      <?php endif; ?>

    </div>
  <?php endif; ?>
</div>
<?php
render_footer();
?>
