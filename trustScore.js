export function recomputeTrustScore(state) {
  const profile = state.profile || {};
  const photos = state.photos || [];
  const realPhotos = photos.filter(p => p.realPhotoBenefit).length;
  let score = 35;

  if (state.auth?.identityVerified) score += 20;
  if (state.auth?.adultVerified) score += 10;
  if (state.region?.verified) score += 10;
  if (profile.nickname && profile.mbti && profile.zodiac) score += 8;
  if (profile.education && profile.education !== "비공개") score += 4;
  if (profile.job && profile.job !== "비공개") score += 4;
  if (profile.incomeRange && profile.incomeRange !== "비공개") score += 4;
  score += Math.min(realPhotos, 3) * 5;

  score = Math.min(100, score);
  return {
    score,
    grade: score >= 85 ? "매우 높음" : score >= 70 ? "높음" : score >= 55 ? "보통" : "낮음",
    priorityExposure: score >= 70,
    reason: [
      state.auth?.identityVerified ? "본인인증 완료" : "본인인증 필요",
      state.region?.verified ? "지역 인증 완료" : "지역 인증 필요",
      realPhotos ? `실사진 ${realPhotos}장` : "실사진 없음"
    ]
  };
}

export function getTrustScore(state) {
  return state.trust || recomputeTrustScore(state);
}
