const debug = false; //extra spam in the console
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
let fullscreen = false;

/**
 * Initialises the player
 */
function init() {
	document.title = v;
	getData(); //get initial state
}

/**
 * Updates the server with local info (paused, currentTime)
 */
function update() {
	const xmlhttp1 = new XMLHttpRequest();
	xmlhttp1.onreadystatechange = () => {
		if (this.readyState == 4 && this.status == 200) {
			if (JSON.parse(this.responseText).ok) {
				if (debug) console.log('Data saved to server');
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
	}
}

/**
 * Gets data from the server (paused, currentTime)
 */
function getData() {
	if (!fullscreen) {
		const xmlhttp2 = new XMLHttpRequest();	
		xmlhttp2.onreadystatechange = () => {
			if (this.readyState == 4 && this.status == 200) {
				const response = JSON.parse(this.responseText); // Parse the response to an array
				//if (debug) console.log(response);
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
}

/**
 * Toggle local playing and paused states
 */
function playPause() {
	if (fullscreen) {
		//Yes these are reversed. I dont know either. Just go with it
		if (vid.paused || vid.paused == 1) {
			vid.pause();
		} else {
			vid.play();
		}
	} else {
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
			setTimeout(() => {
				blocked = false;
			}, 5000);
		}
	}
}

/**
 * Gets a date string. Used for formatting chat DIVs
 * @returns date string in UTC
 */
function getCurrentDateTimeString() {
    return new Date().toISOString().replace(/[:.T]/g, '-').replace(/[Z]/g, '');
}

/**
 * Event listener for video. Fired when video is clicked. Toggles Play/Pause state
 */
vid.addEventListener('click', () => {
	playPause();
});

document.addEventListener('click', (event) => {
	//console.log(document.activeElement.id);
});

/**
 * Event listener for keydown events to handle media controls and user input (chat) based on focus
 */
document.addEventListener('keydown', (event) => {
	switch (document.activeElement.id) {
		case 'usertext':
			if (event.code === 'Enter' && usertext.value.trim() !== '') {
				update();
			}
			break;
		default:
			if(debug) console.log('Pressed "' + event.code + '" on "' + document.activeElement.id + '"');
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
				default:
					event.preventDefault();
					break;
			}
			break;
	}
});

/**
 * Only pause video if it's NOT in fullscreen mode
 */
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement === vid) {
        //console.log('Video is in fullscreen mode.');
		fullscreen = true;
    } else {
        //console.log('Video is not in fullscreen mode.');
		fullscreen = false;
    }
});

/**
 * Gets data from the server every seond, then pauses/plays and sets time accordingly
 */
setInterval(() => {
	if (!fullscreen) {
		//console.log('Getting data');
		getData();
	}
}, 1000);

init();
