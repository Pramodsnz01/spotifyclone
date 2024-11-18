let currentSong = new Audio();
let songs;
let currFolder;
let allSongs = {}; // To store songs from all folders

// Format time function
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    seconds = Math.floor(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
}

// Get and display songs function remains the same
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    displaySongs(songs); // Call to display songs in the list (remains the same)
    return songs;
}

// Function to display songs (unchanged)
function displaySongs(songsToShow) {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";  // Clear the playlist first
    for (const song of songsToShow) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="">
                <div class="info">
                    <div class="songName">${song.replaceAll("%20", " ")}</div> 
                </div>
                <div class="palynow">
                    <span>Play now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>
        `;
    }

    // Attach event listeners to each song (unchanged)
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
}

const playMusic = (track, pause = false) => {
    // Construct the path and log it for debugging
    const songPath = `/${currFolder}/` + track;
    console.log("Attempting to load song from path:", songPath);
    
    currentSong.src = songPath;
    currentSong.load();  // Buffer the audio
    
    if (!pause) {
        currentSong.play()
            .then(() => {
                play.src = "img/pause.svg";
            })
            .catch(error => console.error("Playback failed:", error));
    }
    
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}


// Fetch and store all songs from all playlists
async function getAllSongs() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    for (let anchor of anchors) {
        if (anchor.href.includes("/songs/")) {
            let folder = anchor.href.split("/").slice(-1)[0];
            let songList = await getSongs(`songs/${folder}`);
            allSongs[folder] = songList; // Store songs by folder name
        }
    }
}

// Update search functionality to search across all playlists
document.querySelector("#searchBar").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    let filteredSongs = [];

    // Search in all playlists
    for (const folder in allSongs) {
        const folderSongs = allSongs[folder].filter(song => song.toLowerCase().includes(query));
        filteredSongs.push(...folderSongs.map(song => ({ folder, song })));
    }

    showSuggestions(filteredSongs); // Display suggestions dynamically
});

// Function to display search suggestions dynamically
 function showSuggestions(filteredSongs) {
    const suggestionBox = document.querySelector("#suggestionBox");
    suggestionBox.innerHTML = ""; // Clear previous suggestions

    if (filteredSongs.length > 0) {
        filteredSongs.forEach(({ folder, song }) => {
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.innerText = song.replaceAll("%20", " ");
            
            // Add an event listener to play the selected song
            suggestionItem.addEventListener("click", () => {
                currFolder = folder; // Set currFolder to the folder of the selected song
                playMusic(song); // Play the selected song from suggestions
                suggestionBox.innerHTML = ""; // Clear suggestions when a song is selected
            });
            
            suggestionBox.appendChild(suggestionItem);
        });
        suggestionBox.style.display = "block"; // Show the suggestion box
    } else {
        suggestionBox.style.display = "none"; // Hide the suggestion box if no suggestions are found
    }
}


// Hide suggestions when the mouse leaves the input field
document.querySelector("#searchBar").addEventListener("blur", function () {
    const suggestionBox = document.querySelector("#suggestionBox");
    setTimeout(() => {
        suggestionBox.style.display = "none"; // Hide suggestions when input loses focus
    }, 150); // Delay to allow suggestion click events to register
});

// Show suggestions again when the input is focused
document.querySelector("#searchBar").addEventListener("focus", function () {
    const suggestionBox = document.querySelector("#suggestionBox");
    if (this.value.trim() !== "") {
        suggestionBox.style.display = "block"; // Show the suggestions when the input is focused
    }
});

// Hide suggestions when the mouse leaves the suggestion box
document.querySelector("#suggestionBox").addEventListener("mouseleave", function () {
    this.style.display = "none"; // Hide the suggestions when the mouse leaves the box
});

// Fetch and display albums (this part is unchanged)
async function displayAlbums() {
    let a = await fetch(` /songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    cardContainer.innerHTML = ''; // Clear the cardContainer first

    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")){
            let folder = (e.href.split("/").slice(-1)[0]);
            let a = await fetch(` /songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
                            <circle cx="24" cy="24" r="24" fill="#1ed760" />
                            <g transform="translate(12, 12)">
                                <path
                                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"
                                    fill="black" />
                            </g>
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpeg" alt="">
                    <p>${response.description}</p>
                </div>`;
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

// Main initialization function (unchanged)
async function main() {
    await getAllSongs(); // Fetch all songs from all folders
    await getSongs("songs/7clouds");
    playMusic(songs[0], true);
    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume == 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg";
        } else {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg";
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    }); 
    
  
}

main();
