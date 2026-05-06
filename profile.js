import { AppStore, showScreen } from "./app.js";
import { $, escapeHTML, toast } from "./utils.js";
import { renderRegionVerify, getRegionState } from "./regionVerify.js";
import { renderPhotoPrivacy } from "./photoPrivacy.js";

export function getMyProfile() {
  return AppStore.get().profile || defaultProfile();
}

function defaultProfile() {
  return {
    nickname: "나",
    gender: "남성",
    birthDate: "",
    birthHour: "",
    birthCode: "",
    ageBand: "",
    mbti: "INTJ",
    zodiac: "",
    drinking: "가끔",
    smoking: "비흡연",
    exercise: "주 1~2회",
    education: "비공개",
    job: "비공개",
    incomeRange: "비공개",
    height: "",
    bodyStyle: "보통",
    regionName: "",
    matchPreference: "이성+봇",
    privacyNote: "생년월일시 원문 저장 금지. 나이대/별자리/사주코드만 저장 권장."
  };
}

export function renderProfile(root) {
  const p = getMyProfile();
  root.innerHTML = `
    <section class="hero">
      <h2>프로필</h2>
      <p>20대~30대도 부담 없게 대부분 선택형으로 구성했습니다. 얼굴/몸매/학력/직업/연봉은 직접 연락처처럼 민감하게 노출하지 않고, 매칭 판단에 필요한 범위형 정보로만 사용합니다.</p>
    </section>

    <section class="card">
      <h2 class="title">기본 정보</h2>
      <label>닉네임 6자 제한</label>
      <input id="nickname" class="input" maxlength="6" value="${escapeHTML(p.nickname)}" />

      <div class="grid2">
        <div><label>성별</label><select id="gender">${options(["남성","여성","기타"], p.gender)}</select></div>
        <div><label>MBTI</label><select id="mbti">${options(["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"], p.mbti)}</select></div>
      </div>

      <div class="grid2">
        <div><label>생년월일</label><input id="birthDate" class="input" type="date" value="${escapeHTML(p.birthDate)}" /></div>
        <div><label>태어난 시간</label><select id="birthHour">${options(["모름","자시 23~01","축시 01~03","인시 03~05","묘시 05~07","진시 07~09","사시 09~11","오시 11~13","미시 13~15","신시 15~17","유시 17~19","술시 19~21","해시 21~23"], p.birthHour)}</select></div>
      </div>

      <div class="grid2">
        <div><label>별자리 자동 계산</label><input id="zodiac" class="input" disabled value="${escapeHTML(p.zodiac || "생년월일 입력 시 자동")}" /></div>
        <div><label>나이대 저장</label><input id="ageBand" class="input" disabled value="${escapeHTML(p.ageBand || "자동 계산")}" /></div>
      </div>
    </section>

    <section class="card">
      <h2 class="title">생활/매력 정보</h2>
      <div class="grid2">
        <div><label>주량</label><select id="drinking">${options(["안 마심","가끔","보통","즐김"], p.drinking)}</select></div>
        <div><label>흡연</label><select id="smoking">${options(["비흡연","전자담배","흡연","상관없음"], p.smoking)}</select></div>
        <div><label>운동</label><select id="exercise">${options(["거의 안함","주 1~2회","주 3~4회","매일"], p.exercise)}</select></div>
        <div><label>학력</label><select id="education">${options(["비공개","고졸","전문대","대학교","대학원 이상"], p.education)}</select></div>
        <div><label>직업</label><input id="job" class="input" value="${escapeHTML(p.job)}" placeholder="예: 회사원, 자영업, 전문직" /></div>
        <div><label>연봉 범위</label><select id="incomeRange">${options(["비공개","3천 미만","3천~5천","5천~7천","7천~1억","1억 이상"], p.incomeRange)}</select></div>
        <div><label>키</label><input id="height" class="input" inputmode="numeric" value="${escapeHTML(p.height)}" placeholder="예: 175" /></div>
        <div><label>체형/스타일</label><select id="bodyStyle">${options(["슬림","보통","탄탄","글래머/볼륨","통통","스타일 좋음"], p.bodyStyle)}</select></div>
      </div>
      <label>매칭 선호</label>
      <select id="matchPreference">${options(["이성","동성","이성+봇","동성+봇","모두 보기"], p.matchPreference)}</select>
      <p class="small">개인정보 직접 노출 금지: 전화번호, 카카오톡, 라인, 텔레그램, 정확한 주소는 프로필에 표시하지 않는 구조입니다.</p>
      <button id="saveProfile" class="primary-btn">프로필 저장</button>
    </section>

    <div id="regionBlock"></div>
    <div id="photoBlock"></div>
  `;

  $("#birthDate").addEventListener("change", syncDerivedFields);
  $("#saveProfile").onclick = saveProfile;
  renderRegionVerify($("#regionBlock"));
  renderPhotoPrivacy($("#photoBlock"));
}

function syncDerivedFields() {
  const birthDate = $("#birthDate").value;
  $("#zodiac").value = calcZodiac(birthDate);
  $("#ageBand").value = calcAgeBand(birthDate);
}

function saveProfile() {
  const birthDate = $("#birthDate").value;
  const region = getRegionState();
  const p = {
    nickname: $("#nickname").value.trim().slice(0, 6) || "나",
    gender: $("#gender").value,
    birthDate,
    birthHour: $("#birthHour").value,
    birthCode: makeSajuCode(birthDate, $("#birthHour").value),
    ageBand: calcAgeBand(birthDate),
    mbti: $("#mbti").value,
    zodiac: calcZodiac(birthDate),
    drinking: $("#drinking").value,
    smoking: $("#smoking").value,
    exercise: $("#exercise").value,
    education: $("#education").value,
    job: $("#job").value.trim().slice(0, 18) || "비공개",
    incomeRange: $("#incomeRange").value,
    height: $("#height").value.trim().slice(0, 3),
    bodyStyle: $("#bodyStyle").value,
    regionName: region.regionName || "",
    matchPreference: $("#matchPreference").value,
    rawBirthStored: false,
    privacyNote: "실서비스 DB에는 생년월일시 원문 대신 나이대/별자리/사주코드만 저장 권장."
  };
  const s = AppStore.get();
  s.profile = p;
  AppStore.set(s);
  toast("프로필 저장 완료");
  showScreen("home");
}

function options(list, selected) {
  return list.map(v => `<option ${v === selected ? "selected" : ""}>${v}</option>`).join("");
}

export function calcZodiac(birthDate) {
  if (!birthDate) return "";
  const [, m, d] = birthDate.split("-").map(Number);
  const md = m * 100 + d;
  if (md >= 120 && md <= 218) return "물병자리";
  if (md >= 219 && md <= 320) return "물고기자리";
  if (md >= 321 && md <= 419) return "양자리";
  if (md >= 420 && md <= 520) return "황소자리";
  if (md >= 521 && md <= 621) return "쌍둥이자리";
  if (md >= 622 && md <= 722) return "게자리";
  if (md >= 723 && md <= 822) return "사자자리";
  if (md >= 823 && md <= 922) return "처녀자리";
  if (md >= 923 && md <= 1022) return "천칭자리";
  if (md >= 1023 && md <= 1122) return "전갈자리";
  if (md >= 1123 && md <= 1221) return "사수자리";
  return "염소자리";
}

function calcAgeBand(birthDate) {
  if (!birthDate) return "";
  const y = new Date(birthDate).getFullYear();
  const age = new Date().getFullYear() - y + 1;
  if (age < 20) return "미성년 차단";
  if (age < 30) return "20대";
  if (age < 40) return "30대";
  if (age < 50) return "40대";
  if (age < 60) return "50대";
  return "60대 이상";
}

function makeSajuCode(birthDate, birthHour) {
  if (!birthDate) return "";
  const seed = `${birthDate}_${birthHour || "모름"}`;
  let hash = 0;
  for (const ch of seed) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return `SAJU_${Math.abs(hash).toString(36).toUpperCase()}`;
}
