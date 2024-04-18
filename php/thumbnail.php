<?php

function getThumbnail($query)
{
	$baseDir = 'https://www.google.com';
	$queryEncoded = urlencode('movie ' . $query);
	$url = "$baseDir/search?q=$queryEncoded&tbm=isch";
	$html = file_get_contents($url, false, null, 0, 100000);

	if (preg_match_all('/<img[^>]+src="([^"]+)"[^>]*>/', $html, $matches)) {
		$imageUrls = $matches[1];
		if (is_array($imageUrls) && count($imageUrls) >= 3) {
			return $imageUrls[2];
		} else {
			return '';
		}
	} else {
		return '';
	}
}

if (empty($_GET['query'])) {
	echo '';
	exit;
}

echo getThumbnail($_GET['query']);
