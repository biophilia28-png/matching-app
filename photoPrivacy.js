import { AppStore } from "./app.js";
import { $, toast, uid } from "./utils.js";
import { recomputeTrustScore } from "./trustScore.js";

export function getPhotos() {
  return AppStore.get().photos || [];
}

export function renderPhotoPrivacy(root) {
  const photos = getPhotos();
  const realCount = photos.filter(p => p.realPhotoBenefit).length;
  root.innerHTML = `
    <section class="card">
      <div class="row">
        <h2 class="title">사진/실사진 인증</h2>
        <span class="badge good">실사진 혜택 +${Math.min(realCount, 3)}회</span>
      </div>
      <p class="small">실사진 등록은 선택입니다. 무료 사용자는 최대 3장, 프리미엄 사용자는 최대 5장까지 등록할 수 있습니다. 실사진 1장당 채팅 신청권 +1회, 최대 +3회 혜택을 줍니다.</p>
      <div class="notice">AI사진, 캡처사진, 도용 의심 사진은 혜택에서 제외됩니다. 전신/스타일 사진은 프로필 완성도와 우선 노출 점수에만 반영됩니다.</div>
      <label>사진 종류</label>
      <select id="photoType">
        <option>얼굴 실사진</option>
        <option>전신/스타일 사진</option>
        <option>일상 사진</option>
      </select>
      <label>테스트 이미지 URL 또는 비워두기</label>
      <input id="photoUrl" class="input" placeholder="비우면 더미 이미지 사용" />
      <div class="grid2" style="margin-top:10px">
        <button id="addRealPhoto" class="secondary-btn">실사진 혜택 등록</button>
        <button id="addSuspectPhoto" class="secondary-btn">AI/캡처 의심 등록</button>
      </div>
      <div id="photoList" style="margin-top:12px">${renderPhotoList(photos)}</div>
    </section>
  `;

  $("#addRealPhoto").onclick = () => addPhoto(true);
  $("#addSuspectPhoto").onclick = () => addPhoto(false);
}

function renderPhotoList(photos) {
  if (!photos.length) return `<p class="small">등록된 사진이 없습니다.</p>`;
  return photos.map(p => `
    <div class="chat-list-item">
      <img class="profile-photo" src="${p.url}" alt="사진" />
      <div style="flex:1">
        <b>${p.type}</b><br/>
        <span class="small">${p.realPhotoBenefit ? "실사진 인증 배지 · 혜택 반영" : "AI/캡처/도용 의심 · 혜택 제외"}</span>
      </div>
    </div>
  `).join("");
}

function addPhoto(realPhotoBenefit) {
  const s = AppStore.get();
  const premium = s.premium?.active;
  const limit = premium ? 5 : 3;
  s.photos = s.photos || [];
  if (s.photos.length >= limit) {
    toast(`현재 사진 등록 한도는 ${limit}장입니다.`);
    return;
  }

  s.photos.push({
    id: uid("photo"),
    type: $("#photoType").value,
    url: $("#photoUrl").value.trim() || `https://picsum.photos/seed/${Date.now()}/120/120`,
    realPhotoBenefit,
    originalQualityAllowed: true,
    verifiedBadge: realPhotoBenefit,
    createdAt: new Date().toISOString()
  });
  s.trust = recomputeTrustScore(s);
  AppStore.set(s);
  toast(realPhotoBenefit ? "실사진 혜택이 반영되었습니다." : "혜택 제외 사진으로 등록되었습니다.");
  location.reload();
}
