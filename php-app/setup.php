<?php
declare(strict_types=1);

$config = require __DIR__ . '/config.php';
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $pdo = new PDO(
            sprintf('mysql:host=%s;port=%s;charset=utf8mb4', $config['db_host'], $config['db_port']),
            $config['db_user'],
            $config['db_pass'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        $schema = file_get_contents(__DIR__ . '/schema.sql');
        foreach (array_filter(array_map('trim', explode(';', $schema))) as $statement) {
            $pdo->exec($statement);
        }
        $pdo->exec('USE ' . $config['db_name']);

        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
        $stmt->execute(['demo@student.com']);
        $userId = $stmt->fetchColumn();
        if (!$userId) {
            $stmt = $pdo->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
            $stmt->execute(['Demo Student', 'demo@student.com', password_hash('password123', PASSWORD_DEFAULT)]);
            $userId = (int) $pdo->lastInsertId();
        }

        $stmt = $pdo->prepare('SELECT id FROM subjects WHERE user_id = ? LIMIT 1');
        $stmt->execute([$userId]);
        if (!$stmt->fetchColumn()) {
            $pdo->prepare('INSERT INTO subjects (user_id, name, description) VALUES (?, ?, ?)')->execute([$userId, 'Chemistry', 'Periodic table, bonding, and exam revision.']);
            $subjectId = (int) $pdo->lastInsertId();
            $pdo->prepare('INSERT INTO topics (subject_id, title, description, memory_health_score, status, next_review_date) VALUES (?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 1 DAY))')->execute([$subjectId, 'Periodic Table Trends', 'Groups, periods, reactivity, and atomic trends.', 42, 'Weak']);
            $topicId = (int) $pdo->lastInsertId();
            $pdo->prepare('INSERT INTO notes (topic_id, content) VALUES (?, ?)')->execute([$topicId, 'The periodic table is arranged by increasing atomic number. Elements in the same group have similar valence electrons. Group 1 alkali metals are reactive. Group 18 noble gases are unreactive because they have full outer shells. Atomic radius generally decreases across a period and increases down a group.']);
        }

        $message = 'Setup complete. You can now sign in with demo@student.com / password123.';
    } catch (Throwable $e) {
        $error = $e->getMessage();
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Setup | MemoMind PHP</title>
  <link rel="stylesheet" href="assets/app.css">
</head>
<body class="min-h-screen bg-slate-50 p-6">
  <main class="mx-auto max-w-xl panel space-y-4">
    <h1 class="text-2xl font-black text-ink">MemoMind PHP setup</h1>
    <p class="text-sm text-slate-500">This creates the MySQL database, tables, and a demo account.</p>
    <?php if ($message): ?><p class="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <?php if ($error): ?><p class="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></p><?php endif; ?>
    <form method="post">
      <button class="btn-vibrant">Run setup</button>
      <a class="btn-secondary ml-2" href="login.php">Go to login</a>
    </form>
  </main>
</body>
</html>
