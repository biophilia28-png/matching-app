import { bootAuth, getAuthState, renderAuthGate } from "./auth.js";
import { renderProfile, getMyProfile } from "./profile.js";
import { renderHome } from "./home.js";
import { renderMatchDetail } from "./matching.js";
import { renderChatList } from "./chat.js";
import { renderSettings } from "./usageLimits.js";
import { toast, $, createStore, uid } from "./utils.js";

export const AppStore = createStore("ni_v2_store", {
  appVersion: "v2.step1-9",
  activeTab: "home",
  adminTapCount: 0,
  auth: null,
  profile: null,
  region: null,
  photos: [],
  trust: null,
  chatRights: null,
  chats: [],
  blocks: [],
  reports: [],
  systemLogs: []
});

window.NI = { AppStore, uid };

const tabs = {
  home: () => renderHome($("#screenRoot")),
  match: () => renderMatchDetail($("#screenRoot"), getMyProfile()),
  chat: () => renderChatList($("#screenRoot")),
  profile: () => renderProfile($("#screenRoot")),
  settings: () => renderSettings($("#screenRoot"))
};

export function showScreen(tab = "home") {
  const state = AppStore.get();
  state.activeTab = tab;
  AppStore.set(state);
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));

  if (!getAuthState().verified) {
    renderAuthGate($("#screenRoot"));
    return;
  }
  const renderer = tabs[tab] || tabs.home;
  renderer();
}

function bindNavigation() {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => showScreen(btn.dataset.tab));
  });

  $("#adminHiddenEntry").addEventListener("click", () => {
    const s = AppStore.get();
    s.adminTapCount = (s.adminTapCount || 0) + 1;
    AppStore.set(s);
    if (s.adminTapCount >= 5) {
      toast("관리자 숨김 진입 자리는 14단계 admin.js에서 실제 화면으로 연결됩니다.");
      s.adminTapCount = 0;
      AppStore.set(s);
    } else {
      toast(`앱 정보 ${s.adminTapCount}/5`);
    }
  });
}

function init() {
  bootAuth();
  bindNavigation();
  showScreen(AppStore.get().activeTab || "home");
}

document.addEventListener("DOMContentLoaded", init);
