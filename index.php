<?php
	$columns = 4;
	$directory = dirname(__FILE__) . '/movies/'; //must start and end with a slash
	$media_extensions = ['mkv', 'm4v', 'avi', 'mov', 'flv', 'mpg', 'mpeg']; //these will be converted into .mp4

	if (!is_dir($directory)) {
		exit("Invalid directory path: $directory");
	}

	function extractWords($str = '', $numWords = 3)
	{
		// Split the string into words
		$words = explode(' ', $str);

		// Take the first three words
		$firstThreeWords = array_slice($words, 0, $numWords);

		// Join the words back into a string
		$result = implode(' ', $firstThreeWords);

		return $result;
	}

	require_once 'php/inc/connect.php';

	$files = array();
	$allfiles = scandir($directory);
	//sort so files ending in .mp4 are first. Want files in $media_extensions to come AFTER the .mp4 files
	usort($allfiles, function($a, $b) {
		// Check if $a ends with ".mp4" and $b doesn't
		if (substr($a, -4) === '.mp4' && substr($b, -4) !== '.mp4') {
			return -1; // $a should come before $b
		} elseif (substr($a, -4) !== '.mp4' && substr($b, -4) === '.mp4') {
			return 1; // $a should come after $b
		} else {
			return 0; // Order remains unchanged
		}
	});

	sort($allfiles, SORT_NATURAL | SORT_FLAG_CASE); //case insentivie sort

	foreach ($allfiles as $file) {
		$extension = pathinfo($file, PATHINFO_EXTENSION);
		$vttFilename = $directory . pathinfo($directory . $file, PATHINFO_FILENAME) . '.vtt';

		if ($extension == 'mp4') {
			$files[] = $file;

			$sql = 'INSERT IGNORE INTO movie (moviename, paused, currentTime) VALUES (:v, 0, 0)';
			$data = ['v' => $file];
			$stmt = $pdo->run($sql, $data);
		} elseif (in_array($extension, $media_extensions)) {
			/* The <video> element can only read .mp4 media files, so need to convert it */
			// Assuming $file contains the input file path
			$inputFile = $directory . $file;
			$outputFile = $directory . pathinfo($directory . $file, PATHINFO_FILENAME) . '.mp4';

			if (file_exists($outputFile)) {
				// Add the output file to the list if successful
				$files[] = $file;
				unlink($inputFile);
			} else {
				// Command to execute ffmpeg in the background
				$command = "ffmpeg -i '$inputFile' '$outputFile' >/dev/null 2>&1 &"; //this will use 100% CPU for 10 minutes per file!!!!!!

				// Open a process to execute the command
				$process = proc_open($command, [], $pipes);
				break;
			}
		} elseif ($extension == 'srt' && !file_exists($vttFilename)) {
			/* The <video> element can only read .vtt subtitles files, and not .srt, so need to convert it */
			// Read the contents of the file
			if ($inputText = file_get_contents($directory . $file)) {
				// Replace commas with periods for time formatting
				$inputText = preg_replace('/(\d{2}):(\d{2}):(\d{2}),(\d{3})/', '$1:$2:$3.$4', $inputText);

				// Split the text by line breaks
				$lines = explode("\n", $inputText);

				// Reformat each line
				$outputText = '';
				foreach ($lines as $line) {
					if (preg_match('/^\d+\s*$/', $line)) {
						// Chapter number
						$outputText .= $line . "\r\n";
					} elseif (strpos($line, '-->') !== false) {
						// Time line
						$outputText .= $line . "\r\n";
					} elseif (!empty($line)) {
						// Subtitle line
						$outputText .= $line . "\r\n";
					} else {
						// Empty line
						$outputText .= "\r\n";
					}
				}

				// Add WEBVTT header
				$outputText = 'WEBVTT' . "\r\n\r\n" . $outputText;

				// Write the new contents back to the file with .vtt extension
				file_put_contents($vttFilename, $outputText);
			}
		}
	}
?><!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>ShaunTube</title>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
		integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
	<link rel="stylesheet" href="css/index.css">
</head>
<body>
	<div class="row row-cols-1 row-cols-md-<?php echo $columns + 1; ?> g-<?php echo $columns + 1; ?>" id="thumbnailContainer">
		<?php foreach ($files as $file) {
			$friendlyName = str_replace(
				['.', '_', '[', ']', '-', 'mp4', '  '],
				[' ', ' ', ' ', ' ', ' ', ''   , ' ' ],
				$file);
			$nameid = str_replace(' ', '', $friendlyName); ?>
			<div class="card" onclick="watch('<?php echo $file; ?>');">
				<img class="card-img-top" id="<?php echo $nameid; ?>" alt="<?php echo $friendlyName; ?>" src="img/movie.png">
				<script>
					// Call the function to fetch thumbnail for each file
					window.addEventListener('DOMContentLoaded', function() {
						fetchThumbnail('<?php echo extractWords($friendlyName, 3); ?>', '<?php echo $nameid; ?>');
					});
				</script>
				<div class="card-body"><h5 class="card-title"><?php echo $friendlyName; ?></h5></div>				
			</div>
		<?php } ?>
	</div>

	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
		integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
		crossorigin="anonymous">
	</script>
	<script type="application/javascript" src="js/index.js"></script>
</body>
</html>