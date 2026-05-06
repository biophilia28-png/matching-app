import { AppStore } from "./app.js";
import { $, toast } from "./utils.js";

export function getChatRightsBreakdown(state = AppStore.get()) {
  const baseFree = 5;
  const realPhotoBonus = Math.min((state.photos || []).filter(p => p.realPhotoBenefit).length, 3);
  const purchased = state.chatRights?.purchased || 0;
  const subscription = state.chatRights?.subscriptionRemaining || 0;
  const used = state.chatRights?.used || 0;
  const totalBeforeCap = baseFree + realPhotoBonus + purchased + subscription;
  const total = Math.min(20, totalBeforeCap);
  return { baseFree, realPhotoBonus, purchased, subscription, used, total, remaining: Math.max(0, total - used) };
}

export function getRemainingChatRights(state = AppStore.get()) {
  return getChatRightsBreakdown(state).remaining;
}

export function canUseChatRight(match) {
  const state = AppStore.get();
  const remain = getRemainingChatRights(state);
  if (!match?.compatibility?.canChat) return { ok: false, reason: "궁합 75점 미만은 프리미엄이어도 채팅 신청이 불가합니다." };
  if (remain <= 0) return { ok: false, reason: "남은 채팅 신청권이 없습니다." };
  return { ok: true, reason: "채팅 신청 가능" };
}

export function consumeChatRight() {
  const s = AppStore.get();
  s.chatRights = s.chatRights || {};
  s.chatRights.used = (s.chatRights.used || 0) + 1;
  AppStore.set(s);
}

export function addMonthlySubscriptionRights() {
  const s = AppStore.get();
  s.chatRights = s.chatRights || {};
  const current = getChatRightsBreakdown(s);
  const addable = Math.max(0, 20 - current.remaining);
  s.chatRights.subscriptionRemaining = (s.chatRights.subscriptionRemaining || 0) + Math.min(10, addable);
  s.chatRights.plan = "월정액 9,900원";
  s.chatRights.monthlyPrice = 9900;
  s.chatRights.subscriptionActive = true;
  s.chatRights.nextBillingNote = "월정액 종료 후 남은 채팅권 유지, 다음 결제 시 최대 20회까지 누적 가능.";
  AppStore.set(s);
  toast("테스트 월정액 채팅권 10회가 반영되었습니다.");
}

export function renderSettings(root) {
  const b = getChatRightsBreakdown();
  root.innerHTML = `
    <section class="hero">
      <h2>설정</h2>
      <p>채팅권, 자동삭제, 신고/차단, 개인정보 안내를 확인합니다.</p>
    </section>
    <section class="card">
      <h2 class="title">채팅권 현황</h2>
      <div class="kv"><span>기본 무료</span><b>${b.baseFree}회</b></div>
      <div class="kv"><span>실사진 혜택</span><b>${b.realPhotoBonus}회</b></div>
      <div class="kv"><span>월정액/구매권</span><b>${b.subscription + b.purchased}회</b></div>
      <div class="kv"><span>사용</span><b>${b.used}회</b></div>
      <div class="kv"><span>남은 권한</span><b>${b.remaining}회</b></div>
      <button id="testMonthlyBtn" class="primary-btn">월정액 9,900원 테스트 적용</button>
      <p class="small">월정액 채팅권 10회. 월정액 종료 후 남은 채팅권 유지. 다음 결제 시 최대 20회까지 누적 가능.</p>
    </section>
    <section class="card">
      <h2 class="title">안전 설정</h2>
      <p class="small">채팅은 5일 후 자동삭제 구조입니다. 신고/차단 버튼은 각 채팅방에 표시됩니다. 정확한 위치, 휴대폰번호 원문, 생년월일시 원문은 저장하지 않는 방향으로 15단계 DB에서 고정합니다.</p>
    </section>
  `;
  $("#testMonthlyBtn").onclick = addMonthlySubscriptionRights;
}
