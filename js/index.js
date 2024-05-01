// Define a function to fetch thumbnails asynchronously
function fetchThumbnail(friendlyName, nameid) {
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				// On successful response, add thumbnail to the container
				const thumbnailUrl = xhr.responseText;

				if (thumbnailUrl != '') {
					document.getElementById(nameid).src = thumbnailUrl;
				}
			} else {
				console.error('Error fetching thumbnail:', xhr.statusText);
			}
		}
	};
	xhr.open('GET', 'php/thumbnail.php?query=' + encodeURIComponent(friendlyName), true);
	xhr.send();
}

function watch (file) {
	window.location = `watch.php?v=${file}`;
}
