const CLIENT_ID = "DIN_SPOTIFY_CLIENT_ID_HÄR";
const REDIRECT_URI = "https://DITT-GITHUB-NAMN.github.io/spotify-quiz/redirect.html";
const SCOPES = "playlist-read-private playlist-read-collaborative";

async function generateVerifier(){const array=new Uint8Array(64);crypto.getRandomValues(array);return btoa(String.fromCharCode(...array)).replace(/\+/g,'-').replace(/\//g,'_').substring(0,128);}async function sha256(input){const encoder=new TextEncoder();return crypto.subtle.digest("SHA-256",encoder.encode(input));}function base64urlencode(array){return btoa(String.fromCharCode(...new Uint8Array(array))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,"");}

document.getElementById('loginBtn').onclick=async()=>{const verifier=await generateVerifier();localStorage.setItem('code_verifier',verifier);const challenge=base64urlencode(await sha256(verifier));const url=`https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&code_challenge_method=S256&code_challenge=${challenge}`;window.location.href=url;};

const code=localStorage.getItem("spotify_auth_code");if(code)exchangeCodeForToken(code);

async function exchangeCodeForToken(code){const verifier=localStorage.getItem('code_verifier');const body=new URLSearchParams({client_id:CLIENT_ID,grant_type:'authorization_code',code:code,redirect_uri:REDIRECT_URI,code_verifier:verifier});const res=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});const data=await res.json();localStorage.setItem('spotify_access_token',data.access_token);localStorage.removeItem('spotify_auth_code');loadPlaylist();}

let tracks=[];let index=0;let score=0;
async function loadPlaylist(){const token=localStorage.getItem('spotify_access_token');const playlist="37i9dQZF1DXcBWIGoYBM5M";const res=await fetch(`https://api.spotify.com/v1/playlists/${playlist}/tracks`,{headers:{Authorization:`Bearer ${token}`}});const data=await res.json();tracks=data.items.map(t=>t.track).filter(t=>t?.preview_url);loadQuestion();}

function loadQuestion(){const track=tracks[index];document.getElementById('question').textContent='Vilken låt är detta?';document.getElementById('question').classList.remove('hidden');document.getElementById('player').src=track.preview_url;document.getElementById('player').classList.remove('hidden');document.getElementById('options').innerHTML='';document.getElementById('result').innerHTML='';document.getElementById('nextBtn').classList.add('hidden');

const opts=shuffle([track.name,fake(track),fake(track)]);opts.forEach(o=>{const btn=document.createElement('button');btn.textContent=o;btn.onclick=()=>{if(o===track.name){btn.classList.add('correct');document.getElementById('result').textContent='✅ Rätt!';score++;}else{btn.classList.add('wrong');document.getElementById('result').textContent='❌ Fel!';}disableAll();document.getElementById('nextBtn').classList.remove('hidden');};document.getElementById('options').appendChild(btn);});}

document.getElementById('nextBtn').onclick=()=>{index++;if(index<tracks.length)loadQuestion();else showFinal();};
function showFinal(){document.getElementById('question').textContent=`Klart! Du fick ${score}/${tracks.length} rätt 🎉`;document.getElementById('player').classList.add('hidden');document.getElementById('options').innerHTML='';document.getElementById('nextBtn').classList.add('hidden');}
function disableAll(){document.querySelectorAll('#options button').forEach(b=>b.disabled=true);}function shuffle(a){return a.sort(()=>Math.random()-0.5);}function fake(t){return t.split(" ").reverse().join(" ");}