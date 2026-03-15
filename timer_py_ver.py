import tkinter as tk
import math

class VisualTimer:
    def __init__(self, root):
        self.root = root
        self.root.title("25분 집중 타이머")
        self.root.geometry("350x420")
        self.root.configure(bg="#FADADD")

        # 25분을 목표 시간(초 단위)으로 설정
        self.target_time = 25 * 60 
        self.elapsed_time = 0 # 경과 시간 (0부터 시작)
        self.is_running = False
        self.alert_shown = False # 알림창 중복 실행 방지용

        self.canvas = tk.Canvas(root, width=350, height=350, bg="#FADADD", highlightthickness=0)
        self.canvas.pack(pady=10)

        self.cx, self.cy = 175, 175
        self.dial_r = 130
        self.arc_r = 95

        self.draw_dial()

    def draw_dial(self):
        # 1. 흰색 시계 배경
        self.canvas.create_oval(self.cx - self.dial_r, self.cy - self.dial_r, 
                                self.cx + self.dial_r, self.cy + self.dial_r, 
                                fill="white", outline="#E5E5E5", width=2)

        # 2. 빨간색 타이머 영역 (처음엔 extent가 0)
        self.arc = self.canvas.create_arc(self.cx - self.arc_r, self.cy - self.arc_r, 
                                          self.cx + self.arc_r, self.cy + self.arc_r, 
                                          start=90, extent=0, fill="#D32F2F", outline="")

        # 3. 눈금과 숫자 (60분 기준)
        for i in range(60):
            angle = math.radians(90 - i * 6)
            x1 = self.cx + self.dial_r * math.cos(angle)
            y1 = self.cy - self.dial_r * math.sin(angle)
            
            if i % 5 == 0:
                x2 = self.cx + (self.dial_r - 12) * math.cos(angle)
                y2 = self.cy - (self.dial_r - 12) * math.sin(angle)
                nx = self.cx + (self.dial_r - 25) * math.cos(angle)
                ny = self.cy - (self.dial_r - 25) * math.sin(angle)
                self.canvas.create_text(nx, ny, text=str(i), font=("Arial", 11, "bold"), fill="#333333")
            else:
                x2 = self.cx + (self.dial_r - 5) * math.cos(angle)
                y2 = self.cy - (self.dial_r - 5) * math.sin(angle)
            
            self.canvas.create_line(x1, y1, x2, y2, fill="#888888", width=1.5 if i % 5 == 0 else 1)

        # 4. 가운데 다이얼 포인트
        self.canvas.create_oval(self.cx - 20, self.cy - 20, 
                                self.cx + 20, self.cy + 20, 
                                fill="#FADADD", outline="#E5E5E5", width=2)

        # 5. 하단 버튼 프레임
        btn_frame = tk.Frame(self.root, bg="#FADADD")
        btn_frame.pack(pady=5)

        tk.Button(btn_frame, text="시작", command=self.start_timer, width=6, font=("Arial", 10, "bold")).grid(row=0, column=0, padx=5)
        tk.Button(btn_frame, text="멈춤", command=self.pause_timer, width=6, font=("Arial", 10, "bold")).grid(row=0, column=1, padx=5)
        tk.Button(btn_frame, text="초기화", command=self.reset_timer, width=6, font=("Arial", 10, "bold")).grid(row=0, column=2, padx=5)

    def update_arc(self):
        # 전체 60분(3600초) 기준으로 지나간 시간만큼 12시 방향부터 시계방향으로 빨간색이 덮임
        extent_angle = -(self.elapsed_time / 3600) * 360
        self.canvas.itemconfig(self.arc, extent=extent_angle)

    def start_timer(self):
        if not self.is_running:
            self.is_running = True
            self.update_timer()

    def pause_timer(self):
        self.is_running = False

    def reset_timer(self):
        self.is_running = False
        self.elapsed_time = 0
        self.alert_shown = False
        self.update_arc()

    def update_timer(self):
        if not self.is_running:
            return

        # 1초씩 시간 증가
        self.elapsed_time += 1
        self.update_arc()

        # 정확히 25분(목표 시간)이 되었을 때 알림 띄우기 (한 번만)
        if self.elapsed_time == self.target_time and not self.alert_shown:
            self.show_alert()
            self.alert_shown = True

        # 프로그램이 멈추지 않고 계속 타이머가 돌아가도록 자신을 호출
        self.root.after(1000, self.update_timer)

    def show_alert(self):
        # 1. 윈도우/맥 기본 경고음 소리 재생
        self.root.bell()

        # 2. 메인 시계의 움직임을 멈추지 않는 별도의 알림창 생성
        alert_window = tk.Toplevel(self.root)
        alert_window.title("알림")
        alert_window.geometry("250x120")
        alert_window.attributes('-topmost', True) # 창이 다른 창들에 가려지지 않게 맨 앞으로 가져옴
        
        # 3. 알림창 내용 구성
        tk.Label(alert_window, text="25분됐습니다.\n5분 쉬세요!", font=("Arial", 12, "bold")).pack(expand=True)
        tk.Button(alert_window, text="확인", command=alert_window.destroy, width=8).pack(pady=10)

if __name__ == "__main__":
    window = tk.Tk()
    app = VisualTimer(window)
    window.mainloop()
