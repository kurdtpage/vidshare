<?php

$debug = false;
$folder = 'img/'; //Needs to end in a slash

$response = [
	'ok' => false,
	'thumb' => $folder . 'movie.png' //default image
];

if ($debug) {
	$response['debug']['get'] = $_GET;
	$response['debug']['base_folder'] = $folder;
}

if (empty($_GET['q'])) {
	$response['error'] = 'Missing info';
	echo json_encode($response);
	exit;
}

$q = trim($_GET['q']);

if (file_exists('../' . $folder . $q)) {
	if ($debug) $response['debug']['exists'] = true;
	$response['thumb'] = $folder . $q;
	$response['ok'] = true;
} else {
	if ($debug) $response['debug']['exists'] = false;
	$baseDir = 'https://www.google.com';
	$q = urlencode($q);
	//$url = "$baseDir/search?q=$q&tbm=isch"; //image search
	$url = "$baseDir/search?as_q=$q&imgar=w&udm=2"; //wide image search
	if ($debug) $response['url'] = $url;
	$html = file_get_contents($url, false, null, 0, 100000);

	if (preg_match_all('/<img[^>]+src="([^"]+)"[^>]*>/', $html, $matches)) {
		$imageUrls = $matches[1];

		if (!is_array($imageUrls) || count($imageUrls) < 2) {
			$response['error'] = "No image sources found at '$url'";
			echo json_encode($response);
			exit;
		}

		$imageName = $folder . trim($_GET['q']);

		if ($debug) {
			$response['debug']['imageUrls1'] = $imageUrls[1];
		}

		if ($contents = file_get_contents($imageUrls[1])) {
			if (file_put_contents('../' . $imageName, $contents)) {
				$response['thumb'] = $imageName;
				$response['ok'] = true;
			} else {
				$response['error'] = "Cannot write file to '../$imageName'";
			}
		} else {
			$response['error'] = "Cannot get file contents of '$imageUrls[1]'";
		}
	} else {
		$response['error'] = "No <img> tags found at '$url'";
	}
}

echo json_encode($response);
