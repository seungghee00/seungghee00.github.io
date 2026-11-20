/* =========================================================
   Hidden Things  -  script.js  (게임 동작 파일)
   ---------------------------------------------------------
   [목차]
   1. 스테이지 설정      ← 문구/이미지/제한 시간을 바꾸려면 여기만 수정
   2. 화면 요소 가져오기
   3. 게임 상태
   4. 게임 시작 / 스테이지 전환 / 종료
   5. 타이머
   6. 드래그로 박스 만들기
   7. 버튼 연결
   ========================================================= */


/* =========================================================
   1. 스테이지 설정
   - label : 박스 위에 표시되는 영어 이름
   - prompt: 좌측 상단 안내 문구
   - count : 이미지 속 목표 개수 (정답 판정에는 사용하지 않음)
   - time  : 제한 시간(초)
   ========================================================= */
const STAGES = [
  { label: "Dog",    prompt: "강아지를 찾아 드래그하세요.", image: "images/stage1.jpg", count: 1, time: 15 },
  { label: "Light",  prompt: "신호등을 찾아 드래그하세요.", image: "images/stage2.jpg", count: 1, time: 12 },
  { label: "Person", prompt: "사람을 찾아 드래그하세요.",   image: "images/stage3.jpg", count: 2, time: 9  },
  { label: "Car",    prompt: "자동차를 찾아 드래그하세요.", image: "images/stage4.jpg", count: 2, time: 6  },
  { label: "Bike",   prompt: "자전거를 찾아 드래그하세요.", image: "images/stage5.jpg", count: 3, time: 3  }
];


/* =========================================================
   2. 화면 요소 가져오기
   ========================================================= */
const gameEl      = document.getElementById("game");
const canvasEl    = document.getElementById("canvas");
const startScreen = document.getElementById("startScreen");
const startBtn    = document.getElementById("startBtn");
const submitBtn   = document.getElementById("submitBtn");
const stageImage  = document.getElementById("stageImage");
const promptEl    = document.getElementById("prompt");
const boxLayer    = document.getElementById("boxLayer");
const timerFill   = document.getElementById("timerFill");
const stageBoxes  = document.querySelectorAll("#stageList .stage-box");
const gameOverEl  = document.getElementById("gameOver");
const resultEl    = document.getElementById("result");


/* =========================================================
   3. 게임 상태
   ========================================================= */
let stageIndex = -1;       // 현재 스테이지 (0 = Stage 1)
let isPlaying  = false;    // 게임 조작 가능 여부
let timerId    = null;     // 타이머 반복 ID
let stageStart = 0;        // 스테이지 시작 시각
let boxes      = [];       // 현재 스테이지에서 만든 박스들

/* 사용자의 작업 기록 (정답 판정 없이 행동만 저장)
   브라우저 콘솔에서 gameRecords 를 입력하면 확인할 수 있어요. */
const gameRecords = [];
window.gameRecords = gameRecords;

// 이미지를 미리 불러와 화면 전환 때 깜빡임 방지
STAGES.forEach(function (s) { new Image().src = s.image; });


/* =========================================================
   4. 게임 시작 / 스테이지 전환 / 종료
   ========================================================= */

/* 4-1. 게임 시작 (Start 버튼) */
function startGame() {
  startScreen.hidden = true;
  stageImage.hidden  = false;
  promptEl.hidden    = false;
  submitBtn.hidden   = false;
  canvasEl.classList.add("is-playing");
  isPlaying = true;
  loadStage(0);
}

/* 4-2. 스테이지 불러오기 (이미지, 문구, 타이머, 박스 초기화) */
function loadStage(index) {
  stageIndex = index;
  const stage = STAGES[index];

  // 이전 스테이지의 박스 초기화
  boxLayer.innerHTML = "";
  boxes = [];

  // 이미지와 안내 문구 교체
  stageImage.src = stage.image;
  promptEl.textContent = stage.prompt;

  // 상단 Stage 표시: 현재 단계까지 채우기
  stageBoxes.forEach(function (box, i) {
    box.classList.toggle("is-filled", i <= index);
  });

  startTimer(stage.time);
}

/* 4-3. 스테이지 끝내기 (Submit 클릭 또는 시간 종료) */
function endStage(reason) {
  if (!isPlaying) return;
  stopTimer();

  // 이번 스테이지의 행동 기록 저장
  const stage = STAGES[stageIndex];
  gameRecords.push({
    stage: stageIndex + 1,
    target: stage.label,
    targetCount: stage.count,
    timeLimit: stage.time,
    timeUsed: Math.min((performance.now() - stageStart) / 1000, stage.time),
    endedBy: reason,            // "submit" 또는 "timeout"
    boxes: boxes.slice()        // 만든 박스들의 위치/크기(%)
  });

  if (stageIndex < STAGES.length - 1) {
    loadStage(stageIndex + 1);  // 다음 스테이지로
  } else {
    gameOver();                 // 마지막 스테이지면 종료
  }
}

/* 4-4. 게임 종료 */
function gameOver() {
  isPlaying = false;
  canvasEl.classList.remove("is-playing");
  gameEl.classList.add("is-over");   // 블러 + 조작 비활성화
  gameOverEl.hidden = false;         // Game Over 팝업
  resultEl.hidden   = false;         // 아래 결과 영역 (스크롤로 이동)
}


/* =========================================================
   5. 타이머 (타이머 바가 오른쪽 → 왼쪽으로 줄어듦)
   ========================================================= */
function startTimer(seconds) {
  stopTimer();
  const limit = seconds * 1000;
  stageStart = performance.now();
  timerFill.style.width = "100%";

  function tick(now) {
    const remain = Math.max(limit - (now - stageStart), 0);
    timerFill.style.width = (remain / limit * 100) + "%";

    if (remain <= 0) {
      endStage("timeout");          // 0초 → 자동으로 다음 스테이지
      return;
    }
    timerId = requestAnimationFrame(tick);
  }
  timerId = requestAnimationFrame(tick);
}

function stopTimer() {
  if (timerId !== null) {
    cancelAnimationFrame(timerId);
    timerId = null;
  }
}


/* =========================================================
   6. 드래그로 박스 만들기
   - 마우스를 누른 채 움직이면 박스가 생기고
   - 마우스를 놓으면 그 자리에 고정됩니다.
   - 박스는 개수 제한 없이 계속 만들 수 있고, 서로 독립적입니다.
   ========================================================= */
let dragging  = false;
let startX    = 0;       // 드래그 시작점 (영역 안의 px)
let startY    = 0;
let currentEl = null;    // 지금 그리고 있는 박스

/* 영역 안의 마우스 위치 계산 (영역 밖으로 나가도 가장자리에 고정) */
function getPoint(event) {
  const rect = canvasEl.getBoundingClientRect();
  const w = canvasEl.clientWidth;
  const h = canvasEl.clientHeight;
  const x = event.clientX - rect.left - canvasEl.clientLeft;
  const y = event.clientY - rect.top  - canvasEl.clientTop;
  return {
    x: Math.min(Math.max(x, 0), w),
    y: Math.min(Math.max(y, 0), h),
    w: w,
    h: h
  };
}

/* 박스 요소 만들기 (이름표 포함) */
function createBoxElement() {
  const box = document.createElement("div");
  box.className = "drag-box";

  const label = document.createElement("span");
  label.className = "drag-box__label";
  label.textContent = STAGES[stageIndex].label;

  box.appendChild(label);
  boxLayer.appendChild(box);
  return box;
}

/* 박스 위치/크기 적용 (% 단위라서 화면이 줄어들어도 같이 맞춰짐) */
function updateBox(el, p) {
  const left = Math.min(startX, p.x);
  const top  = Math.min(startY, p.y);
  const width  = Math.abs(p.x - startX);
  const height = Math.abs(p.y - startY);

  el.style.left   = (left   / p.w * 100) + "%";
  el.style.top    = (top    / p.h * 100) + "%";
  el.style.width  = (width  / p.w * 100) + "%";
  el.style.height = (height / p.h * 100) + "%";

  return { x: left / p.w, y: top / p.h, w: width / p.w, h: height / p.h };
}

canvasEl.addEventListener("pointerdown", function (e) {
  if (!isPlaying) return;
  if (e.target.closest("#submitBtn")) return;   // Submit 버튼은 드래그 제외
  if (e.button !== 0) return;                   // 왼쪽 버튼만

  const p = getPoint(e);
  dragging = true;
  startX = p.x;
  startY = p.y;
  currentEl = createBoxElement();
  updateBox(currentEl, p);
  canvasEl.setPointerCapture(e.pointerId);
});

canvasEl.addEventListener("pointermove", function (e) {
  if (!dragging) return;
  updateBox(currentEl, getPoint(e));
});

function finishDrag(e) {
  if (!dragging) return;
  dragging = false;

  const p = getPoint(e);
  const rect = updateBox(currentEl, p);

  // 너무 작은 박스(그냥 클릭)는 만들지 않음
  if (rect.w * p.w < 8 || rect.h * p.h < 8) {
    currentEl.remove();
  } else {
    boxes.push(rect);           // 박스 고정 + 기록
  }
  currentEl = null;
}

canvasEl.addEventListener("pointerup", finishDrag);
canvasEl.addEventListener("pointercancel", finishDrag);


/* =========================================================
   7. 버튼 연결
   ========================================================= */
startBtn.addEventListener("click", startGame);

submitBtn.addEventListener("click", function () {
  endStage("submit");           // 남은 시간과 관계없이 다음 스테이지로
});
