/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-alert, no-use-before-define */
(() => {
  const glossary = window.HOCKEY_GLOSSARY || { categories: {}, terms: [] };
  const rules = window.HOCKEY_RULES || { sections: [] };
  const visuals = window.HOCKEY_VISUALS || {};
  const distractorEngine = window.HOCKEY_DISTRACTORS || null;
  const storageKey = 'hockey-quiz-progress-v2';
  const seasonStorageKey = 'hockey-glossary-season-v1';
  const englishSeasonStorageKey = 'hockey-english-season-v1';
  const activeTestStorageKey = 'hockey-active-test-v1';
  const seasonMatchSize = 12;
  const {
    escapeHtml,
    shuffle,
    plural,
    sectionThemeVars,
    applySectionTheme,
    difficultyMeter,
  } = window.HockeyUtils;
  const storage = window.HockeyStorage;

  const state = {
    activeTest: null,
    questionIndex: 0,
    answers: [],
    locked: false,
    glossaryCategory: 'all',
    glossarySearch: '',
    studyTerms: [],
    studyIndex: 0,
    termDialogIndex: 0,
    progress: loadProgress(),
    savedTest: storage.loadActiveTest(activeTestStorageKey),
    season: loadSeason(seasonStorageKey),
    englishSeason: loadSeason(englishSeasonStorageKey),
    seasonMode: 'main',
    activeSectionId: rules.sections[0]?.id || null,
    rulesFilter: 'all',
  };

  const screens = {
    home: document.querySelector('#home-screen'),
    season: document.querySelector('#season-screen'),
    rules: document.querySelector('#rules-screen'),
    lesson: document.querySelector('#lesson-screen'),
    glossary: document.querySelector('#glossary-screen'),
    study: document.querySelector('#study-screen'),
    quiz: document.querySelector('#quiz-screen'),
    result: document.querySelector('#result-screen'),
  };

  const elements = {
    headerAttempts: document.querySelector('#header-attempts'),
    totalAttempts: document.querySelector('#total-attempts'),
    rulesMastered: document.querySelector('#rules-mastered'),
    rulesMasteredTotal: document.querySelector('#rules-mastered-total'),
    termsLearned: document.querySelector('#terms-learned'),
    termsLearnedTotal: document.querySelector('#terms-learned-total'),
    termsLearnedBar: document.querySelector('#terms-learned-bar'),
    termsLearnedProgress: document.querySelector('#terms-learned-progress'),
    rankTitle: document.querySelector('#rank-title'),
    termsTotal: document.querySelector('#terms-total'),
    conceptsTotal: document.querySelector('#concepts-total'),
    glossaryTotal: document.querySelector('#glossary-total'),
    promoCategories: document.querySelector('#promo-categories'),
    resumeSection: document.querySelector('#resume-test'),
    resumeName: document.querySelector('#resume-test-name'),
    resumeProgress: document.querySelector('#resume-test-progress'),
    resumeBar: document.querySelector('#resume-test-bar'),
    glossarySeasonProgressLabel: document.querySelector('#glossary-season-progress-label'),
    glossarySeasonProgressBar: document.querySelector('#glossary-season-progress-bar'),
    rulesHomeGrid: document.querySelector('[data-rules-home-grid]'),
    rulesPromoSections: document.querySelector('#rules-promo-sections'),
    rulesPromoRules: document.querySelector('#rules-promo-rules'),
    rulesPromoQuestions: document.querySelector('#rules-promo-questions'),
    rulesPromoTopics: document.querySelector('#rules-promo-topics'),
    seasonModeButtons: document.querySelectorAll('[data-season-mode]'),
    seasonKicker: document.querySelector('#season-kicker'),
    seasonTitle: document.querySelector('#season-title'),
    seasonDescription: document.querySelector('#season-description'),
    seasonTotalConcepts: document.querySelector('#season-total-concepts'),
    seasonMatchTotal: document.querySelector('#season-match-total'),
    seasonProgressLabel: document.querySelector('#season-progress-label'),
    seasonProgressPercent: document.querySelector('#season-progress-percent'),
    seasonProgressBar: document.querySelector('#season-progress-bar'),
    seasonStats: document.querySelector('#season-stats'),
    seasonMessage: document.querySelector('#season-message'),
    seasonPrimary: document.querySelector('#season-primary'),
    seasonErrors: document.querySelector('#season-errors'),
    seasonReset: document.querySelector('#season-reset'),
    seasonBreakdownSection: document.querySelector('#season-breakdown-section'),
    seasonBreakdown: document.querySelector('#season-breakdown'),
    rulesSections: document.querySelector('#rules-sections'),
    rulesFilters: document.querySelector('#rules-filters'),
    rulesFilterResult: document.querySelector('#rules-filter-result'),
    rulesSectionsTotal: document.querySelector('#rules-sections-total'),
    rulesRulesTotal: document.querySelector('#rules-rules-total'),
    rulesQuestionsTotal: document.querySelector('#rules-questions-total'),
    lessonKicker: document.querySelector('#lesson-kicker'),
    lessonSectionLabel: document.querySelector('#lesson-section-label'),
    lessonTitle: document.querySelector('#lesson-title'),
    lessonIntro: document.querySelector('#lesson-intro'),
    lessonHeroVisual: document.querySelector('#lesson-hero-visual'),
    lessonToc: document.querySelector('#lesson-toc'),
    lessonContent: document.querySelector('#lesson-content'),
    termSearch: document.querySelector('#term-search'),
    categoryFilters: document.querySelector('#category-filters'),
    termsFound: document.querySelector('#terms-found'),
    clearSearch: document.querySelector('#clear-search'),
    termsGrid: document.querySelector('#terms-grid'),
    termDialog: document.querySelector('#term-dialog'),
    termDialogCategory: document.querySelector('#term-dialog-category'),
    termDialogDifficulty: document.querySelector('#term-dialog-difficulty'),
    termDialogTitle: document.querySelector('#term-dialog-title'),
    termDialogDescription: document.querySelector('#term-dialog-description'),
    termDialogEnglish: document.querySelector('#term-dialog-english'),
    termDialogCounter: document.querySelector('#term-dialog-counter'),
    studyCategory: document.querySelector('#study-category'),
    studyCounter: document.querySelector('#study-counter'),
    studyProgress: document.querySelector('#study-progress'),
    studyTermEn: document.querySelector('#study-term-en'),
    studyTermRu: document.querySelector('#study-term-ru'),
    studyDescription: document.querySelector('#study-description'),
    studyAnswer: document.querySelector('#study-answer'),
    revealButton: document.querySelector('#reveal-button'),
    studyNextButton: document.querySelector('#study-next-button'),
    quizCategory: document.querySelector('#quiz-category'),
    quizExitLabel: document.querySelector('#quiz-exit-label'),
    questionCounter: document.querySelector('#question-counter'),
    progressBar: document.querySelector('#progress-bar'),
    questionNumber: document.querySelector('#question-number'),
    questionKicker: document.querySelector('#question-kicker'),
    questionTitle: document.querySelector('#question-title'),
    questionVisual: document.querySelector('#question-visual'),
    answers: document.querySelector('#answers'),
    feedback: document.querySelector('#feedback'),
    feedbackIcon: document.querySelector('#feedback-icon'),
    feedbackTitle: document.querySelector('#feedback-title'),
    feedbackText: document.querySelector('#feedback-text'),
    feedbackEnglish: document.querySelector('#feedback-english'),
    prevButton: document.querySelector('#prev-button'),
    nextButton: document.querySelector('#next-button'),
    resultBadge: document.querySelector('#result-badge'),
    resultTitle: document.querySelector('#result-title'),
    resultSubtitle: document.querySelector('#result-subtitle'),
    scoreRing: document.querySelector('#score-ring'),
    scorePercent: document.querySelector('#score-percent'),
    resultStars: document.querySelector('#result-stars'),
    correctCount: document.querySelector('#correct-count'),
    wrongCount: document.querySelector('#wrong-count'),
    bestResult: document.querySelector('#best-result'),
    resultBackButton: document.querySelector('#result-back-button'),
    resultMistakesButton: document.querySelector('#result-mistakes-button'),
    mistakesSection: document.querySelector('#mistakes-section'),
    mistakesList: document.querySelector('#mistakes-list'),
  };

  function loadProgress() {
    const progress = storage.loadProgress(storageKey, 'hockey-quiz-progress-v1');
    progress.attemptsById = progress.attemptsById || {};
    return progress;
  }

  function attemptsFor(testId) {
    return Number(state.progress.attemptsById?.[testId]) || 0;
  }

  function attemptsLabel(count) {
    return `${count} ${plural(count, 'попытка', 'попытки', 'попыток')}`;
  }

  function loadSeason(key) {
    return storage.loadSeason(key, learningTerms().map(term => term.id));
  }

  function saveProgress() {
    storage.write(storageKey, state.progress);
  }

  function saveSeason() {
    const key = state.seasonMode === 'english' ? englishSeasonStorageKey : seasonStorageKey;
    const season = activeSeason();
    if (season) storage.write(key, season);
    else storage.remove(key);
  }

  function saveActiveTest() {
    if (!state.activeTest) return;
    const saved = {
      test: state.activeTest,
      questionIndex: state.questionIndex,
      answers: [...state.answers],
    };
    state.savedTest = saved;
    storage.write(activeTestStorageKey, saved);
  }

  function clearActiveTest() {
    state.savedTest = null;
    storage.remove(activeTestStorageKey);
    renderResume();
  }

  function renderResume() {
    if (!elements.resumeSection) return;
    const saved = state.savedTest;
    if (!saved) {
      elements.resumeSection.hidden = true;
      return;
    }
    const total = saved.test.questions.length;
    const answered = saved.answers.filter(answer => answer !== undefined).length;
    const progress = total ? Math.round((answered / total) * 100) : 0;
    elements.resumeSection.hidden = false;
    elements.resumeName.textContent = saved.test.title;
    elements.resumeProgress.textContent = `Вопрос ${saved.questionIndex + 1} из ${total} · отвечено ${answered}`;
    elements.resumeBar.style.width = `${progress}%`;
  }

  function resumeActiveTest() {
    const saved = state.savedTest;
    if (!saved) return;
    state.activeTest = saved.test;
    state.questionIndex = saved.questionIndex;
    state.answers = [...saved.answers];
    state.locked = saved.answers[state.questionIndex] !== undefined;
    showScreen('quiz');
    renderQuestion();
  }

  function activeSeason() {
    return state.seasonMode === 'english' ? state.englishSeason : state.season;
  }

  function setActiveSeason(season) {
    if (state.seasonMode === 'english') state.englishSeason = season;
    else state.season = season;
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([key, screen]) => {
      screen.classList.toggle('screen--active', key === name);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function categoryInfo(category) {
    return glossary.categories[category] || glossary.categories.all;
  }

  function learningTerms() {
    return glossary.terms.filter(term => !term.aliasOf);
  }

  function englishLabel(term) {
    return [term.en, ...(term.aliases || [])].join(' / ');
  }

  function termsInCategory(category) {
    const terms = learningTerms();
    if (category === 'all') return terms;
    return terms.filter(term => term.category === category);
  }

  function filteredTerms() {
    const query = state.glossarySearch.trim().toLocaleLowerCase('ru');
    return termsInCategory(state.glossaryCategory).filter(term => {
      if (!query) return true;
      return [englishLabel(term), term.ru, term.description].some(value =>
        value.toLocaleLowerCase('ru').includes(query)
      );
    });
  }

  function sectionById(sectionId) {
    return rules.sections.find(section => section.id === sectionId);
  }

  function sectionLabel(section) {
    return section.label || `Раздел ${section.id}`;
  }

  function ruleLabel(rule) {
    return rule.label || `Правило ${rule.number}`;
  }

  function ruleByNumber(section, ruleNumber) {
    return section.rules.find(rule => rule.number === ruleNumber);
  }

  function sectionQuestions(section, ruleNumber = null) {
    if (!section) return [];
    return section.questions.filter(question => !ruleNumber || question.rule === ruleNumber);
  }

  function visualContent(visual) {
    if (!visual) return '';
    if (visual.kind === 'svg' && visuals[visual.id]) {
      return visuals[visual.id]();
    }
    if (visual.kind === 'image' && visual.src) {
      return `<img src="${escapeHtml(visual.src)}" alt="${escapeHtml(visual.alt || '')}" loading="lazy" />`;
    }
    return '';
  }

  function renderVisual(visual, figureClass = 'lesson-visual') {
    if (!visual) return '';
    const content = visualContent(visual);
    if (!content) return '';
    const caption = visual.caption
      ? `<figcaption>${escapeHtml(visual.caption)}</figcaption>`
      : '';
    if (!figureClass) return `${content}${caption}`;
    return `<figure class="${figureClass}">${content}${caption}</figure>`;
  }

  function openRules() {
    renderRules();
    showScreen('rules');
  }

  function renderRules() {
    const totalRules = rules.sections.reduce((sum, section) => sum + section.rules.length, 0);
    const totalQuestions = rules.sections.reduce(
      (sum, section) => sum + section.questions.length,
      0
    );
    elements.rulesSectionsTotal.textContent = rules.sections.length;
    elements.rulesRulesTotal.textContent = totalRules;
    elements.rulesQuestionsTotal.textContent = totalQuestions;

    if (
      state.rulesFilter !== 'all' &&
      !rules.sections.some(section => section.id === state.rulesFilter)
    ) {
      state.rulesFilter = 'all';
    }
    const visibleSections = rules.sections
      .map((section, index) => ({ section, index }))
      .filter(({ section }) => state.rulesFilter === 'all' || section.id === state.rulesFilter);
    elements.rulesFilters.innerHTML = [
      { id: 'all', label: 'Все разделы', icon: '🏒', index: null },
      ...rules.sections.map((section, index) => ({
        id: section.id,
        label: section.shortTitle || section.title,
        icon: section.icon,
        index,
      })),
    ]
      .map(
        item => `
          <button
            class="rules-filter-chip ${state.rulesFilter === item.id ? 'is-active' : ''}"
            type="button"
            data-rules-filter="${item.id}"
            aria-pressed="${state.rulesFilter === item.id}"
            ${item.index !== null ? `style="${sectionThemeVars(item.index)}"` : ''}
          >
            <span aria-hidden="true">${item.icon}</span>
            ${escapeHtml(item.label)}
          </button>
        `
      )
      .join('');
    elements.rulesFilterResult.textContent = `Показано ${visibleSections.length} из ${rules.sections.length}`;
    elements.rulesSections.innerHTML = visibleSections
      .map(({ section, index }) => {
        const sectionBest = state.progress.best?.[`rules-${section.id}`];
        const ruleRows = section.rules
          .map(rule => {
            const questionCount = sectionQuestions(section, rule.number).length;
            const ruleBest = state.progress.best?.[`rules-${section.id}-${rule.number}`];
            return `
              <div class="rules-rule-row">
                <span class="rules-rule-row__number">${rule.badge || rule.number}</span>
                <div>
                  <h3>${escapeHtml(rule.title)}</h3>
                  <p>${rule.clauses.length} пунктов · ${questionCount} вопросов${
                    ruleBest !== undefined ? ` · рекорд ${ruleBest}%` : ''
                  }${attemptsFor(`rules-${section.id}-${rule.number}`) ? ` · ${attemptsLabel(attemptsFor(`rules-${section.id}-${rule.number}`))}` : ''}</p>
                </div>
                <div class="rules-rule-row__actions">
                  <button class="rules-mini-button" type="button" data-rule-read="${section.id}:${rule.number}">
                    Читать
                  </button>
                  <button class="rules-mini-button rules-mini-button--primary" type="button" data-rule-test="${section.id}:${rule.number}">
                    Тест
                  </button>
                </div>
              </div>
            `;
          })
          .join('');

        return `
          <article class="rules-section-card" style="${sectionThemeVars(index)}">
            <div class="rules-section-card__top">
              <div>
                <span class="rules-section-card__label">
                  ${section.icon} ${sectionLabel(section)}
                </span>
                <h2>${escapeHtml(section.title)}</h2>
                <p class="rules-section-card__subtitle">${escapeHtml(section.subtitle)}</p>
                ${attemptsFor(`rules-${section.id}`) ? `<span class="rules-attempts">${attemptsLabel(attemptsFor(`rules-${section.id}`))}</span>` : ''}
              </div>
              <div class="rules-section-card__badge">
                <strong>${section.questions.length}</strong>
                <span>вопросов</span>
              </div>
            </div>
            <div class="rules-section-card__actions">
              <button class="primary-button" type="button" data-action="section-test" data-section-id="${section.id}">
                Пройти тест${sectionBest !== undefined ? ` · ${sectionBest}%` : ''}
              </button>
              <button class="secondary-button" type="button" data-action="open-lesson" data-section-id="${section.id}">
                Читать раздел
              </button>
            </div>
            <div class="rules-rule-list">${ruleRows}</div>
          </article>
        `;
      })
      .join('');
  }

  function openLesson(sectionId) {
    const section = sectionById(sectionId);
    if (!section) {
      openRules();
      return;
    }
    state.activeSectionId = section.id;
    renderLesson();
    showScreen('lesson');
  }

  function renderLesson() {
    const section = sectionById(state.activeSectionId) || rules.sections[0];
    if (!section) return;

    const sectionIndex = Math.max(
      0,
      rules.sections.findIndex(item => item.id === section.id)
    );
    applySectionTheme(screens.lesson, sectionIndex);
    screens.lesson
      .querySelector('.lesson-hero')
      ?.classList.toggle('lesson-hero--no-visual', !section.heroVisual);
    elements.lessonKicker.textContent = sectionLabel(section);
    elements.lessonSectionLabel.textContent = `${sectionLabel(section)} · ${section.title}`;
    elements.lessonTitle.textContent = section.title;
    elements.lessonIntro.textContent = section.intro;
    elements.lessonHeroVisual.innerHTML = visualContent(section.heroVisual);

    elements.lessonToc.innerHTML = section.rules
      .map(
        rule => `
          <a href="#lesson-rule-${rule.number}">
            Правило ${rule.number}
            <span>${escapeHtml(rule.title)}</span>
          </a>
        `
      )
      .join('');

    elements.lessonContent.innerHTML = section.rules
      .map(rule => {
        const clauses = rule.clauses
          .map(clause => {
            const paragraphs = clause.text
              .split('\n\n')
              .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
              .join('');
            const clauseVisuals = [
              ...(clause.visual ? [clause.visual] : []),
              ...(clause.visuals || []),
            ]
              .map(visual => renderVisual(visual))
              .join('');
            return `
              <article class="lesson-clause">
                <h3>${clause.id}. ${escapeHtml(clause.title)}</h3>
                ${paragraphs}
                ${clauseVisuals}
              </article>
            `;
          })
          .join('');

        return `
          <section class="lesson-rule" id="lesson-rule-${rule.number}">
            <header class="lesson-rule__header">
              <div>
                <span class="lesson-rule__label">${ruleLabel(rule)}</span>
                <h2>${escapeHtml(rule.title)}</h2>
              </div>
            </header>
            <p class="lesson-rule__summary">${escapeHtml(rule.summary)}</p>
            <div class="lesson-keyfacts">
              ${rule.keyFacts.map(fact => `<span>${escapeHtml(fact)}</span>`).join('')}
            </div>
            <div class="lesson-clauses">${clauses}</div>
            <div class="lesson-rule__footer">
              <button class="primary-button" type="button" data-rule-test="${section.id}:${rule.number}">
                ${rule.label ? `Тест: ${rule.label}` : `Тест по правилу ${rule.number}`}
              </button>
            </div>
          </section>
        `;
      })
      .join('');
  }

  function shuffleQuestionOptions(question) {
    const options = question.a.map((text, index) => ({
      text,
      correct: index === question.correct,
    }));
    const shuffled = shuffle(options);
    return {
      ...question,
      a: shuffled.map(option => option.text),
      correct: shuffled.findIndex(option => option.correct),
    };
  }

  function startRulesQuiz(sectionId, ruleNumber = null) {
    const section = sectionById(sectionId);
    if (!section) return;
    const questions = shuffle(sectionQuestions(section, ruleNumber)).map(shuffleQuestionOptions);
    if (!questions.length) return;
    const rule = ruleNumber ? ruleByNumber(section, ruleNumber) : null;
    activateTest({
      id: ruleNumber ? `rules-${section.id}-${ruleNumber}` : `rules-${section.id}`,
      title: ruleNumber
        ? `${sectionLabel(section)} · ${rule ? ruleLabel(rule) : `правило ${ruleNumber}`}`
        : `${sectionLabel(section)} · ${section.title}`,
      rulesSection: section.id,
      rulesRule: ruleNumber,
      returnScreen: ruleNumber ? 'lesson' : 'rules',
      questions,
    });
  }

  function masteredRulesCount() {
    const best = state.progress.best || {};
    return rules.sections.reduce((total, section) => {
      if ((best[`rules-${section.id}`] || 0) >= 80) return total + section.rules.length;
      return (
        total +
        section.rules.filter(rule => (best[`rules-${section.id}-${rule.number}`] || 0) >= 80)
          .length
      );
    }, 0);
  }

  function rankFor(attempts, mastered, learned) {
    const points = attempts + Math.floor(mastered / 3) + Math.floor(learned / 10);
    if (mastered >= 24 && points >= 18) return 'Капитан знаний';
    if (points >= 5) return 'Хоккейный умник';
    return 'Новичок';
  }

  function renderStats() {
    const attempts = state.progress.attempts || 0;
    const mastered = masteredRulesCount();
    const learned = (state.season?.results || []).filter(result => result?.correct).length;
    const conceptTotal = learningTerms().length;
    const ruleTotal = rules.sections.reduce((sum, section) => sum + section.rules.length, 0);
    const progress = conceptTotal ? Math.round((learned / conceptTotal) * 100) : 0;

    elements.headerAttempts.textContent = attempts;
    elements.totalAttempts.textContent = attempts;
    elements.rulesMastered.textContent = mastered;
    elements.rulesMasteredTotal.textContent = ruleTotal;
    elements.termsLearned.textContent = learned;
    elements.termsLearnedTotal.textContent = conceptTotal;
    elements.termsLearnedBar.style.width = `${progress}%`;
    elements.termsLearnedProgress.setAttribute('aria-valuemax', String(conceptTotal));
    elements.termsLearnedProgress.setAttribute('aria-valuenow', String(learned));
    elements.rankTitle.textContent = rankFor(attempts, mastered, learned);
  }

  function renderPromo() {
    const sourceTotal = glossary.terms.length;
    const conceptTotal = learningTerms().length;
    const matchTotal = Math.ceil(conceptTotal / seasonMatchSize);
    elements.termsTotal.textContent = sourceTotal;
    elements.conceptsTotal.textContent = conceptTotal;
    elements.glossaryTotal.textContent = conceptTotal;
    elements.seasonTotalConcepts.textContent = conceptTotal;
    elements.seasonMatchTotal.textContent = matchTotal;
    elements.promoCategories.innerHTML = Object.entries(glossary.categories)
      .map(([key, category]) => {
        const count = key === 'all' ? conceptTotal : termsInCategory(key).length;
        return `
          <button class="glossary-promo__chip" type="button" data-promo-category="${key}">
            ${category.icon} ${escapeHtml(category.title)} · ${count}
          </button>
        `;
      })
      .join('');

    const answered = state.season?.index || 0;
    const progress = conceptTotal ? Math.round((answered / conceptTotal) * 100) : 0;
    elements.glossarySeasonProgressLabel.textContent =
      answered >= conceptTotal ? `Сезон завершён · ${conceptTotal} / ${conceptTotal}` : `${answered} / ${conceptTotal}`;
    elements.glossarySeasonProgressBar.setAttribute('aria-valuenow', String(progress));
    elements.glossarySeasonProgressBar.querySelector('span').style.width = `${progress}%`;
  }

  function renderHomeRules() {
    if (!elements.rulesHomeGrid) return;
    const totalRules = rules.sections.reduce((sum, section) => sum + section.rules.length, 0);
    const totalQuestions = rules.sections.reduce(
      (sum, section) => sum + section.questions.length,
      0
    );
    elements.rulesPromoSections.textContent = rules.sections.length;
    elements.rulesPromoRules.textContent = totalRules;
    elements.rulesPromoQuestions.textContent = totalQuestions;
    elements.rulesPromoTopics.innerHTML = rules.sections
      .map(
        section => `
          <button class="rules-promo__topic" type="button" data-action="open-lesson" data-section-id="${section.id}">
            ${section.icon} ${escapeHtml(section.shortTitle || section.title)}
          </button>
        `
      )
      .join('');
    elements.rulesHomeGrid.innerHTML = rules.sections
      .map((section, index) => {
        const best = state.progress.best?.[`rules-${section.id}`];
        const visual = section.heroVisual?.src
          ? `<img src="${escapeHtml(section.heroVisual.src)}" alt="${escapeHtml(
              section.heroVisual.alt || section.title
            )}" loading="lazy" />`
          : '';

        return `
          <article class="rules-home-intro" style="--delay: ${index * 80}ms; ${sectionThemeVars(index)}">
            <div class="rules-home-intro__bg">${visual}</div>
            <div class="rules-home-intro__content">
              <span class="rules-home-intro__kicker">${section.icon} ${sectionLabel(section)}</span>
              <h3>${escapeHtml(section.title)}</h3>
              <p>${escapeHtml(section.subtitle)}</p>
              <div class="rules-home-intro__stats">
                <span><strong>${section.rules.length}</strong> ${plural(section.rules.length, 'правило', 'правила', 'правил')}</span>
                <span><strong>${section.questions.length}</strong> ${plural(section.questions.length, 'вопрос', 'вопроса', 'вопросов')}</span>
                ${attemptsFor(`rules-${section.id}`) ? `<span><strong>${attemptsFor(`rules-${section.id}`)}</strong> ${plural(attemptsFor(`rules-${section.id}`), 'попытка', 'попытки', 'попыток')}</span>` : ''}
              </div>
              <div class="rules-home-intro__progress">
                <div class="rules-home-intro__progress-top">
                  <span>Прогресс теста</span>
                  <strong>${best !== undefined ? `${best}%` : 'не начат'}</strong>
                </div>
                <div
                  class="rules-home-intro__progress-bar"
                  role="progressbar"
                  aria-label="Лучший результат теста раздела"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow="${best ?? 0}"
                ><span style="width: ${best ?? 0}%"></span></div>
              </div>
              <div class="rules-home-intro__actions">
                <button class="primary-button" type="button" data-action="section-test" data-section-id="${section.id}">
                  Пройти тест
                </button>
                <button class="rules-home-intro__ghost" type="button" data-action="open-lesson" data-section-id="${section.id}">
                  Читать раздел
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function seasonCorrectCount() {
    const season = activeSeason();
    if (!season) return 0;
    return season.results.filter(result => result?.correct).length;
  }

  function renderSeasonBreakdown() {
    const season = activeSeason();
    if (!season || season.results.length === 0) {
      elements.seasonBreakdownSection.hidden = true;
      return;
    }

    const resultsById = new Map(
      season.results.filter(Boolean).map(result => [result.termId, result])
    );
    elements.seasonBreakdownSection.hidden = false;
    elements.seasonBreakdown.innerHTML = Object.entries(glossary.categories)
      .filter(([key]) => key !== 'all')
      .map(([key, category]) => {
        const terms = termsInCategory(key);
        const answered = terms.filter(term => resultsById.has(term.id));
        const correct = answered.filter(term => resultsById.get(term.id).correct).length;
        const accuracy = answered.length ? Math.round((correct / answered.length) * 100) : 0;
        return `
          <article class="season-category">
            <span class="season-category__icon">${category.icon}</span>
            <div class="season-category__main">
              <div><strong>${escapeHtml(category.title)}</strong><span>${correct} из ${answered.length} верно</span></div>
              <div class="season-category__bar"><span style="width: ${accuracy}%"></span></div>
            </div>
            <b>${answered.length ? `${accuracy}%` : '—'}</b>
          </article>
        `;
      })
      .join('');
  }

  function renderSeason() {
    const total = learningTerms().length;
    const season = activeSeason();
    const isEnglish = state.seasonMode === 'english';
    elements.seasonModeButtons.forEach(button => {
      button.classList.toggle('is-active', button.dataset.seasonMode === state.seasonMode);
    });
    elements.seasonKicker.textContent = isEnglish
      ? 'Полный курс хоккейного английского'
      : 'Большой хоккейный экзамен';
    elements.seasonTitle.textContent = isEnglish ? 'English Season' : 'Полный сезон';

    if (!season) {
      elements.seasonDescription.textContent = isEnglish
        ? `Выучи английские названия всех ${total} хоккейных карточек с отдельным прогрессом.`
        : `Пройди ${total} хоккейных карточек: короткие матчи, сохранение прогресса и большой финал.`;
      elements.seasonProgressLabel.textContent = 'Подготовка к первому матчу';
      elements.seasonProgressPercent.textContent = '0%';
      elements.seasonProgressBar.style.width = '0%';
      elements.seasonStats.innerHTML = `
        <div><strong>${total}</strong><span>карточек</span></div>
        <div><strong>${Math.ceil(total / seasonMatchSize)}</strong><span>матчей</span></div>
        <div><strong>до 12</strong><span>вопросов за матч</span></div>
      `;
      elements.seasonMessage.hidden = true;
      elements.seasonPrimary.hidden = false;
      elements.seasonPrimary.dataset.action = 'season-start';
      elements.seasonPrimary.textContent = isEnglish
        ? 'Начать English Season'
        : 'Начать первый матч';
      elements.seasonErrors.hidden = true;
      elements.seasonReset.hidden = true;
      elements.seasonBreakdownSection.hidden = true;
      return;
    }

    const answered = season.index;
    const correct = seasonCorrectCount();
    const complete = answered >= total;
    const progress = Math.round((answered / total) * 100);
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
    const finishedMatches = complete
      ? Math.ceil(total / seasonMatchSize)
      : Math.floor(answered / seasonMatchSize);
    const nextMatch = Math.min(finishedMatches + 1, Math.ceil(total / seasonMatchSize));

    let seasonDescription = `Следующий матч №${nextMatch}. Прогресс сохранён — можно продолжить в любое время.`;
    if (complete && isEnglish) {
      seasonDescription = 'English Season завершён! Все английские названия пройдены.';
    } else if (complete) seasonDescription = 'Финальная сирена! Весь хоккейный словарь пройден.';
    elements.seasonDescription.textContent = seasonDescription;
    elements.seasonProgressLabel.textContent = `${answered} из ${total} карточек`;
    elements.seasonProgressPercent.textContent = `${progress}%`;
    elements.seasonProgressBar.style.width = `${progress}%`;
    elements.seasonStats.innerHTML = `
      <div><strong>${finishedMatches}</strong><span>матчей завершено</span></div>
      <div><strong>${correct}</strong><span>верных ответов</span></div>
      <div><strong>${accuracy}%</strong><span>точность</span></div>
    `;

    if (season.lastMatch) {
      elements.seasonMessage.hidden = false;
      elements.seasonMessage.innerHTML = `
        <span>Матч ${season.lastMatch.number} завершён</span>
        <strong>${season.lastMatch.correct} из ${season.lastMatch.total} верно</strong>
      `;
    } else {
      elements.seasonMessage.hidden = true;
    }

    elements.seasonPrimary.hidden = false;
    elements.seasonPrimary.dataset.action = complete ? 'season-new' : 'season-continue';
    let primaryLabel = `Продолжить · матч ${nextMatch}`;
    if (complete && isEnglish) primaryLabel = 'Пройти English Season заново';
    else if (complete) primaryLabel = 'Пройти новый сезон';
    elements.seasonPrimary.textContent = primaryLabel;
    const errorCount = season.results.filter(result => result && !result.correct).length;
    elements.seasonErrors.hidden = !complete || errorCount === 0;
    const reviewCount = Math.min(errorCount, seasonMatchSize);
    elements.seasonErrors.textContent = `Переиграть ошибки · ${reviewCount}`;
    elements.seasonReset.hidden = answered === 0 || complete;
    renderSeasonBreakdown();
  }

  function openSeason() {
    renderSeason();
    showScreen('season');
  }

  function createSeason() {
    setActiveSeason({
      order: shuffle(learningTerms().map(term => term.id)),
      results: [],
      index: 0,
      startedAt: new Date().toISOString(),
      lastMatch: null,
    });
    saveSeason();
  }

  function startSeasonMatch(createNew = false) {
    if (createNew || !activeSeason()) createSeason();
    const season = activeSeason();
    if (season.index >= season.order.length) {
      openSeason();
      return;
    }

    const start = season.index;
    const nextBoundary = (Math.floor(start / seasonMatchSize) + 1) * seasonMatchSize;
    const end = Math.min(nextBoundary, season.order.length);
    const termIds = season.order.slice(start, end);
    const terms = termIds.map(id => glossary.terms.find(term => term.id === id));
    const matchNumber = Math.floor(start / seasonMatchSize) + 1;
    const isEnglish = state.seasonMode === 'english';
    activateTest({
      id: `${isEnglish ? 'english-' : ''}season-match-${matchNumber}`,
      title: `${isEnglish ? 'English Season' : 'Полный сезон'} · матч ${matchNumber}`,
      season: true,
      seasonMode: state.seasonMode,
      english: isEnglish,
      seasonStart: start,
      termIds,
      questions: terms.map((term, index) => {
        const questionIndex = start + index;
        return isEnglish
          ? englishQuestionFromTerm(term, questionIndex)
          : questionFromTerm(term, questionIndex);
      }),
    });
  }

  function recordSeasonAnswer(isCorrect) {
    const season = activeSeason();
    if (!state.activeTest?.season || !season) return;
    const globalIndex = state.activeTest.seasonStart + state.questionIndex;
    season.results[globalIndex] = {
      termId: state.activeTest.termIds[state.questionIndex],
      correct: isCorrect,
    };
    season.index = Math.max(season.index, globalIndex + 1);
    saveSeason();
  }

  function finishSeasonMatch() {
    const season = activeSeason();
    const matchNumber = Math.ceil(season.index / seasonMatchSize);
    const matchStart = (matchNumber - 1) * seasonMatchSize;
    const matchEnd = Math.min(matchNumber * seasonMatchSize, season.order.length);
    const matchResults = season.results.slice(matchStart, matchEnd);
    const correct = matchResults.filter(result => result?.correct).length;
    season.lastMatch = {
      number: matchNumber,
      correct,
      total: matchEnd - matchStart,
    };
    saveSeason();
    clearActiveTest();
    openSeason();
  }

  function startErrorReview() {
    const season = activeSeason();
    if (!season) return;
    const termIds = season.results
      .filter(result => result && !result.correct)
      .map(result => result.termId);
    startTermReview(termIds, 'season', state.seasonMode === 'english');
  }

  function startTermReview(termIds, returnScreen, english = false) {
    const selectedIds = shuffle(termIds).slice(0, seasonMatchSize);
    const terms = selectedIds.map(id => glossary.terms.find(term => term.id === id));
    activateTest({
      id: 'season-error-review',
      title: 'Работа над ошибками',
      review: true,
      english,
      returnScreen,
      termIds: selectedIds,
      questions: terms.map(english ? englishQuestionFromTerm : questionFromTerm),
    });
  }

  function activateTest(test) {
    const sourceScreen = Object.entries(screens).find(([, screen]) => {
      return screen.classList.contains('screen--active');
    })?.[0];
    if (!test.returnScreen) {
      if (test.season || test.review || sourceScreen === 'season') test.returnScreen = 'season';
      else if (sourceScreen === 'rules') test.returnScreen = 'rules';
      else if (sourceScreen === 'lesson') test.returnScreen = 'lesson';
      else if (sourceScreen === 'glossary' || sourceScreen === 'study') {
        test.returnScreen = 'glossary';
      } else test.returnScreen = 'home';
    }
    state.activeTest = test;
    state.questionIndex = 0;
    state.answers = [];
    state.locked = false;
    if (test.returnScreen === 'glossary') elements.quizExitLabel.textContent = 'В словарь';
    else if (test.returnScreen === 'season') elements.quizExitLabel.textContent = 'В сезон';
    else if (test.returnScreen === 'rules') elements.quizExitLabel.textContent = 'К правилам';
    else if (test.returnScreen === 'lesson') elements.quizExitLabel.textContent = 'К разделу';
    else elements.quizExitLabel.textContent = 'В раздевалку';
    showScreen('quiz');
    renderQuestion();
    saveActiveTest();
  }

  function buildOptions(term, answerText) {
    const candidates = learningTerms().filter(item => item.id !== term.id);
    const picked = distractorEngine
      ? distractorEngine.pick(term, candidates, answerText, 3)
      : [];
    const usedAnswers = new Set([answerText(term)]);
    const distractors = [];

    picked.forEach(item => {
      const text = answerText(item);
      if (distractors.length < 3 && !usedAnswers.has(text)) {
        distractors.push(item);
        usedAnswers.add(text);
      }
    });

    if (distractors.length < 3) {
      const sameCategory = candidates.filter(item => item.category === term.category);
      const fallback = shuffle([...sameCategory, ...candidates]);
      fallback.forEach(item => {
        const text = answerText(item);
        if (distractors.length < 3 && !usedAnswers.has(text)) {
          distractors.push(item);
          usedAnswers.add(text);
        }
      });
    }

    const options = [term, ...distractors].map(item => ({
      text: answerText(item),
      correct: item.id === term.id,
    }));
    const shuffledOptions = shuffle(options);

    return {
      answers: shuffledOptions.map(option => option.text),
      correct: shuffledOptions.findIndex(option => option.correct),
    };
  }

  function questionFromTerm(term, index) {
    const askForDefinition = index % 2 === 0;
    const answerText = item => (askForDefinition ? item.description : item.ru);
    const options = buildOptions(term, answerText);

    return {
      q: askForDefinition
        ? `Что означает хоккейный термин «${term.ru}»?`
        : `Как называется ситуация или понятие: «${term.description}»?`,
      a: options.answers,
      correct: options.correct,
      fact: `${term.ru}. ${term.description} По-английски: ${englishLabel(term)}.`,
    };
  }

  function englishQuestionFromTerm(term, index) {
    const askForRussian = index % 2 === 0;
    const answerText = item => (askForRussian ? item.ru : englishLabel(item));
    const options = buildOptions(term, answerText);

    return {
      q: askForRussian
        ? `Как переводится хоккейный термин «${englishLabel(term)}»?`
        : `Как по-английски называется «${term.ru}»?`,
      a: options.answers,
      correct: options.correct,
      fact: `${englishLabel(term)} — ${term.ru}. ${term.description}`,
    };
  }

  function startGeneratedQuiz(category = 'all', returnScreen = null) {
    const pool = termsInCategory(category);
    const selected = shuffle(pool).slice(0, Math.min(8, pool.length));
    const info = categoryInfo(category);
    activateTest({
      id: `glossary-${category}`,
      title: category === 'all' ? 'Понимаю хоккей' : info.title,
      category,
      returnScreen,
      generated: true,
      questions: selected.map(questionFromTerm),
    });
  }

  function startEnglishQuiz(category = 'all', returnScreen = null) {
    const pool = termsInCategory(category);
    const selected = shuffle(pool).slice(0, Math.min(8, pool.length));
    const info = categoryInfo(category);
    activateTest({
      id: `english-${category}`,
      title: category === 'all' ? 'Хоккейный английский' : `English · ${info.title}`,
      category,
      returnScreen,
      generated: true,
      english: true,
      questions: selected.map(englishQuestionFromTerm),
    });
  }

  function showFeedback(question, selectedIndex) {
    const isCorrect = selectedIndex === question.correct;
    elements.feedback.hidden = false;
    elements.feedback.classList.add(isCorrect ? 'feedback--correct' : 'feedback--wrong');
    elements.feedbackIcon.textContent = isCorrect ? '✓' : '!';
    elements.feedbackTitle.textContent = isCorrect
      ? 'Точно в девятку!'
      : 'Почти! Запомни этот момент';
    const [mainFact, englishFact] = question.fact.split(' По-английски: ');
    elements.feedbackText.textContent = mainFact;
    elements.feedbackEnglish.hidden = !englishFact;
    elements.feedbackEnglish.textContent = englishFact ? `По-английски: ${englishFact}` : '';
  }

  function renderQuestion() {
    const test = state.activeTest;
    const question = test.questions[state.questionIndex];
    const storedAnswer = state.answers[state.questionIndex];
    const answered = storedAnswer !== undefined;
    const number = state.questionIndex + 1;
    const progress = (state.questionIndex / test.questions.length) * 100;

    state.locked = answered;
    elements.quizCategory.textContent = test.title;
    elements.questionCounter.textContent = `${number} / ${test.questions.length}`;
    elements.progressBar.style.width = `${progress}%`;
    elements.questionNumber.textContent = String(number).padStart(2, '0');
    elements.questionKicker.textContent = `Вопрос ${number}`;
    elements.questionTitle.textContent = question.q;
    elements.questionVisual.innerHTML = renderVisual(question.visual, '');
    elements.questionVisual.hidden = !elements.questionVisual.innerHTML;
    elements.feedback.hidden = true;
    elements.feedback.className = 'feedback';
    elements.prevButton.hidden = state.questionIndex === 0;
    elements.nextButton.hidden = !answered;
    elements.nextButton.innerHTML =
      number === test.questions.length
        ? 'Узнать результат <span aria-hidden="true">→</span>'
        : 'Следующий вопрос <span aria-hidden="true">→</span>';

    elements.answers.innerHTML = question.a
      .map(
        (answer, index) => `
          <button class="answer" type="button" data-answer="${index}">
            <span class="answer__key">${index + 1}</span>
            <span>${escapeHtml(answer)}</span>
            <i aria-hidden="true"></i>
          </button>
        `
      )
      .join('');

    if (answered) {
      elements.answers.querySelectorAll('.answer').forEach((button, index) => {
        button.disabled = true;
        if (index === question.correct) button.classList.add('answer--correct');
        if (index === storedAnswer && storedAnswer !== question.correct) {
          button.classList.add('answer--wrong');
        }
      });
      showFeedback(question, storedAnswer);
    }

    requestAnimationFrame(() => {
      const target = answered ? elements.nextButton : elements.answers.querySelector('.answer');
      target?.focus({ preventScroll: true });
    });
  }

  function chooseAnswer(answerIndex) {
    if (state.locked) return;
    const question = state.activeTest.questions[state.questionIndex];
    if (answerIndex < 0 || answerIndex >= question.a.length) return;

    state.locked = true;
    const isCorrect = answerIndex === question.correct;
    state.answers[state.questionIndex] = answerIndex;
    recordSeasonAnswer(isCorrect);

    elements.answers.querySelectorAll('.answer').forEach((button, index) => {
      button.disabled = true;
      if (index === question.correct) button.classList.add('answer--correct');
      if (index === answerIndex && !isCorrect) button.classList.add('answer--wrong');
    });

    showFeedback(question, answerIndex);
    elements.nextButton.hidden = false;
    elements.nextButton.focus({ preventScroll: true });
    saveActiveTest();
  }

  function goNext() {
    if (!state.locked) return;
    if (state.questionIndex < state.activeTest.questions.length - 1) {
      state.questionIndex += 1;
      saveActiveTest();
      renderQuestion();
      return;
    }
    finishTest();
  }

  function goPrevious() {
    if (state.questionIndex <= 0) return;
    state.questionIndex -= 1;
    saveActiveTest();
    renderQuestion();
  }

  function finishTest() {
    if (state.activeTest.season) {
      finishSeasonMatch();
      return;
    }

    const test = state.activeTest;
    const correct = test.questions.reduce(
      (sum, question, index) => sum + Number(state.answers[index] === question.correct),
      0
    );
    const percent = Math.round((correct / test.questions.length) * 100);
    const previousBest = state.progress.best?.[test.id] || 0;

    state.progress.attempts = (state.progress.attempts || 0) + 1;
    state.progress.best = state.progress.best || {};
    state.progress.attemptsById = state.progress.attemptsById || {};
    state.progress.attemptsById[test.id] = (state.progress.attemptsById[test.id] || 0) + 1;
    state.progress.best[test.id] = Math.max(previousBest, percent);
    saveProgress();

    elements.progressBar.style.width = '100%';
    clearActiveTest();
    renderResult(correct, percent);
    renderStats();
    renderHomeRules();
    showScreen('result');
  }

  function renderResult(correct, percent) {
    const test = state.activeTest;
    const wrong = test.questions.length - correct;
    let title = 'Нужна ещё тренировка';
    let badge = 'Хороший старт';
    let subtitle =
      'Повтори сложные моменты и возвращайся на лёд — следующая попытка будет сильнее!';

    if (percent >= 90) {
      title = 'Матч звёзд!';
      badge = 'Хоккейный эксперт';
      subtitle = 'Ты отлично читаешь игру. Тренер уже записывает тебя в первую пятёрку!';
    } else if (percent >= 70) {
      title = 'Отличная игра!';
      badge = 'Крепкий знаток';
      subtitle = 'Правила уже в твоей игре. Разбери пару моментов — и будет чемпионский результат.';
    } else if (percent >= 50) {
      title = 'Хороший период!';
      badge = 'Перспективный новичок';
      subtitle = 'Основа есть! Посмотри разбор ошибок и попробуй отыграться в следующем матче.';
    }

    let stars = 1;
    if (percent >= 90) stars = 3;
    else if (percent >= 65) stars = 2;
    elements.resultBadge.textContent = badge;
    elements.resultTitle.textContent = title;
    elements.resultSubtitle.textContent = subtitle;
    elements.scorePercent.textContent = `${percent}%`;
    elements.scoreRing.style.setProperty('--score', `${percent * 3.6}deg`);
    elements.correctCount.textContent = correct;
    elements.wrongCount.textContent = wrong;
    elements.bestResult.textContent = `${state.progress.best[test.id]}%`;
    if (test.returnScreen === 'glossary') {
      elements.resultBackButton.textContent = 'Вернуться в словарь';
    } else if (test.returnScreen === 'season') {
      elements.resultBackButton.textContent = 'Вернуться в сезон';
    } else if (test.returnScreen === 'lesson') {
      elements.resultBackButton.textContent = 'Вернуться к разделу';
    } else if (test.returnScreen === 'rules') {
      elements.resultBackButton.textContent = 'Вернуться к правилам';
    } else elements.resultBackButton.textContent = 'На главную';
    elements.resultStars.innerHTML = [0, 1, 2]
      .map(index => `<span class="${index < stars ? 'is-earned' : ''}">★</span>`)
      .join('');

    const mistakes = test.questions
      .map((question, index) => ({ question, index, selected: state.answers[index] }))
      .filter(({ question, selected }) => selected !== question.correct);

    elements.mistakesSection.hidden = mistakes.length === 0;
    const canReview = Boolean(test.rulesSection) && mistakes.length > 0;
    elements.resultMistakesButton.hidden = !canReview;
    elements.resultMistakesButton.textContent = `Переиграть ошибки · ${mistakes.length}`;
    elements.mistakesList.innerHTML = mistakes
      .map(
        ({ question, index, selected }) => `
          <article class="mistake-card">
            <span>${String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3>${escapeHtml(question.q)}</h3>
              <p class="mistake-card__answer mistake-card__answer--wrong">
                Твой ответ: ${escapeHtml(question.a[selected])}
              </p>
              <p class="mistake-card__answer mistake-card__answer--correct">
                Верно: ${escapeHtml(question.a[question.correct])}
              </p>
              <small>${escapeHtml(question.fact)}</small>
            </div>
          </article>
        `
      )
      .join('');
  }

  function renderCategories() {
    elements.categoryFilters.innerHTML = Object.entries(glossary.categories)
      .map(([key, category]) => {
        const count = termsInCategory(key).length;
        const active = key === state.glossaryCategory ? 'is-active' : '';
        return `
          <button class="category-chip ${active}" type="button" data-category="${key}">
            <span class="category-chip__icon">${category.icon}</span>
            <span class="category-chip__title">${escapeHtml(category.title)}</span>
            <b>${count}</b>
          </button>
        `;
      })
      .join('');
  }

  function renderGlossary() {
    const terms = filteredTerms();
    renderCategories();
    elements.termsFound.textContent = `Найдено: ${terms.length}`;
    elements.clearSearch.hidden = !state.glossarySearch;
    elements.termsGrid.innerHTML = terms.length
      ? terms
          .map(term => {
            const info = categoryInfo(term.category);
            return `
              <button class="term-card" type="button" data-term-id="${term.id}"
                aria-label="Открыть карточку: ${escapeHtml(term.ru)}">
                <div class="term-card__top">
                  <span>${info.icon} ${escapeHtml(info.title)}</span>
                  ${difficultyMeter(term.difficulty)}
                </div>
                <h2>${escapeHtml(term.ru)}</h2>
                <p class="term-card__description">${escapeHtml(term.description)}</p>
                <div class="term-card__english">
                  <small>По-английски</small>
                  <span>${escapeHtml(englishLabel(term))}</span>
                </div>
              </button>
            `;
          })
          .join('')
      : `
          <div class="empty-state">
            <span>🔎</span>
            <h2>Такого термина пока нет</h2>
            <p>Попробуй другое слово или сбрось поиск.</p>
          </div>
        `;
  }

  function openGlossary() {
    showScreen('glossary');
    renderGlossary();
  }

  function renderTermDialog() {
    const terms = filteredTerms();
    const term = terms[state.termDialogIndex];
    if (!term) return;
    const info = categoryInfo(term.category);

    elements.termDialogCategory.textContent = `${info.icon} ${info.title}`;
    elements.termDialogDifficulty.innerHTML = `${difficultyMeter(term.difficulty)}<span>Сложность ${term.difficulty} из 3</span>`;
    elements.termDialogTitle.textContent = term.ru;
    elements.termDialogDescription.textContent = term.description;
    elements.termDialogEnglish.textContent = englishLabel(term);
    elements.termDialogCounter.textContent = `${state.termDialogIndex + 1} / ${terms.length}`;
  }

  function openTermDialog(termId) {
    const terms = filteredTerms();
    const index = terms.findIndex(term => term.id === termId);
    if (index < 0) return;
    state.termDialogIndex = index;
    renderTermDialog();
    if (!elements.termDialog.open) elements.termDialog.showModal();
  }

  function moveTermDialog(direction) {
    const terms = filteredTerms();
    if (!terms.length) return;
    state.termDialogIndex = (state.termDialogIndex + direction + terms.length) % terms.length;
    renderTermDialog();
  }

  function startStudy() {
    const visibleTerms = filteredTerms();
    const pool = visibleTerms.length ? visibleTerms : termsInCategory(state.glossaryCategory);
    state.studyTerms = shuffle(pool).slice(0, Math.min(7, pool.length));
    state.studyIndex = 0;
    showScreen('study');
    renderStudyCard();
  }

  function renderStudyCard() {
    const term = state.studyTerms[state.studyIndex];
    const number = state.studyIndex + 1;
    const total = state.studyTerms.length;
    const info = categoryInfo(state.glossaryCategory);

    elements.studyCategory.textContent = info.title;
    elements.studyCounter.textContent = `${number} / ${total}`;
    elements.studyProgress.style.width = `${((number - 1) / total) * 100}%`;
    elements.studyTermEn.textContent = englishLabel(term);
    elements.studyTermRu.textContent = term.ru;
    elements.studyDescription.textContent = term.description;
    elements.studyAnswer.hidden = true;
    elements.revealButton.hidden = false;
    elements.studyNextButton.hidden = true;
    elements.studyNextButton.innerHTML =
      number === total
        ? 'Проверить себя <span aria-hidden="true">→</span>'
        : 'Понятно, дальше <span aria-hidden="true">→</span>';
  }

  function revealStudyAnswer() {
    elements.studyAnswer.hidden = false;
    elements.revealButton.hidden = true;
    elements.studyNextButton.hidden = false;
    elements.studyNextButton.focus({ preventScroll: true });
  }

  function nextStudyCard() {
    if (state.studyIndex >= state.studyTerms.length - 1) {
      startGeneratedQuiz(state.glossaryCategory);
      return;
    }
    state.studyIndex += 1;
    renderStudyCard();
  }

  function goHome() {
    renderStats();
    renderPromo();
    renderResume();
    showScreen('home');
  }

  function returnFromQuiz() {
    if (state.activeTest?.returnScreen === 'glossary') openGlossary();
    else if (state.activeTest?.returnScreen === 'season') openSeason();
    else if (state.activeTest?.returnScreen === 'rules') openRules();
    else if (state.activeTest?.returnScreen === 'lesson') openLesson(state.activeSectionId);
    else goHome();
  }

  function startMistakeReview() {
    const test = state.activeTest;
    if (!test) return;
    const wrong = test.questions.filter(
      (question, index) => state.answers[index] !== question.correct
    );
    if (!wrong.length) return;
    activateTest({
      id: `${test.id}-mistakes`,
      title: `${test.title} · работа над ошибками`,
      rulesSection: test.rulesSection,
      rulesRule: test.rulesRule || null,
      returnScreen: test.returnScreen,
      questions: wrong,
      review: true,
      mistakesReview: true,
    });
  }

  function retryTest() {
    if (!state.activeTest) return;
    const { returnScreen } = state.activeTest;
    if (state.activeTest.rulesSection) {
      startRulesQuiz(state.activeTest.rulesSection, state.activeTest.rulesRule || null);
    } else if (state.activeTest.review) {
      startTermReview(state.activeTest.termIds, returnScreen, state.activeTest.english);
    } else if (state.activeTest.english) {
      startEnglishQuiz(state.activeTest.category, returnScreen);
    } else if (state.activeTest.generated) {
      startGeneratedQuiz(state.activeTest.category, returnScreen);
    } else goHome();
  }

  document.addEventListener('click', event => {
    const termButton = event.target.closest('[data-term-id]');
    if (termButton) {
      openTermDialog(termButton.dataset.termId);
      return;
    }

    const answerButton = event.target.closest('[data-answer]');
    if (answerButton) {
      chooseAnswer(Number(answerButton.dataset.answer));
      return;
    }

    const rulesFilterButton = event.target.closest('[data-rules-filter]');
    if (rulesFilterButton) {
      state.rulesFilter = rulesFilterButton.dataset.rulesFilter;
      renderRules();
      return;
    }

    const promoCategoryButton = event.target.closest('[data-promo-category]');
    if (promoCategoryButton) {
      state.glossaryCategory = promoCategoryButton.dataset.promoCategory;
      state.glossarySearch = '';
      elements.termSearch.value = '';
      openGlossary();
      window.setTimeout(() => {
        document
          .querySelector('.category-panel')
          ?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) {
      state.glossaryCategory = categoryButton.dataset.category;
      renderGlossary();
      return;
    }

    const seasonModeButton = event.target.closest('[data-season-mode]');
    if (seasonModeButton) {
      state.seasonMode = seasonModeButton.dataset.seasonMode;
      renderSeason();
      return;
    }

    const ruleReadButton = event.target.closest('[data-rule-read]');
    if (ruleReadButton) {
      const [sectionId, ruleNumber] = ruleReadButton.dataset.ruleRead.split(':');
      openLesson(sectionId);
      window.setTimeout(() => {
        document
          .querySelector(`#lesson-rule-${ruleNumber}`)
          ?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
      }, 80);
      return;
    }

    const ruleTestButton = event.target.closest('[data-rule-test]');
    if (ruleTestButton) {
      const [sectionId, ruleNumber] = ruleTestButton.dataset.ruleTest.split(':');
      startRulesQuiz(sectionId, Number(ruleNumber));
      return;
    }

    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'home') goHome();
    if (action === 'resume-test') resumeActiveTest();
    if (action === 'discard-test') clearActiveTest();
    if (action === 'quiz-return') returnFromQuiz();
    if (action === 'prev-question') goPrevious();
    if (action === 'term-close') elements.termDialog.close();
    if (action === 'term-prev') moveTermDialog(-1);
    if (action === 'term-next') moveTermDialog(1);
    if (action === 'rules') openRules();
    if (action === 'open-lesson') {
      const sectionId = event.target.closest('[data-section-id]')?.dataset.sectionId;
      if (sectionId) openLesson(sectionId);
    }
    if (action === 'section-test') {
      const sectionId = event.target.closest('[data-section-id]')?.dataset.sectionId;
      if (sectionId) startRulesQuiz(sectionId);
    }
    if (action === 'lesson-test') startRulesQuiz(state.activeSectionId);
    if (action === 'season') openSeason();
    if (action === 'season-start') startSeasonMatch(true);
    if (action === 'season-continue') startSeasonMatch();
    if (action === 'season-new') startSeasonMatch(true);
    if (action === 'season-errors') startErrorReview();
    if (action === 'season-reset') {
      const shouldReset = window.confirm('Начать сезон заново? Текущий прогресс будет удалён.');
      if (shouldReset) {
        createSeason();
        renderSeason();
      }
    }
    if (action === 'glossary') openGlossary();
    if (action === 'retry') retryTest();
    if (action === 'retry-mistakes') startMistakeReview();
    if (action === 'quick-quiz') startGeneratedQuiz('all');
    if (action === 'category-quiz') startGeneratedQuiz(state.glossaryCategory);
    if (action === 'english-quiz') startEnglishQuiz(state.glossaryCategory);
    if (action === 'study') startStudy();
    if (action === 'reveal') revealStudyAnswer();
    if (action === 'study-next') nextStudyCard();
    if (action === 'clear-search') {
      state.glossarySearch = '';
      elements.termSearch.value = '';
      renderGlossary();
    }
    if (action === 'quit') {
      if (state.activeTest?.returnScreen !== 'home') {
        returnFromQuiz();
        return;
      }
      const hasProgress = state.questionIndex > 0 || state.locked;
      const canQuit =
        !hasProgress || window.confirm('Закончить тест? Текущий результат не сохранится.');
      if (canQuit) {
        clearActiveTest();
        goHome();
      }
    }
  });

  elements.termSearch.addEventListener('input', event => {
    state.glossarySearch = event.target.value;
    renderGlossary();
  });

  elements.nextButton.addEventListener('click', goNext);

  elements.termDialog.addEventListener('click', event => {
    const rect = elements.termDialog.getBoundingClientRect();
    const outside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (outside) elements.termDialog.close();
  });

  elements.termDialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveTermDialog(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  document.addEventListener('keydown', event => {
    if (!screens.quiz.classList.contains('screen--active')) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goPrevious();
      return;
    }
    if (state.locked) return;
    const number = Number(event.key);
    if (number >= 1 && number <= 4) chooseAnswer(number - 1);
  });

  renderStats();
  renderPromo();
  renderResume();
  renderHomeRules();
})();
