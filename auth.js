import { AppStore, showScreen } from "./app.js";
import { $, toast } from "./utils.js";

function hashLikePhone(phone) {
  const clean = String(phone || "").replace(/\D/g, "");
  let hash = 0;
  for (const ch of clean) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
  return `phone_hash_${Math.abs(hash).toString(36)}`;
}

export function getAuthState() {
  return AppStore.get().auth || {
    verified: false,
    adultVerified: false,
    identityVerified: false,
    banned: false,
    phoneHash: null,
    createdAt: null
  };
}

export function bootAuth() {
  const s = AppStore.get();
  if (!s.auth) {
    s.auth = getAuthState();
    AppStore.set(s);
  }
}

export function renderAuthGate(root) {
  const auth = getAuthState();
  root.innerHTML = `
    <section class="hero">
      <h2>본인인증 후 이용 가능</h2>
      <p>나의 인연은 성인 전용 매칭 앱입니다. 휴대폰 본인인증, 성인인증, 정지계정 차단, 중복가입 제한 구조를 먼저 통과해야 앱에 진입할 수 있습니다.</p>
    </section>

    <section class="card">
      <h2 class="title">테스트용 더미 인증</h2>
      <p class="notice">실서비스에서는 PASS, NICE, KMC, 토스인증 등 외부 인증 API를 연결해야 합니다. 현재 코드는 개발 테스트용이며 휴대폰번호 원문은 저장하지 않고 해시 형태의 식별값만 저장하는 구조입니다.</p>
      <label>휴대폰번호</label>
      <input id="phoneInput" class="input" inputmode="tel" placeholder="01012345678" maxlength="13" />
      <label>생년월일</label>
      <input id="birthInput" class="input" type="date" />
      <label>테스트 인증 코드</label>
      <input id="codeInput" class="input" placeholder="123456" />
      <div style="height:12px"></div>
      <button id="verifyBtn" class="primary-btn">본인인증/성인인증 완료</button>
      <p class="small">정지계정은 12단계 moderation.js와 연동됩니다. 여기서는 테스트용으로 앱 진입 차단 구조만 포함합니다.</p>
    </section>
  `;

  $("#verifyBtn").onclick = () => {
    const phone = $("#phoneInput").value;
    const birth = $("#birthInput").value;
    const code = $("#codeInput").value.trim();
    if (!/^010\d{8}$/.test(phone.replace(/\D/g, ""))) return toast("휴대폰번호 형식을 확인해주세요.");
    if (!birth) return toast("생년월일을 선택해주세요.");
    if (code !== "123456") return toast("테스트 인증 코드는 123456입니다.");

    const age = calcAge(birth);
    if (age < 19) return toast("성인 인증에 실패했습니다. 만 19세 이상만 이용 가능합니다.");

    const phoneHash = hashLikePhone(phone);
    const s = AppStore.get();
    const bannedList = JSON.parse(localStorage.getItem("ni_v2_banned_phone_hashes") || "[]");
    if (bannedList.includes(phoneHash)) {
      s.auth = { ...getAuthState(), banned: true, phoneHash };
      AppStore.set(s);
      return toast("정지계정으로 확인되어 앱 진입이 차단되었습니다.");
    }

    s.auth = {
      verified: true,
      identityVerified: true,
      adultVerified: true,
      banned: false,
      phoneHash,
      createdAt: new Date().toISOString(),
      rawPhoneStored: false,
      note: "휴대폰번호 원문 저장 금지. 해시 식별값만 테스트 저장."
    };
    AppStore.set(s);
    toast("테스트 인증 완료");
    showScreen("home");
  };
}

function calcAge(birthISO) {
  const d = new Date(birthISO);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
