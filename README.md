
# About
This project allows groups of people to watch the same movie together. If someone pauses the movie, then it will pause for everybody else watching that movie too. It also allows people to chat and share their thoughts of what is going on in the movie.

## Setup
- Copy all code into `/var/www/html/vidshare/`
- Make sure PHP and MySQL/MariaDB have been set up correctly
- Run the SQL in `/var/www/html/vidshare/schema.sql`
- Edit `/var/www/html/vidshare/php/inc/credentials.php` and enter the following:
 ```php
<?php
$hostname = 'localhost';
$database = 'vidshare';
$username = 'username';
$password = 'password';
$char_set = 'utf8mb4';
```
- Copy some movie files into `/var/www/html/vidshare/movies/`
- Share your website URL and watch with your friends

## Issues
Sometimes the movie file does not load. Refreshing the page will fix it