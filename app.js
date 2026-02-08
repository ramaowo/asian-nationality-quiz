let wikiFetcher = new WikiFetcher();
let currentPerson = null;
let score = 0;
let streak = 0;
let isAnswered = false;

const ALL_NATIONALITIES = Object.keys(wikiFetcher.categories);

const imgElement = document.getElementById('celeb-img');
const nameElement = document.getElementById('celeb-name');
const optionsContainer = document.getElementById('options');
const nextBtn = document.getElementById('next-btn');
const resultMsg = document.getElementById('result-message');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const loadingIndicator = document.getElementById('loading');

async function init() {
    // Initial load
    loadNextQuestion();
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

async function loadNextQuestion() {
    isAnswered = false;
    resultMsg.textContent = '';
    resultMsg.className = 'hidden';
    nextBtn.classList.add('hidden');
    optionsContainer.innerHTML = ''; 
    nameElement.textContent = "Loading...";
    imgElement.style.opacity = "0.3";
    loadingIndicator.classList.remove('hidden');

    try {
        // Dynamic fetch!
        currentPerson = await wikiFetcher.fetchRandomCelebrity();

        if (!currentPerson) {
            nameElement.textContent = "Error loading. Please try again.";
            nextBtn.classList.remove('hidden');
            return;
        }

        // Set UI
        imgElement.onload = () => {
            imgElement.style.opacity = "1";
            loadingIndicator.classList.add('hidden');
        };
        imgElement.src = currentPerson.image;
        imgElement.onerror = () => {
            imgElement.src = 'https://via.placeholder.com/400x400?text=No+Image';
        };
        
        nameElement.textContent = currentPerson.name;

        // Generate Options
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

    } catch (e) {
        console.error(e);
        nameElement.textContent = "Failed to load celebrity.";
        nextBtn.classList.remove('hidden');
    }
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
