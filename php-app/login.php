<?php
require __DIR__ . '/includes/bootstrap.php';

if (current_user()) {
    redirect('dashboard.php');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';
    $stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        redirect('dashboard.php');
    }
    $error = 'Invalid email or password';
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login | MemoMind</title>
  <link rel="stylesheet" href="assets/app.css">
</head>
<body>
  <div class="landing-shell landing-grid relative min-h-screen overflow-hidden">
    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-stretch gap-10 px-6 py-10 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
      <section class="flex flex-1 flex-col justify-center">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-700 backdrop-blur">Your AI study companion</div>
        <h1 class="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">Study smarter, <span class="bg-gradient-to-r from-violet-600 via-teal to-amber bg-clip-text text-transparent">remember longer.</span></h1>
        <p class="mt-5 max-w-xl text-lg text-slate-600">MemoMind turns your notes into spaced-repetition practice, surfaces what you are about to forget, and keeps your study rhythm focused.</p>
      </section>
      <section class="w-full lg:max-w-md">
        <form method="post" class="glass-card relative space-y-5">
          <div class="flex items-center gap-3">
            <img src="assets/memomind-logo.jpeg" alt="MemoMind logo" class="h-12 w-12 rounded-xl object-cover ring-2 ring-violet-200">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-violet-600">MemoMind</p>
              <h2 class="text-xl font-bold text-ink">Welcome back</h2>
            </div>
          </div>
          <?php if ($error): ?><p class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100"><?= h($error) ?></p><?php endif; ?>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-slate-600">Email</span>
            <input class="field-vibrant" name="email" value="<?= h($_POST['email'] ?? 'demo@student.com') ?>" required>
          </label>
          <label class="block">
            <span class="mb-1 block text-xs font-semibold text-slate-600">Password</span>
            <input class="field-vibrant" type="password" name="password" value="<?= h($_POST['password'] ?? 'password123') ?>" required>
          </label>
          <button class="btn-vibrant w-full">Continue studying</button>
          <p class="text-center text-sm text-slate-500">New here? <a class="font-semibold text-violet-600 hover:text-violet-700" href="register.php">Create your account</a></p>
        </form>
      </section>
    </div>
  </div>
</body>
</html>

