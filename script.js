let flashcards = [];
let currentCard = null;
let isReversed = false; // NEW: toggle mode flag

fetch('words-new.json')
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  })
  .then(data => {
    const localData = JSON.parse(localStorage.getItem("flashcards")) || [];
    flashcards = localData.length > 0 ? localData : data;
    if (localData.length === 0) {
      localStorage.setItem("flashcards", JSON.stringify(flashcards));
    }
  })
  .catch(error => console.error("Error loading JSON:", error));

function addCard() {
  const german = document.getElementById("german").value.trim();
  const english = document.getElementById("english").value.trim();

  if (!german || !english) {
    alert("Please fill in both fields.");
    return;
  }

  if (flashcards.some(card => card.german.toLowerCase() === german.toLowerCase())) {
    alert("This German word already exists.");
    return;
  }

  flashcards.push({ german, english });
  localStorage.setItem("flashcards", JSON.stringify(flashcards));

  document.getElementById("german").value = "";
  document.getElementById("english").value = "";

  alert("Flashcard added!");
}

function showRandomCard() {
  if (flashcards.length === 0) {
    alert("No flashcards available. Add some first!");
    return;
  }

  currentCard = flashcards[Math.floor(Math.random() * flashcards.length)];

  document.getElementById("german-word").textContent = isReversed
    ? currentCard.english
    : currentCard.german;

  document.getElementById("userInput").value = "";
  document.getElementById("userInput").placeholder = isReversed
    ? "Type German translation"
    : "Type English translation";

  document.getElementById("feedback").textContent = "";
  document.getElementById("answer-mode").style.display = "block";
  document.getElementById("reveal-mode").style.display = "none";

  document.getElementById("english-word").textContent = "???";
  document.getElementById("english-word").dataset.translation = isReversed
    ? currentCard.german
    : currentCard.english;
}

function checkAnswer() {
  if (!currentCard) {
    alert("Please show a flashcard first.");
    return;
  }

  const userAnswer = document.getElementById("userInput").value.trim().toLowerCase();
  const correctAnswer = (isReversed ? currentCard.german : currentCard.english).toLowerCase();
  const feedback = document.getElementById("feedback");

  if (userAnswer === correctAnswer) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = `❌ Incorrect. Correct answer: ${isReversed ? currentCard.german : currentCard.english}`;
    feedback.style.color = "red";
  }

  document.getElementById("userInput").blur();
}

function revealAnswer() {
  if (!currentCard) {
    alert("Please show a flashcard first.");
    return;
  }
  const answer = document.getElementById("english-word").dataset.translation;
  document.getElementById("english-word").textContent = answer;
  document.getElementById("reveal-mode").style.display = "block";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const btn = document.getElementById("darkModeBtn");
  const isDark = document.body.classList.contains("dark-mode");
  btn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function toggleMode() {
  isReversed = !isReversed;
  const btn = document.getElementById("toggleModeBtn");
  btn.textContent = isReversed ? "🔁 Mode: EN → DE" : "🔁 Mode: DE → EN";
  showRandomCard();
}

document.addEventListener("keydown", function (e) {
  const inputFocused = document.activeElement.tagName === "INPUT";
  if (e.key === "Enter" && inputFocused && document.getElementById("userInput").value) {
    checkAnswer();
  } else if (e.key.toLowerCase() === "r") {
    revealAnswer();
  } else if (e.key.toLowerCase() === "n") {
    showRandomCard();
  } else if (e.key.toLowerCase() === "d") {
    toggleDarkMode();
  }
});
