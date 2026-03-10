// 알림창이 열릴 때 '띠링~' 소리를 내는 함수
function playDingSound() {
    // 브라우저의 오디오 시스템을 불러옵니다.
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 맑고 부드러운 소리 파형 설정
    oscillator.type = 'sine';

    // 처음엔 '띠' (높은 도) 소리
    oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime);
    // 0.1초 뒤에 '링' (높은 미) 소리로 변경
    oscillator.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.1);

    // 소리 크기가 서서히 줄어들게 하여 자연스러운 여운을 줍니다.
    gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    // 소리 재생 시작 및 0.5초 뒤 종료
    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
}

// 창이 팝업으로 열리자마자 소리 재생 함수 실행
playDingSound();

// 알림 끄기 버튼을 누르면 이 창을 닫습니다.
document.getElementById('closeBtn').addEventListener('click', () => {
    window.close();
});