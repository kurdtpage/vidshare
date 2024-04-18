<?php
	$allowedFiles = array(
		'avi',
		'mkv',
		'mov',
		'mp4',
	);
	$columns = 4;

	$directory = dirname(__FILE__) . '/movies';

	if (!is_dir($directory)) {
		exit("Invalid directory path: $directory");
	}

	require_once 'php/inc/connect.php';

	$files = array();
	foreach (scandir($directory) as $file) {
		if (in_array(pathinfo($file, PATHINFO_EXTENSION), $allowedFiles)) {
			$files[] = $file;

			$sql = 'INSERT IGNORE INTO movie (moviename, paused, currentTime) VALUES (:v, 0, 0)';
			$data = ['v' => $file];
			$stmt = $pdo->run($sql, $data);
		} elseif (pathinfo($file, PATHINFO_EXTENSION) == 'srt') {
			// Read the contents of the file
			if ($inputText = file_get_contents("$directory/$file")) {
				// Replace commas with periods for time formatting
				$inputText = preg_replace('/(\d{2}):(\d{2}):(\d{2}),(\d{3})/', '$1:$2:$3.$4', $inputText);

				// Split the text by line breaks
				$lines = explode("\n", $inputText);

				// Reformat each line
				$outputText = '';
				foreach ($lines as $line) {
					if (preg_match('/^\d+\s*$/', $line)) {
						// Chapter number
						$outputText .= $line . "\n";
					} elseif (strpos($line, '-->') !== false) {
						// Time line
						$outputText .= $line . "\n";
					} elseif (!empty($line)) {
						// Subtitle line
						$outputText .= $line . "\n";
					} else {
						// Empty line
						$outputText .= "\n";
					}
				}

				// Add WEBVTT header
				$outputText = 'WEBVTT' . "\n\n" . $outputText;

				// Write the new contents back to the file with .vtt extension
				$newFilename = $directory . '/' . pathinfo("$directory/$file", PATHINFO_FILENAME) . '.vtt';
				file_put_contents($newFilename, $outputText);
			}
		}
	}

	sort($files, SORT_NATURAL | SORT_FLAG_CASE); //case insentivie sort
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
		<?php foreach ($files as $index => $file) { ?>
			<?php $friendlyName = str_replace(['.', '_', '[', ']', '-', '  '], [' ', ' ', ' ', ' ', ' ', ' '], $file); ?>
			<script>
				// Call the function to fetch thumbnail for each file
				window.addEventListener('DOMContentLoaded', function() {
					fetchThumbnail('<?php echo $file; ?>', '<?php echo $friendlyName; ?>');
				});
			</script>
		<?php } ?>
	</div>

	<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
		integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
		crossorigin="anonymous">
	</script>
	<script type="application/javascript" src="js/index.js"></script>
</body>
</html>