const debug = false;
const container = document.getElementById('video-container');
const vid = document.getElementById('vid');
const source = document.getElementById('source');
const track = document.getElementById('track');
const info = document.getElementById('info');
const totalTime = document.getElementById('totalTime');
const pausedid = document.getElementById('paused');
const chat = document.getElementById('chat');
const username = document.getElementById('username');
const usertext = document.getElementById('usertext');
const v = new URLSearchParams(window.location.search).get('v');
let blocked = false; //cant play/pause in rapid succession

/**
 * Resizes the video player to fit the window
 */
function resize() {
	if (debug) console.log('resize()');
	source.src = 'movies/' + v;
	document.title = v;
	if (debug) console.log('source.src', source.src);

	const parts = v.split('.');
	const ext = parts[parts.length - 1];
	source.type = 'video/' + ext;
	
	track.src = 'movies/' + sub(v);

	const width = window.innerWidth - 5;
	vid.width = width + 'px';
	container.style.width = width + 'px';
	document.getElementById('width').innerText = width + 'px';

	const height = window.innerHeight - 10;
	vid.height = height + 'px';
	container.style.height = height + 'px';
	document.getElementById('height').innerText = height + 'px';

	if (debug) console.log(width, height);
}

/**
 * Replaces the extension (e.g. .avi or .mp4) with .vtt
 */
function sub(v) {
	let lastDotIndex = v.lastIndexOf(".");
	if (lastDotIndex !== -1) {
		return v.slice(0, lastDotIndex) + ".vtt";
	} else {
		return v;
	}
}

/**
 * Updates the server with local info (paused, currentTime)
 */
function update() {
	const xmlhttp1 = new XMLHttpRequest();
	xmlhttp1.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			if (JSON.parse(this.responseText).ok) {
				if (debug) console.log('data saved to server');
				usertext.value = '';
			} else {
				console.error(this.responseText);
			}
		}
	};

	const formData = new FormData();

	// Append data to the FormData object
	formData.append('v', v); //movie
	formData.append('paused', vid.paused ? 1 : 0);
	formData.append('currentTime', vid.currentTime);
	if (usertext.value !== '') {
		formData.append('username', username.value);
		formData.append('usertext', usertext.value);
		formData.append('usertime', getCurrentDateTimeString());
	}

	xmlhttp1.open('POST', 'php/update.php', true);
	xmlhttp1.send(formData);
}

/**
 * Gets data from the server (paused, currentTime)
 */
function getData() {
	const xmlhttp2 = new XMLHttpRequest();	
	xmlhttp2.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			const response = JSON.parse(this.responseText); // Parse the response to an array
			if (debug) console.log(response);
			if (response.ok) {
				const vidpaused = vid.paused ? 1 : 0;

				//update video status from server
				if (response.video.paused !== vidpaused) {
					if (response.video.paused == 1) {
						vid.pause();
					} else {
						vid.play();
					}

					vid.currentTime = parseFloat(response.video.currentTime);
				}

				//get chat stuff
				if (typeof response.chat !== 'undefined') {
					response.chat.forEach((data) => {
						const abcDiv = document.getElementById(data.usertime);
						if (abcDiv) {
							//already exists
						} else {
							const newchat = document.createElement('div');
							newchat.setAttribute('id', data.usertime);
							newchat.innerHTML = data.username + ': ' + data.usertext;
							chat.appendChild(newchat);

							// Automatically hide the newchat div after 10 seconds
							setTimeout(function() {
								newchat.style.opacity = '0'; // Set opacity to 0 to start the fade-out effect
								newchat.style.transition = 'opacity 1s'; // Apply a transition effect to opacity property
							}, 10000); // 10 seconds in milliseconds

							// After 11 seconds, remove the div from the DOM
							setTimeout(function() {
								newchat.parentNode.removeChild(newchat);
							}, 11000); // 11 seconds in milliseconds
						}
					});
				}
			} else {
				console.error(response.error);
			}
		}
	};
	xmlhttp2.open('GET', `php/get.php?v=${v}`, true);
	xmlhttp2.send();
}

/**
 * Toggle local playing and paused states
 */
function playPause() {
	if (!blocked) {
		if (vid.paused == 1) {
			vid.play();
		} else {
			vid.pause();
		}

		update();

		pausedid.innerText = vid.paused ? 1 : 0;

		blocked = true;
		setTimeout(function() {
			blocked = false;
		}, 2000);	
	} else {
		console.log('BLOCKED FOR 2 SECONDS DUE TO SPAMMING PLAY/PAUSE');
	}
}

/**
 * Gets a date string. Used for formatting chat DIVs
 * @returns date string
 */
function getCurrentDateTimeString() {
	const now = new Date();
	const Y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
	const d = String(now.getDate()).padStart(2, '0');
	const H = String(now.getHours()).padStart(2, '0');
	const i = String(now.getMinutes()).padStart(2, '0');
	const s = String(now.getSeconds()).padStart(2, '0');

	return `${Y}-${m}-${d}_${H}x${i}x${s}`;
}

/**
 * Event listener for chat. Fired when Enter key is pressed
 */
usertext.addEventListener('keydown', function(event) {
	if (event.key === 'Enter' && usertext.value.trim() !== '') {
		update();
	}
});

/**
 * Allows local user to skip back or forward in the video
 */
document.addEventListener('keydown', function(event) {
	if (event.key === 'ArrowLeft') {
		// Left arrow key pressed
		vid.currentTime = vid.currentTime - 5;
	} else if (event.key === 'ArrowRight') {
		// Right arrow key pressed
		vid.currentTime = vid.currentTime + 5;
	}
});

/**
 * Gets data from the server every seond, then pauses/plays and sets time accordingly
 */
setInterval(function() {
	getData();
}, 1000);

resize();
getData(); //get initial state
