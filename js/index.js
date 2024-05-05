// Define a function to fetch thumbnails asynchronously
function fetchThumbnail(friendlyName, nameid) {
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				// On successful response, add thumbnail to the container
				const thumbnailUrl = xhr.responseText;

				if (thumbnailUrl != '' && document.getElementById(nameid) !== null) {
					document.getElementById(nameid).src = thumbnailUrl;
				}
			} else {
				console.error('Error fetching thumbnail:', xhr.statusText);
			}
		}
	};
	xhr.open('GET', 'php/thumbnail.php?q=' + encodeURIComponent(friendlyName), true);
	xhr.send();
}

function watch (file) {
	window.location = `watch.php?v=${file}`;
}

function extractWords(str = '', numWords = 3) {
	// Split the string into words
	const words = str.split(' ');

	// Take the first three words
	const firstThreeWords = words.slice(0, numWords);

	// Join the words back into a string
	const result = firstThreeWords.join(' ');

	return result;
}

function niceTime(time) {
	// Calculate hours
	let hours = Math.floor(time / 3600);
	hours = hours === 0 ? '' : hours + ':';

	// Calculate remaining seconds after removing hours
	let remainder = Math.floor(time) % 3600;

	// Calculate minutes
	const minutes = String(Math.floor(remainder / 60)).padStart(2, '0') + ':';

	// Calculate remaining seconds after removing minutes
	const seconds = String(Math.floor(remainder % 60)).padStart(2, '0');

	return `${hours}${minutes}${seconds}`;
}

let timeoutId;
document.getElementById('searchinput').addEventListener('keyup', (event) => {
	clearTimeout(timeoutId);
	const q = document.getElementById('searchinput').value;
	if (q != '') {
		timeoutId = setTimeout(() => {
			const xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) {
						const response = JSON.parse(xhr.responseText);
						if (response.ok) {
							console.log(response.videos);
							const grid = document.getElementById('grid');
							grid.innerHTML = '';
							response.videos.forEach(video => {
								const moviename = video.moviename;
								const friendlyName = moviename
									.replace(/\./g, ' ')
									.replace(/_/g, ' ')
									.replace(/\[/g, ' ')
									.replace(/\]/g, ' ')
									.replace(/-/g, ' ')
									.replace(/mp4/g, '')
									.replace(/\s+/g, ' ');
								const nameid = friendlyName.replace(' ', '');
								const newdiv = document.createElement('div');
								newdiv.className = 'card';
								newdiv.onclick = function() { watch(moviename.replace('.mp4', '')); };
								newdiv.innerHTML = `
									<img class="card-img-top" id="${nameid}" src="img/movie.png"
										alt="${extractWords(friendlyName, 4)}">
									<div class="duration">${niceTime(video.totalTime)}</div>
									<div class="card-body"><h5 class="card-title">${friendlyName}</h5></div>
								`;
								grid.appendChild(newdiv);
								fetchThumbnail(extractWords(friendlyName, 4), nameid);
							});
						}
					} else {
						console.error('Error searching for "' + q + '":', xhr.statusText);
					}
				}
			};
			xhr.open('GET', 'php/search.php?q=' + q, true);
			xhr.send();
		}, 1000); // Wait for 1 second before making the request
	}
});
