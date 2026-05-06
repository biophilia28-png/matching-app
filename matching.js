import { AppStore, showScreen } from "./app.js";
import { escapeHTML, clamp } from "./utils.js";
import { getBotCandidates } from "./bots.js";

const mbtiPairs = {
  INTJ: ["ENFP","ENTP","INFJ"], INTP: ["ENTJ","ENFJ","ENTP"], ENTJ: ["INTP","INFP","ENTP"], ENTP: ["INFJ","INTJ","INTP"],
  INFJ: ["ENTP","ENFP","INTJ"], INFP: ["ENFJ","ENTJ","INFJ"], ENFJ: ["INFP","INTP","ISFP"], ENFP: ["INFJ","INTJ","ENFJ"],
  ISTJ: ["ESFP","ESTP","ISFJ"], ISFJ: ["ESTP","ESFP","ISTJ"], ESTJ: ["ISFP","ISTP","ESFJ"], ESFJ: ["ISFP","ISTP","ISFJ"],
  ISTP: ["ESFJ","ESTJ","ISFP"], ISFP: ["ENFJ","ESFJ","ESTJ"], ESTP: ["ISFJ","ISTJ","ESFP"], ESFP: ["ISTJ","ISFJ","ESTP"]
};

const zodiacGood = {
  물병자리: ["쌍둥이자리","천칭자리","사수자리"],
  물고기자리: ["게자리","전갈자리","황소자리"],
  양자리: ["사자자리","사수자리","쌍둥이자리"],
  황소자리: ["처녀자리","염소자리","물고기자리"],
  쌍둥이자리: ["천칭자리","물병자리","양자리"],
  게자리: ["전갈자리","물고기자리","황소자리"],
  사자자리: ["양자리","사수자리","천칭자리"],
  처녀자리: ["황소자리","염소자리","게자리"],
  천칭자리: ["쌍둥이자리","물병자리","사자자리"],
  전갈자리: ["게자리","물고기자리","처녀자리"],
  사수자리: ["양자리","사자자리","물병자리"],
  염소자리: ["황소자리","처녀자리","전갈자리"]
};

export function computeCompatibility(me, other) {
  const saju = calcSajuScore(me, other);
  const mbti = calcMbtiScore(me.mbti, other.mbti);
  const zodiac = calcZodiacScore(me.zodiac, other.zodiac);
  const lifestyle = calcLifestyleScore(me, other);
  const total = Math.round(saju * 0.42 + mbti * 0.23 + zodiac * 0.20 + lifestyle * 0.15);

  return {
    total,
    grade: total >= 90 ? "최고궁합" : total >= 80 ? "좋은궁합" : total >= 75 ? "보통 이상" : total >= 60 ? "주의궁합" : "낮은궁합",
    canChat: total >= 75,
    saju, mbti, zodiac, lifestyle,
    flow20: calcTwentyYearFlow(me, other),
    reasons: explain(me, other, { total, saju, mbti, zodiac, lifestyle })
  };
}

function calcSajuScore(me, other) {
  const a = String(me.birthCode || me.birthDate || me.nickname || "");
  const b = String(other.birthCode || other.birthDate || other.nickname || "");
  let seed = 0;
  for (const ch of a + b) seed += ch.charCodeAt(0);
  let score = 58 + (seed % 35);
  if ((me.birthHour || "") === (other.birthHour || "")) score += 4;
  if (me.ageBand && other.ageBand && me.ageBand !== other.ageBand) score += 2;
  return clamp(score, 35, 100);
}

function calcMbtiScore(a, b) {
  if (!a || !b) return 65;
  if (a === b) return 76;
  if (mbtiPairs[a]?.includes(b)) return 94;
  let same = [...a].filter((ch, i) => ch === b[i]).length;
  return [58, 66, 72, 80, 76][same] || 65;
}

function calcZodiacScore(a, b) {
  if (!a || !b) return 65;
  if (a === b) return 72;
  if (zodiacGood[a]?.includes(b)) return 92;
  return 62 + ((a.length + b.length) % 18);
}

function calcLifestyleScore(me, other) {
  let score = 60;
  if (me.smoking === other.smoking) score += 12;
  if (me.drinking === other.drinking) score += 9;
  if (me.exercise === other.exercise) score += 8;
  if (me.regionName && other.regionName && me.regionName.split(" ")[0] === other.regionName.split(" ")[0]) score += 8;
  if (me.bodyStyle && other.bodyStyle) score += 3;
  return clamp(score, 35, 100);
}

function calcTwentyYearFlow(me, other) {
  const base = calcSajuScore(me, other);
  return [
    { age: "20~39세", score: clamp(base + 3, 0, 100), note: "연애 감정과 호기심이 강한 흐름" },
    { age: "40~59세", score: clamp(base - 1, 0, 100), note: "현실 조건과 생활 리듬이 중요" },
    { age: "60~79세", score: clamp(base + 2, 0, 100), note: "안정감과 정서 궁합 중심" },
    { age: "80~100세", score: clamp(base - 4, 0, 100), note: "동반자적 친밀감 중심" }
  ];
}

function explain(me, other, scores) {
  const reasons = [];
  if (scores.saju >= 80) reasons.push("사주 흐름에서 형충보다 회합/보완성이 강하게 계산되었습니다.");
  else reasons.push("사주 흐름은 일부 충돌 가능성이 있어 천천히 확인하는 편이 좋습니다.");

  if (scores.mbti >= 85) reasons.push(`${me.mbti}와 ${other.mbti}는 대화 방식과 끌림이 좋은 MBTI 조합입니다.`);
  else reasons.push("MBTI는 완전한 천생연분보다는 생활 속 조율이 필요한 조합입니다.");

  if (scores.zodiac >= 85) reasons.push(`${me.zodiac}와 ${other.zodiac}는 별자리 궁합에서 좋은 조합으로 분류됩니다.`);
  if (scores.lifestyle >= 75) reasons.push("주량, 흡연, 운동, 지역 등 생활스타일이 비교적 잘 맞습니다.");
  if (scores.total < 75) reasons.push("총합 75점 미만이므로 프리미엄이어도 채팅 신청은 제한됩니다.");
  return reasons;
}

export function getRecommendedMatches(me) {
  const bots = getBotCandidates(me);
  return bots
    .map(bot => ({ ...bot, compatibility: computeCompatibility(me, bot) }))
    .sort((a, b) => b.compatibility.total - a.compatibility.total);
}

export function renderMatchDetail(root, me) {
  const matches = getRecommendedMatches(me);
  root.innerHTML = `
    <section class="hero">
      <h2>궁합 상세</h2>
      <p>총합 75점 이상만 채팅 신청 가능합니다. 사주궁합, MBTI, 별자리, 생활스타일을 합산합니다.</p>
    </section>
    ${matches.map(m => matchCard(m)).join("")}
  `;
}

function matchCard(m) {
  const c = m.compatibility;
  return `
    <section class="card">
      <div class="match-card">
        <img class="profile-photo" src="${m.photo}" alt="${escapeHTML(m.nickname)}" />
        <div style="flex:1">
          <div class="row"><b>${escapeHTML(m.nickname)}</b><span class="badge ${c.canChat ? "good" : "bad"}">${c.grade}</span></div>
          <div class="small">${escapeHTML(m.regionName)} · ${escapeHTML(m.mbti)} · ${escapeHTML(m.zodiac)} · ${m.isBot ? "AI추천 인연" : "일반 회원"}</div>
        </div>
        <div class="score">${c.total}<small>점</small></div>
      </div>
      <div class="progress" style="margin:12px 0"><i style="width:${c.total}%"></i></div>
      <div class="grid2">
        <div class="kv"><span>사주</span><b>${c.saju}</b></div>
        <div class="kv"><span>MBTI</span><b>${c.mbti}</b></div>
        <div class="kv"><span>별자리</span><b>${c.zodiac}</b></div>
        <div class="kv"><span>생활</span><b>${c.lifestyle}</b></div>
      </div>
      <p class="small">${c.reasons.map(escapeHTML).join("<br>")}</p>
      <div class="notice">${c.flow20.map(f => `${f.age}: ${f.score}점 - ${f.note}`).join("<br>")}</div>
    </section>
  `;
}
