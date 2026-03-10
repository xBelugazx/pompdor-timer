const canvas = document.getElementById('timerCanvas');
const ctx = canvas.getContext('2d');

const targetTime = 25 * 60;
let timerInterval = null;

const cx = 150, cy = 150, dialR = 120, arcR = 85;

function drawDial(elapsedTime) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(cx, cy, dialR, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#E5E5E5";
    ctx.stroke();

    if (elapsedTime > 0) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const startAngle = -Math.PI / 2;
        const fillAngle = (elapsedTime / 3600) * (2 * Math.PI);
        ctx.arc(cx, cy, arcR, startAngle, startAngle + fillAngle);
        ctx.fillStyle = "#D32F2F";
        ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 12px Arial";
    ctx.fillStyle = "#333333";

    for (let i = 0; i < 60; i++) {
        const angle = -Math.PI / 2 + (i * 6 * Math.PI / 180);
        const x1 = cx + dialR * Math.cos(angle);
        const y1 = cy + dialR * Math.sin(angle);

        let x2, y2;
        if (i % 5 === 0) {
            x2 = cx + (dialR - 12) * Math.cos(angle);
            y2 = cy + (dialR - 12) * Math.sin(angle);
            const nx = cx + (dialR - 25) * Math.cos(angle);
            const ny = cy + (dialR - 25) * Math.sin(angle);
            ctx.fillText(i.toString(), nx, ny);
        } else {
            x2 = cx + (dialR - 5) * Math.cos(angle);
            y2 = cy + (dialR - 5) * Math.sin(angle);
        }

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = "#888888";
        ctx.lineWidth = i % 5 === 0 ? 1.5 : 1;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = "#FADADD";
    ctx.fill();
    ctx.strokeStyle = "#E5E5E5";
    ctx.stroke();
}

function updateUI() {
    chrome.storage.local.get(['isRunning', 'endTime', 'remainingTime'], (data) => {
        if (data.isRunning && data.endTime) {
            const now = Date.now();
            let left = Math.round((data.endTime - now) / 1000);

            if (left <= 0) {
                left = 0;
                clearInterval(timerInterval);
                timerInterval = null;
            }
            const elapsed = targetTime - left;
            drawDial(elapsed);
        } else {
            const elapsed = targetTime - (data.remainingTime !== undefined ? data.remainingTime : targetTime);
            drawDial(elapsed);
        }
    });
}

function startTimer() {
    chrome.storage.local.get(['isRunning', 'remainingTime'], (data) => {
        if (!data.isRunning) {
            const left = data.remainingTime !== undefined ? data.remainingTime : targetTime;
            if (left > 0) {
                const endTime = Date.now() + (left * 1000);
                chrome.storage.local.set({ isRunning: true, endTime: endTime });
                chrome.alarms.create("pomodoro", { when: endTime });

                if (!timerInterval) timerInterval = setInterval(updateUI, 1000);
            }
        }
    });
}

function pauseTimer() {
    chrome.storage.local.get(['isRunning', 'endTime'], (data) => {
        if (data.isRunning) {
            chrome.alarms.clear("pomodoro");
            const now = Date.now();
            const left = Math.max(0, Math.round((data.endTime - now) / 1000));
            chrome.storage.local.set({ isRunning: false, remainingTime: left });
            clearInterval(timerInterval);
            timerInterval = null;
            drawDial(targetTime - left);
        }
    });
}

function resetTimer() {
    chrome.alarms.clear("pomodoro");
    chrome.storage.local.set({ isRunning: false, remainingTime: targetTime, endTime: null });
    clearInterval(timerInterval);
    timerInterval = null;
    drawDial(0);
}

document.getElementById('startBtn').addEventListener('click', startTimer);
document.getElementById('pauseBtn').addEventListener('click', pauseTimer);
document.getElementById('resetBtn').addEventListener('click', resetTimer);

chrome.storage.local.get(['isRunning'], (data) => {
    if (data.isRunning) {
        timerInterval = setInterval(updateUI, 1000);
    }
    updateUI();
});