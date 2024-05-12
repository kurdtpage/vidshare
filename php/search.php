<?php

$debug = true;

$response = ['ok' => false];
if ($debug) $response['get'] = $_GET;

if (!isset($_GET['q'])) {
	$response['error'] = 'Missing data';
	echo json_encode($response);
	exit;
}

require_once 'inc/connect.php';

$q = '%' . $_GET['q'] . '%';

if ($q == '%%' || $q == '%null%') {
	$q = '%';
}

//get movie
$sql = 'SELECT
	moviename,
	totalTime
FROM
	movie
WHERE
	moviename like :q
ORDER by
	dateAdded,
	moviename
';
$data = [
	'q' => $q
];

if ($debug) $response['sql'] = $pdo->niceQuery($sql, $data);
$stmt = $pdo->run($sql, $data);

while ($movie = $stmt->fetch()) {
	$response['videos'][] = $movie;
}

$response['ok'] = true;
echo json_encode($response);
