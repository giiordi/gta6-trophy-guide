(() => {
  const PROGRESS_KEY = 'leonida-field-notes:earned:v1';
  const PREFERENCES_KEY = 'leonida-field-notes:preferences:v1';

  function loadStoredObject(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '{}');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }

  function readGuideState() {
    const earned = loadStoredObject(PROGRESS_KEY);
    const preferences = loadStoredObject(PREFERENCES_KEY);
    return {
      earned: Object.fromEntries(Object.entries(earned).filter(([, value]) => value === true)),
      spoilerMode: preferences.spoilerMode === true,
      filter: 'all',
      search: '',
      selectedId: 1,
      view: 'checklist'
    };
  }

  function saveEarnedState(state) {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.earned));
      return true;
    } catch {
      return false;
    }
  }

  function saveGuidePreferences(state) {
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ spoilerMode: state.spoilerMode }));
      return true;
    } catch {
      return false;
    }
  }

  function serializeProgress(state) {
    return {
      format: 'leonida-field-notes-progress',
      version: 1,
      exportedAt: new Date().toISOString(),
      earned: state.earned,
      preferences: { spoilerMode: state.spoilerMode }
    };
  }

  function importProgressObject(value, trophyIds) {
    if (!value || typeof value !== 'object' || value.format !== 'leonida-field-notes-progress' || value.version !== 1 || !value.earned || typeof value.earned !== 'object' || Array.isArray(value.earned)) {
      throw new Error('That file is not a Leonida Field Notes progress export.');
    }
    const validIds = new Set(trophyIds.map(String));
    const earned = {};
    for (const [id, isEarned] of Object.entries(value.earned)) {
      if (validIds.has(id) && isEarned === true) earned[id] = true;
    }
    return { earned, spoilerMode: value.preferences?.spoilerMode === true };
  }

  window.GuideState = { readGuideState, saveEarnedState, saveGuidePreferences, serializeProgress, importProgressObject };
})();
