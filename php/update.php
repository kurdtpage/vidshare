<?php

$debug = false;

$response = ['ok' => false];
if ($debug) $response['post'] = $_POST;


if (empty($_POST['v'])) {
	$response['error'] = 'Missing data';
	echo json_encode($response);
	exit;
}

require_once 'inc/connect.php';

$v = $_POST['v'] . '.mp4';

$sql = 'UPDATE movie SET
	paused = :paused,
	currentTime = :currentTime
	WHERE moviename = :v
';
$data = [
	'paused' => $_POST['paused'],
	'currentTime' => $_POST['currentTime'],
	'v' => $v
];

if ($debug) $response['sql'][] = $pdo->niceQuery($sql, $data);
$stmt = $pdo->run($sql, $data);

if (!empty($_POST['usertext'])) {
	//get movie id via name
	$sql = 'SELECT id
		FROM movie
		WHERE moviename = :v';
	$data = [
		'v' => $v
	];

	if ($debug) $response['sql'][] = $pdo->niceQuery($sql, $data);
	$stmt = $pdo->run($sql, $data);
	if ($movie = $stmt->fetch()) {
		$movieid = $movie['id'];

		//insert into chat
		$sql = 'INSERT INTO chat (
			movie, username, usertext, usertime, videotime
		) VALUES (
			:movie, :username, :usertext, :usertime, :videotime
		)';
		$data = [
			'movie' => $movieid,
			'username' => $_POST['username'] == '' ? 'Anonymous' : $_POST['username'],
			'usertext' => $_POST['usertext'],
			'usertime' => $_POST['usertime'],
			'videotime' => $_POST['currentTime'],
		];

		if ($debug) $response['sql'][] = $pdo->niceQuery($sql, $data);
		$stmt = $pdo->run($sql, $data);
	}
}

$response['ok'] = true;
echo json_encode($response);
