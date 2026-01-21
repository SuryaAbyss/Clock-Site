// DOM Elements
const timeDisplay = document.getElementById('time-display');
const dateDisplay = document.getElementById('date-display');
const regionDisplay = document.getElementById('region-display');
const regionSelect = document.getElementById('region-select');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const darkModeBtn = document.getElementById('dark-mode-btn');
const formatToggleBtn = document.getElementById('format-toggle-btn');
const formatTexts = document.querySelectorAll('.toggle-text');
const controls = document.querySelector('.controls');
// Removed debug log code


// State
let currentRegion = 'Asia/Kolkata';
let isFullscreen = false;
let is24Hour = false; // Default to 12-hour
let isDarkMode = false;
let inactivityTimer;

// Time Update Function
function updateTime() {
    const now = new Date();

    const timeOptions = {
        timeZone: currentRegion,
        hour12: !is24Hour,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    const datePartsFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: currentRegion,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
    const dateParts = datePartsFormatter.formatToParts(now);

    // Extract time parts manually to handle AM/PM and colons reliably
    // Note: Intl format might vary slightly by browser, but usually "12:00:00 PM"
    // We'll parse the timeString or just use raw values if we want strict control. 
    // Best approach for localization + granularity:

    // Parse the localized time string
    // Assumption: 'en-US' format is reliable: "HH:MM:SS AM" or "HH:MM:SS"
    let [timePart, period] = timeString.split(' ');
    let [hours, minutes, seconds] = timePart.split(':');

    // Update Time Spans
    // We use querySelector on the element to ensure we find the children
    const timeContainer = document.getElementById('time-display');

    // Check if structure exists (it should, but safety first)
    if (timeContainer.querySelector('.hour')) {
        timeContainer.querySelector('.hour').textContent = hours;
        timeContainer.querySelector('.minute').textContent = minutes;

        const secElem = timeContainer.querySelector('.second');
        if (secElem) secElem.textContent = seconds || ''; // Hide seconds if not present? Usually always present in this format

        const ampmElem = timeContainer.querySelector('.ampm-tag');
        if (ampmElem) {
            ampmElem.textContent = period || '';
            ampmElem.style.display = period ? 'inline' : 'none';
        }
    } else {
        // Fallback for safety
        timeContainer.textContent = timeString;
    }

    // Update Date Spans
    const dateContainer = document.getElementById('date-display');
    const weekday = dateParts.find(p => p.type === 'weekday')?.value || '';
    const month = dateParts.find(p => p.type === 'month')?.value || '';
    const day = dateParts.find(p => p.type === 'day')?.value || '';
    const year = dateParts.find(p => p.type === 'year')?.value || '';

    if (dateContainer.querySelector('.weekday')) {
        dateContainer.querySelector('.weekday').textContent = weekday;
        // Logic for day-month text can vary by style, but we set a default here
        dateContainer.querySelector('.day-month').textContent = `${month} ${day}`;
        dateContainer.querySelector('.year').textContent = year;
    } else {
        dateContainer.textContent = `${weekday}, ${month} ${day}, ${year}`;
    }
}

// Region Change Handler
regionSelect.addEventListener('change', (e) => {
    currentRegion = e.target.value;
    const regionName = e.target.options[e.target.selectedIndex].text;
    regionDisplay.textContent = regionName.split('(')[0].trim() + ' Standard Time';
    if (currentRegion === 'Asia/Kolkata') regionDisplay.textContent = 'India Standard Time';
    else regionDisplay.textContent = regionName;

    updateTime();
});

// Format Toggle Handler
formatToggleBtn.addEventListener('click', () => {
    is24Hour = !is24Hour;
    updateFormatUI();
    updateTime();
});

function updateFormatUI() {
    formatTexts.forEach(text => text.classList.remove('active'));
    if (is24Hour) {
        formatTexts[1].classList.add('active'); // 24H
    } else {
        formatTexts[0].classList.add('active'); // 12H
    }
}

// Dark Mode Handler
darkModeBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);

    // Update icon
    const svg = darkModeBtn.querySelector('svg');
    if (isDarkMode) {
        svg.innerHTML = '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>';
    } else {
        svg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
});

// Fullscreen Handler
fullscreenBtn.addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.warn(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

function handleFullscreenChange() {
    isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (isFullscreen) {
        setupInactivityTracker();
    } else {
        clearInactivityTracker();
        controls.classList.remove('hidden'); // Always show when not in fullscreen
    }
}

// Inactivity Tracker (Mouse hide)
function setupInactivityTracker() {
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);
    resetInactivityTimer(); // Start immediately
}

function clearInactivityTracker() {
    document.removeEventListener('mousemove', resetInactivityTimer);
    document.removeEventListener('click', resetInactivityTimer);
    clearTimeout(inactivityTimer);
}

function resetInactivityTimer() {
    controls.classList.remove('hidden');
    document.body.style.cursor = 'default';

    clearTimeout(inactivityTimer);

    if (isFullscreen) {
        inactivityTimer = setTimeout(() => {
            controls.classList.add('hidden');
            document.body.style.cursor = 'none';
        }, 3000); // Hide after 3 seconds of inactivity
    }
}

// Initial Call
updateTime();
setInterval(updateTime, 1000);

/* --- Menu & Feature Logic --- */

const menuBtn = document.getElementById('menu-btn');
const menuCloseBtn = document.getElementById('menu-close-btn');
const menuOverlay = document.getElementById('menu-overlay');
const styleOptions = document.querySelectorAll('#style-options .option-card');
const bgOptions = document.querySelectorAll('#bg-options .option-card');
const clockContainer = document.querySelector('.clock-container');
const bgVideoContainer = document.getElementById('video-background'); // Replaced video element wrapper

/* --- YouTube Background Logic --- */
let player;
let isPlayerReady = false;
let currentVideoId = '';

const videoIds = {
    'new-york': 'Hb08uAeYf6g',
    'forest': 'hMxlDbv-rec',
    'london': 'sXJLT3kYdhk',
    'tokyo': 'MkdsvjGZv7U',
    'los-angeles': '3ecyAHQDsIU',
    'monte-carlo': 'oS-rwVafano'
};

// Load YouTube IFrame API
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '100%',
        width: '100%',
        videoId: '', // Start empty
        playerVars: {
            'autoplay': 1,
            'controls': 0,
            'showinfo': 0,
            'modestbranding': 1,
            'loop': 1,
            'fs': 0,
            'cc_load_policy': 0,
            'iv_load_policy': 3,
            'autohide': 0,
            'playlist': '', // Will be set on load for looping
            'mute': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    event.target.mute();
}

function onPlayerStateChange(event) {
    // Loop manually if playlist param doesn't catch it
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo();
    }
}

function playBackgroundVideo(videoId) {
    if (!isPlayerReady || !player) return;

    if (currentVideoId !== videoId) {
        currentVideoId = videoId;
        // Load video and set playlist to same ID to ensure loop works efficiently
        player.loadVideoById({
            videoId: videoId,
            startSeconds: 0
        });
        player.mute(); // Ensure muted
    } else {
        player.playVideo();
    }

    // Show container
    bgVideoContainer.classList.add('active');
}

function stopBackgroundVideo() {
    if (isPlayerReady && player) {
        player.pauseVideo();
    }
    bgVideoContainer.classList.remove('active');
    currentVideoId = '';
}

// Menu Toggling
const menuMain = document.getElementById('menu-main');
const menuStyles = document.getElementById('menu-styles');
const menuBackgrounds = document.getElementById('menu-backgrounds');
const menuNavBtns = document.querySelectorAll('.menu-nav-btn');
const backBtns = document.querySelectorAll('.back-btn');

function showView(viewId) {
    // Hide all views
    [menuMain, menuStyles, menuBackgrounds].forEach(el => {
        el.classList.add('hidden');
    });
    // Show target view
    document.getElementById(viewId).classList.remove('hidden');
}

function resetMenu() {
    showView('menu-main');
}

function toggleMenu() {
    const isHidden = menuOverlay.classList.contains('hidden');
    if (isHidden) {
        // Opening menu
        resetMenu(); // Always start at main
        menuOverlay.classList.remove('hidden');
    } else {
        // Closing menu
        menuOverlay.classList.add('hidden');
    }
}

// Main Navigation Click Handlers
menuNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        showView(target);
    });
});

// Back Button Handlers
backBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        showView(target);
    });
});


menuBtn.addEventListener('click', toggleMenu);
menuCloseBtn.addEventListener('click', toggleMenu);

// Close menu when clicking outside the content
menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
        toggleMenu();
    }
});

// Clock Style Switching
styleOptions.forEach(option => {
    option.addEventListener('click', () => {
        // UI Update
        styleOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // Logic
        const styleName = option.dataset.style;

        // Remove existing style classes
        clockContainer.classList.remove('style-default', 'style-neon', 'style-classic', 'style-retro', 'style-bold', 'style-vertical', 'style-elegant', 'style-typo');

        // Add new style class
        clockContainer.classList.add(styleName);
    });
});

// Background Switching
bgOptions.forEach(option => {
    option.addEventListener('click', () => {
        // UI Update
        bgOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // Logic
        const bgType = option.dataset.bg;

        if (bgType === 'gradient') {
            stopBackgroundVideo();
        } else {
            const videoId = videoIds[bgType];
            if (videoId) {
                playBackgroundVideo(videoId);
            }
        }
    });
});

