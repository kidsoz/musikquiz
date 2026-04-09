// DIN QUIZ-DATA (INGET API BEHÖVS)
const quiz = [
  {
    question: "Vilken låt är detta?",
    trackId: "3AJwUDP919kvQ9QcozQPxg", // t.ex. 'Dancing Queen'
    options: [
      "Dancing Queen – ABBA",
      "Gimme! Gimme! Gimme! – ABBA",
      "Mamma Mia – ABBA"
    ],
    correct: 0
  },
  {
    question: "Vem är artisten?",
    trackId: "1hKdDCpiI9mqz1jVHRKG0E", // t.ex. 'Habits (Stay High)' Tove Lo
    options: [
      "Zara Larsson",
      "Tove Lo",
      "Robyn"
    ],
    correct: 1
  }
];

let index = 0;
let score = 0;

const qEl = document.getElementById("question");
const optEl = document.getElementById("options");
const resEl = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const player = document.getElementById("spotifyPlayer");

loadQuestion();

function loadQuestion() {
  const q = quiz[index];

  qEl.innerHTML = `<h2>${q.question}</h2>`;
  resEl.innerHTML = "";
  nextBtn.classList.add("hidden");

  // ✅ Visa Spotify-spelaren
  player.src = `https://open.spotify.com/embed/track/${q.trackId}`;

  // ✅ Visa svarsalternativ
  optEl.innerHTML = "";
  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.textContent = text;

    btn.onclick = () => {
      if (i === q.correct) {
        btn.classList.add("correct");
        resEl.textContent = "✅ Rätt!";
        score++;
      } else {
        btn.classList.add("wrong");
        resEl.textContent = "❌ Fel!";
      }

      disableAll();
      nextBtn.classList.remove("hidden");
    };

    optEl.appendChild(btn);
  });
}

nextBtn.onclick = () => {
  index++;
  if (index < quiz.length) loadQuestion();
  else showFinal();
};

function disableAll() {
  optEl.querySelectorAll("button").forEach(b => b.disabled = true);
}

function showFinal() {
  qEl.innerHTML = `<h2>Klart! Du fick ${score}/${quiz.length} rätt 🎉</h2>`;
  player.style.display = "none";
  optEl.innerHTML = "";
  nextBtn.classList.add("hidden");
}
