<?php
declare(strict_types=1);

session_start();

date_default_timezone_set('Asia/Kuala_Lumpur');

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = require __DIR__ . '/../config.php';
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_port'], $config['db_name']);
    $pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}

function h(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function redirect(string $path): never
{
    header('Location: ' . $path);
    exit;
}

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$_SESSION['user_id']]);
    return $stmt->fetch() ?: null;
}

function require_login(): array
{
    $user = current_user();
    if (!$user) {
        redirect('login.php');
    }
    return $user;
}

function flash(?string $message = null): ?string
{
    if ($message !== null) {
        $_SESSION['flash'] = $message;
        return null;
    }
    $stored = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $stored;
}

function status_for_score(float $score): string
{
    if ($score >= 80) return 'Strong';
    if ($score >= 60) return 'Good';
    if ($score >= 40) return 'Weak';
    return 'Critical';
}

function update_memory_score(float $oldScore, float $answerScore): array
{
    $newScore = round(($oldScore * 0.7) + (($answerScore * 10) * 0.3), 2);
    $newScore = max(0, min(100, $newScore));
    return [$newScore, status_for_score($newScore)];
}

function interval_for_score(float $score): int
{
    if ($score <= 3) return 1;
    if ($score <= 5) return 2;
    if ($score <= 7) return 4;
    if ($score < 9) return 7;
    return 14;
}

function get_subject(int $id, int $userId): ?array
{
    $stmt = db()->prepare('SELECT * FROM subjects WHERE id = ? AND user_id = ?');
    $stmt->execute([$id, $userId]);
    return $stmt->fetch() ?: null;
}

function get_topic(int $id, int $userId): ?array
{
    $stmt = db()->prepare(
        'SELECT t.*, s.name AS subject_name, s.user_id
         FROM topics t
         JOIN subjects s ON s.id = t.subject_id
         WHERE t.id = ? AND s.user_id = ?'
    );
    $stmt->execute([$id, $userId]);
    return $stmt->fetch() ?: null;
}

function keywords(string $text): array
{
    preg_match_all('/[a-zA-Z]{4,}/', strtolower($text), $matches);
    $stop = array_flip(['that', 'with', 'this', 'from', 'have', 'does', 'into', 'used', 'when', 'where', 'what', 'which', 'will', 'their', 'about']);
    return array_values(array_filter($matches[0], fn($word) => !isset($stop[$word])));
}

function generate_mock_questions(string $notes): array
{
    $compact = trim(preg_replace('/\s+/', ' ', $notes));
    $sentences = preg_split('/[\n.!?]+/', $notes);
    $sentences = array_values(array_filter(array_map('trim', $sentences), fn($s) => strlen($s) > 20));
    $base = substr($compact, 0, 600) ?: 'Review the notes and explain the key ideas.';
    $first = $sentences[0] ?? $base;

    return [
        ['question_text' => 'What is the main idea from these notes?', 'expected_answer' => $first, 'question_type' => 'definition', 'difficulty' => 'easy'],
        ['question_text' => 'Explain the concept in your own words.', 'expected_answer' => $base, 'question_type' => 'explanation', 'difficulty' => 'medium'],
        ['question_text' => 'Compare two important details from the notes.', 'expected_answer' => $base, 'question_type' => 'comparison', 'difficulty' => 'medium'],
        ['question_text' => 'How would you apply this idea in a real situation?', 'expected_answer' => $base, 'question_type' => 'scenario', 'difficulty' => 'medium'],
        ['question_text' => 'Why does this topic matter, and what would happen if the key idea was misunderstood?', 'expected_answer' => $base, 'question_type' => 'higher_order', 'difficulty' => 'hard'],
    ];
}

function grade_answer(string $expected, string $student): array
{
    $expectedWords = array_unique(keywords($expected));
    $answerWords = array_unique(keywords($student));
    $matched = count(array_intersect($expectedWords, $answerWords));
    $ratio = count($expectedWords) > 0 ? $matched / count($expectedWords) : 0.5;
    $lengthBonus = min(str_word_count($student) / 45, 1) * 2;
    $score = round(max(0, min(10, ($ratio * 8) + $lengthBonus)), 1);
    if (str_word_count($student) < 8) {
        $score = min($score, 5);
    }
    $missing = array_slice(array_values(array_diff($expectedWords, $answerWords)), 0, 6);
    $missingText = $missing ? implode("\n", array_map(fn($w) => '- Include the idea of ' . $w . '.', $missing)) : '- No major missing points detected.';
    $feedback = $score >= 8 ? 'Strong answer with good coverage.' : ($score < 4 ? 'The answer is too brief or misses the core concepts.' : 'Partially correct but needs more complete detail.');
    return ['score' => $score, 'feedback' => $feedback, 'missing_points' => $missingText, 'corrected_answer' => $expected];
}
