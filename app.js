let quizData = [];
let currentPerson = null;
let score = 0;
let streak = 0;
let isAnswered = false;

// Common nationalities to ensure good distractors
const ALL_NATIONALITIES = [
    "South Korea", "Japan", "China", "Taiwan", 
    "Thailand", "Vietnam", "Philippines", "India"
];

const imgElement = document.getElementById('celeb-img');
const nameElement = document.getElementById('celeb-name');
const optionsContainer = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const resultMsg = document.getElementById('result-message');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');

// Normalize nationality names (Wikidata labels can be verbose)
function normalizeNationality(nat) {
    if (nat.includes('Korea')) return 'South Korea'; // Simplify ROK
    if (nat.includes('China') || nat.includes('Chinese')) return 'China';
    return nat;
}

async function init() {
    try {
        const response = await fetch('quiz-data.json');
        const data = await response.json();
        
        // Filter out bad data (missing images) and normalize
        quizData = data.filter(p => p.image).map(p => ({
            ...p,
            nationality: normalizeNationality(p.nationality)
        }));

        if (quizData.length === 0) {
            alert("No data found. Please run the fetch script.");
            return;
        }

        loadNextQuestion();
    } catch (e) {
        console.error("Failed to load data", e);
        nameElement.innerText = "Error loading data. Run 'node scripts/fetch-data.js'";
    }
}

function getRandomItems(arr, count, exclude) {
    let pool = arr.filter(i => i !== exclude);
    let result = [];
    for(let i=0; i<count; i++) {
        if (pool.length === 0) break;
        const idx = Math.floor(Math.random() * pool.length);
        result.push(pool[idx]);
        pool.splice(idx, 1);
    }
    return result;
}

function loadNextQuestion() {
    isAnswered = false;
    resultMsg.textContent = '';
    resultMsg.className = 'hidden';
    nextBtn.classList.add('hidden');
    optionsContainer.innerHTML = ''; // Clear buttons

    // Pick random person
    const idx = Math.floor(Math.random() * quizData.length);
    currentPerson = quizData[idx];

    // Set UI
    imgElement.src = currentPerson.image;
    nameElement.textContent = currentPerson.name;

    // Generate Options (1 correct + 3 random unique wrong ones)
    const correctNat = currentPerson.nationality;
    const distractors = getRandomItems(ALL_NATIONALITIES, 3, correctNat);
    const options = [correctNat, ...distractors];
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => handleGuess(opt, btn);
        optionsContainer.appendChild(btn);
    });
}

function handleGuess(guess, btnElement) {
    if (isAnswered) return;
    isAnswered = true;

    const correct = currentPerson.nationality;
    
    if (guess === correct) {
        btnElement.classList.add('correct');
        resultMsg.textContent = "Correct! 🎉";
        resultMsg.style.color = "var(--correct)";
        score++;
        streak++;
    } else {
        btnElement.classList.add('wrong');
        resultMsg.textContent = `Wrong! They are from ${correct}.`;
        resultMsg.style.color = "var(--wrong)";
        streak = 0;
        
        // Highlight correct button
        const buttons = optionsContainer.querySelectorAll('button');
        buttons.forEach(b => {
            if (b.textContent === correct) b.classList.add('correct');
        });
    }

    scoreEl.textContent = score;
    streakEl.textContent = streak;
    
    resultMsg.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
}

nextBtn.onclick = loadNextQuestion;

init();
