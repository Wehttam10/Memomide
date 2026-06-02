<?php
function render_header(string $title, array $user): void
{
    $links = [
        ['dashboard.php', 'Dashboard', '<svg class="h-5 w-5 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>'],
        ['subjects.php', 'Subjects', '<svg class="h-5 w-5 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>'],
        ['revision.php', 'Revision', '<svg class="h-5 w-5 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>'],
        ['awards.php', 'Awards', '<svg class="h-5 w-5 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4a5 5 0 005 5h4a5 5 0 005-5V3M4 7h16M12 12v6M9 21h6" /></svg>'],
        ['profile.php', 'Profile', '<svg class="h-5 w-5 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'],
    ];
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= h($title) ?> | MemoMind</title>
  <link rel="stylesheet" href="assets/app.css">
  <style>
    #sidebar {
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
    }
    #sidebarToggle {
      display: flex !important;
    }
    @media (min-width: 1024px) {
      #sidebar {
        position: sticky !important;
        top: 0 !important;
        height: 100vh !important;
      }
      #sidebarToggle {
        display: none !important;
      }
    }
    @media (max-width: 1023px) {
      #sidebar {
        position: fixed !important;
        top: 0 !important;
        bottom: 0 !important;
        left: 0 !important;
        z-index: 50 !important;
        transform: translateX(-100%) !important;
        width: 16rem !important;
        background-color: rgba(255, 255, 255, 0.98) !important;
      }
      #sidebar.sidebar-open {
        transform: translateX(0) !important;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
      }
    }
    @media (min-width: 1024px) {
      #sidebar.sidebar-closed {
        width: 4.75rem !important;
        padding-left: 0.5rem !important;
        padding-right: 0.5rem !important;
      }
      #sidebar.sidebar-closed .sidebar-text {
        display: none !important;
      }
      #sidebar.sidebar-closed .sidebar-header {
        flex-direction: column !important;
        gap: 1rem !important;
        align-items: center !important;
      }
      #sidebar.sidebar-closed .sidebar-toggle-btn {
        margin-left: 0 !important;
      }
      #sidebar.sidebar-closed nav {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
      }
      #sidebar.sidebar-closed nav a {
        justify-content: center !important;
        width: 3.25rem !important;
        height: 3.25rem !important;
        padding: 0 !important;
      }
      #sidebar.sidebar-closed .logout-container {
        border-top-width: 0 !important;
        padding-top: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
      }
      #sidebar.sidebar-closed .logout-container a {
        justify-content: center !important;
        width: 3.25rem !important;
        height: 3.25rem !important;
        padding: 0 !important;
      }
      #sidebar.sidebar-closed .collapse-icon-open {
        display: none !important;
      }
      #sidebar.sidebar-closed .collapse-icon-closed {
        display: block !important;
      }
    }
    @media (max-width: 639px) {
      #headerSearchForm {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Sidebar Backdrop for mobile -->
    <div id="sidebar-backdrop" class="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm hidden lg:hidden"></div>
    
    <aside id="sidebar" class="min-h-screen w-64 border-r border-white/60 bg-white/55 px-4 py-5 backdrop-blur-xl">
      <script>
        if (localStorage.getItem('sidebar_state') === 'closed' && window.innerWidth >= 1024) {
          document.getElementById('sidebar').classList.add('sidebar-closed');
        }
      </script>
      <div>
        <div class="mb-8 flex items-center gap-3 sidebar-header">
          <img class="h-10 w-10 logo-img rounded-xl bg-white object-contain p-1 shadow-sm ring-2 ring-violet-200 transition-all duration-300" src="assets/memomind-logo.jpeg" alt="MemoMind logo">
          <div class="sidebar-text">
            <p class="brand-gradient text-lg font-black leading-tight">MemoMind</p>
            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Study coach</p>
          </div>
          <!-- Sidebar Close/Collapse Button -->
          <button id="sidebarClose" class="sidebar-toggle-btn ml-auto flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-all duration-300" type="button" aria-label="Toggle sidebar">
            <!-- Chevron Left icon (when open) -->
            <svg class="h-5 w-5 collapse-icon-open hidden lg:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <!-- Chevron Right icon (when collapsed) -->
            <svg class="h-5 w-5 collapse-icon-closed hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            <!-- Close cross icon (for mobile) -->
            <svg class="h-5 w-5 lg:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav class="space-y-1">
          <?php foreach ($links as [$href, $label, $icon]): ?>
            <a class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition <?= basename($_SERVER['PHP_SELF']) === $href ? 'nav-active' : 'text-slate-600 hover:bg-white/80 hover:text-ink' ?>" href="<?= $href ?>" title="<?= h($label) ?>">
              <?= $icon ?>
              <span class="sidebar-text"><?= h($label) ?></span>
            </a>
          <?php endforeach; ?>
        </nav>
      </div>

      <!-- Logout at the bottom -->
      <div class="logout-container border-t border-slate-100/60 pt-4 mt-auto">
        <a class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition text-rose-600 hover:bg-rose-50/50 hover:text-rose-700" href="logout.php" title="Logout">
          <svg class="h-5 w-5 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="sidebar-text">Logout</span>
        </a>
      </div>
    </aside>
    <div class="flex min-h-screen flex-1 flex-col">
      <header class="sticky top-0 z-10 border-b border-white/60 bg-white/65 backdrop-blur-xl">
        <div class="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
          <div class="flex items-center gap-3">
            <!-- Sidebar Toggle Button -->
            <button id="sidebarToggle" class="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-white/80 text-violet-600 shadow-sm transition hover:bg-white" type="button" aria-label="Toggle Sidebar">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 class="text-base font-bold text-ink sm:text-lg">Study workspace</h1>
            </div>
          </div>
          <form id="headerSearchForm" action="search.php" method="get" class="w-80 items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-4 py-1.5 text-sm text-slate-500 shadow-sm flex">
            <svg class="h-4 w-4 text-violet-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="search" name="q" placeholder="Search subjects or topics..." class="bg-transparent border-0 outline-none w-full text-ink placeholder-slate-400 py-0.5 text-xs font-semibold" value="<?= h($_GET['q'] ?? '') ?>" required>
          </form>
        </div>
      </header>
      <main class="flex-1 mt-6 px-4 py-6 sm:px-6 lg:px-8">
        <?php if ($message = flash()): ?>
          <p class="mb-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><?= h($message) ?></p>
        <?php endif; ?>
<?php
}

function render_footer(): void
{
?>
      </main>
      <aside class="block border-t border-white/60 bg-white/70 px-3 py-2 backdrop-blur-xl lg:hidden">
        <nav class="grid grid-cols-5 gap-1">
          <a class="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold" href="dashboard.php">Dashboard</a>
          <a class="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold" href="subjects.php">Subjects</a>
          <a class="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold" href="revision.php">Revision</a>
          <a class="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold" href="awards.php">Awards</a>
          <a class="flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold" href="profile.php">Profile</a>
        </nav>
      </aside>
    </div>
  </div>
  <script src="assets/app.js"></script>
</body>
</html>
<?php
}

