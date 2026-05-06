import { AppStore, showScreen } from "./app.js";
import { $, escapeHTML, toast, uid, daysBetween } from "./utils.js";
import { getMyProfile } from "./profile.js";
import { getRecommendedMatches } from "./matching.js";
import { canUseChatRight, consumeChatRight } from "./usageLimits.js";

export function renderChatList(root) {
  cleanupExpiredChats();
  const state = AppStore.get();
  const matches = getRecommendedMatches(getMyProfile());
  const chats = state.chats || [];

  root.innerHTML = `
    <section class="hero">
      <h2>채팅</h2>
      <p>궁합 75점 이상만 채팅 신청 가능. 프리미엄이어도 낮은 궁합은 제한됩니다. 채팅은 5일 후 자동삭제됩니다.</p>
    </section>

    <section class="card">
      <h2 class="title">매칭 상대에게 채팅 신청</h2>
      ${matches.map(m => `
        <div class="chat-list-item">
          <img class="profile-photo" src="${m.photo}" alt="${escapeHTML(m.nickname)}" />
          <div style="flex:1">
            <b>${escapeHTML(m.nickname)}</b><br/>
            <span class="small">${m.compatibility.total}점 · ${m.compatibility.grade} · ${m.compatibility.canChat ? "신청 가능" : "75점 미만 제한"}</span>
          </div>
          <button class="secondary-btn" data-start-chat="${m.id}">신청</button>
        </div>
      `).join("")}
    </section>

    <section class="card">
      <h2 class="title">진행 중인 채팅</h2>
      ${chats.length ? chats.map(renderChatItem).join("") : `<p class="small">아직 채팅방이 없습니다.</p>`}
    </section>
  `;

  document.querySelectorAll("[data-start-chat]").forEach(btn => {
    btn.onclick = () => {
      const match = matches.find(m => m.id === btn.dataset.startChat);
      startChat(match);
    };
  });

  document.querySelectorAll("[data-open-chat]").forEach(btn => {
    btn.onclick = () => renderChatRoom(root, btn.dataset.openChat);
  });
}

function renderChatItem(chat) {
  const expiredIn = Math.max(0, 5 - daysBetween(chat.createdAt));
  return `
    <div class="chat-list-item">
      <img class="profile-photo" src="${chat.partner.photo}" alt="${escapeHTML(chat.partner.nickname)}" />
      <div style="flex:1">
        <b>${escapeHTML(chat.partner.nickname)}</b><br/>
        <span class="small">${chat.partner.compatibility.total}점 · ${expiredIn}일 후 자동삭제 · ${escapeHTML(chat.lastMessage || "대화를 시작해보세요.")}</span>
      </div>
      <button class="secondary-btn" data-open-chat="${chat.id}">열기</button>
    </div>
  `;
}

function startChat(match) {
  const state = AppStore.get();
  state.chats = state.chats || [];
  const already = state.chats.find(c => c.partner.id === match.id);
  if (already) {
    toast("이미 열린 채팅방입니다. 기존 채팅은 채팅권이 추가 차감되지 않습니다.");
    showScreen("chat");
    return;
  }

  const check = canUseChatRight(match);
  if (!check.ok) return toast(check.reason);
  consumeChatRight();

  const s = AppStore.get();
  s.chats = s.chats || [];
  s.chats.push({
    id: uid("chat"),
    partner: match,
    createdAt: new Date().toISOString(),
    lastMessage: "채팅방이 개설되었습니다.",
    messages: [
      { from: "system", text: "채팅방이 개설되었습니다. 연락처 요구, 금전 요구, 외부 메신저 유도는 신고 대상입니다.", at: new Date().toISOString() }
    ],
    blocked: false,
    reported: false
  });
  AppStore.set(s);
  toast("채팅 신청 완료");
  showScreen("chat");
}

function renderChatRoom(root, chatId) {
  const state = AppStore.get();
  const chat = (state.chats || []).find(c => c.id === chatId);
  if (!chat) return renderChatList(root);

  root.innerHTML = `
    <section class="hero">
      <div class="row">
        <div>
          <h2>${escapeHTML(chat.partner.nickname)}</h2>
          <p>${chat.partner.compatibility.total}점 · 5일 자동삭제 · 신고/차단 가능</p>
        </div>
        <button id="backChat" class="ghost-btn">목록</button>
      </div>
    </section>

    <section class="card">
      <div id="messageList">${chat.messages.map(m => `<div class="chat-bubble ${m.from === "me" ? "me" : ""}">${escapeHTML(m.text)}</div>`).join("")}</div>
      <label>메시지</label>
      <input id="messageInput" class="input" placeholder="메시지를 입력하세요" />
      <div class="grid3" style="margin-top:10px">
        <button id="sendMsg" class="primary-btn">전송</button>
        <button id="reportBtn" class="danger-btn">신고</button>
        <button id="blockBtn" class="secondary-btn">차단</button>
      </div>
    </section>
  `;

  $("#backChat").onclick = () => renderChatList(root);
  $("#sendMsg").onclick = () => {
    const text = $("#messageInput").value.trim();
    if (!text) return;
    const danger = detectUnsafeText(text);
    chat.messages.push({ from: "me", text, at: new Date().toISOString() });
    chat.lastMessage = text;
    if (danger) {
      chat.reported = true;
      chat.messages.push({ from: "system", text: `주의 문구 감지: ${danger}. 신고/제한 대상이 될 수 있습니다.`, at: new Date().toISOString() });
    }
    AppStore.set(state);
    renderChatRoom(root, chatId);
  };
  $("#reportBtn").onclick = () => {
    chat.reported = true;
    state.reports = state.reports || [];
    state.reports.push({ id: uid("report"), chatId, targetId: chat.partner.id, reason: "사용자 신고", at: new Date().toISOString() });
    AppStore.set(state);
    toast("신고가 접수되었습니다.");
  };
  $("#blockBtn").onclick = () => {
    chat.blocked = true;
    state.blocks = state.blocks || [];
    state.blocks.push({ id: uid("block"), targetId: chat.partner.id, at: new Date().toISOString() });
    AppStore.set(state);
    toast("차단되었습니다.");
    renderChatList(root);
  };
}

function detectUnsafeText(text) {
  const t = text.toLowerCase();
  if (/카톡|카카오|라인|텔레그램|telegram|line/.test(t)) return "외부 메신저 유도";
  if (/조건|만남비|입금|계좌|돈|송금/.test(t)) return "조건만남/금전 요구 의심";
  if (/미성년|고딩|학생/.test(t)) return "미성년자 의심 대화";
  return "";
}

function cleanupExpiredChats() {
  const s = AppStore.get();
  const before = (s.chats || []).length;
  s.chats = (s.chats || []).filter(c => daysBetween(c.createdAt) < 5);
  if (s.chats.length !== before) AppStore.set(s);
}
