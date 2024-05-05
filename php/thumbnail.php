<?php

if (empty($_GET['q'])) {
	echo '';
	exit;
}

$baseDir = 'https://www.google.com';
$q = urlencode('movie ' . $_GET['q']);
//$url = "$baseDir/search?q=$q&tbm=isch"; //image search
$url = "$baseDir/search?as_q=$q&imgar=w&udm=2"; //wide image search
$html = file_get_contents($url, false, null, 0, 100000);

if (preg_match_all('/<img[^>]+src="([^"]+)"[^>]*>/', $html, $matches)) {
	$imageUrls = $matches[1];
	if (is_array($imageUrls) && count($imageUrls) >= 3) {
		echo $imageUrls[2]; //first one is the page logo
	} else {
		echo '';
	}
} else {
	echo '';
}
