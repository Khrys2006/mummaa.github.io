const defaultContent = {
  hearts: [
    "You made ordinary days like magical days.",
    "Thankyou for teaching us manners.",
    "Thankyou for teaching us the importance of money.",
    "Thank you for always supporting us.",
    "I love you in the tiny details, the old songs, and all the tomorrows.",
    "You are my first universe."
  ],
  songs: [
    {
      title: "Tareef karoon kya uski",
      artist: "Muhammad Rafi",
      spotify: "https://open.spotify.com/track/5TAPQPoHlsYVA3Jl43hZiZ?si=2aa8ccdaef0f4545"
    },
    {
      title: "Pal pal dil ke paas",
      artist: "Kishore Kumar",
      spotify: "https://open.spotify.com/track/71j40GUuIgwpEGmoupat2O?si=2e5c5aa04285427e"
    },
    {
      title: "Tu Kitni Achi Hai",
      artist: "Lata Mangeshkar",
      spotify: "https://open.spotify.com/track/6tx9Jm17HY3h9knbIasZfh?si=1ab8679a9d7e475d"
    },
    {
      title: "Badan pe sitaare",
      artist: "Muhammad Rafi",
      spotify: "https://open.spotify.com/track/3hEDNbJiTytsPjKULzd12O?si=202714d0e0dc426b"
    },
    {
      title: "Bindiya Chamke gi",
      artist: "Lata Mangeshkar",
      spotify: "https://open.spotify.com/track/0jdr0Bq0rL99zbwP6k0jSL?si=a3bfd83e8f444c67"
    }
  ],
  letters: [
    {
      title: "Dear Mumma",
      body: "You were the first place where my heart could restt."
    },
    {
      title: "love",
      body: "you make the best food, thankyouu for always making such yummy food for us!!"
    },
    {
      title: "love",
      body: "we will work really hard to become the best children ever, someone on whom you and papa can be proud of and can rely on."
    }
  ],
  memories: [
    {
      
      title: "love",
      caption: "beautiful moments.",
      image: "images/m1.jpg"
    },
    {
      title: "love",
      caption: "beautiful moments.",
      image: "images/m2.jpg"
    },
    {
      title: "memo",
      caption: "moments",
      image: "images/m3.jpg"
    },
    {
      title: "love",
      caption: "beautiful moments.",
      image: "images/m4.jpg"
    },
    {
      title: "love",
      caption: "beautiful moments.",
      image: "images/m5.jpg"
    },
    {
      title: "love",
      caption: "beautiful moments.",
      image: "images/m6.jpg"
    },
    {
      title: "love",
      caption: "beautiful moments.",
      image: "images/m7.jpg"
    },
    {
      title: "love",
      caption: "beautiful moments.",
      image: "images/m8.jpg"
    },
    {
      title: "love",
      caption: "beautiful moments.",
      image: "images/m9.jpg"
    },
    {
      title: "love",
      caption: "beautiful moments.",
      image: "images/m10.jpg"
    },
    {
      title: "love",
      caption: "beautiful moments.",
      image: "images/m11.jpg"
    },
  ],
};

const storageKey = "mothers-day-memory-universe-v2";
const sceneIds = {
  intro: "introScene",
  dashboard: "dashboardScene",
  hearts: "heartsScene",
  music: "musicScene",
  letters: "lettersScene",
  memories: "memoriesScene",
  final: "finalScene"
};

const state = {
  content: loadContent(),
  activeScene: "intro",
  audioContext: null,
  ambientNodes: null,
  activeSpotifyIndex: null,
  soundEnabled: false,
  visited: new Set()
};

const sparkleLayer = document.getElementById("sparkleLayer");
const cakeStage = document.getElementById("cakeStage");
const navButtons = [...document.querySelectorAll(".nav-button")];
const soundButton = document.getElementById("soundButton");
const editButton = document.getElementById("editButton");
const editorDrawer = document.getElementById("editorDrawer");
const closeEditorButton = document.getElementById("closeEditorButton");
const saveEditsButton = document.getElementById("saveEditsButton");
const heartEditor = document.getElementById("heartEditor");
const songEditor = document.getElementById("songEditor");
const letterEditor = document.getElementById("letterEditor");
const photoUpload = document.getElementById("photoUpload");
const heartField = document.getElementById("heartField");
const heartMessage = document.getElementById("heartMessage");
const cassetteGrid = document.getElementById("cassetteGrid");
const playerPanel = document.getElementById("playerPanel");
const playerTitle = document.getElementById("playerTitle");
const spotifyPlayer = document.getElementById("spotifyPlayer");
const stopMusicButton = document.getElementById("stopMusicButton");
const envelopeLine = document.getElementById("envelopeLine");
const polaroidTrack = document.getElementById("polaroidTrack");

function loadContent() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return {
      hearts: saved?.hearts?.length ? saved.hearts : defaultContent.hearts,
      songs: saved?.songs?.length ? saved.songs : defaultContent.songs,
      letters: saved?.letters?.length ? saved.letters : defaultContent.letters,
      memories: mergeMemories(saved?.memories)
    };
  } catch {
    return JSON.parse(JSON.stringify(defaultContent));
  }
}

function mergeMemories(savedMemories = []) {
  return defaultContent.memories.map((defaultMemory, index) => {
    const savedMemory = savedMemories[index] || {};
    const savedImage = savedMemory.image || "";
    const canUseSavedImage =
      savedImage.startsWith("data:image/") ||
      savedImage.startsWith("http://") ||
      savedImage.startsWith("https://") ||
      savedImage.startsWith("images/");

    return {
      ...defaultMemory,
      ...savedMemory,
      image: canUseSavedImage ? savedImage : defaultMemory.image
    };
  });
}

function persistContent() {
  const storable = {
    hearts: state.content.hearts,
    songs: state.content.songs.map(({ title, artist, spotify }) => ({ title, artist, spotify })),
    letters: state.content.letters,
    memories: state.content.memories
  };
  localStorage.setItem(storageKey, JSON.stringify(storable));
}

function openScene(name) {
  if (!sceneIds[name] || state.activeScene === name) return;

  document.getElementById(sceneIds[state.activeScene])?.classList.remove("active");
  document.getElementById(sceneIds[name])?.classList.add("active");
  state.activeScene = name;
  state.visited.add(name);

  navButtons.forEach((button) => {
    const isActive = button.dataset.openScene === name;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-current", isActive ? "page" : "false");
  });

  if (name !== "music") {
    stopSpotify();
  }

  createSparkles(10);
}

function finishIntro() {
  if (state.activeScene !== "intro") return;
  document.body.classList.add("candles-out");
  createBurst(window.innerWidth / 2, window.innerHeight * 0.43, 26);
  window.setTimeout(() => {
    document.body.classList.add("ready");
    openScene("dashboard");
  }, 720);
}

function createSparkles(count = 1) {
  for (let index = 0; index < count; index += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${82 + Math.random() * 20}%`;
    sparkle.style.setProperty("--duration", `${7 + Math.random() * 7}s`);
    sparkle.style.setProperty("--drift-x", `${-40 + Math.random() * 80}px`);
    sparkleLayer.appendChild(sparkle);
    sparkle.addEventListener("animationend", () => sparkle.remove());
  }
}

function createBurst(x, y, count = 18) {
  for (let index = 0; index < count; index += 1) {
    const burst = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count;
    const distance = 36 + Math.random() * 56;
    burst.className = "burst";
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    burst.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    burst.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    sparkleLayer.appendChild(burst);
    burst.addEventListener("animationend", () => burst.remove());
  }
}

function renderHearts() {
  heartField.innerHTML = "";
  state.content.hearts.forEach((message, index) => {
    const heart = document.createElement("button");
    heart.type = "button";
    heart.className = "heart-button";
    heart.setAttribute("aria-label", `Reveal heart message ${index + 1}`);
    heart.style.left = `${8 + ((index * 23) % 78)}%`;
    heart.style.top = `${24 + ((index * 17) % 48)}%`;
    heart.style.setProperty("--float-speed", `${10 + (index % 4) * 1.7}s`);
    heart.addEventListener("click", (event) => {
      heart.classList.remove("popped");
      window.requestAnimationFrame(() => heart.classList.add("popped"));
      heartMessage.innerHTML = `<span>${escapeHtml(message)}</span>`;
      createBurst(event.clientX, event.clientY, 20);
      playChime(740 + index * 22);
    });
    heartField.appendChild(heart);
  });
}

function renderCassettes() {
  cassetteGrid.innerHTML = "";
  state.content.songs.forEach((song, index) => {
    const cassette = document.createElement("button");
    cassette.type = "button";
    cassette.className = "cassette-card";
    cassette.dataset.songIndex = String(index);
    cassette.setAttribute("aria-label", `Play ${song.title} by ${song.artist}`);
    cassette.innerHTML = `
      <span class="cassette-label">
        <span>${escapeHtml(song.artist || "Spotify")}</span>
        <span>0${index + 1}</span>
      </span>
      <span class="cassette-window"><span></span><span></span></span>
      <span class="cassette-title">${escapeHtml(song.title)}</span>
    `;
    cassette.addEventListener("click", () => playSong(index));
    cassetteGrid.appendChild(cassette);
  });
}

function renderLetters() {
  envelopeLine.innerHTML = "";
  state.content.letters.forEach((letter, index) => {
    const envelope = document.createElement("button");
    envelope.type = "button";
    envelope.className = "envelope";
    envelope.setAttribute("aria-label", `Open letter ${index + 1}`);
    envelope.innerHTML = `
      <span class="paper">
        <h3>${escapeHtml(letter.title)}</h3>
        <p>${escapeHtml(letter.body)}</p>
      </span>
      <span class="envelope-front"></span>
    `;
    envelope.addEventListener("click", () => {
      document.querySelectorAll(".envelope.open").forEach((openEnvelope) => {
        if (openEnvelope !== envelope) openEnvelope.classList.remove("open");
      });
      envelope.classList.toggle("open");
      createSparkles(8);
      playChime(520 + index * 45);
    });
    envelopeLine.appendChild(envelope);
  });
}


function renderMemories() {
  // Memories are now static in index.html.
  // No JavaScript rendering required.
}

function syncEditor() {
  heartEditor.value = state.content.hearts.join("\n");
  letterEditor.value = state.content.letters.map((letter) => `${letter.title} | ${letter.body}`).join("\n");

  if (songEditor) {
    songEditor.value = state.content.songs
      .map((song) => `${song.title} | ${song.artist || ""} | ${song.spotify}`)
      .join("\n");
  }
}

function saveEditorText() {
  const hearts = heartEditor.value.split("\n").map((line) => line.trim()).filter(Boolean);
  const letters = letterEditor.value.split("\n").map((line, index) => {
    const [title, ...bodyParts] = line.split("|");
    return {
      title: title?.trim() || `Letter ${index + 1}`,
      body: bodyParts.join("|").trim() || line.trim()
    };
  }).filter((letter) => letter.body);

  if (hearts.length) state.content.hearts = hearts;
  if (letters.length) state.content.letters = letters;

  if (songEditor) {
    const songs = songEditor.value
      .split("\n")
      .map((line) => {
        const [title, artist, spotify] = line.split("|").map((part) => part?.trim());
        return { title, artist, spotify };
      })
      .filter((song) => song.title && song.spotify);

    if (songs.length) state.content.songs = songs;
  }

  persistContent();
  renderAll();
  stopSpotify();
  closeEditor();
  createSparkles(18);
}

function handlePhotoUploads(files) {
  [...files].slice(0, 6).forEach((file, index) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      state.content.memories[index] = {
        title: file.name.replace(/\.[^/.]+$/, "") || `Memory ${index + 1}`,
        caption: state.content.memories[index]?.caption || "A custom memory, glowing softly here.",
        image: reader.result
      };
      persistContent();
      renderMemories();
    });
    reader.readAsDataURL(file);
  });
}

function playSong(index) {
  const song = state.content.songs[index];
  const embedUrl = getSpotifyEmbedUrl(song.spotify);

  if (!embedUrl) {
    playerTitle.textContent = "Invalid Spotify link";
    stopSpotify();
    return;
  }

  state.activeSpotifyIndex = index;
  playerPanel.classList.add("playing");
  playerTitle.textContent = `${song.title} - ${song.artist || "Spotify"}`;

  document.querySelectorAll(".cassette-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.songIndex === String(index));
  });

  if (spotifyPlayer) {
    spotifyPlayer.innerHTML = `
      <iframe
        title="${escapeHtml(song.title)} Spotify player"
        src="${embedUrl}"
        width="100%"
        height="152"
        frameborder="0"
        allowfullscreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy">
      </iframe>
    `;
  }

  createSparkles(14);
}

function stopSpotify() {
  state.activeSpotifyIndex = null;
  playerPanel?.classList.remove("playing");
  document.querySelectorAll(".cassette-card.active").forEach((card) => card.classList.remove("active"));

  if (spotifyPlayer) {
    spotifyPlayer.innerHTML = `
      <div class="spotify-placeholder">
        <strong>Pick a cassette</strong>
        <span>Spotify will open here.</span>
      </div>
    `;
  }

  if (playerTitle) {
    playerTitle.textContent = "Choose a cassette";
  }
}

function getSpotifyEmbedUrl(url) {
  try {
    const spotifyUrl = new URL(url);
    const pathParts = spotifyUrl.pathname.split("/").filter(Boolean);
    const type = pathParts[0];
    const id = pathParts[1];

    if (spotifyUrl.hostname !== "open.spotify.com" || type !== "track" || !id) {
      return "";
    }

    return `https://open.spotify.com/embed/track/${encodeURIComponent(id)}?utm_source=generator&theme=0`;
  } catch {
    return "";
  }
}

function ensureAudio() {
  if (!state.audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      state.audioContext = new AudioContextClass();
    }
  }

  if (state.audioContext?.state === "suspended") {
    state.audioContext.resume();
  }

  if (!state.soundEnabled) {
    state.soundEnabled = true;
    soundButton.setAttribute("aria-pressed", "true");
    startAmbient();
  }
}

function startAmbient() {
  if (!state.audioContext || state.ambientNodes) return;

  const context = state.audioContext;
  const master = context.createGain();
  master.gain.value = 0.035;
  master.connect(context.destination);

  const tones = [196, 246.94, 329.63];
  const oscillators = tones.map((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.value = index === 0 ? 0.5 : 0.18;
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start();
    return oscillator;
  });

  state.ambientNodes = { master, oscillators };
}

function playChime(frequency) {
  if (!state.soundEnabled || !state.audioContext) return;

  const context = state.audioContext;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.48);
}

function openEditor() {
  syncEditor();
  editorDrawer.classList.add("open");
  editorDrawer.setAttribute("aria-hidden", "false");
}

function closeEditor() {
  editorDrawer.classList.remove("open");
  editorDrawer.setAttribute("aria-hidden", "true");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAll() {
  renderHearts();
  renderCassettes();
  renderLetters();
  renderMemories();
}

function initThreeUniverse() {
  const canvas = document.getElementById("universeCanvas");
  if (!window.THREE || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 24;

  const particleCount = 260;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const palette = [
    new THREE.Color("#FFF6F2"),
    new THREE.Color("#FFD9E2"),
    new THREE.Color("#F4D58D"),
    new THREE.Color("#F7B6C2")
  ];

  for (let index = 0; index < particleCount; index += 1) {
    positions[index * 3] = (Math.random() - 0.5) * 42;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 58;
    positions[index * 3 + 2] = (Math.random() - 0.5) * 24;
    const color = palette[index % palette.length];
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.115,
    vertexColors: true,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const ringGeometry = new THREE.TorusGeometry(7.8, 0.025, 8, 160);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: "#FFF6F2",
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });
  const rings = Array.from({ length: 3 }, (_, index) => {
    const ring = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring.rotation.x = 1.05 + index * 0.28;
    ring.rotation.y = index * 0.46;
    ring.scale.setScalar(1 + index * 0.28);
    scene.add(ring);
    return ring;
  });

  const pointer = { x: 0, y: 0 };

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  let lastFrame = 0;

  function animate(time) {
    window.requestAnimationFrame(animate);
    if (time - lastFrame < 33) return;
    lastFrame = time;

    const t = time * 0.00018;
    particles.rotation.y = t + pointer.x * 0.12;
    particles.rotation.x = -t * 0.5 + pointer.y * 0.08;
    rings.forEach((ring, index) => {
      ring.rotation.z = t * (index + 1.4);
      ring.material.opacity = 0.1 + Math.sin(t * 8 + index) * 0.035;
    });
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  resize();
  animate(0);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => openScene(button.dataset.openScene));
});

document.querySelectorAll("[data-open-scene]").forEach((button) => {
  button.addEventListener("click", () => openScene(button.dataset.openScene));
});

cakeStage.addEventListener("click", finishIntro);
cakeStage.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    finishIntro();
  }
});

soundButton.addEventListener("click", ensureAudio);
editButton.addEventListener("click", openEditor);
closeEditorButton.addEventListener("click", closeEditor);
saveEditsButton.addEventListener("click", saveEditorText);
stopMusicButton.addEventListener("click", stopSpotify);
photoUpload.addEventListener("change", (event) => handlePhotoUploads(event.target.files));

window.addEventListener("pointerdown", () => {
  if (!state.soundEnabled && state.activeScene !== "intro") {
    ensureAudio();
  }
}, { once: true });

window.setInterval(() => createSparkles(3), 1400);
window.setTimeout(finishIntro, 5600);

renderAll();
syncEditor();
stopSpotify();
initThreeUniverse();
createSparkles(12);
