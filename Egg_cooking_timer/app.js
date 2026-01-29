// ==========================================
// 🎮 EGG MASTER - ARCADE TIMER
// Anime Arcade Style Egg Cooking Timer
// ==========================================

// DOM Elements
const eggOptions = document.querySelectorAll('.egg-option');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const timeDisplay = document.getElementById('time-display');
const statusText = document.getElementById('status-text');
const progressCircle = document.getElementById('progress-circle');
const timerDisplay = document.getElementById('timer-display');
const egg = document.getElementById('egg');
const pot = document.querySelector('.pot');
const completionModal = document.getElementById('completion-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalMessage = document.getElementById('modal-message');
const soundToggle = document.getElementById('sound-toggle');
const qrToggle = document.getElementById('qr-toggle');
const qrPopup = document.getElementById('qr-popup');
const qrCanvas = document.getElementById('qr-canvas');

// Timer State
let selectedTime = 0;
let remainingTime = 0;
let timerInterval = null;
let selectedType = null;
let soundEnabled = true;

// Audio Context for Sound Effects
let audioContext = null;

// Constants
const CIRCUMFERENCE = 2 * Math.PI * 90;

// Initialize
function init() {
    progressCircle.style.strokeDasharray = CIRCUMFERENCE;
    progressCircle.style.strokeDashoffset = CIRCUMFERENCE;

    // Initialize audio context on first user interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    // Generate QR Code
    generateQRCode();
}

// Initialize Audio Context
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🔊 Audio system initialized!');
    } catch (e) {
        console.log('Audio not supported');
    }
}

// ==========================================
// 🔊 SOUND EFFECTS - Arcade Style
// ==========================================

function playSound(type) {
    if (!soundEnabled || !audioContext) return;

    switch (type) {
        case 'select':
            playSelectSound();
            break;
        case 'start':
            playStartSound();
            break;
        case 'tick':
            playTickSound();
            break;
        case 'complete':
            playCompleteSound();
            break;
        case 'hover':
            playHoverSound();
            break;
        case 'click':
            playClickSound();
            break;
        case 'reset':
            playResetSound();
            break;
    }
}

// Arcade select/coin sound
function playSelectSound() {
    const now = audioContext.currentTime;

    // Coin insert sound
    playTone(987.77, now, 0.08, 'square', 0.2);        // B5
    playTone(1318.51, now + 0.08, 0.08, 'square', 0.2); // E6
    playTone(1567.98, now + 0.16, 0.15, 'square', 0.15); // G6
}

// Game start fanfare
function playStartSound() {
    const now = audioContext.currentTime;

    // Power up sound
    for (let i = 0; i < 10; i++) {
        const freq = 200 + (i * 100);
        playTone(freq, now + (i * 0.03), 0.05, 'sawtooth', 0.1);
    }

    // Final note
    playTone(880, now + 0.35, 0.2, 'square', 0.15);
}

// Tick sound for timer
function playTickSound() {
    const now = audioContext.currentTime;
    playTone(800, now, 0.02, 'sine', 0.05);
}

// Victory/Complete sound
function playCompleteSound() {
    const now = audioContext.currentTime;

    // Victory fanfare
    const melody = [
        { freq: 523.25, time: 0, dur: 0.15 },     // C5
        { freq: 659.25, time: 0.15, dur: 0.15 },  // E5
        { freq: 783.99, time: 0.3, dur: 0.15 },   // G5
        { freq: 1046.50, time: 0.45, dur: 0.3 },  // C6
        { freq: 783.99, time: 0.8, dur: 0.1 },    // G5
        { freq: 1046.50, time: 0.95, dur: 0.5 },  // C6
    ];

    melody.forEach(note => {
        playTone(note.freq, now + note.time, note.dur, 'square', 0.15);
    });

    // Add some sparkle
    for (let i = 0; i < 5; i++) {
        playTone(2000 + Math.random() * 2000, now + 1.5 + (i * 0.1), 0.05, 'sine', 0.05);
    }
}

// Hover sound
function playHoverSound() {
    const now = audioContext.currentTime;
    playTone(440, now, 0.03, 'sine', 0.03);
}

// Click sound
function playClickSound() {
    const now = audioContext.currentTime;
    playTone(600, now, 0.05, 'square', 0.08);
    playTone(800, now + 0.05, 0.05, 'square', 0.06);
}

// Reset/cancel sound
function playResetSound() {
    const now = audioContext.currentTime;
    playTone(400, now, 0.1, 'sawtooth', 0.1);
    playTone(300, now + 0.1, 0.1, 'sawtooth', 0.08);
    playTone(200, now + 0.2, 0.15, 'sawtooth', 0.05);
}

// Core tone generator
function playTone(frequency, startTime, duration, waveType = 'sine', volume = 0.1) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = waveType;

    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.1);
}

// ==========================================
// 🎯 EVENT LISTENERS
// ==========================================

// Helper function to handle both click and touch
function addTouchClick(element, handler) {
    let touchMoved = false;

    element.addEventListener('touchstart', () => {
        touchMoved = false;
    }, { passive: true });

    element.addEventListener('touchmove', () => {
        touchMoved = true;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
        if (!touchMoved) {
            e.preventDefault();
            handler();
        }
    });

    element.addEventListener('click', (e) => {
        // Only handle click if not from touch
        if (e.pointerType !== 'touch') {
            handler();
        }
    });
}

// Egg Option Selection
eggOptions.forEach(option => {
    addTouchClick(option, () => selectOption(option));
    option.addEventListener('mouseenter', () => playSound('hover'));
});

// Control Buttons
addTouchClick(startBtn, startTimer);
addTouchClick(resetBtn, resetTimer);
addTouchClick(modalCloseBtn, closeModal);

// Sound Toggle
addTouchClick(soundToggle, toggleSound);

// QR Code Toggle
addTouchClick(qrToggle, toggleQRPopup);

// Close QR popup when clicking outside
document.addEventListener('click', (e) => {
    if (!qrPopup.contains(e.target) && e.target !== qrToggle) {
        qrPopup.classList.add('hidden');
    }
});

document.addEventListener('touchend', (e) => {
    if (!qrPopup.contains(e.target) && e.target !== qrToggle) {
        qrPopup.classList.add('hidden');
    }
});

// ==========================================
// 🎮 GAME LOGIC
// ==========================================

function selectOption(option) {
    playSound('select');

    // Remove previous selection
    eggOptions.forEach(opt => opt.classList.remove('selected'));

    // Add selection to clicked option
    option.classList.add('selected');

    // Get time and type
    selectedTime = parseInt(option.dataset.time);
    selectedType = option.dataset.type;
    remainingTime = selectedTime;

    // Update display
    updateTimeDisplay(remainingTime);
    statusText.textContent = 'READY!';

    // Enable start button
    startBtn.disabled = false;

    // Reset egg state
    egg.className = 'egg';

    // Animate selection
    option.style.transform = 'translateX(8px) scale(1.05)';
    setTimeout(() => {
        option.style.transform = '';
    }, 150);
}

function startTimer() {
    if (remainingTime <= 0) return;

    playSound('start');

    // Update UI state
    startBtn.classList.add('hidden');
    resetBtn.classList.remove('hidden');
    timerDisplay.classList.add('running');

    // Start animations
    egg.classList.add('cooking');
    pot.classList.add('boiling');

    // Disable option selection
    eggOptions.forEach(opt => opt.style.pointerEvents = 'none');

    // Update status
    statusText.textContent = 'COOKING...';

    // Start countdown
    let lastSecond = remainingTime;
    timerInterval = setInterval(() => {
        remainingTime--;
        updateTimeDisplay(remainingTime);
        updateProgress();
        updateEggState();

        // Play tick sound every second
        if (Math.floor(remainingTime) !== lastSecond) {
            if (remainingTime <= 10 && remainingTime > 0) {
                playSound('tick');
            }
            lastSecond = Math.floor(remainingTime);
        }

        if (remainingTime <= 0) {
            completeTimer();
        }
    }, 1000);
}

function updateTimeDisplay(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateProgress() {
    const progress = (selectedTime - remainingTime) / selectedTime;
    const offset = CIRCUMFERENCE - (progress * CIRCUMFERENCE);
    progressCircle.style.strokeDashoffset = offset;
}

function updateEggState() {
    const progress = (selectedTime - remainingTime) / selectedTime;

    if (progress >= 0.9) {
        egg.className = 'egg cooking ' + selectedType;
    } else if (progress >= 0.5) {
        egg.classList.add('cooking');
        const yolk = document.getElementById('egg-yolk');
        yolk.style.opacity = 0.3 + (progress * 0.7);
    }
}

function completeTimer() {
    clearInterval(timerInterval);
    timerInterval = null;

    // Stop animations
    egg.classList.remove('cooking');
    egg.classList.add('complete', selectedType);
    pot.classList.remove('boiling');
    timerDisplay.classList.remove('running');

    // Play victory sound
    playSound('complete');

    // Show modal
    showModal();

    // Update status
    statusText.textContent = 'PERFECT!';
}

function resetTimer() {
    playSound('reset');

    // Clear interval
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    // Reset state
    remainingTime = selectedTime;

    // Reset UI
    startBtn.classList.remove('hidden');
    resetBtn.classList.add('hidden');
    timerDisplay.classList.remove('running');

    // Reset egg
    egg.className = 'egg';
    pot.classList.remove('boiling');

    // Reset progress
    progressCircle.style.strokeDashoffset = CIRCUMFERENCE;

    // Re-enable options
    eggOptions.forEach(opt => opt.style.pointerEvents = 'auto');

    // Update display
    if (selectedTime > 0) {
        updateTimeDisplay(selectedTime);
        statusText.textContent = 'READY!';
    } else {
        timeDisplay.textContent = '00:00';
        statusText.textContent = 'SELECT MODE';
    }
}

function showModal() {
    const messages = {
        soft: '🍳 Perfect soft egg! Transfer to ice water for 1 min. Enjoy that runny yolk!',
        medium: '🥚 Jammy perfection! Cool in ice water for 2 min. The best texture!',
        hard: '🥚 Fully cooked! Cool in ice water for 5 min for easy peeling.'
    };

    modalMessage.textContent = messages[selectedType] || 'Your egg is ready!';
    completionModal.classList.remove('hidden');
}

function closeModal() {
    playSound('click');
    completionModal.classList.add('hidden');
}

// ==========================================
// 🔊 SOUND TOGGLE
// ==========================================

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
    soundToggle.classList.toggle('muted', !soundEnabled);

    if (soundEnabled) {
        playSound('click');
    }
}

// ==========================================
// 📱 QR CODE GENERATION
// ==========================================

// ⚡ SET YOUR DEPLOYED URL HERE! ⚡
// After deploying to Netlify/Vercel/GitHub Pages, paste your URL below:
const DEPLOYED_URL = 'https://datta4549.github.io/egg-timer/';
// Examples:
// 'https://your-app-name.netlify.app'
// 'https://your-username.github.io/egg-timer'
// 'https://egg-timer.vercel.app'

function generateQRCode() {
    // Use deployed URL if available, otherwise use current URL
    let url = DEPLOYED_URL;

    // If no deployed URL set, try to use current URL
    if (!DEPLOYED_URL || DEPLOYED_URL === 'https://egg-master-timer.netlify.app') {
        const currentUrl = window.location.href;
        // If we're on a real hosted URL (not file://), use that
        if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) {
            url = currentUrl.split('?')[0]; // Remove query params
        }
    }

    // Generate QR code using the library
    if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(qrCanvas, url, {
            width: 150,
            margin: 2,
            color: {
                dark: '#00f5ff',
                light: '#0a0a1a'
            }
        }, function (error) {
            if (error) {
                console.log('QR Code generation failed:', error);
                createFallbackQR(url);
            } else {
                console.log('📱 QR Code generated for:', url);
            }
        });
    } else {
        // Manual QR-like pattern as fallback
        createFallbackQR(url);
    }

    // Update the popup text with the URL
    const qrPopupText = document.querySelector('.qr-popup p');
    if (qrPopupText) {
        if (url.startsWith('file://')) {
            qrPopupText.innerHTML = '⚠️ Deploy to share!<br><small>See DEPLOY.html</small>';
        } else {
            qrPopupText.innerHTML = `<small>${url.replace('https://', '')}</small>`;
        }
    }
}

function createFallbackQR(url) {
    const ctx = qrCanvas.getContext('2d');
    qrCanvas.width = 150;
    qrCanvas.height = 150;

    // Background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, 150, 150);

    // Create a simple pattern
    ctx.fillStyle = '#00f5ff';
    const size = 10;

    // Corner patterns
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            // Top-left corner
            ctx.fillRect(10 + i * size, 10 + j * size, size - 2, size - 2);
            // Top-right corner
            ctx.fillRect(110 + i * size, 10 + j * size, size - 2, size - 2);
            // Bottom-left corner
            ctx.fillRect(10 + i * size, 110 + j * size, size - 2, size - 2);
        }
    }

    // Center text
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EGG', 75, 70);
    ctx.fillText('MASTER', 75, 85);
}

function toggleQRPopup() {
    playSound('click');
    qrPopup.classList.toggle('hidden');
}

// ==========================================
// ⌨️ KEYBOARD CONTROLS
// ==========================================

document.addEventListener('keydown', (e) => {
    // Space to start
    if (e.code === 'Space' && !startBtn.disabled && !startBtn.classList.contains('hidden')) {
        e.preventDefault();
        startTimer();
    }

    // Escape to reset/close modal
    if (e.code === 'Escape') {
        if (!completionModal.classList.contains('hidden')) {
            closeModal();
        } else if (timerInterval) {
            resetTimer();
        }
    }

    // Number keys to select options
    if (e.key === '1') {
        document.getElementById('soft-btn').click();
    }
    if (e.key === '2') {
        document.getElementById('medium-btn').click();
    }
    if (e.key === '3') {
        document.getElementById('hard-btn').click();
    }

    // M to toggle mute
    if (e.key === 'm' || e.key === 'M') {
        toggleSound();
    }
});

// ==========================================
// 📱 TOUCH SUPPORT
// ==========================================

eggOptions.forEach(option => {
    option.addEventListener('touchstart', () => {
        option.style.transform = 'scale(0.98)';
    });
    option.addEventListener('touchend', () => {
        option.style.transform = '';
    });
});

// ==========================================
// 🚀 INITIALIZE
// ==========================================

init();
console.log('🎮 EGG MASTER loaded! Press 1, 2, or 3 to select, SPACE to start!');
