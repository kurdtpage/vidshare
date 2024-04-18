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

$sql = 'UPDATE movie SET
	paused = :paused,
	currentTime = :currentTime
	WHERE moviename = :v
';
$data = [
	'paused' => $_POST['paused'],
	'currentTime' => $_POST['currentTime'],
	'v' => $_POST['v']
];

if ($debug) $response['sql'][] = $pdo->niceQuery($sql, $data);
$stmt = $pdo->run($sql, $data);

if (!empty($_POST['usertext'])) {
	//get movie id via name
	$sql = 'SELECT id
		FROM movie
		WHERE moviename = :v';
	$data = [
		'v' => $_POST['v']
	];

	if ($debug) $response['sql'][] = $pdo->niceQuery($sql, $data);
	$stmt = $pdo->run($sql, $data);
	if ($movie = $stmt->fetch()) {
		$movieid = $movie['id'];

		//insert into chat
		$sql = 'INSERT INTO chat (
			movie, username, usertext, usertime
		) VALUES (
			:movie, :username, :usertext, :usertime
		)';
		$data = [
			'movie' => $movieid,
			'username' => $_POST['username'],
			'usertext' => $_POST['usertext'],
			'usertime' => $_POST['usertime'],
		];

		if ($debug) $response['sql'][] = $pdo->niceQuery($sql, $data);
		$stmt = $pdo->run($sql, $data);
	}
}

$response['ok'] = true;
echo json_encode($response);
