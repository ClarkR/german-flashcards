let flashcards = [];
let currentCard = null;

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
    const translation = await translateText(currentCard.german);
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

  if (flashcards.some(card => card.german.toLowerCase() === german.toLowerCase())) {
    alert("This word already exists!");
    return;
  }

  flashcards.push({ german, english });
  localStorage.setItem("flashcards", JSON.stringify(flashcards));
  
  // Clear inputs
  document.getElementById("german").value = "";
  document.getElementById("english").value = "";
  
  // Optional: Show confirmation
  document.getElementById("german").focus();
  console.log("Added:", { german, english });
}

// ======================
// PRACTICE MODE
// ======================
function showRandomCard() {
  if (flashcards.length === 0) {
    alert("No flashcards available. Add some first!");
    return;
  }

  currentCard = flashcards[Math.floor(Math.random() * flashcards.length)];
  document.getElementById("german-word").textContent = currentCard.german;
  
  // Reset UI
  document.getElementById("answer-mode").style.display = "block";
  document.getElementById("reveal-mode").style.display = "none";
  document.getElementById("userInput").value = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("english-word").textContent = "???";
  document.getElementById("english-word").dataset.translation = currentCard.english;
}

function checkAnswer() {
  if (!currentCard) return;
  
  const userAnswer = document.getElementById("userInput").value.trim().toLowerCase();
  const correctAnswer = currentCard.english.toLowerCase();
  const feedback = document.getElementById("feedback");
  
  if (userAnswer === correctAnswer) {
    feedback.textContent = "✅ Correct!";
    feedback.style.color = "var(--correct-color, green)";
  } else {
    feedback.textContent = `❌ Incorrect. The answer was: ${currentCard.english}`;
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
      case "t": translateCard(); break; // Added translation shortcut
    }
  }
});

// Load flashcards on startup
loadFlashcards();
