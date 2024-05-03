<?php

if (empty($_GET['query'])) {
	echo '';
	exit;
}

$baseDir = 'https://www.google.com';
$queryEncoded = urlencode('movie ' . $_GET['query']);
//$url = "$baseDir/search?q=$queryEncoded&tbm=isch";
$url = "$baseDir/search?as_q=$queryEncoded&imgar=w&udm=2";
$html = file_get_contents($url, false, null, 0, 100000);

if (preg_match_all('/<img[^>]+src="([^"]+)"[^>]*>/', $html, $matches)) {
	$imageUrls = $matches[1];
	if (is_array($imageUrls) && count($imageUrls) >= 3) {
		echo $imageUrls[2];
	} else {
		echo '';
	}
} else {
	echo '';
}
