<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
render_header('Profile', $user);
?>
<section class="panel max-w-2xl">
  <h2 class="text-2xl font-bold">Profile</h2>
  <dl class="mt-5 grid gap-4 text-sm">
    <div><dt class="font-semibold text-slate-500">Name</dt><dd class="mt-1"><?= h($user['name']) ?></dd></div>
    <div><dt class="font-semibold text-slate-500">Email</dt><dd class="mt-1"><?= h($user['email']) ?></dd></div>
    <div><dt class="font-semibold text-slate-500">Joined</dt><dd class="mt-1"><?= h(date('M j, Y', strtotime($user['created_at']))) ?></dd></div>
  </dl>
</section>
<?php render_footer(); ?>

