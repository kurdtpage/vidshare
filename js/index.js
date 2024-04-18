// Define a function to fetch thumbnails asynchronously
function fetchThumbnail(fileName, friendlyName) {
	const container = document.getElementById('thumbnailContainer');
	const xhr = new XMLHttpRequest();
	xhr.open('GET', 'php/thumbnail.php?query=' + encodeURIComponent(friendlyName), true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			//define default thumbnail
			let thumbnail = '<div class="card" onclick="window.location=\'watch.html?v=' + fileName + '\';">' +
				'<img class="card-img-top" alt="' + friendlyName + '" src="img/movie.png">' +
				'<div class="card-body"><h5 class="card-title">' + friendlyName + '</h5></div>' +
				'</div>';

			if (xhr.status === 200) {
				// On successful response, add thumbnail to the container
				const thumbnailUrl = xhr.responseText;

				if (thumbnailUrl != '') {
					thumbnail = '<div class="card" onclick="window.location=\'watch.html?v=' + fileName + '\';">' +
						'<img class="card-img-top" alt="' + friendlyName + '" src="' + thumbnailUrl + '">' +
						'<div class="card-body"><h5 class="card-title">' + friendlyName + '</h5></div>' +
						'</div>';
				}
			} else {
				console.error('Error fetching thumbnail:', xhr.statusText);
			}

			container.innerHTML += thumbnail;
		}
	};

	xhr.send();
}
