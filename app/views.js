(() => {
  const grades = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
  const gradeOrder = ['platinum', 'gold', 'silver', 'bronze'];

  function storyDetailsAreHidden(trophy, state) {
    return state.spoilerMode && trophy.filters.includes('story') && !state.earned[trophy.id];
  }

  function createGuideElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function findVisibleTrophies(trophies, state) {
    const search = state.search.trim().toLocaleLowerCase();
    return trophies.filter(trophy => {
      if (state.filter !== 'all' && !trophy.filters.includes(state.filter)) return false;
      if (!search) return true;
      if (storyDetailsAreHidden(trophy, state)) return false;
      return `${trophy.name} ${trophy.description} ${trophy.guide}`.toLocaleLowerCase().includes(search);
    });
  }

  function renderTrophyRows(trophies, state, onSelect, onEarned) {
    const list = document.querySelector('#trophy-list');
    const visible = findVisibleTrophies(trophies, state);
    list.replaceChildren();
    document.querySelector('#visible-count').textContent = `${visible.length} ${visible.length === 1 ? 'entry' : 'entries'}`;
    if (!visible.length) {
      const emptyMessage = state.filter === 'online'
        ? 'There are no online-only trophies in this list. All 55 objectives are presented as offline.'
        : 'Nothing matches this view. Clear the search or choose another filter.';
      list.append(createGuideElement('div', 'empty-state', emptyMessage));
      return;
    }

    for (const trophy of visible) {
      const hidden = storyDetailsAreHidden(trophy, state);
      const row = createGuideElement('article', `trophy-row${state.selectedId === trophy.id ? ' active' : ''}${state.earned[trophy.id] ? ' earned' : ''}`);
      row.dataset.trophyId = trophy.id;
      row.setAttribute('aria-current', String(state.selectedId === trophy.id));
      row.addEventListener('click', () => onSelect(trophy.id));

      const check = createGuideElement('input', 'row-check');
      check.type = 'checkbox';
      check.checked = Boolean(state.earned[trophy.id]);
      check.setAttribute('aria-label', `${check.checked ? 'Unmark' : 'Mark'} ${hidden ? 'hidden story trophy' : trophy.name} earned`);
      check.addEventListener('click', event => event.stopPropagation());
      check.addEventListener('change', () => onEarned(trophy.id, check.checked));

      const copy = createGuideElement('div', 'row-copy');
      const title = createGuideElement('div', 'row-title', hidden ? 'Unrevealed story milestone' : trophy.name);
      if (trophy.missable) title.append(createGuideElement('span', 'mini-alert', 'Potentially missable'));
      copy.append(title, createGuideElement('div', 'row-description', hidden ? 'Earn to reveal this chapter detail.' : trophy.description));
      row.append(check, copy, createGuideElement('span', `row-grade ${trophy.grade}`, grades[trophy.grade]));
      list.append(row);
    }
  }

  function renderTrophyDetail(trophies, state) {
    const panel = document.querySelector('#detail-panel');
    const trophy = trophies.find(item => item.id === state.selectedId) || trophies[0];
    const hidden = storyDetailsAreHidden(trophy, state);
    panel.replaceChildren();

    const kicker = createGuideElement('div', 'detail-kicker');
    kicker.append(createGuideElement('span', 'trophy-glyph', hidden ? '◌' : '✦'));
    kicker.append(document.createTextNode(`${hidden ? 'STORY SPOILER HELD' : `TROPHY ${String(trophy.id).padStart(2, '0')} / 55`} · ${grades[trophy.grade]}`));
    panel.append(kicker, createGuideElement('h2', 'detail-title', hidden ? 'Story milestone hidden' : trophy.name));

    const tags = createGuideElement('div', 'detail-tags');
    for (const filter of trophy.filters) tags.append(createGuideElement('span', `detail-tag${filter === 'missable' ? ' missable' : ''}`, filter));
    if (trophy.missable) tags.append(createGuideElement('span', 'detail-tag missable', 'Potentially missable'));
    panel.append(tags, createGuideElement('p', 'detail-description', hidden ? 'Earn this story trophy to reveal its official title and description.' : trophy.description));

    const columns = createGuideElement('div', 'detail-columns');
    const guide = createGuideElement('section');
    guide.append(createGuideElement('h3', 'detail-section-title', hidden ? 'Spoiler-safe note' : 'Field guide'));
    guide.append(createGuideElement('p', 'guide-copy', hidden ? 'The story route is intentionally concealed until you mark this trophy earned. The checklist remains usable while spoilers are hidden.' : trophy.guide));
    columns.append(guide);
    const route = createGuideElement('section');
    route.append(createGuideElement('h3', 'detail-section-title', hidden ? 'Next action' : 'Quick route'));
    const steps = createGuideElement('ul', 'steps-list');
    const routeSteps = hidden ? ['Complete the milestone, then return to reveal its details.'] : trophy.steps;
    for (const step of routeSteps) steps.append(createGuideElement('li', '', step));
    route.append(steps);
    columns.append(route);
    panel.append(columns);

    if (trophy.missable) panel.append(createGuideElement('div', 'missable-callout', trophy.missableNote));
    const sources = createGuideElement('section', 'source-area');
    sources.append(createGuideElement('h3', 'detail-section-title', `References · ${trophy.sources.length}`));
    const links = createGuideElement('div', 'source-list');
    for (const source of trophy.sources) {
      const link = createGuideElement('a', 'source-link', source.name);
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      links.append(link);
    }
    sources.append(links, createGuideElement('p', 'source-caveat', 'Links open only when selected. The guide itself loads from local files.'));
    panel.append(sources);
  }

  function renderProgressCounts(trophies, state) {
    const earnedCount = trophies.filter(trophy => state.earned[trophy.id]).length;
    const percent = Math.round(earnedCount / trophies.length * 100);
    document.querySelector('#progress-count').innerHTML = `${earnedCount} <small>/ ${trophies.length}</small>`;
    document.querySelector('#progress-percent').textContent = `${percent}%`;
    document.querySelector('.progress-track').setAttribute('aria-valuenow', String(earnedCount));
    document.querySelector('#progress-fill').style.width = `${percent}%`;
    document.querySelector('#grade-breakdown').innerHTML = gradeOrder.map(grade => {
      const gradeItems = trophies.filter(trophy => trophy.grade === grade);
      const gradeEarned = gradeItems.filter(trophy => state.earned[trophy.id]).length;
      return `<span><i class="grade-dot ${grade}"></i><b>${gradeEarned}</b>/${gradeItems.length} ${grade === 'platinum' ? 'P' : grade[0].toUpperCase()}</span>`;
    }).join('');
  }

  function renderChecklist(trophies, state, onSelect, onEarned) {
    renderTrophyRows(trophies, state, onSelect, onEarned);
    renderTrophyDetail(trophies, state);
    renderProgressCounts(trophies, state);
    document.querySelector('#spoiler-toggle').checked = state.spoilerMode;
    document.querySelectorAll('.filter-chip').forEach(button => {
      const selected = button.dataset.filter === state.filter;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  window.GuideViews = { renderChecklist, findVisibleTrophies, getVisibleTrophies: findVisibleTrophies };
})();
