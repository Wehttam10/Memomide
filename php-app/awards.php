<?php
require __DIR__ . '/includes/bootstrap.php';
require __DIR__ . '/includes/layout.php';

$user = require_login();
$pdo = db();

// --- 1. DAILY PROGRESS CALCULATIONS ---
$userId = (int)$user['id'];

// Move Ring: Notes written today (Goal: 1 note)
$notesTodayStmt = $pdo->prepare('
    SELECT COUNT(*) 
    FROM notes n 
    JOIN topics t ON t.id = n.topic_id 
    JOIN subjects s ON s.id = t.subject_id 
    WHERE s.user_id = ? AND n.created_at >= CURDATE()
');
$notesTodayStmt->execute([$userId]);
$notesToday = (int)$notesTodayStmt->fetchColumn();

// Exercise Ring: Attempts made today (Goal: 3 attempts)
$attemptsTodayStmt = $pdo->prepare('
    SELECT COUNT(*) 
    FROM attempts 
    WHERE user_id = ? AND created_at >= CURDATE()
');
$attemptsTodayStmt->execute([$userId]);
$attemptsToday = (int)$attemptsTodayStmt->fetchColumn();

// Stand Ring: Unique topics practiced today (Goal: 2 unique topics)
$topicsPracticedTodayStmt = $pdo->prepare('
    SELECT COUNT(DISTINCT q.topic_id) 
    FROM attempts a 
    JOIN questions q ON q.id = a.question_id 
    WHERE a.user_id = ? AND a.created_at >= CURDATE()
');
$topicsPracticedTodayStmt->execute([$userId]);
$topicsPracticedToday = (int)$topicsPracticedTodayStmt->fetchColumn();

// Goals
$goalNotes = 1;
$goalAttempts = 3;
$goalTopics = 2;

// Ratios
$ratioNotes = min(1.0, $notesToday / $goalNotes);
$ratioAttempts = min(1.0, $attemptsToday / $goalAttempts);
$ratioTopics = min(1.0, $topicsPracticedToday / $goalTopics);


// --- 2. MILESTONE AWARDS EVALUATION (ON-THE-FLY) ---

$awards = [];

// Award 1: First Steps (First Subject created)
$firstSubjectStmt = $pdo->prepare('SELECT MIN(created_at) FROM subjects WHERE user_id = ?');
$firstSubjectStmt->execute([$userId]);
$firstSubjectDate = $firstSubjectStmt->fetchColumn();
$awards[] = [
    'id' => 'first_steps',
    'title' => 'First Steps',
    'desc' => 'Created your first subject category.',
    'unlocked' => !empty($firstSubjectDate),
    'date' => $firstSubjectDate,
    'icon' => '🌱',
    'color' => 'from-emerald-400 to-teal-500 shadow-emerald-500/20'
];

// Award 2: Scholar (First Attempt made)
$firstAttemptStmt = $pdo->prepare('SELECT MIN(created_at) FROM attempts WHERE user_id = ?');
$firstAttemptStmt->execute([$userId]);
$firstAttemptDate = $firstAttemptStmt->fetchColumn();
$awards[] = [
    'id' => 'scholar',
    'title' => 'The Scholar',
    'desc' => 'Completed your first practice question attempt.',
    'unlocked' => !empty($firstAttemptDate),
    'date' => $firstAttemptDate,
    'icon' => '📖',
    'color' => 'from-violet-400 to-indigo-500 shadow-violet-500/20'
];

// Award 3: Knowledge Builder (First Note added)
$firstNoteStmt = $pdo->prepare('
    SELECT MIN(n.created_at) 
    FROM notes n 
    JOIN topics t ON t.id = n.topic_id 
    JOIN subjects s ON s.id = t.subject_id 
    WHERE s.user_id = ?
');
$firstNoteStmt->execute([$userId]);
$firstNoteDate = $firstNoteStmt->fetchColumn();
$awards[] = [
    'id' => 'knowledge_builder',
    'title' => 'Knowledge Builder',
    'desc' => 'Wrote your first set of topic study notes.',
    'unlocked' => !empty($firstNoteDate),
    'date' => $firstNoteDate,
    'icon' => '✍️',
    'color' => 'from-sky-400 to-blue-500 shadow-sky-500/20'
];

// Award 4: Perfect Score (10/10 Score on any attempt)
$perfectScoreStmt = $pdo->prepare('SELECT MIN(created_at) FROM attempts WHERE user_id = ? AND score >= 10.0');
$perfectScoreStmt->execute([$userId]);
$perfectScoreDate = $perfectScoreStmt->fetchColumn();
$awards[] = [
    'id' => 'perfect_score',
    'title' => 'Perfect Score',
    'desc' => 'Scored a perfect 10/10 on a practice attempt.',
    'unlocked' => !empty($perfectScoreDate),
    'date' => $perfectScoreDate,
    'icon' => '🎯',
    'color' => 'from-rose-400 to-red-500 shadow-rose-500/20'
];

// Award 5: Night Owl (Completed attempt between 10 PM and 4 AM)
$nightOwlStmt = $pdo->prepare('
    SELECT MIN(created_at) 
    FROM attempts 
    WHERE user_id = ? AND (HOUR(created_at) >= 22 OR HOUR(created_at) < 4)
');
$nightOwlStmt->execute([$userId]);
$nightOwlDate = $nightOwlStmt->fetchColumn();
$awards[] = [
    'id' => 'night_owl',
    'title' => 'Night Owl',
    'desc' => 'Completed a practice session late at night (10 PM - 4 AM).',
    'unlocked' => !empty($nightOwlDate),
    'date' => $nightOwlDate,
    'icon' => '🦉',
    'color' => 'from-fuchsia-500 to-purple-800 shadow-fuchsia-500/20'
];

// Award 6: Early Bird (Completed attempt between 5 AM and 9 AM)
$earlyBirdStmt = $pdo->prepare('
    SELECT MIN(created_at) 
    FROM attempts 
    WHERE user_id = ? AND (HOUR(created_at) >= 5 AND HOUR(created_at) < 9)
');
$earlyBirdStmt->execute([$userId]);
$earlyBirdDate = $earlyBirdStmt->fetchColumn();
$awards[] = [
    'id' => 'early_bird',
    'title' => 'Early Bird',
    'desc' => 'Completed a practice session early in the morning (5 AM - 9 AM).',
    'unlocked' => !empty($earlyBirdDate),
    'date' => $earlyBirdDate,
    'icon' => '🌅',
    'color' => 'from-amber-400 to-orange-500 shadow-amber-500/20'
];

// Award 7: Study Streak (Attempts on 3 consecutive days)
$streakDatesStmt = $pdo->prepare('
    SELECT DISTINCT DATE(created_at) as attempt_date 
    FROM attempts 
    WHERE user_id = ? 
    ORDER BY attempt_date ASC
');
$streakDatesStmt->execute([$userId]);
$attemptDates = $streakDatesStmt->fetchAll();

$streakDate = null;
if (count($attemptDates) >= 3) {
    for ($i = 0; $i <= count($attemptDates) - 3; $i++) {
        $d1 = new DateTime($attemptDates[$i]['attempt_date']);
        $d2 = new DateTime($attemptDates[$i+1]['attempt_date']);
        $d3 = new DateTime($attemptDates[$i+2]['attempt_date']);
        
        $diff1 = $d1->diff($d2)->days;
        $diff2 = $d2->diff($d3)->days;
        
        if ($diff1 === 1 && $diff2 === 1) {
            $streakDate = $attemptDates[$i+2]['attempt_date'] . ' 12:00:00';
            break;
        }
    }
}
$awards[] = [
    'id' => 'streak_maker',
    'title' => 'Streak Maker',
    'desc' => 'Practiced topics on three consecutive days.',
    'unlocked' => !empty($streakDate),
    'date' => $streakDate,
    'icon' => '🔥',
    'color' => 'from-orange-400 to-red-600 shadow-orange-500/20'
];

// Award 8: Memory Master (3+ Topics status Strong)
$strongTopicsStmt = $pdo->prepare('
    SELECT t.created_at 
    FROM topics t 
    JOIN subjects s ON s.id = t.subject_id 
    WHERE s.user_id = ? AND t.status = "Strong" 
    ORDER BY t.created_at ASC
');
$strongTopicsStmt->execute([$userId]);
$strongTopics = $strongTopicsStmt->fetchAll();
$memoryMasterDate = (count($strongTopics) >= 3) ? $strongTopics[2]['created_at'] : null;
$awards[] = [
    'id' => 'memory_master',
    'title' => 'Memory Master',
    'desc' => 'Brought at least three study topics to a Strong status.',
    'unlocked' => !empty($memoryMasterDate),
    'date' => $memoryMasterDate,
    'icon' => '🧠',
    'color' => 'from-cyan-400 to-blue-600 shadow-cyan-500/20'
];

// Award 9: Super Scholar (10+ total practice attempts)
$totalAttemptsStmt = $pdo->prepare('SELECT created_at FROM attempts WHERE user_id = ? ORDER BY created_at ASC LIMIT 10');
$totalAttemptsStmt->execute([$userId]);
$allAttempts = $totalAttemptsStmt->fetchAll();
$superScholarDate = (count($allAttempts) >= 10) ? $allAttempts[9]['created_at'] : null;
$awards[] = [
    'id' => 'super_scholar',
    'title' => 'Super Scholar',
    'desc' => 'Logged 10 or more total revision attempts.',
    'unlocked' => !empty($superScholarDate),
    'date' => $superScholarDate,
    'icon' => '🏆',
    'color' => 'from-yellow-400 to-amber-500 shadow-yellow-500/20'
];

render_header('Awards & Activity', $user);
?>
<div class="space-y-6">
  
  <!-- Rings Header Card -->
  <section class="celebration-card relative overflow-hidden rounded-2xl shadow-sm p-6 sm:p-8">
    <div class="relative grid gap-6 lg:grid-cols-[280px_1fr] items-center">
      
      <!-- Concentric SVG Activity Rings -->
      <div class="flex justify-center">
        <div class="relative h-56 w-56">
          <svg class="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
            <!-- Background Rings -->
            <circle class="text-rose-100/20" stroke="currentColor" stroke-width="6" fill="transparent" r="40" cx="50" cy="50" />
            <circle class="text-teal-100/20" stroke="currentColor" stroke-width="6" fill="transparent" r="32" cx="50" cy="50" />
            <circle class="text-violet-100/20" stroke="currentColor" stroke-width="6" fill="transparent" r="24" cx="50" cy="50" />
            
            <!-- Move Ring (Outer - Notes) -->
            <circle class="text-rose-500 transition-all duration-1000 ease-out" 
                    stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="transparent" r="40" cx="50" cy="50" 
                    stroke-dasharray="251.3" 
                    stroke-dashoffset="<?= 251.3 - ($ratioNotes * 251.3) ?>" />
            
            <!-- Exercise Ring (Middle - Attempts) -->
            <circle class="text-teal-500 transition-all duration-1000 ease-out" 
                    stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="transparent" r="32" cx="50" cy="50" 
                    stroke-dasharray="201.1" 
                    stroke-dashoffset="<?= 201.1 - ($ratioAttempts * 201.1) ?>" />
            
            <!-- Stand Ring (Inner - Topics Practiced) -->
            <circle class="text-violet-500 transition-all duration-1000 ease-out" 
                    stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="transparent" r="24" cx="50" cy="50" 
                    stroke-dasharray="150.8" 
                    stroke-dashoffset="<?= 150.8 - ($ratioTopics * 150.8) ?>" />
          </svg>
          <!-- Center Rings Logo Icon -->
          <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-800">
            <span class="text-xs font-bold tracking-widest uppercase opacity-75">Today</span>
            <span class="text-2xl font-black brand-gradient">Rings</span>
          </div>
        </div>
      </div>
      
      <!-- Stats breakdown -->
      <div class="space-y-4">
        <h2 class="text-2xl font-black text-ink">Close your study rings today</h2>
        <p class="text-sm text-slate-600">Close each ring by completing your daily targets. Consistent progress builds strong neural paths!</p>
        
        <div class="grid gap-3 sm:grid-cols-3">
          <!-- Move Ring Card (Notes) -->
          <div class="flex items-center gap-3 rounded-xl border border-white/60 bg-white/50 p-3 shadow-sm backdrop-blur">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500 text-white font-bold">✍️</div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Notes Written</p>
              <p class="text-base font-black text-ink"><?= $notesToday ?> <span class="text-xs font-normal text-slate-500">/ <?= $goalNotes ?></span></p>
            </div>
          </div>
          
          <!-- Exercise Ring Card (Attempts) -->
          <div class="flex items-center gap-3 rounded-xl border border-white/60 bg-white/50 p-3 shadow-sm backdrop-blur">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-white font-bold">🎯</div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions Done</p>
              <p class="text-base font-black text-ink"><?= $attemptsToday ?> <span class="text-xs font-normal text-slate-500">/ <?= $goalAttempts ?></span></p>
            </div>
          </div>
          
          <!-- Stand Ring Card (Topics) -->
          <div class="flex items-center gap-3 rounded-xl border border-white/60 bg-white/55 p-3 shadow-sm backdrop-blur">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-white font-bold">🧠</div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Concepts Ticked</p>
              <p class="text-base font-black text-ink"><?= $topicsPracticedToday ?> <span class="text-xs font-normal text-slate-500">/ <?= $goalTopics ?></span></p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </section>
  
  <!-- Awards Gallery Section -->
  <section class="panel space-y-4">
    <div>
      <h3 class="text-xl font-bold text-ink">Achievements Gallery</h3>
      <p class="text-xs text-slate-500 mt-1">Unlock badges as you hit study milestones and develop positive habits.</p>
    </div>
    
    <div class="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
      <?php foreach ($awards as $a): ?>
        <div class="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center text-center <?= $a['unlocked'] ? '' : 'grayscale opacity-75' ?>">
          
          <!-- Glow effect for unlocked awards -->
          <?php if ($a['unlocked']): ?>
            <div class="absolute -inset-10 bg-gradient-to-tr <?= $a['color'] ?> opacity-10 blur-xl transition-all group-hover:scale-110"></div>
          <?php endif; ?>
          
          <!-- Badge Icon Container -->
          <div class="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr shadow-md p-1 transition-transform duration-500 group-hover:rotate-12 
            <?= $a['unlocked'] ? $a['color'] : 'from-slate-200 to-slate-300 shadow-slate-300/10 grayscale opacity-45' ?>">
            <span class="text-4xl pointer-events-none"><?= $a['icon'] ?></span>
            
            <!-- Locked Lock Symbol Overlay -->
            <?php if (!$a['unlocked']): ?>
              <div class="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px] rounded-full">
                <svg class="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            <?php endif; ?>
          </div>
          
          <!-- Badge Info -->
          <h4 class="mt-4 font-bold text-sm text-ink <?= $a['unlocked'] ? '' : 'text-slate-500' ?>"><?= h($a['title']) ?></h4>
          <p class="mt-1 text-xs text-slate-500 max-w-[180px] leading-relaxed"><?= h($a['desc']) ?></p>
          
          <!-- Unlock Status Ribbon -->
          <div class="mt-3 w-full border-t border-slate-100/80 pt-2 flex items-center justify-center gap-1.5">
            <?php if ($a['unlocked']): ?>
              <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span class="text-[10px] font-bold text-emerald-600 tracking-wide uppercase">Unlocked <?= date('M j, Y', strtotime($a['date'])) ?></span>
            <?php else: ?>
              <span class="inline-flex h-2 w-2 rounded-full bg-slate-300"></span>
              <span class="text-[10px] font-bold text-slate-400 tracking-wide uppercase">Locked</span>
            <?php endif; ?>
          </div>
          
        </div>
      <?php endforeach; ?>
    </div>
  </section>
  
</div>
<?php
render_footer();
?>
