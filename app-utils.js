window.HockeyUtils = (() => {
  const sectionThemes = [
    { accent: '#5de8ff', accent2: '#0b6cff', soft: 'rgba(93, 232, 255, 0.16)' },
    { accent: '#ffd05a', accent2: '#ff8a1f', soft: 'rgba(255, 208, 90, 0.16)' },
    { accent: '#5ff0cf', accent2: '#0e9f7e', soft: 'rgba(95, 240, 207, 0.16)' },
    { accent: '#ff9aa8', accent2: '#e84552', soft: 'rgba(255, 154, 168, 0.16)' },
  ];

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = String(value);
    return node.innerHTML;
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  }

  function plural(count, one, few, many) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function sectionTheme(index) {
    return sectionThemes[index % sectionThemes.length] || sectionThemes[0];
  }

  function sectionThemeVars(index) {
    const theme = sectionTheme(index);
    return `--section-accent: ${theme.accent}; --section-accent-2: ${theme.accent2}; --section-accent-soft: ${theme.soft};`;
  }

  function applySectionTheme(element, index) {
    const theme = sectionTheme(index);
    element.style.setProperty('--section-accent', theme.accent);
    element.style.setProperty('--section-accent-2', theme.accent2);
    element.style.setProperty('--section-accent-soft', theme.soft);
  }

  function difficultyMeter(difficulty) {
    const level = Math.max(1, Math.min(3, Number(difficulty) || 1));
    const bars = [1, 2, 3]
      .map(index => `<i class="${index <= level ? 'is-on' : ''}"></i>`)
      .join('');
    return `
      <span class="term-level term-level--${level}" role="img"
        title="Сложность ${level} из 3" aria-label="Сложность ${level} из 3">
        ${bars}
      </span>
    `;
  }

  return { escapeHtml, shuffle, plural, sectionThemeVars, applySectionTheme, difficultyMeter };
})();
