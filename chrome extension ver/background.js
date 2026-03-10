chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "pomodoro") {
        chrome.windows.create({
            url: "alert.html",
            type: "popup",
            width: 400,
            height: 250,
            focused: true
        });
        chrome.storage.local.set({ isRunning: false, remainingTime: 25 * 60, endTime: null });
    }
});