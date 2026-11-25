window.HockeyStorage = (() => {
  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage may be disabled; the app keeps working in memory.
    }
  }

  function loadProgress(key, legacyKey) {
    return read(key, null) || read(legacyKey, null) || { attempts: 0, best: {} };
  }

  function loadSeason(key, validIds) {
    const saved = read(key, null);
    if (!saved || !Array.isArray(saved.order) || !Array.isArray(saved.results)) return null;
    const knownIds = new Set(validIds);
    const hasUnknownTerms = saved.order.some(id => !knownIds.has(id));
    if (hasUnknownTerms || saved.order.length !== validIds.length) return null;
    saved.index = Math.min(Math.max(saved.index || 0, 0), saved.order.length);
    return saved;
  }

  function loadActiveTest(key) {
    const saved = read(key, null);
    if (!saved || !saved.test || !Array.isArray(saved.test.questions) || !Array.isArray(saved.answers)) {
      return null;
    }
    const index = Number(saved.questionIndex);
    if (!Number.isInteger(index) || index < 0 || index >= saved.test.questions.length) return null;
    return {
      test: saved.test,
      questionIndex: index,
      answers: saved.answers.slice(0, saved.test.questions.length),
    };
  }

  return { loadProgress, loadSeason, loadActiveTest, write, remove };
})();
