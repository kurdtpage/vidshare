<?php
	require_once 'php/inc/connect.php';

	function niceTime($time)
	{
		// Calculate hours
		$hours = floor($time / 3600);
		if ($hours == 0) {
			$hours = '';
		} else {
			$hours = $hours . ':';
		}

		// Calculate remaining seconds after removing hours
		$remainder = floor($time) % 3600;

		// Calculate minutes
		$minutes = str_pad(floor($remainder / 60), 2, '0', STR_PAD_LEFT) . ':';

		// Calculate remaining seconds after removing minutes
		$seconds = str_pad(floor($remainder % 60), 2, '0', STR_PAD_LEFT);

		return "$hours$minutes$seconds";
	}

	$sql = 'SELECT
			moviename,
			totalTime
		FROM
			movie
		ORDER BY
			dateAdded,
			moviename
	';
	$stmt = $pdo->run($sql);
?><!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>ShaunTube</title>
	<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" crossorigin="anonymous"
		integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" rel="stylesheet">
	<link rel="stylesheet" href="css/index.css">
</head>
<body>
	<div id="searchdiv" class="fixed-top">
		<input type="text" placeholder="Search..." id="searchinput">
	</div>
	<div id="grid">
		<?php while($movie = $stmt->fetch()) {
			$moviename = $movie['moviename'];
			$friendlyName = str_replace(
				['.', '_', '[', ']', '-', 'mp4', '  '],
				[' ', ' ', ' ', ' ', ' ', ''   , ' ' ],
				$moviename);
			$nameid = str_replace(' ', '', $friendlyName); ?>
			<div class="card" onclick="watch('<?php echo str_replace('.mp4', '', $moviename); ?>');">
				<img class="card-img-top" id="<?php echo $nameid; ?>" src="img/movie.png"
					alt="<?php echo extractWords($friendlyName, 4); ?>">
				<div class="duration"><?php echo niceTime($movie['totalTime']); ?></div>
				<div class="card-body"><h5 class="card-title"><?php echo $friendlyName; ?></h5></div>
				<script>
					window.addEventListener('DOMContentLoaded', () => {
						fetchThumbnail('<?php echo extractWords($friendlyName, 4); ?>', '<?php echo $nameid; ?>');
					});
				</script>
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
<!--<?php
	flush();

	$directory = dirname(__FILE__) . '/movies/'; //must start and end with a slash
	$media_extensions = ['mkv', 'm4v', 'avi', 'mov', 'flv', 'mpg', 'mpeg']; //these will be converted into .mp4

	if (!is_dir($directory)) {
		exit("Invalid directory path: $directory");
	}

	/**
	 * Gets the first x number of words from a sentence
	 */
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

	foreach (scandir($directory) as $file) {
		$extension = pathinfo($file, PATHINFO_EXTENSION);
		$vttFilename = $directory . pathinfo($directory . $file, PATHINFO_FILENAME) . '.vtt';

		if ($extension == 'mp4') {
			//get time of video
			// Execute ffmpeg command to get video duration
			$cmd = "ffmpeg -i '$directory$file' 2>&1 | grep Duration";
			$output = null;
			exec($cmd, $output);

			// Parse the output to extract the duration
			$duration = 0;
			foreach ($output as $line) {
				if (preg_match('/Duration: (\d+):(\d+):(\d+\.\d+)/', $line, $matches)) {
					$hours = intval($matches[1]);
					$minutes = intval($matches[2]);
					$seconds = floatval($matches[3]);
					$duration = $hours * 3600 + $minutes * 60 + $seconds;
					break;
				}
			}

			//insert into database
			$sql = 'INSERT IGNORE INTO `movie` (
				moviename, paused, currentTime, totalTime, dateAdded
			) VALUES (
				:v, 0, 0, :duration, now()
			)';
			$data = [
				'v' => $file,
				'duration' => $duration,
			];
			$stmt = $pdo->run($sql, $data);
		} elseif ($extension == 'srt' && !file_exists($vttFilename)) {
			/* The <video> element can only read .vtt subtitles files, and not .srt, so need to convert it */
			// Read the contents of the file
			if ($inputText = file_get_contents($directory . $file)) {
				// Replace commas with periods for time formatting
				$inputText = preg_replace('/(\d{2}):(\d{2}):(\d{2}),(\d{3})/', '$1:$2:$3.$4', $inputText);

				// Split the text by line breaks
				$lines = explode("\n", $inputText);

				// Reformat each line
				$outputText = "WEBVTT\r\n\r\n";
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

				// Write the new contents back to the file with .vtt extension
				file_put_contents($vttFilename, $outputText);
				unlink($directory . $file); //delete the .srt file
			}
		} elseif (in_array($extension, $media_extensions)) {
			/* The <video> element can only read .mp4 media files, so need to convert it */
			// Assuming $file contains the input file path
			$inputFile = $directory . $file;
			echo "Found $inputFile\r\n";
			$outputFile = $directory . pathinfo($directory . $file, PATHINFO_FILENAME) . '.mp4';

			if (file_exists($outputFile)) {
				echo "The .mp4 exists, so deleting\r\n";
				// Add the output file to the list if successful
				unlink($inputFile);
			} else {
				echo "Converting to .mp4\r\n";
				// Command to execute ffmpeg in the background
				//WARNING: THIS WILL USE 100% CPU FOR 10 MINUTES PER FILE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
				$command = "ffmpeg -i '$inputFile' -map 0:s:0 '$vttFilename' '$outputFile' >/dev/null 2>&1 &";
				echo "Command: $command\r\n";

				// Open a process to execute the command
				$process = proc_open($command, [], $pipes);
			}
		}
	}
?>-->