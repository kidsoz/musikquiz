const CLIENT_ID = "cb562e24e68e49bdb497b65bc42cd010";
const REDIRECT_URI = "https://kidsoz.github.io/musikquiz/redirect.html";
const SCOPES = "playlist-read-private playlist-read-collaborative";

async function generateVerifier(){const arr=new Uint8Array(64);crypto.getRandomValues(arr);return btoa(String.fromCharCode(...arr)).replace(/\+/g,'-').replace(/\//g,'_').substring(0,128);}
async function sha256(input){const enc=new TextEncoder().encode(input);return crypto.subtle.digest('SHA-256',enc);}
function base64urlencode(b){return btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}

document.getElementById('loginBtn').onclick=async()=>{const verifier=await generateVerifier();localStorage.setItem('code_verifier',verifier);const challenge=base64urlencode(await sha256(verifier));const url=`https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge_method=S256&code_challenge=${challenge}`;window.location.href=url;};

const code=localStorage.getItem('spotify_auth_code');if(code)exchange(code);

async function exchange(code){const verifier=localStorage.getItem('code_verifier');const body=new URLSearchParams({client_id:CLIENT_ID,grant_type:'authorization_code',code:code,redirect_uri:REDIRECT_URI,code_verifier:verifier});const res=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});const data=await res.json();localStorage.setItem('spotify_access_token',data.access_token);localStorage.removeItem('spotify_auth_code');loadPlaylist();}

let tracks=[];let idx=0;let score=0;


async function loadPlaylistWithId(playlistId) {
  const token = localStorage.getItem("spotify_access_token");

  const res = await fetch(
    `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();

  tracks = data.items
    .map(i => i.track)
    .filter(t => t && t.preview_url); // endast låtar med preview

  if (tracks.length === 0) {
    alert("Inga låtar med förhandslyssning hittades i spellistan.");
    return;
  }

  document.getElementById("playlistInputArea").classList.add("hidden");
  document.getElementById("quizArea").classList.remove("hidden");

  idx = 0;
  score = 0;
  loadQuestion();
}

function fake(t){return t.split(' ').reverse().join(' ');}
function disableAll(){document.querySelectorAll('#options button').forEach(b=>b.disabled=true);}
function shuffle(a){return a.sort(()=>Math.random()-0.5);}
function finish(){document.getElementById('quizArea').innerHTML=`<h2>Klart! Du fick ${score} av ${tracks.length} rätt 🎉</h2>`;}

ocument.getElementById("loadPlaylistBtn").onclick = () => {
  const input = document.getElementById("playlistInput").value.trim();
  const playlistId = extractPlaylistId(input);

  if (!playlistId) {
    alert("Kunde inte läsa spellistan. Klistra in en korrekt Spotify-länk.");
    return;
  }

  loadPlaylistWithId(playlistId);
};
``

function extractPlaylistId(input) {
  // Om användaren klistrar in en hel länk
  const match = input.match(/playlist\/([a-zA-Z0-9]+)/);
  if (match && match[1]) return match[1];

  // Om användaren klistrar in bara ID
  if (/^[a-zA-Z0-9]{22}$/.test(input)) return input;

  return null;
}
