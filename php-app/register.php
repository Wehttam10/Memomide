<?php
require __DIR__ . '/includes/bootstrap.php';

if (current_user()) {
    redirect('dashboard.php');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $password = $_POST['password'] ?? '';
    if ($name === '' || $email === '' || strlen($password) < 8) {
        $error = 'Please enter a name, email, and password of at least 8 characters.';
    } else {
        try {
            $stmt = db()->prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
            $_SESSION['user_id'] = (int) db()->lastInsertId();
            redirect('dashboard.php');
        } catch (PDOException $e) {
            $error = 'Email is already registered';
        }
    }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Register | MemoMind</title>
  <link rel="stylesheet" href="assets/app.css">
</head>
<body>
  <div class="landing-shell landing-grid relative min-h-screen overflow-hidden">
    <div class="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col items-stretch gap-10 px-6 py-10 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
      <section class="flex flex-1 flex-col justify-center">
        <div class="inline-flex w-fit items-center gap-2 rounded-full border border-white/60 bg-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber backdrop-blur">Start your study streak</div>
        <h1 class="mt-5 text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">Make every page <span class="bg-gradient-to-r from-amber via-coral to-violet-600 bg-clip-text text-transparent">actually stick.</span></h1>
        <p class="mt-5 max-w-xl text-lg text-slate-600">Build a study habit that compounds. MemoMind plans your revisions and tracks each subject.</p>
      </section>
      <section class="w-full lg:max-w-md">
        <form method="post" class="glass-card relative space-y-5">
          <div class="flex items-center gap-3">
            <img src="assets/memomind-logo.jpeg" alt="MemoMind logo" class="h-12 w-12 rounded-xl object-cover ring-2 ring-violet-200">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-violet-600">MemoMind</p>
              <h2 class="text-xl font-bold text-ink">Create your account</h2>
            </div>
          </div>
          <?php if ($error): ?><p class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100"><?= h($error) ?></p><?php endif; ?>
          <label class="block"><span class="mb-1 block text-xs font-semibold text-slate-600">Name</span><input class="field-vibrant" name="name" value="<?= h($_POST['name'] ?? '') ?>" required></label>
          <label class="block"><span class="mb-1 block text-xs font-semibold text-slate-600">Email</span><input class="field-vibrant" name="email" value="<?= h($_POST['email'] ?? '') ?>" required></label>
          <label class="block"><span class="mb-1 block text-xs font-semibold text-slate-600">Password</span><input class="field-vibrant" type="password" name="password" required></label>
          <button class="btn-vibrant w-full">Start studying</button>
          <p class="text-center text-sm text-slate-500">Already registered? <a class="font-semibold text-violet-600 hover:text-violet-700" href="login.php">Sign in</a></p>
        </form>
      </section>
    </div>
  </div>
</body>
</html>

