<?php
$debug = false;
$target_dir = '../movies/'; //must end in a slash

$response = ['ok' => false];
if ($debug) $response['debug']['post'] = $_POST;

$video_files = [
	'video/mp4',
	'video/x-matroska', //mkv
	'video/x-msvideo', //avi
	'video/quicktime', //mov
	'video/mpeg',
	'video/webm',
	'video/ogg',
	'video/3gpp',
	'video/x-flv',
];

function parse_size($size)
{
	// Remove the non-number characters
	$unit = preg_replace('/[^bkmgtpezy]/i', '', $size);
	// Remove the non-numeric characters
	$size = preg_replace('/[^0-9\.]/', '', $size);
	if ($unit) {
		// Find the position of the unit in the string
		return round($size * pow(1024, stripos('bkmgtpezy', $unit[0])));
	} else {
		// If no unit, assume bytes
		return round($size);
	}
}

if (!isset($_FILES['fileToUpload'])) {
	$response['error'] = 'Sorry, there is no file to upload.';
	echo json_encode($response);
	die();
}

$target_file = $target_dir . basename($_FILES['fileToUpload']['name']);
if ($debug) $response['debug']['target_file'] = $target_file;

// Specify a size limit (in bytes)
//$maxSize = 5000000; // 5MB

// Get the upload_max_filesize value from the PHP configuration
// Convert to bytes
$maxSize = parse_size(ini_get('upload_max_filesize'));
if ($debug) $response['debug']['maxSize'] = $maxSize;

if ($_FILES['fileToUpload']['size'] > $maxSize) {
	$response['error'] = 'Sorry, your video is larger than the max file size. Please upload a smaller file.';
} else {
	if (!in_array($_FILES['fileToUpload']['type'], $video_files)) {
		$response['error'] = 'Sorry but files of that type are not allowed. Please upload a video file.';
	} else {
		if (file_exists($target_file)) {
			$response['error'] = 'Sorry, the file already exists. Please rename and try again.';
		} else {
			if (move_uploaded_file($_FILES['fileToUpload']['tmp_name'], $target_file)) {
				//TODO: Add to database, convert, etc
				$response['error'] = 'The video ' . htmlspecialchars(basename( $_FILES['fileToUpload']['name'])) . ' has been successfully uploaded.';
				$response['ok'] = true;
			} else {
				$response['error'] = 'Sorry, there was an error uploading your video. Please try again.';
			}
		}
	}
}

echo json_encode($response);
