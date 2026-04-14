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

async function loadPlaylist(){const token=localStorage.getItem('spotify_access_token');const playlist="3pEXYGttJuLxSlrxN4UDcn";const res=await fetch(`https://api.spotify.com/v1/playlists/${playlist}/tracks`,{headers:{Authorization:`Bearer ${token}`}});const data=await res.json();tracks=data.items.map(i=>i.track).filter(t=>t.preview_url);document.getElementById('loginBtn').classList.add('hidden');document.getElementById('quizArea').classList.remove('hidden');loadQuestion();}

function loadQuestion(){const q=tracks[idx];document.getElementById('questionText').textContent='Vilken låt är detta?';document.getElementById('audioPlayer').src=q.preview_url;document.getElementById('result').textContent='';document.getElementById('nextBtn').classList.add('hidden');const opts=[q.name, fake(q.name), fake(q.name)];shuffle(opts);const optDiv=document.getElementById('options');optDiv.innerHTML='';opts.forEach(o=>{const btn=document.createElement('button');btn.textContent=o;btn.onclick=()=>{if(o===q.name){btn.classList.add('correct');score++;document.getElementById('result').textContent='✅ Rätt!';} else {btn.classList.add('wrong');document.getElementById('result').textContent='❌ Fel!';} disableAll();document.getElementById('nextBtn').classList.remove('hidden');};optDiv.appendChild(btn);});}

document.getElementById('nextBtn').onclick=()=>{idx++;if(idx<tracks.length)loadQuestion();else finish();};

function fake(t){return t.split(' ').reverse().join(' ');}
function disableAll(){document.querySelectorAll('#options button').forEach(b=>b.disabled=true);}
function shuffle(a){return a.sort(()=>Math.random()-0.5);}
function finish(){document.getElementById('quizArea').innerHTML=`<h2>Klart! Du fick ${score} av ${tracks.length} rätt 🎉</h2>`;}
