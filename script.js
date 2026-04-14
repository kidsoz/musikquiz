/* =============================
   KONFIGURATION
============================= */

const CLIENT_ID = "cb562e24e68e49bdb497b65bc42cd010";
const REDIRECT_URI = "https://kidsoz.github.io/musikquiz/redirect.html";
const SCOPES = "playlist-read-private playlist-read-collaborative";

/* =============================
   PKCE – HJÄLPFUNKTIONER
============================= */

function generateCodeVerifier() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let verifier = "";
  const random = crypto.getRandomValues(new Uint8Array(64));

  for (let i = 0; i < random.length; i++) {
    verifier += chars[random[i] % chars.length];
  }
  return verifier;
}

async function generateCodeChallenge(verifier) {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/* =============================
   SPOTIFY LOGIN
============================= */

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");

  if (loginBtn) {
    loginBtn.onclick = async () => {
      const verifier = generateCodeVerifier();
      localStorage.setItem("pkce_verifier", verifier);

      const challenge = await generateCodeChallenge(verifier);

      const authUrl =
        "https://accounts.spotify.com/authorize" +
        "?response_type=code" +
        "&client_id=" + CLIENT_ID +
        "&scope=" + encodeURIComponent(SCOPES) +
        "&redirect_uri=" + encodeURIComponent(REDIRECT_URI) +
        "&code_challenge_method=S256" +
        "&code_challenge=" + challenge;

      window.location.href = authUrl;
    };
  }

  // Om vi kommer tillbaka från Spotify med ?code=...
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    exchangeCodeForToken(code);
  }

  const loadBtn = document.getElementById("loadPlaylistBtn");
  if (loadBtn) {
    loadBtn.onclick = handlePlaylistInput;
  }
});

/* =============================
   TOKEN-UTBYTE
============================= */

async function exchangeCodeForToken(code) {
  const verifier = localStorage.getItem("pkce_verifier");
  if (!verifier) return;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!res.ok) {
    console.error("Token exchange failed:", await res.text());
    return;
  }

  const data = await res.json();
  localStorage.setItem("spotify_access_token", data.access_token);
  localStorage.removeItem("pkce_verifier");

  document.getElementById("playlistInputArea").classList.remove("hidden");
}

/* =============================
   SPELLISTA VIA INPUT
============================= */

async function handlePlaylistInput() {
  const input = document.getElementById("playlistInput").value.trim();
  const playlistId = extractPlaylistId(input);

  if (!playlistId) {
    alert("Ogiltig Spotify-spellista");
    return;
  }

  loadPlaylistWithId(playlistId);
}

function extractPlaylistId(input) {
  const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9]{22}$/.test(input)) return input;
  return null;
}

/* =============================
   QUIZ
============================= */

let tracks = [];
let idx = 0;
let score = 0;

async function loadPlaylistWithId(playlistId) {
  const token = localStorage.getItem("spotify_access_token");

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  if (!data.items) {
    alert("Kunde inte läsa spellistan");
    return;
  }

  tracks = data.items
    .map(i => i.track)
    .filter(t => t && t.preview_url);

  if (tracks.length === 0) {
    alert("Inga låtar med preview hittades");
    return;
  }

  document.getElementById("playlistInputArea").classList.add("hidden");
  document.getElementById("quizArea").classList.remove("hidden");

  idx = 0;
  score = 0;
  loadQuestion();
}

function loadQuestion() {
  const q = tracks[idx];
  document.getElementById("questionText").textContent = "Vilken låt är detta?";
  document.getElementById("audioPlayer").src = q.preview_url;
}

/* =============================
   RESULTAT
============================= */

function finish() {
  document.getElementById("quizArea").innerHTML =
    `<h2>Klart! Du fick ${score} av ${tracks.length} rätt 🎉</h2>`;
}
