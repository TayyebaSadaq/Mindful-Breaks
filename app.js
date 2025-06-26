const bells = new Audio('./sounds/bell.wav');
const startBtn = document.querySelector('.btn-start');
const stopBtn = document.querySelector('.btn-stop'); // new stop button
const session = document.querySelector('.minutes');
const seconds = document.querySelector('.seconds');
const setBtn = document.querySelector('.btn-set'); // new set button
const inputMinutes = document.querySelector('.input-minutes'); // new input
const breakBtn = document.querySelector('.btn-break');
const breatheBtn = document.querySelector('.btn-breathe');
const controls = document.querySelector('.app-controls');
const circle = document.querySelector('.app-circle');
const message = document.querySelector('.app-message');
const breakInput = document.querySelector('.input-break-minutes');
const setBreakBtn = document.querySelector('.btn-set-break');
const breakModal = document.querySelector('.break-modal');
const breatheModal = document.querySelector('.breathe-modal');
const breatheInput = document.querySelector('.input-breathe-minutes');
const setBreatheBtn = document.querySelector('.btn-set-breathe');
const backBtns = document.querySelectorAll('.btn-back-main');
let myInterval;
let state = true;
let totalSeconds;
let breathingInterval;
let breathingStep = 0;
let breathingDuration = 0;
let breathingElapsed = 0;
let isBreak = false; // Track if currently in break mode

const startTimer = () => {
    if (state) {
        state = false;
        const sessionAmount = Number.parseInt(session.textContent);
        totalSeconds = sessionAmount * 60;
        updateDisplay(totalSeconds); // Ensure display is correct at start
        myInterval = setInterval(updateSeconds, 1000);
    } else {
        alert('Session has already started.');
    }
};

const updateDisplay = (totalSecs) => {
    const minuteDiv = document.querySelector('.minutes');
    const secondDiv = document.querySelector('.seconds');
    let minutesLeft = Math.floor(totalSecs / 60);
    let secondsLeft = totalSecs % 60;
    minuteDiv.textContent = `${minutesLeft}`;
    secondDiv.textContent = secondsLeft < 10 ? '0' + secondsLeft : secondsLeft;
};

const stopTimer = () => {
    clearInterval(myInterval);
    state = true;
};

const setTimer = () => {
    let val = parseInt(inputMinutes.value, 10);
    if (!isNaN(val) && val > 0) {
        session.textContent = val;
        seconds.textContent = '00';
        stopTimer();
        updateDisplay(val * 60);
    }
};

const showBreakOrBreathe = () => {
    controls.style.display = 'none';
    document.querySelector('.break-breathe-options').style.display = 'flex';
    if (breakModal) breakModal.style.display = 'none';
    if (breatheModal) breatheModal.style.display = 'none';
    message.textContent = isBreak
        ? "Break complete! Ready for another session?"
        : "Session complete! Have a break";
    isBreak = false;

    // Show "Start New Session" button if break just ended
    let newSessionBtn = document.querySelector('.btn-new-session');
    if (!newSessionBtn) {
        newSessionBtn = document.createElement('button');
        newSessionBtn.className = 'btn-new-session';
        newSessionBtn.textContent = 'Start New Session';
        newSessionBtn.style.marginTop = '12px';
        newSessionBtn.onclick = () => {
            document.querySelector('.break-breathe-options').style.display = 'none';
            controls.style.display = 'flex';
            // Reset timer to default or last session value
            let defaultSession = inputMinutes.value && parseInt(inputMinutes.value, 10) > 0
                ? parseInt(inputMinutes.value, 10)
                : 25;
            session.textContent = defaultSession;
            seconds.textContent = '00';
            updateDisplay(defaultSession * 60);
            message.textContent = "press start to begin";
            newSessionBtn.remove();
        };
        document.querySelector('.break-breathe-options').appendChild(newSessionBtn);
    } else {
        newSessionBtn.style.display = 'block';
    }

    // Try to bring the tab into focus
    if (document.hidden) {
        window.focus();
        // Also use Notification API if available and permitted
        if ("Notification" in window) {
            if (Notification.permission === "granted") {
                new Notification("Mindful Breaks", { body: isBreak ? "Break is over! Start a new session." : "Time for a break!" });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        new Notification("Mindful Breaks", { body: isBreak ? "Break is over! Start a new session." : "Time for a break!" });
                    }
                });
            }
        }
    }
};

const showBreakModal = () => {
    document.querySelector('.break-breathe-options').style.display = 'none';
    if (breakModal) breakModal.style.display = 'flex';
    if (breatheModal) breatheModal.style.display = 'none';
    message.textContent = "Set your break duration";
};

const showBreatheModal = () => {
    document.querySelector('.break-breathe-options').style.display = 'none';
    if (breatheModal) breatheModal.style.display = 'flex';
    if (breakModal) breakModal.style.display = 'none';
    message.textContent = "Set your breathing duration";
};

const setBreakTimer = () => {
    let val = parseInt(breakInput.value, 10);
    if (!isNaN(val) && val > 0) {
        if (breakModal) breakModal.style.display = 'none';
        controls.style.display = 'flex';
        session.textContent = val;
        seconds.textContent = '00';
        isBreak = true;
        state = true;
        startTimer();
        message.textContent = "Break started!";
    }
};

const setBreatheTimer = () => {
    let val = parseInt(breatheInput.value, 10);
    if (!isNaN(val) && val > 0 && val <= 10) {
        if (breatheModal) breatheModal.style.display = 'none';
        startBreathing(val);
    }
};

const backToMain = () => {
    if (breakModal) breakModal.style.display = 'none';
    if (breatheModal) breatheModal.style.display = 'none';
    document.querySelector('.break-breathe-options').style.display = 'none';
    controls.style.display = 'flex';
    message.textContent = "press start to begin";
    // Remove stop breathing button if present
    const stopBtn = document.querySelector('.btn-stop-breathe');
    if (stopBtn) stopBtn.remove();
    // Reset breathing state
    clearTimeout(breathingInterval);
    circle.style.transform = "scale(1)";
    // Show timer if hidden
    const timerBox = document.querySelector('.app-counter-box');
    if (timerBox) timerBox.style.display = '';
};

const startBreathing = (durationMinutes = 1) => {
    // Hide all modals and controls
    document.querySelector('.break-breathe-options').style.display = 'none';
    controls.style.display = 'none';
    if (breakModal) breakModal.style.display = 'none';
    if (breatheModal) breatheModal.style.display = 'none';
    message.textContent = "Breathe in...";

    // Hide timer during breathing
    const timerBox = document.querySelector('.app-counter-box');
    if (timerBox) timerBox.style.display = 'none';

    // Set breathing duration in ms
    breathingDuration = durationMinutes * 60 * 1000;
    breathingElapsed = 0;

    let breathePhases = [
        { text: "Breathe in...", scale: 1.2, duration: 4000 },
        { text: "Hold...", scale: 1.2, duration: 2000 },
        { text: "Breathe out...", scale: 1.0, duration: 4000 },
        { text: "Hold...", scale: 1.0, duration: 2000 }
    ];
    breathingStep = 0;

    const animateBreathing = () => {
        let phase = breathePhases[breathingStep % breathePhases.length];
        message.textContent = phase.text;
        // Only animate scale if it changes from previous phase
        if (
            breathingStep === 0 ||
            breathePhases[(breathingStep - 1 + breathePhases.length) % breathePhases.length].scale !== phase.scale
        ) {
            circle.style.transition = "transform 4s cubic-bezier(.4,1,.6,1)";
            circle.style.transform = `scale(${phase.scale})`;
        }
        breathingElapsed += phase.duration;
        breathingStep++;
        if (breathingElapsed < breathingDuration) {
            breathingInterval = setTimeout(animateBreathing, phase.duration);
        } else {
            stopBreathing(true);
        }
    };

    animateBreathing();

    // Place stop button below the circle, centered, and a "Back" button
    let stopBreathe = document.querySelector('.btn-stop-breathe');
    if (!stopBreathe) {
        stopBreathe = document.createElement('button');
        stopBreathe.textContent = "Stop Breathing";
        stopBreathe.className = "btn-stop-breathe";
        stopBreathe.onclick = () => stopBreathing(false);
        circle.parentNode.insertBefore(stopBreathe, circle.nextSibling);
    }
    stopBreathe.style.display = "block";
    stopBreathe.style.margin = "40px auto 0 auto";
};

const stopBreathing = (finished = false) => {
    clearTimeout(breathingInterval);
    circle.style.transform = "scale(1)";
    const stopBtn = document.querySelector('.btn-stop-breathe');
    if (stopBtn) stopBtn.remove();
    if (finished) {
        message.textContent = "Breathing exercise complete!";
    } else {
        message.textContent = "Breathing exercise stopped.";
    }
    controls.style.display = 'flex';
    // Show timer again
    const timerBox = document.querySelector('.app-counter-box');
    if (timerBox) timerBox.style.display = '';
};

const updateSeconds = () => {
    totalSeconds--;
    updateDisplay(totalSeconds);

    if (totalSeconds <= 0) {
        bells.play();
        clearInterval(myInterval);
        state = true;
        showBreakOrBreathe();
    }
}

startBtn.addEventListener('click', startTimer);
if (stopBtn) stopBtn.addEventListener('click', stopTimer);
if (setBtn) setBtn.addEventListener('click', setTimer);
if (breakBtn) breakBtn.addEventListener('click', showBreakModal);
if (breatheBtn) breatheBtn.addEventListener('click', showBreatheModal);
if (setBreakBtn) setBreakBtn.addEventListener('click', setBreakTimer);
if (setBreatheBtn) setBreatheBtn.addEventListener('click', setBreatheTimer);
// Add back button listeners
backBtns.forEach(btn => btn.addEventListener('click', backToMain));

// Ask for notification permission on first load
window.addEventListener('DOMContentLoaded', () => {
    if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
    }
});