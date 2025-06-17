let flashcards = [];
let currentCard = null;

fetch('words.json')
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
    console.log("Flashcards loaded:", flashcards);
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
    alert("No flashcards available.");
    return;
  }

  const index = Math.floor(Math.random() * flashcards.length);
  currentCard = flashcards[index];
  console.log("Showing card:", currentCard);

  const answerMode = document.getElementById("answer-mode");
  const userInput = document.getElementById("userInput");
  const feedback = document.getElementById("feedback");
  const englishWord = document.getElementById("english-word");
  const revealMode = document.getElementById("reveal-mode");

  document.getElementById("german-word").textContent = currentCard.german;

  answerMode.style.display = "block";
  userInput.value = "";
  feedback.textContent = "";

  englishWord.textContent = "???";
  englishWord.dataset.translation = currentCard.english;

  revealMode.style.display = "none";
}

function checkAnswer() {
  if (!currentCard) {
    alert("Please show a flashcard first.");
    return;
  }

  const userAnswer = document.getElementById("userInput").value.trim().toLowerCase();
  const correctAnswer = currentCard.english.toLowerCase();
  const feedback = document.getElementById("feedback");

  if (userAnswer === correctAnswer) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "green";
  } else {
    feedback.textContent = `❌ Incorrect. Correct answer: ${currentCard.english}`;
    feedback.style.color = "red";
  }
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

document.addEventListener("keydown", function (e) {
  const inputFocused = document.activeElement.tagName === "INPUT";

  if (e.key === "Enter" && inputFocused && document.getElementById("userInput").value) {
    checkAnswer();
  } else if (e.key.toLowerCase() === "r" && !inputFocused) {
    revealAnswer();
  } else if (e.key.toLowerCase() === "n" && !inputFocused) {
    showRandomCard();
  } else if (e.key.toLowerCase() === "d" && !inputFocused) {
    toggleDarkMode();
  }
});
