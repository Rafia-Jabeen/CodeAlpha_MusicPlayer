// selectors
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("previous-btn");
const nextBtn = document.getElementById("next-btn");
const progressFill = document.querySelector(".progress-fill");
const progressBar = document.querySelector(".progress-bar");
const volumeSlider = document.getElementById("volume-slider");
const volumeIcon = document.getElementById("volume-icon");
const currentTimeEl = document.getElementById("current-time");
const totalDurationEl = document.getElementById("total-duration");

const songs = Array.from(document.querySelectorAll(".song"));


let currentSongIndex = 0;
let currentAudio = songs[currentSongIndex].querySelector(".song__audio");
let isPlaying = false;

let universalVolume = volumeSlider.value; 

// UI Updates
function updateIcons(play) {
    playBtn.className = play ? "fa-solid fa-pause" : "fa-solid fa-play";
    
    // Sync all icons in the playlist
    songs.forEach((song, index) => {
        const icon = song.querySelector("i");
        if (index === currentSongIndex && play) {
            icon.className = "fa-solid fa-pause";
            song.classList.add("active-song"); 
        } else {
            icon.className = "fa-solid fa-play";
            song.classList.remove("active-song");
        }
    });
}

function updateHeroSection() {
    const songData = songs[currentSongIndex].dataset;
    const songEl = songs[currentSongIndex];
    const imgSrc = songEl.querySelector("img").src;
    const title = songEl.querySelector(".song__title").textContent;

    // 1. Update Hero Section's current song information
    document.getElementById("hero-cover").src = imgSrc;
    document.getElementById("hero-title").textContent = `Song name: ${title}`;
    document.getElementById("hero-artist").textContent = `Artist: ${songData.artist}`;
    document.querySelector(".song-source").textContent = `Source: ${songData.source}`;
    document.getElementById("hero-download-link").href = songData.download;
    document.getElementById("hero-yt-link").href = songData.yt;

    // 2. Update Progress Bar's song cover image and name
    document.getElementById("current-cover").src = imgSrc;
    document.getElementById("current-title").textContent = title;
}

// Main logic
function playSong(index) {
    // 1. Fully stop and reset the current audio before switching
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.onloadedmetadata = null;
    currentAudio.ontimeupdate = null;

    // 2. Switch to new song
    currentSongIndex = index;
    currentAudio = songs[currentSongIndex].querySelector(".song__audio");

    // 3. Reset the UI text immediately so it doesn't stay "1:15"
    totalDurationEl.textContent = "--:--"; 
    currentTimeEl.textContent = "0:00";
    progressFill.style.width = "0%";

    // 4. Set volume
    currentAudio.volume = universalVolume;

    // 5. Update UI and Re-attach Events
    updateHeroSection();
    attachAudioEvents(); 

    // 6. Play
    currentAudio.play().then(() => {
        isPlaying = true;
        updateIcons(true);
    })
}

function togglePlay() {
    if (isPlaying) {
        currentAudio.pause();
        isPlaying = false;
        updateIcons(false);
    } else {
        // Ensure volume is synced before playing
        currentAudio.volume = universalVolume;
        currentAudio.play();
        isPlaying = true;
        updateIcons(true);
    }
}

function nextSong() {
    let nextIndex = (currentSongIndex + 1) % songs.length;
    playSong(nextIndex);
}

function prevSong() {
    let prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(prevIndex);
}

// Event Helpers
function attachAudioEvents() {
    //catch the duration
    currentAudio.addEventListener('loadedmetadata', () => {
        totalDurationEl.textContent = formatTime(currentAudio.duration);
    }, { once: true });

    // If the browser already has the data (cached), set it immediately
    if (currentAudio.readyState >= 1) {
        totalDurationEl.textContent = formatTime(currentAudio.duration);
    }

    currentAudio.ontimeupdate = () => {
        if (!isNaN(currentAudio.duration) && currentAudio.duration > 0) {
            const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
            progressFill.style.width = `${progress}%`;
            currentTimeEl.textContent = formatTime(currentAudio.currentTime);
        }
    };

    currentAudio.onended = nextSong;
}

// Inputs

// Seek Logic
progressBar.addEventListener("click", (e) => {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = currentAudio.duration;
    if (duration) {
        currentAudio.currentTime = (clickX / width) * duration;
    }
});

// Universal Volume Control
volumeSlider.addEventListener("input", (e) => {
    universalVolume = e.target.value;
    currentAudio.volume = universalVolume;

    // Dynamic Icon Change
    if (universalVolume == 0) {
        volumeIcon.className = "fa-solid fa-volume-xmark";
    } else if (universalVolume < 0.5) {
        volumeIcon.className = "fa-solid fa-volume-low";
    } else {
        volumeIcon.className = "fa-solid fa-volume-high";
    }
});

// Keyboard Controls
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault(); // Prevent page scroll
        togglePlay();
    } else if (e.code === "ArrowRight") {
        nextSong();
    } else if (e.code === "ArrowLeft") {
        prevSong();
    }
});

// Button Clicks
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

// List Clicks
songs.forEach((song, index) => {
    song.addEventListener("click", (e) => {
        if (e.target.tagName !== 'A') {
            playSong(index);
        }
    });
});

function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
}

// Initial Sync
updateHeroSection();
attachAudioEvents();
currentAudio.volume = universalVolume;