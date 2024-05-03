<?php
	if (empty($_GET['v'])) {
		header('Location: index.php');
	}
?><!DOCTYPE html> 
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Video player</title>
	<link rel="stylesheet" href="css/watch.css">
</head>
<body>
	<div id="container">
		<div id="video-container">
			<video id="vid" controls>
				<source src="<?php echo 'movies/' . $_GET['v'] . '.mp4'; ?>" id="source" type="video/mp4">
				<track src="<?php echo 'movies/' . $_GET['v'] . '.vtt'; ?>" id="track" label="English" srclang="en"
					kind="subtitles" default>
				Your browser does not support HTML5 video.
			</video>
		</div>

		<div id="chat-container">
			<div id="chat"></div>
			<div id="chatinput">
				<input type="text" id="username" placeholder="Username">
				<input type="text" id="usertext" placeholder="Type something...">
			</div>
		</div>
	</div>
	<script type="application/javascript" src="js/watch.js"></script>
</body> 
</html>
