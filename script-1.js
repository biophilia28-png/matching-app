function goScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById("screen-" + name);
  if (target) target.classList.add("active");
}

function getProfile() {
  return {
    nickname: document.getElementById("nickname").value.trim(),
    gender: document.getElementById("gender").value,
    mbti: document.getElementById("mbti").value,
    region: document.getElementById("region").value,
    birthYear: Number(document.getElementById("birthYear").value),
    birthMonth: Number(document.getElementById("birthMonth").value),
    birthDay: Number(document.getElementById("birthDay").value),
    birthHour: Number(document.getElementById("birthHour").value)
  };
}

function saveProfile() {
  const profile = getProfile();

  if (!profile.nickname) return alert("닉네임을 입력하세요.");
  if (!profile.gender) return alert("성별을 선택하세요.");
  if (!profile.mbti) return alert("MBTI를 선택하세요.");
  if (!profile.birthYear || !profile.birthMonth || !profile.birthDay) return alert("생년월일을 입력하세요.");
  if (!profile.region) return alert("지역을 선택하세요.");

  const allowed = checkRegionByLocation(profile.region);
  if (!allowed) {
    alert("위치정보 동의 후 실제 위치와 크게 다른 지역은 등록할 수 없습니다.\n현재 테스트 버전은 서울/경기권만 임시 허용합니다.");
    return;
  }

  localStorage.setItem("profile", JSON.stringify(profile));
  alert("프로필 저장 완료");
renderMatches();
renderHomeProfile();
goScreen("matches");
}

function checkRegionByLocation(region) {
  const locationAgree = localStorage.getItem("locationAgree") === "yes";
  if (!locationAgree) return true;

  const temporaryAllowedRegions = ["서울특별시", "경기도", "인천광역시"];
  return temporaryAllowedRegions.includes(region);
}

const dummyMatches = [
  { name: "봇 지우", isBot: true, gender: "female", mbti: "INFP", region: "서울특별시", birthYear: 1996, birthMonth: 2, birthDay: 8, birthHour: 10 },
  { name: "봇 서연", isBot: true, gender: "female", mbti: "ENFP", region: "부산광역시", birthYear: 1994, birthMonth: 10, birthDay: 12, birthHour: 18 },
  { name: "봇 민아", isBot: true, gender: "female", mbti: "INTJ", region: "대전광역시", birthYear: 1992, birthMonth: 7, birthDay: 21, birthHour: 9 },
  { name: "봇 하린", isBot: true, gender: "female", mbti: "ISFP", region: "광주광역시", birthYear: 1998, birthMonth: 5, birthDay: 3, birthHour: 15 },
  { name: "봇 수아", isBot: true, gender: "female", mbti: "INFJ", region: "서울특별시", birthYear: 1993, birthMonth: 6, birthDay: 11, birthHour: 14 },
  { name: "봇 유나", isBot: true, gender: "female", mbti: "ENTP", region: "경기도", birthYear: 1995, birthMonth: 1, birthDay: 20, birthHour: 9 },
  { name: "봇 현우", isBot: true, gender: "male", mbti: "ENTJ", region: "서울특별시", birthYear: 1993, birthMonth: 11, birthDay: 2, birthHour: 21 },
  { name: "봇 도윤", isBot: true, gender: "male", mbti: "ENFJ", region: "인천광역시", birthYear: 1995, birthMonth: 4, birthDay: 18, birthHour: 13 },
  { name: "봇 준호", isBot: true, gender: "male", mbti: "INTP", region: "경기도", birthYear: 1990, birthMonth: 9, birthDay: 25, birthHour: 7 },
  { name: "봇 태민", isBot: true, gender: "male", mbti: "ISTP", region: "대구광역시", birthYear: 1997, birthMonth: 12, birthDay: 4, birthHour: 16 }
];

let selectedMatch = null;
let currentChatUser = "";

function loadProfile() {
  const raw = localStorage.getItem("profile");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function renderMatches() {
  const list = document.getElementById("matchList");
  const profile = loadProfile();

  if (!profile) {
    list.innerHTML = `<div class="match-card"><h3>프로필을 먼저 저장하세요</h3><p>프로필 입력 후 궁합 계산이 가능합니다.</p></div>`;
    return;
  }

  const matches = dummyMatches
    .filter(p => p.gender !== profile.gender)
    .map(p => ({ ...p, result: calcTotal(profile, p) }))
    .sort((a, b) => b.result.total - a.result.total);

  window.currentMatches = matches;
  list.innerHTML = "";

  matches.forEach((m, i) => {
    const locked = m.result.total < 50;
    const img = m.gender === "female" ? "./assets/profile-woman.png" : "./assets/profile-man.png";

    const gradeText =
      m.result.total >= 85 ? "최고궁합" :
      m.result.total >= 70 ? "좋은궁합" :
      m.result.total >= 50 ? "노력필요" : "비공개";

    const gradeClass =
      m.result.total >= 85 ? "grade-best" :
      m.result.total >= 70 ? "grade-good" :
      m.result.total >= 50 ? "grade-normal" : "grade-low";

    const div = document.createElement("div");
    div.className = "match-card";

    div.innerHTML = `
      <div class="match-row">
        <img class="match-img" src="${locked ? './assets/app-icon.png' : img}" alt="프로필" />

        <div class="match-info">
          <div class="match-name-line">
            <h3>${locked ? "접속자 있음" : m.name}</h3>
            ${m.isBot ? `<span class="bot-badge">BOT</span>` : ""}
            <span class="online-dot">${locked ? "비공개" : "접속중"}</span>
          </div>
          <p>${locked ? "궁합 50점 이하로 프로필 비공개" : `${m.mbti} · ${m.region}`}</p>
          <p>${locked ? "상세 정보는 열람할 수 없습니다." : "사주 · MBTI · 별자리 종합 분석"}</p>
        </div>

        <div class="grade-badge ${gradeClass}">${gradeText}</div>

        <div class="match-score">
          <strong>${m.result.total}</strong>
          <span>점</span>
        </div>
      </div>

      <div class="match-stars">
        ${"★".repeat(Math.min(5, Math.max(1, Math.round(m.result.total / 20))))}
        ${"☆".repeat(5 - Math.min(5, Math.max(1, Math.round(m.result.total / 20))))}
      </div>

      ${
        locked
          ? `<button disabled>열람 불가</button>`
          : `<button onclick="openDetail(${i})">궁합 상세보기</button>`
      }
    `;

    list.appendChild(div);
  });
}

function openDetail(index) {
  const m = window.currentMatches[index];
  selectedMatch = m;

  document.getElementById("detailPartnerName").innerText = m.name;
  document.getElementById("detailTotalScore").innerText = m.result.total + "점";

  let grade = "그저그런 궁합";
  if (m.result.total >= 85) grade = "최고의 궁합";
  else if (m.result.total >= 70) grade = "좋은 궁합";
  else if (m.result.total >= 50) grade = "노력이 필요한 궁합";

  document.getElementById("detailGrade").innerText = grade;
  document.getElementById("detailReason").innerText =
    `사주 ${m.result.saju}점, MBTI ${m.result.mbti}점, 별자리 ${m.result.star}점으로 계산되었습니다.`;

  const sajuPercent = (m.result.saju / 50) * 100;
  const mbtiPercent = (m.result.mbti / 25) * 100;
  const starPercent = (m.result.star / 25) * 100;

  const barSaju = document.getElementById("barSaju");
  const barMbti = document.getElementById("barMbti");
  const barStar = document.getElementById("barStar");

  if (barSaju) barSaju.style.width = sajuPercent + "%";
  if (barMbti) barMbti.style.width = mbtiPercent + "%";
  if (barStar) barStar.style.width = starPercent + "%";

  document.getElementById("detailSajuScore").innerText = m.result.saju + " / 50";
  document.getElementById("detailMbtiScore").innerText = m.result.mbti + " / 25";
  document.getElementById("detailStarScore").innerText = m.result.star + " / 25";

  document.getElementById("detailSajuText").innerText = m.result.sajuText;
  document.getElementById("detailMbtiText").innerText = m.result.mbtiText;
  document.getElementById("detailStarText").innerText = m.result.starText;

  document.getElementById("detailChatBtn").disabled = m.result.total < 50;
  goScreen("detail");
}

function renderChatRooms() {
  const list = document.getElementById("chatRoomList");
  const raw = localStorage.getItem("chatRooms") || "[]";
  const rooms = JSON.parse(raw);

  if (!rooms.length) {
    list.innerHTML = `
      <div class="match-card">
        <h3>진행중인 채팅방 없음</h3>
        <p>궁합 상세 페이지에서 채팅을 시작하면 여기에 표시됩니다.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = rooms.map(room => `
    <div class="match-card" onclick="openChat('${room.user}')">
      <div class="match-row">
        <img class="match-img" src="./assets/profile-woman.png" alt="프로필" />
        <div class="match-info">
          <div class="match-name-line">
            <h3>${room.user}</h3>
            ${room.user.startsWith("봇") ? `<span class="bot-badge">BOT</span>` : ""}
            <span class="online-dot">채팅중</span>
          </div>
          <p>${room.lastMessage}</p>
          <p>${room.time} · 15일 후 자동 삭제 안내</p>
        </div>
      </div>
    </div>
  `).join("");
}

function toggleAlarmSetting() {
  alert("실제 앱에서는 Android 알림 권한과 휴대폰 알림음을 연결해야 합니다.");
}

let adminTapCount = 0;

function openAdminGate() {
  adminTapCount++;

  if (adminTapCount < 5) {
    alert("앱 버전: v1.0.0");
    return;
  }

  adminTapCount = 0;

  const pw = prompt("관리자 비밀번호를 입력하세요.");
  const adminPassword = "246897";

 if (pw && pw.trim() === adminPassword) {
  renderAdminStats();
  goScreen("admin");
 } else {
    alert("관리자 비밀번호가 맞지 않습니다.");
  }
}

window.onload = function () {
  if (localStorage.getItem("locationAgree") === null) {
    localStorage.setItem("locationAgree", "yes");
  }

  renderMatches();
  renderChatRooms();
  renderHomeRecentChat();
  renderHomeChatRoomList();
  renderHomeProfile();
};

function getRecentChatRoom() {
  const raw = localStorage.getItem("chatRooms") || "[]";
  const rooms = JSON.parse(raw);
  return rooms.length ? rooms[0] : null;
}

function renderHomeRecentChat() {
  const box = document.getElementById("homeRecentChat");
  if (!box) return;

  const room = getRecentChatRoom();

  if (!room) {
    box.innerHTML = `
      <div class="chat-bubble other">아직 최근 대화가 없습니다.</div>
    `;
    return;
  }

  box.innerHTML = `
    <div class="recent-chat-card" onclick="openChat('${room.user}')">
      <div class="match-row">
        <img class="match-img" src="./assets/profile-woman.png" alt="프로필" />
        <div class="match-info">
          <div class="match-name-line">
            <h3>${room.user}</h3>
            ${room.user.startsWith("봇") ? `<span class="bot-badge">BOT</span>` : ""}
            <span class="online-dot">최근대화</span>
          </div>
          <p>${room.lastMessage}</p>
          <p>${room.time} · 이어서 대화 가능</p>
        </div>
      </div>
    </div>
  `;
}

function openRecentChatFromHome() {
  const room = getRecentChatRoom();

  if (!room) {
    alert("아직 최근 대화상대가 없습니다. 궁합 상세 페이지에서 채팅을 시작해보세요.");
    return;
  }

  openChat(room.user);
}

function renderHomeChatRoomList() {
  const box = document.getElementById("homeChatRoomList");
  if (!box) return;

  const raw = localStorage.getItem("chatRooms") || "[]";
  const rooms = JSON.parse(raw);

  if (!rooms.length) {
    box.innerHTML = `
      <div class="match-card">
        <h3>진행중인 채팅방 없음</h3>
        <p>궁합 상세 페이지에서 채팅을 시작하면 여기에 표시됩니다.</p>
      </div>
    `;
    return;
  }

  box.innerHTML = rooms.map(room => `
    <div class="match-card" onclick="openChat('${room.user}')">
      <div class="match-row">
        <img class="match-img" src="./assets/profile-woman.png" alt="프로필" />
        <div class="match-info">
          <div class="match-name-line">
            <h3>${room.user}</h3>
            ${room.user.startsWith("봇") ? `<span class="bot-badge">BOT</span>` : ""}
            <span class="online-dot">최근채팅</span>
          </div>
          <p>${room.lastMessage}</p>
          <p>${room.time} · 이어서 대화하기</p>
        </div>
      </div>
    </div>
  `).join("");
}

function renderHomeProfile() {
  const profile = loadProfile();
  if (!profile) return;

  const homeNameEls = document.querySelectorAll(".profile-small span");

  if (homeNameEls[0]) {
    homeNameEls[0].innerText = profile.nickname || "나";
  }
}

function renderAdminStats() {
  const profile = loadProfile();
  const now = new Date();
  const currentYear = now.getFullYear();

  let totalUsers = 12458;
  let todayUsers = 152;
  let onlineUsers = 1024;

  let age10 = 3;
  let age20 = 38;
  let age30 = 42;
  let age40 = 14;
  let age50 = 3;

  if (profile && profile.birthYear) {
    const age = currentYear - Number(profile.birthYear);
    totalUsers += 1;
    todayUsers += 1;
    onlineUsers += 1;

    if (age < 20) age10 += 1;
    else if (age < 30) age20 += 1;
    else if (age < 40) age30 += 1;
    else if (age < 50) age40 += 1;
    else age50 += 1;
  }

  setText("adminTodayUsers", todayUsers + "명");
  setText("adminTotalUsers", totalUsers.toLocaleString() + "명");
  setText("adminAge10", age10 + "%");
  setText("adminAge20", age20 + "%");
  setText("adminAge30", age30 + "%");
  setText("adminAge40", age40 + "%");
  setText("adminAge50", age50 + "%");
  setText("adminOnlineUsers", onlineUsers.toLocaleString() + "명");

  renderAdminChatHourly();
}

function renderAdminChatHourly() {
  const box = document.getElementById("adminChatHourly");
  if (!box) return;

  const rooms = JSON.parse(localStorage.getItem("chatRooms") || "[]");

  const hours = {};
  for (let i = 0; i < 24; i++) {
    hours[i] = 0;
  }

  rooms.forEach(room => {
    const hourText = String(room.time || "").match(/(\d{1,2})/);
    if (hourText) {
      const h = Number(hourText[1]);
      if (!Number.isNaN(h)) hours[h] += 1;
    }
  });

  box.innerHTML = Object.keys(hours).map(h => {
    const count = hours[h];
    const width = Math.min(100, count * 20);

    return `
      <div class="hour-row">
        <span>${h}시</span>
        <div class="hour-bar-bg">
          <div class="hour-bar-fill" style="width:${width}%"></div>
        </div>
        <strong>${count}건</strong>
      </div>
    `;
  }).join("");
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}
