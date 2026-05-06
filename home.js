import { AppStore, showScreen } from "./app.js";
import { escapeHTML } from "./utils.js";
import { getMyProfile } from "./profile.js";
import { getRecommendedMatches } from "./matching.js";
import { getRemainingChatRights } from "./usageLimits.js";
import { getTrustScore } from "./trustScore.js";

export function renderHome(root) {
  const state = AppStore.get();
  const me = getMyProfile();
  const matches = getRecommendedMatches(me);
  const top = matches[0];
  const remaining = getRemainingChatRights(state);
  const trust = getTrustScore(state);

  root.innerHTML = `
    <section class="hero">
      <div class="row">
        <div>
          <h2>오늘의 최고 인연</h2>
          <p>${top ? `${top.nickname}님과 총합 ${top.compatibility.total}점 · ${top.compatibility.grade}` : "프로필 저장 후 추천됩니다."}</p>
        </div>
        <span class="badge good">최고 궁합 배너</span>
      </div>
    </section>

    <section class="card">
      <div class="row">
        <div>
          <h2 class="title">남은 채팅권</h2>
          <p class="small">기본 무료 5회 + 실사진 혜택 최대 3회 + 월정액/구매권</p>
        </div>
        <div class="score">${remaining}<small>회</small></div>
      </div>
      <button class="secondary-btn" onclick="window.NI_goSettings()">채팅권/설정 보기</button>
    </section>

    <section class="card">
      <div class="row">
        <h2 class="title">내 신뢰도</h2>
        <span class="badge ${trust.score >= 70 ? "good" : "warn"}">${trust.grade}</span>
      </div>
      <div class="progress"><i style="width:${trust.score}%"></i></div>
      <p class="small">${trust.reason.join(" · ")}</p>
    </section>

    <div class="ad-box">광고 자리 · 초기 무료 운영 후 11단계 ads.js에서 활성화</div>

    <section class="card">
      <h2 class="title">좋은 궁합 TOP 3</h2>
      <p class="small">좋은 궁합 열람은 무료 사용자도 볼 수 있습니다. 프리미엄은 우선 알림/우선 노출만 적용됩니다.</p>
      ${matches.slice(0, 3).map(renderTopCard).join("")}
    </section>

    <section class="card flat">
      <h2 class="title">사진 등록 혜택</h2>
      <p class="small">실사진 1장당 채팅 신청권 +1회, 최대 +3회. 전신/스타일 사진은 프로필 완성도와 우선 노출에 반영됩니다.</p>
      <button class="primary-btn" onclick="window.NI_goProfile()">프로필/사진 등록하기</button>
    </section>
  `;

  window.NI_goProfile = () => showScreen("profile");
  window.NI_goSettings = () => showScreen("settings");
}

function renderTopCard(m) {
  const c = m.compatibility;
  return `
    <div class="chat-list-item">
      <img class="profile-photo" src="${m.photo}" alt="${escapeHTML(m.nickname)}" />
      <div style="flex:1">
        <div class="row"><b>${escapeHTML(m.nickname)}</b><span class="badge ${c.canChat ? "good" : "warn"}">${c.total}점</span></div>
        <div class="small">${escapeHTML(m.regionName)} · 약 ${m.distanceKm}km · ${escapeHTML(m.badge)}</div>
        <div class="small">${escapeHTML(c.reasons[0] || "")}</div>
      </div>
    </div>
  `;
}
