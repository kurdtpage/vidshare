const debug = false;

/**
 * Gets thumbnail images
 * @param {string} friendlyName Text to search for
 * @param {string} nameid This id will be replaced by the image. <img id="nameid" src="">
 */
function fetchThumbnail(friendlyName, nameid) {
	//first try via client, might get CORS error
	const baseDir = 'https://www.google.com';
	const q = encodeURIComponent(friendlyName);
	const url = `${baseDir}/search?as_q=${q}&imgar=w&udm=2`; //wide image search
	
	fetch(url)
		.then(response => response.text())
		.then(html => {
			const matches = html.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/g);
			const imageUrls = [];
			for (const match of matches) {
				imageUrls.push(match[1]);
			}
		
			if (imageUrls.length >= 2) { //first one is the page logo
				//console.log(imageUrls[1]);
				document.getElementById(nameid).src = imageUrls[1];
			}
		})
		.catch(() => {
			//failed via client, now try via server
			const xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function() {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status === 200) {
						const response = JSON.parse(xhr.responseText);
						// On successful response, add thumbnail to the container
						if (response.ok) {
							const thumbnailUrl = response.thumb;

							if (thumbnailUrl != '' && document.getElementById(nameid) !== null) {
								document.getElementById(nameid).src = thumbnailUrl;
							}
						} else {
							console.error(response.error);
						}
					} else {
						console.error('Error fetching thumbnail:', xhr.statusText);
					}
				}
			};
			xhr.open('GET', 'php/thumbnail.php?q=' + encodeURIComponent(friendlyName), true);
			xhr.send();
		});
}

/**
 * Redirects to a video file
 * @param {string} file Filename of video to watch. Does not end in .mp4
 */
function watch (file) {
	window.location = `watch.php?v=${file}`;
}

/**
 * Gets some words from the start of a sentence
 * @param {string} str The string to reduce
 * @param {int} numWords Number of words to return
 * @returns 
 */
function extractWords(str = '', numWords = 3) {
	// Split the string into words
	const words = str.split(' ');

	// Take the first three words
	const firstThreeWords = words.slice(0, numWords);

	// Join the words back into a string
	const result = firstThreeWords.join(' ');

	return result;
}

/**
 * Converts seconds into 15 minute intervals
 * @param {number} time Number of seconds
 * @returns {string} A nicely formatted time
 */
function niceTime(time) {
	// Calculate hours
	let hours = Math.floor(time / 3600);
	hours = hours === 0 ? '' : hours + ' hour ';

	// Calculate remaining seconds after removing hours
	let remainder = Math.floor(time) % 3600;

	// Calculate minutes, rounding to the nearest 15-minute interval
	let minutes = Math.round(remainder / 60 / 15) * 15;
	minutes = minutes <= 1 ? '' : minutes + ' minutes';

	return `${hours}${minutes}`;
}

/**
 * Refreshes the page with video files
 */
function refresh() {
	//priority is search input is #1, URL is #2
	let q = new URLSearchParams(window.location.search).get('s'); //this might get overwritten
	const searchinput = document.getElementById('searchinput').value;
	if (searchinput != '') {
		q = searchinput;
	}

	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200) {
				const response = JSON.parse(xhr.responseText);
				if (response.ok && typeof response.videos !== null) {
					if(debug) console.log(response.videos);
					grid.innerHTML = '';
					response.videos.forEach(video => {
						const moviename = video.moviename;
						const friendlyName = moviename
							.replace(/\./g, ' ') //period
							.replace(/_/g, ' ') //underscore
							.replace(/\[/g, ' ') //square bracket left
							.replace(/\]/g, ' ') //square bracket right
							.replace(/\(/g, ' ') //curved bracket left
							.replace(/\)/g, ' ') //curved bracket right
							.replace(/-/g, ' ') //minus
							.replace(/mp4/g, '') //mp4
							.replace(/\s+/g, ' '); //whitespace
						const nameid = friendlyName.replace(' ', '');
						const newdiv = document.createElement('div');
						newdiv.className = 'card';
						newdiv.onclick = function() {
							watch(moviename.replace('.mp4', ''));
						};
						newdiv.innerHTML = `
							<img class="card-img-top" id="${nameid}" src="img/movie.png"
								alt="${extractWords(friendlyName, 4)}">
							<div class="card-body"><h5 class="card-title">${friendlyName}</h5></div>
							<div class="duration">${niceTime(video.totalTime)}</div>
						`;
						grid.appendChild(newdiv);
						fetchThumbnail(extractWords(friendlyName, 4), nameid);
					});
				} else {
					console.error(response.error);
				}
			} else {
				console.error('Error searching for "' + q + '":', xhr.statusText);
			}
		}
	};
	xhr.open('GET', 'php/search.php?q=' + q, true);
	xhr.send();
}

/**
 * Drag and drop
 * @param {object} evt Event object
 */
function fileDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	const files = evt.dataTransfer.files; // FileList object.

	if (debug) {
		console.log(evt);
		console.log(files);
	}

	// files is a FileList of File objects. List some properties.
	for (let i = 0, f; f = files[i]; i++) {
		if(debug) console.log(f);
		// Check if the file is a video file
		if (f.type.startsWith('video/')) {
			uploadFile(f);
		} else {
			alert('Sorry only video files are allowed.');
		}
	}
}

/**
 * Uploads a file
 * @param {file} file The file
 */
function uploadFile(file) {
	//show progress bar
	document.getElementsByClassName('wrap-circles')[0].style.display = 'flex';
	const url = 'php/upload.php';
	const formData = new FormData();

	formData.append('fileToUpload', file);

	const xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.onload = function() {
		if (xhr.status === 200) {
			const response = JSON.parse(xhr.response);
			if (response.ok) {
				console.log("Upload successful!");
			} else {
				alert(response.error);
			}
		} else {
			alert("Error uploading files. Please try again.");
		}

		//hide progress bar
		document.getElementsByClassName('wrap-circles')[0].style.display = 'none';
	};
	xhr.upload.onprogress = e => {
		let percentComplete = 50;

		if (e.lengthComputable) {
			percentComplete = (e.loaded / e.total) * 100;
		}

		const inner = document.getElementById('inner');
		const circle = document.getElementById('circle');

		if (percentComplete == 100) {
			circle.style.backgroundImage = `conic-gradient(green ${percentComplete}%, black 0)`;
			inner.innerText = 'Finalizing';
		} else {
			circle.style.backgroundImage = `conic-gradient(white ${percentComplete}%, black 0)`;
			inner.innerText = `${Math.round(percentComplete)}%`;
		}

	};
	xhr.send(formData);
}

/**
 * This fires when a user drags a file over the div, but has not dropped yet
 * @param {object} evt Event object
 */
function fileDragOver(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

let timeoutId;
/**
 * When someone searches for something
 */
document.getElementById('searchinput').addEventListener('keyup', (event) => {
	clearTimeout(timeoutId);
	timeoutId = setTimeout(() => {
		refresh();
	}, 1000); // Wait for 1 second before making the request
});

document.addEventListener('DOMContentLoaded', function(event) {
    refresh();
	document.getElementById('searchinput').focus();
});

const grid = document.getElementById('grid');
// Setup the dnd listeners.
grid.addEventListener('dragover', fileDragOver, false);
grid.addEventListener('drop', fileDrop, false);
