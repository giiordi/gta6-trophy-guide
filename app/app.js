(() => {
  function setSaveMessage(message, isError = false) {
    const status = document.querySelector('#save-status');
    status.textContent = message;
    status.style.color = isError ? '#e58b72' : '';
  }

  function startTrophyGuide() {
    const trophies = window.GUIDE_TROPHIES;
    if (!Array.isArray(trophies) || trophies.length !== 55) {
      setSaveMessage('Trophy data did not load', true);
      return;
    }
    const state = window.GuideState.readGuideState();
    const knownIds = trophies.map(trophy => trophy.id);
    for (const key of Object.keys(state.earned)) if (!knownIds.includes(Number(key))) delete state.earned[key];

    function renderGuide() {
      window.GuideViews.renderChecklist(trophies, state, selectTrophy, setEarned);
      window.GuideRoadmap.renderRoadmap(trophies, state, selectTrophy);
      document.querySelector('#checklist-view').hidden = state.view !== 'checklist';
      document.querySelector('#roadmap-view').hidden = state.view !== 'roadmap';
      document.querySelector('#checklist-tab').classList.toggle('active', state.view === 'checklist');
      document.querySelector('#roadmap-tab').classList.toggle('active', state.view === 'roadmap');
      document.querySelector('#checklist-tab').setAttribute('aria-selected', String(state.view === 'checklist'));
      document.querySelector('#roadmap-tab').setAttribute('aria-selected', String(state.view === 'roadmap'));
    }

    function selectTrophy(id) {
      state.selectedId = id;
      state.view = 'checklist';
      renderGuide();
    }

    function setEarned(id, earned) {
      if (earned) state.earned[id] = true;
      else delete state.earned[id];
      const stored = window.GuideState.saveEarnedState(state);
      setSaveMessage(stored ? 'Saved in this browser' : 'Browser storage is unavailable; progress is temporary', !stored);
      renderGuide();
    }

    function setFilter(filter) {
      state.filter = filter;
      const visible = window.GuideViews.getVisibleTrophies(trophies, state);
      if (visible.length && !visible.some(trophy => trophy.id === state.selectedId)) state.selectedId = visible[0].id;
      renderGuide();
    }

    function saveSpoilerPreference(enabled) {
      state.spoilerMode = enabled;
      const stored = window.GuideState.saveGuidePreferences(state);
      setSaveMessage(stored ? 'Spoiler setting saved' : 'Browser storage is unavailable', !stored);
      const visible = window.GuideViews.getVisibleTrophies(trophies, state);
      if (visible.length && !visible.some(trophy => trophy.id === state.selectedId)) state.selectedId = visible[0].id;
      renderGuide();
    }

    function downloadProgress() {
      const contents = JSON.stringify(window.GuideState.serializeProgress(state), null, 2);
      const blob = new Blob([contents], { type: 'application/json' });
      const fileUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = `leonida-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
      setSaveMessage('Progress export created');
    }

    async function restoreProgress(file) {
      try {
        const imported = window.GuideState.importProgressObject(JSON.parse(await file.text()), knownIds);
        state.earned = imported.earned;
        state.spoilerMode = imported.spoilerMode;
        const progressSaved = window.GuideState.saveEarnedState(state);
        const preferencesSaved = window.GuideState.saveGuidePreferences(state);
        setSaveMessage(progressSaved && preferencesSaved ? 'Progress restored from file' : 'Restored for this session only', !(progressSaved && preferencesSaved));
        renderGuide();
      } catch (error) {
        setSaveMessage(error.message || 'Could not read that progress file', true);
      }
    }

    document.querySelectorAll('.filter-chip').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
    document.querySelectorAll('.view-tab').forEach(button => button.addEventListener('click', () => {
      state.view = button.dataset.view;
      renderGuide();
    }));
    document.querySelector('#search-input').addEventListener('input', event => {
      state.search = event.currentTarget.value;
      const visible = window.GuideViews.getVisibleTrophies(trophies, state);
      if (visible.length && !visible.some(trophy => trophy.id === state.selectedId)) state.selectedId = visible[0].id;
      renderGuide();
    });
    document.querySelector('#spoiler-toggle').addEventListener('change', event => saveSpoilerPreference(event.currentTarget.checked));
    document.querySelector('#export-button').addEventListener('click', downloadProgress);
    document.querySelector('#import-button').addEventListener('click', () => document.querySelector('#import-file').click());
    document.querySelector('#import-file').addEventListener('change', event => {
      const file = event.currentTarget.files?.[0];
      if (file) restoreProgress(file);
      event.currentTarget.value = '';
    });

    const hiddenCount = trophies.filter(trophy => trophy.hidden).length;
    document.querySelector('.intro-stats div:nth-of-type(2) strong').textContent = String(hiddenCount).padStart(2, '0');
    renderGuide();
    setSaveMessage('Progress saves in this browser');
  }

  document.addEventListener('DOMContentLoaded', startTrophyGuide, { once: true });
})();
