const debug = true; //extra spam in the console
const v = new URLSearchParams(window.location.search).get('v');
const container = document.getElementById('video-container');
const vid = document.getElementById('vid');
const source = document.getElementById('source');
const track = document.getElementById('track');
const chat = document.getElementById('chat');
const chatInput = document.getElementById('chatinput');
const username = document.getElementById('username');
const usertext = document.getElementById('usertext');
let blocked = false; //cant play/pause in rapid succession

/**
 * Resizes the video player to fit the window
 */
function resize() {
	document.title = v;

	const ext = v.split('.');
	source.type = 'video/' + ext[ext.length - 1];

	track.src = 'movies/' + sub(v);
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
		formData.append('username', username.value === '' ? 'Anonymous' : username.value);
		formData.append('usertext', usertext.value);
		formData.append('usertime', getCurrentDateTimeString());
	}

	xmlhttp1.open('POST', 'php/update.php', true);
	xmlhttp1.send(formData);
}

/**
 * Updates the chat div
 * @param {object} data The response from get.php in the form of {username => '', usertext => '', usertime => ''}
 */
function showChat(data) {
	const chatid = data.username + data.usertime;
	const abcDiv = document.getElementById(chatid);
	if (abcDiv) {
		//already exists
	} else {
		const newchat = document.createElement('div');
		newchat.setAttribute('id', chatid);
		newchat.innerText = data.username + ': ' + data.usertext;
		chat.appendChild(newchat);

		/*
		// Automatically hide the newchat div after 10 seconds
		setTimeout(function() {
			newchat.style.opacity = '0'; // Set opacity to 0 to start the fade-out effect
			newchat.style.transition = 'opacity 1s'; // Apply a transition effect to opacity property
		}, 10000); // 10 seconds in milliseconds

		// After 11 seconds, remove the div from the DOM
		setTimeout(function() {
			newchat.parentNode.removeChild(newchat);
		}, 11000); // 11 seconds in milliseconds
		*/
	}
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
						showChat(data);
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
	if (blocked) {
		showChat({
			username: 'Admin',
			usertext: 'You have been blocked for 5 seconds due to spamming play/pause',
			usertime: getCurrentDateTimeString()
		});
	} else {
		if (vid.paused == 1) {
			vid.play();
			usertext.value = 'Playing the video';
		} else {
			vid.pause();
			usertext.value = 'Paused the video';
		}

		update();
		usertext.value = '';

		blocked = true;
		setTimeout(function() {
			blocked = false;
		}, 5000);
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
 * Event listener for keydown events to handle media controls and user input (chat) based on focus
 */
document.addEventListener('keydown', function(event) {
	switch (document.activeElement.id) {
		case 'usertext':
			if (event.key === 'Enter' && usertext.value.trim() !== '') {
				update();
			}
			break;
		default:
			console.log('Pressed "' + event.code + '" on "' + document.activeElement.id + '"');
			switch (event.code) {
				case 'Space':
					playPause();
					break;
				case 'ArrowLeft':
					vid.currentTime -= 5;
					break;
				case 'ArrowRight':
					vid.currentTime += 5;
					break;
			}
			break;
	}
});

/**
 * Event listener for video. Fired when video is clicked. Toggles Play/Pause state
 */
vid.addEventListener('click', function() {
	playPause();
});

vid.addEventListener('timeupdate', function() {
	//update();
});

chatInput.addEventListener('mouseenter', function() {
	chatInput.focus();
	this.style.opacity = '1'; // Set opacity to 100% when mouse enters
});

chatInput.addEventListener("focusout", function() {
	this.style.opacity = '0.05'; // Set opacity to 1% when mouse leaves
});

/**
 * Gets data from the server every seond, then pauses/plays and sets time accordingly
 */
setInterval(function() {
	getData();
}, 1000);

resize();
getData(); //get initial state
