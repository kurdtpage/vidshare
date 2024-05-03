<?php

$debug = false;

$response = ['ok' => false];
if ($debug) $response['get'] = $_GET;

if (empty($_GET['v'])) {
	$response['error'] = 'Missing data';
	echo json_encode($response);
	exit;
}

require_once 'inc/connect.php';

$v = $_GET['v'] . '.mp4';

//get movie status
$sql = 'SELECT
	paused,
	currentTime
FROM
	movie
WHERE
	moviename = :v
';
$data = [
	'v' => $v
];

if ($debug) $response['sql']['video'] = $pdo->niceQuery($sql, $data);
$stmt = $pdo->run($sql, $data);

if ($movie = $stmt->fetch()) {
	$response['video'] = $movie;
}

//get chat
$sql = "SELECT
	username,
	usertext,
	usertime
From
	chat Left Join
	movie On movie.id = chat.movie
Where
	moviename = :v and
	STR_TO_DATE(REPLACE(REPLACE(usertime, '_', ' '), 'x', ':'), '%Y-%m-%d %H:%i:%s') >= DATE_SUB(NOW(), INTERVAL 10 SECOND)
";
$data = [
	'v' => $v
];
if ($debug) $response['sql']['chat'] = $pdo->niceQuery($sql, $data);
$stmt = $pdo->run($sql, $data);

while ($chat = $stmt->fetch()) {
	$response['chat'][] = [
		'username' => $chat['username'] == '' ? 'Anonymous' : $chat['username'],
		'usertext' => $chat['usertext'],
		'usertime' => $chat['usertime']
	];
}

$response['ok'] = true;
echo json_encode($response);
