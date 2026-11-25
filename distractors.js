window.HOCKEY_DISTRACTORS = (() => {
  const groups = [
    ['offside', 'icing', 'delayed-call', 'faceoff', 'clearing-zone'],
    ['goal', 'assist', 'save', 'shot-on-goal', 'rebound', 'empty-net-goal'],
    ['penalty', 'delayed-penalty', 'penalty-shot', 'double-minor', 'shorthanded', 'penalty-killing'],
    ['crease', 'goal-cage', 'goalposts', 'crossbar', 'goal-line'],
    ['faceoff-circles', 'centre-ice-spot', 'faceoff', 'centre-ice'],
    ['blue-lines', 'centre-line', 'zones', 'defensive-zone', 'attacking-zone', 'neutral-zone'],
    ['captain', 'alternate-captain', 'assistant-coach', 'centre', 'wings', 'forwards', 'defenders'],
    ['goalkeeper', 'skaters', 'defenders', 'forwards', 'centre', 'wings', 'players'],
    ['forward-line', 'line-change', 'shift', 'substitution', 'skaters', 'roster'],
    ['stick', 'puck', 'blocker', 'catching-glove', 'face-mask', 'jersey'],
    ['wrist-shot', 'slap-shot', 'backhand', 'one-timer', 'deke', 'screen-shot', 'deflection', 'rebound'],
    ['high-stick', 'delay-game', 'body-check', 'checking', 'offside', 'icing', 'penalty'],
    ['offside', 'icing', 'high-stick', 'delay-game', 'shootout', 'overtime', 'sudden-death'],
    ['referee', 'linespersons', 'off-ice-officials', 'on-ice-officials', 'waved-off'],
    ['plus-minus', 'pim', 'shot-on-goal', 'save', 'assist', 'goal', 'hat-trick'],
    ['forecheck', 'backcheck', 'transition', 'checking', 'body-check', 'lane'],
    ['full-strength', 'shorthanded', 'penalty-killing', 'penalty', 'delayed-penalty'],
  ];

  const stopWords = new Set([
    'или',
    'если',
    'когда',
    'после',
    'перед',
    'между',
    'через',
    'также',
    'это',
    'как',
    'для',
    'при',
    'над',
    'под',
    'без',
    'его',
    'она',
    'они',
    'все',
    'весь',
    'игра',
    'игрок',
    'игрока',
    'игроки',
    'шайба',
    'шайбы',
    'шайбой',
    'хоккей',
    'хоккеист',
    'хоккеиста',
    'команда',
    'команды',
    'может',
    'должен',
    'должна',
    'должны',
    'который',
    'которая',
    'которые',
    'чтобы',
    'этот',
    'эта',
    'эти',
    'свой',
    'своей',
    'своих',
    'один',
    'одна',
    'одно',
    'два',
    'две',
    'the',
    'and',
    'with',
    'from',
    'that',
    'this',
    'into',
    'over',
    'under',
  ]);

  function normalize(value) {
    return String(value || '').toLocaleLowerCase('ru');
  }

  function tokens(value) {
    return normalize(value)
      .split(/[^a-zа-яё0-9]+/i)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  function groupsFor(termId) {
    return groups.filter(group => group.includes(termId));
  }

  function overlapScore(targetTokens, candidateTokens) {
    const target = new Set(targetTokens);
    let score = 0;
    candidateTokens.forEach(token => {
      if (target.has(token)) score += 1;
    });
    return score;
  }

  function lengthScore(targetText, candidateText) {
    const targetLength = normalize(targetText).length;
    const candidateLength = normalize(candidateText).length;
    if (!targetLength || !candidateLength) return 0;
    return 1 - Math.abs(targetLength - candidateLength) / Math.max(targetLength, candidateLength);
  }

  function score(target, candidate, answerText, style = 'near') {
    const targetText = answerText(target);
    const candidateText = answerText(candidate);
    if (!candidateText || candidateText === targetText) return -Infinity;

    let value = 0;
    if (target.category === candidate.category) value += 3.5;
    if (target.difficulty === candidate.difficulty) value += 1;
    if (target.category === 'rules' && candidate.category === 'rules') value += 0.5;

    const targetGroups = groupsFor(target.id);
    const sharesGroup = targetGroups.some(group => group.includes(candidate.id));
    if (sharesGroup) value += 7;

    const targetTokens = [
      ...tokens(target.en),
      ...tokens(target.ru),
      ...tokens(target.description),
    ];
    const candidateTokens = [
      ...tokens(candidate.en),
      ...tokens(candidate.ru),
      ...tokens(candidate.description),
    ];
    value += overlapScore(targetTokens, candidateTokens) * 1.15;
    value += lengthScore(targetText, candidateText) * 1.2;

    if (style === 'opposite') {
      const opposites = {
        forehand: 'backhand',
        backhand: 'forehand',
        forecheck: 'backcheck',
        backcheck: 'forecheck',
        'attacking-zone': 'defensive-zone',
        'defensive-zone': 'attacking-zone',
        'on-ice-officials': 'off-ice-officials',
        'off-ice-officials': 'on-ice-officials',
        'full-strength': 'shorthanded',
        shorthanded: 'full-strength',
        overtime: 'regulation-time',
        'regulation-time': 'overtime',
      };
      if (opposites[target.id] === candidate.id) value += 8;
    }

    const tieBreaker =
      candidate.id.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0) % 97;
    return value + tieBreaker / 1000;
  }

  function pick(target, candidates, answerText, count = 3, style = 'near') {
    const ranked = candidates
      .map(candidate => ({
        candidate,
        value: score(target, candidate, answerText, style),
      }))
      .filter(item => Number.isFinite(item.value))
      .sort((a, b) => b.value - a.value);

    const chosen = [];
    const usedText = new Set([answerText(target)]);
    for (const item of ranked) {
      const text = answerText(item.candidate);
      if (usedText.has(text)) continue;
      chosen.push(item.candidate);
      usedText.add(text);
      if (chosen.length === count) break;
    }
    return chosen;
  }

  return { pick, score, tokens };
})();
