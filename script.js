let flashcards = [];
let filteredFlashcards = [];
let currentCard = null;
let isReversed = false;

// ======================
// TRANSLATION FUNCTIONS
// ======================
async function translateText(text) {
  const response = await fetch(
    `https://aerial-plant-fenugreek.glitch.me/translate?text=${encodeURIComponent(text)}`
  );
  if (!response.ok) throw new Error(`Translation API failed: ${response.status}`);
  const data = await response.json();
  return data.translation;
}

async function translateInput() {
  const germanInput = document.getElementById("german");
  const englishInput = document.getElementById("english");
  const germanText = germanInput.value.trim();

  if (!germanText) {
    alert("Please enter a German word first.");
    return;
  }

  try {
    englishInput.value = "Translating...";
    englishInput.disabled = true;
    const translation = await translateText(germanText);
    englishInput.value = translation;
  } catch (error) {
    englishInput.value = "";
    alert("Translation failed. Please enter manually.");
    console.error("Translation error:", error);
  } finally {
    englishInput.disabled = false;
  }
}

async function translateCard() {
  if (!currentCard) return;
  const englishWord = document.getElementById("english-word");

  try {
    englishWord.textContent = "Translating...";
    const source = isReversed ? currentCard.english : currentCard.german;
    const translation = await translateText(source);
    englishWord.textContent = translation;
    document.getElementById("reveal-mode").style.display = "block";
  } catch (error) {
    englishWord.textContent = "❌ Translation failed";
    console.error("Practice translation error:", error);
  }
}

// ======================
// FLASHCARD MANAGEMENT
// ======================
function loadFlashcards() {
  fetch('words-new.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      const localData = JSON.parse(localStorage.getItem("flashcards")) || [];
      flashcards = localData.length > 0 ? localData : data;
      filteredFlashcards = [...flashcards];
      if (localData.length === 0) {
        localStorage.setItem("flashcards", JSON.stringify(flashcards));
      }
      console.log("Flashcards loaded:", flashcards.length);
    })
    .catch(error => console.error("Loading error:", error));
}

function addCard() {
  const german = document.getElementById("german").value.trim();
  const english = document.getElementById("english").value.trim();

  if (!german || !english) {
    alert("Both fields are required!");
    return;
  }

  // Determine type automatically
  let type = "other";
  if (german.endsWith('en') || german.endsWith('n')) type = "verb";
  else if (german.endsWith('ig') || german.endsWith('lich') || german.endsWith('isch') || 
           german.endsWith('bar') || german.endsWith('sam') || german.endsWith('haft')) type = "adjective";
  else if (german[0] === german[0].toUpperCase() && german[0] !== german[0].toLowerCase()) type = "noun";

  flashcards.push({ german, english, type });
  filteredFlashcards = [...flashcards];
  localStorage.setItem("flashcards", JSON.stringify(flashcards));

  document.getElementById("german").value = "";
  document.getElementById("english").value = "";
  document.getElementById("german").focus();
}

// ======================
// FILTER FUNCTIONS
// ======================
function filterFlashcards() {
  const type = document.getElementById("typeFilter").value;
  if (type === "all") {
    filteredFlashcards = [...flashcards];
  } else {
    filteredFlashcards = flashcards.filter(card => card.type === type);
  }
  // Reset current card if it's not in the filtered set
  if (currentCard && !filteredFlashcards.includes(currentCard)) {
    currentCard = null;
  }
}

// ======================
// PRACTICE MODE
// ======================
function showRandomCard() {
  if (filteredFlashcards.length === 0) {
    if (flashcards.length === 0) {
      alert("No flashcards available. Add some first!");
    } else {
      alert("No flashcards match the current filter. Change the filter and try again.");
    }
    return;
  }

  currentCard = filteredFlashcards[Math.floor(Math.random() * filteredFlashcards.length)];
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
  if (!currentCard) return;

  const userAnswer = document.getElementById("userInput").value.trim().toLowerCase();
  const correctAnswer = (isReversed ? currentCard.german : currentCard.english).toLowerCase();
  const feedback = document.getElementById("feedback");

  if (userAnswer === correctAnswer) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "var(--correct-color, green)";
  } else {
    feedback.textContent = `❌ Incorrect. The answer was: ${isReversed ? currentCard.german : currentCard.english}`;
    feedback.style.color = "var(--incorrect-color, red)";
  }

  document.getElementById("userInput").blur();
}

function revealAnswer() {
  if (!currentCard) return;
  document.getElementById("english-word").textContent =
    document.getElementById("english-word").dataset.translation;
  document.getElementById("reveal-mode").style.display = "block";
}

// ======================
// UI HELPERS
// ======================
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const btn = document.getElementById("darkModeBtn");
  btn.textContent = document.body.classList.contains("dark-mode")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
}

function toggleMode() {
  isReversed = !isReversed;
  const btn = document.getElementById("toggleModeBtn");
  btn.textContent = isReversed ? "🔁 Mode: EN → DE" : "🔁 Mode: DE → EN";
  showRandomCard();
}

// ======================
// INITIALIZATION
// ======================
document.addEventListener("keydown", (e) => {
  const inputFocused = document.activeElement.tagName === "INPUT";

  if (e.key === "Enter" && inputFocused && document.getElementById("userInput").value) {
    checkAnswer();
  } else if (!inputFocused) {
    switch (e.key.toLowerCase()) {
      case "r": revealAnswer(); break;
      case "n": showRandomCard(); break;
      case "d": toggleDarkMode(); break;
      case "t": translateCard(); break;
    }
  }
});

loadFlashcards();
