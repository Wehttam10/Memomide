# MemoMind PHP/MySQL Version

This folder is the PHP/MySQL replacement for the original React/FastAPI app.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Database: MySQL
- Database admin: phpMyAdmin
- Queries: direct SQL with prepared PDO statements

## Setup With XAMPP or MAMP

1. Copy or open this project folder from your local server root.
   - XAMPP example: `htdocs/ai-study-memory-coach/php-app`
   - MAMP example: `htdocs/ai-study-memory-coach/php-app`

2. Start Apache and MySQL.

3. Edit `config.php` if your MySQL username/password is different.
   - XAMPP default is often `root` with an empty password.
   - MAMP default is often `root` / `root` and MySQL port `8889`.

4. Open this in your browser:
   - `http://localhost/ai-study-memory-coach/php-app/setup.php`

5. Click **Run setup**.

6. Sign in at:
   - `http://localhost/ai-study-memory-coach/php-app/login.php`

Demo login:

- Email: `demo@student.com`
- Password: `password123`

## Manual phpMyAdmin Setup

You can also import `schema.sql` in phpMyAdmin, then create an account using `register.php`.
