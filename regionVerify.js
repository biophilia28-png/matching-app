import { AppStore } from "./app.js";
import { $, daysBetween, toast } from "./utils.js";

export function getRegionState() {
  return AppStore.get().region || {
    verified: false,
    regionName: "",
    verifiedAt: null,
    expiresInDays: 30,
    preciseLocationStored: false
  };
}

export function renderRegionVerify(root) {
  const r = getRegionState();
  const expired = !r.verifiedAt || daysBetween(r.verifiedAt) >= 30;
  root.innerHTML = `
    <section class="card">
      <div class="row">
        <h2 class="title">지역 인증</h2>
        <span class="badge ${r.verified && !expired ? "good" : "warn"}">${r.verified && !expired ? "지역 인증됨" : "재인증 필요"}</span>
      </div>
      <p class="small">GPS는 현재 지역 확인에만 사용하고 정확한 위치는 저장하지 않습니다. 프로필에는 시/구 정도의 지역명만 표시합니다.</p>
      <label>표시 지역명</label>
      <input id="manualRegion" class="input" value="${r.regionName || ""}" placeholder="예: 서울 서초구" />
      <div style="height:10px"></div>
      <button id="verifyRegionBtn" class="secondary-btn">현재 위치 기반 지역 설정</button>
      <p class="small">마지막 인증: ${r.verifiedAt ? new Date(r.verifiedAt).toLocaleDateString("ko-KR") : "없음"} · 30일마다 재인증</p>
    </section>
  `;
  $("#verifyRegionBtn").onclick = verifyRegion;
}

function verifyRegion() {
  const manual = $("#manualRegion").value.trim();
  if (manual) return saveRegion(manual);

  if (!navigator.geolocation) {
    toast("GPS를 사용할 수 없어 수동 지역명을 입력해주세요.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    () => saveRegion("현재 위치 인증 지역"),
    () => toast("위치 권한이 거부되었습니다. 지역명을 직접 입력해주세요."),
    { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
  );
}

function saveRegion(regionName) {
  const s = AppStore.get();
  s.region = {
    verified: true,
    regionName,
    verifiedAt: new Date().toISOString(),
    expiresInDays: 30,
    preciseLocationStored: false,
    note: "정확한 GPS 좌표는 저장하지 않고 지역 인증 여부와 지역명만 저장."
  };
  if (s.profile) s.profile.regionName = regionName;
  AppStore.set(s);
  toast("지역 인증 완료");
}
