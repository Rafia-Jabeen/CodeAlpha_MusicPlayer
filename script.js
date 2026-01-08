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

progressBar.addEventListener("click", (e) => {
  const barWidth = progressBar.clientWidth;
  const clickX = e.offsetX;

  const duration = currentAudio.duration;

  if (!isNaN(duration)) {
    const newTime = (clickX / barWidth) * duration;
    currentAudio.currentTime = newTime;
  }
});

const volume = Number(volumeSlider.value);

volumeSlider.addEventListener("input", () => {
  currentAudio.volume = volumeSlider.value;

  if (volumeSlider.value == 0) {
    volumeIcon.className = "fa-solid fa-volume-xmark";
  } else if (volumeSlider.value < 0.5) {
    volumeIcon.className = "fa-solid fa-volume-low";
  } else {
    volumeIcon.className = "fa-solid fa-volume-high";
  }
});

function updateCurrentSongUI() {
  const currentSong = songs[currentSongIndex];

  const imgSrc = currentSong.querySelector("img").src;
  const titleText = currentSong.querySelector(".song__title").textContent;

  document.getElementById("current-cover").src = imgSrc;
  document.getElementById("current-title").textContent = titleText;
}

/*helpers*/

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}


function updateIcons(play) {
  playBtn.className = play ? "fa-solid fa-pause" : "fa-solid fa-play";

  songs.forEach(song => {
    song.querySelector("i").className = "fa-solid fa-play";
  });

  if (play) {
    songs[currentSongIndex]
      .querySelector("i")
      .className = "fa-solid fa-pause";
  }
}



/* main functions */

function playSong(index) {

  // toggle play/pause for same song
  if (index === currentSongIndex) {
    togglePlay();
    return;
  }

  // stop old song
  currentAudio.pause();
  currentAudio.currentTime = 0;

  currentSongIndex = index;
  currentAudio = songs[currentSongIndex].querySelector(".song__audio");

  updateCurrentSongUI();

  // reset UI
  currentTimeEl.textContent = "0:00";
  totalDurationEl.textContent = "0:00";
  progressFill.style.width = "0%";

  currentAudio.load();
  attachAudioEvents();
  currentAudio.volume = volumeSlider.value;
  currentAudio.play();
  isPlaying = true;
  updateIcons(true);
}


function togglePlay() {
  if (!isPlaying) {
    currentAudio.play();
    isPlaying = true;
    updateIcons(true);
  } else {
    currentAudio.pause();
    isPlaying = false;
    updateIcons(false);
  }
}

function nextSong() {
  playSong((currentSongIndex + 1) % songs.length);
}

function prevSong() {
  playSong((currentSongIndex - 1 + songs.length) % songs.length);
}

/*  audio events  */

function attachAudioEvents() {

  currentAudio.onloadedmetadata = () => {
    if (!isNaN(currentAudio.duration)) {
      totalDurationEl.textContent = formatTime(currentAudio.duration);
    }
  };

  currentAudio.ontimeupdate = () => {
    if (!isNaN(currentAudio.duration)) {
      const progress =
        (currentAudio.currentTime / currentAudio.duration) * 100;

      progressFill.style.width = progress + "%";
      currentTimeEl.textContent = formatTime(currentAudio.currentTime);
    }
  };

  currentAudio.onended = nextSong;
}



/* events */

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);

songs.forEach((song, index) => {
  song.addEventListener("click", () => playSong(index));
});

attachAudioEvents();
