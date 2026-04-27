const mbtiGood = {
  INTJ: ["ENFP", "ENTP"],
  INTP: ["ENTJ", "ENFJ"],
  ENTJ: ["INTP", "INFP"],
  ENTP: ["INFJ", "INTJ"],
  INFJ: ["ENTP", "ENFP"],
  INFP: ["ENFJ", "ENTJ"],
  ENFJ: ["INFP", "ISFP"],
  ENFP: ["INTJ", "INFJ"],
  ISTJ: ["ESFP", "ESTP"],
  ISFJ: ["ESFP", "ESTP"],
  ESTJ: ["ISTP", "ISFP"],
  ESFJ: ["ISFP", "ISTP"],
  ISTP: ["ESTJ", "ESFJ"],
  ISFP: ["ESFJ", "ENFJ"],
  ESTP: ["ISFJ", "ISTJ"],
  ESFP: ["ISTJ", "ISFJ"]
};

function getMbtiScore(a, b) {
  if (!a || !b) return 10;
  if (a === b) return 18;
  if (mbtiGood[a] && mbtiGood[a].includes(b)) return 25;
  return 15;
}

function getMbtiText(a, b, score) {
  if (score >= 25) return `${a}와 ${b}는 서로 부족한 부분을 보완하는 천생연분형 궁합입니다.`;
  if (score >= 18) return `${a}와 ${b}는 비슷한 성향으로 편안하지만 익숙함이 강할 수 있습니다.`;
  return `${a}와 ${b}는 대화 방식과 감정 표현을 맞춰가면 관계가 좋아질 수 있습니다.`;
}

function getStar(month, day) {
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "양자리";
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "황소자리";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 21)) return "쌍둥이자리";
  if ((month == 6 && day >= 22) || (month == 7 && day <= 22)) return "게자리";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "사자자리";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "처녀자리";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "천칭자리";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 22)) return "전갈자리";
  if ((month == 11 && day >= 23) || (month == 12 && day <= 24)) return "사수자리";
  if ((month == 12 && day >= 25) || (month == 1 && day <= 19)) return "염소자리";
  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "물병자리";
  return "물고기자리";
}

const starGood = {
  양자리: ["사자자리", "사수자리", "쌍둥이자리"],
  황소자리: ["처녀자리", "염소자리", "게자리"],
  쌍둥이자리: ["천칭자리", "물병자리", "양자리"],
  게자리: ["전갈자리", "물고기자리", "황소자리"],
  사자자리: ["양자리", "사수자리", "천칭자리"],
  처녀자리: ["황소자리", "염소자리", "게자리"],
  천칭자리: ["쌍둥이자리", "물병자리", "사자자리"],
  전갈자리: ["게자리", "물고기자리", "처녀자리"],
  사수자리: ["양자리", "사자자리", "물병자리"],
  염소자리: ["황소자리", "처녀자리", "전갈자리"],
  물병자리: ["쌍둥이자리", "천칭자리", "사수자리"],
  물고기자리: ["게자리", "전갈자리", "염소자리"]
};

function getStarScore(a, b) {
  if (!a || !b) return 10;
  if (a === b) return 18;
  if (starGood[a] && starGood[a].includes(b)) return 25;
  return 15;
}

function getStarText(a, b, score) {
  if (score >= 25) return `${a}와 ${b}는 끌림과 대화 흐름이 좋은 별자리 궁합입니다.`;
  if (score >= 18) return `${a}와 ${b}는 비슷한 감정 흐름으로 안정적인 관계가 가능합니다.`;
  return `${a}와 ${b}는 관계 속도와 감정 표현 방식을 천천히 맞춰가는 것이 좋습니다.`;
}

const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];

const sixHarmony = {
  자: "축", 축: "자",
  인: "해", 해: "인",
  묘: "술", 술: "묘",
  진: "유", 유: "진",
  사: "신", 신: "사",
  오: "미", 미: "오"
};

const clash = {
  자: "오", 오: "자",
  축: "미", 미: "축",
  인: "신", 신: "인",
  묘: "유", 유: "묘",
  진: "술", 술: "진",
  사: "해", 해: "사"
};

const triGroups = [
  ["신", "자", "진"],
  ["해", "묘", "미"],
  ["인", "오", "술"],
  ["사", "유", "축"]
];

function getYearBranch(year) {
  const idx = (Number(year) - 4) % 12;
  return branches[(idx + 12) % 12];
}

function getMonthBranch(month) {
  const map = {
    1: "축", 2: "인", 3: "묘", 4: "진",
    5: "사", 6: "오", 7: "미", 8: "신",
    9: "유", 10: "술", 11: "해", 12: "자"
  };
  return map[Number(month)] || "자";
}

function getDayBranch(day) {
  return branches[(Number(day) - 1) % 12];
}

function getHourBranch(hour) {
  const h = Number(hour);
  if (h >= 23 || h < 1) return "자";
  if (h < 3) return "축";
  if (h < 5) return "인";
  if (h < 7) return "묘";
  if (h < 9) return "진";
  if (h < 11) return "사";
  if (h < 13) return "오";
  if (h < 15) return "미";
  if (h < 17) return "신";
  if (h < 19) return "유";
  if (h < 21) return "술";
  return "해";
}

function branchPairScore(a, b) {
  if (a === b) return 8;
  if (sixHarmony[a] === b) return 12;
  if (clash[a] === b) return 0;

  const tri = triGroups.some(g => g.includes(a) && g.includes(b));
  if (tri) return 10;

  return 5;
}

function branchComment(a, b, label) {
  if (a === b) return `${label}: 같은 지지라 익숙함과 공감대가 강합니다.`;
  if (sixHarmony[a] === b) return `${label}: 육합 관계로 자연스럽게 끌리고 협력하기 쉽습니다.`;
  if (clash[a] === b) return `${label}: 충 관계라 부딪힘이 생기기 쉬워 배려가 필요합니다.`;

  const tri = triGroups.some(g => g.includes(a) && g.includes(b));
  if (tri) return `${label}: 삼합 계열 흐름으로 서로 성장시키는 관계입니다.`;

  return `${label}: 큰 충돌은 적지만 서로를 알아가는 시간이 필요합니다.`;
}

function buildSaju(profile) {
  return {
    year: getYearBranch(profile.birthYear),
    month: getMonthBranch(profile.birthMonth),
    day: getDayBranch(profile.birthDay),
    hour: getHourBranch(profile.birthHour)
  };
}

function getSajuScore(profile, partner) {
  const a = buildSaju(profile);
  const b = buildSaju(partner);

  const yearScore = branchPairScore(a.year, b.year);
  const monthScore = branchPairScore(a.month, b.month);
  const dayScore = branchPairScore(a.day, b.day);
  const hourScore = branchPairScore(a.hour, b.hour);

  const total = yearScore + monthScore + dayScore + hourScore + 2;

  return {
    total: Math.min(50, total),
    text: [
      branchComment(a.year, b.year, "년지 0~20세 흐름"),
      branchComment(a.month, b.month, "월지 20~40세 흐름"),
      branchComment(a.day, b.day, "일지 40~60세 흐름"),
      branchComment(a.hour, b.hour, "시지 60~80세 흐름")
    ].join("\n")
  };
}

function calcTotal(profile, partner) {
  const mbti = getMbtiScore(profile.mbti, partner.mbti);

  const myStar = getStar(profile.birthMonth, profile.birthDay);
  const yourStar = getStar(partner.birthMonth, partner.birthDay);
  const star = getStarScore(myStar, yourStar);

  const sajuObj = getSajuScore(profile, partner);

  return {
    total: mbti + star + sajuObj.total,
    mbti,
    star,
    saju: sajuObj.total,
    sajuText: sajuObj.text,
    mbtiText: getMbtiText(profile.mbti, partner.mbti, mbti),
    starText: getStarText(myStar, yourStar, star),
    myStar,
    yourStar
  };
}
