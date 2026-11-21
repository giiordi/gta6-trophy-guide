(() => {
  const stages = [
    { id: 1, title: 'Protect the early window', eyebrow: 'Before moving on', body: 'Make the first meditation your opening side task. The provided route note places it in Chapter 1 after “Down to Earth”; exact timing still needs confirmation.', trophies: [28] },
    { id: 2, title: 'Clear story milestones', eyebrow: 'Chapters 1–4 + finale', body: 'Complete Gone Fishing; Chapters 1–4; Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown and Operation Savage Glory; then the finale and five partner strands.', trophies: [2,3,4,5,6,7,8,9,10,11,12,13,22,23,24,26,27] },
    { id: 3, title: 'Build the activity record', eyebrow: 'Free roam', body: 'Try 9 activity types; gold 42 range challenges; win 14 drone venues and 20 races; finish 8 stranger strands; reach 250 stunts, 100 WAiNK places and 50 challenges, plus side objectives.', trophies: [15,16,17,18,19,20,21,25,29,31,32,33,34,36,37,38,39,40,41,43,44,45,46,47,48,49,50,51] },
    { id: 4, title: 'Sweep collections & discovery', eyebrow: 'Map cleanup', body: 'Finish 3 card sets, discover 100 vehicles, explore all 52 regions and register 10 vehicles with Scooter Bros.', trophies: [30,35,42,55] },
    { id: 5, title: 'Finish money & ownership', eyebrow: 'Long-tail cleanup', body: 'Reach 100% completion, launder $250,000 in Marked Bills, spend $100,000 in shops and buy all 8 garages.', trophies: [14,52,53,54] },
    { id: 6, title: 'Verify completion', eyebrow: 'Platinum finish', body: 'Check the 100% ledger and all remaining trophy rows before the final mission if its award is still open; the platinum follows the other 54.', trophies: [1] }
  ];

  function renderRoadmap(trophies, state, onSelect) {
    const view = document.querySelector('#roadmap-view');
    view.replaceChildren();
    const header = document.createElement('div');
    header.className = 'roadmap-header';
    const intro = document.createElement('div');
    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow'; eyebrow.textContent = 'A ROUTE TO THE PLATINUM';
    const title = document.createElement('h2'); title.textContent = 'Six passes through Leonida';
    const note = document.createElement('p'); note.textContent = 'Protect the only potentially missable task first, then follow the list from story to cleanup.';
    intro.append(eyebrow, title, note);
    const alert = document.createElement('div');
    alert.className = 'roadmap-note';
    alert.textContent = state.spoilerMode && !state.earned[28]
      ? 'MISSABLE · Early meditation trophy — complete the first visit in Chapter 1 before advancing; exact timing still needs confirmation.'
      : 'MISSABLE · Positive Mental Attitude — first meditation is reported after “Down to Earth” in Chapter 1. Do it before story progress; confirm the exact window with the cited roadmaps.';
    header.append(intro, alert);
    view.append(header);

    const grid = document.createElement('div');
    grid.className = 'roadmap-stages';
    for (const stage of stages) {
      const card = document.createElement('article');
      card.className = 'roadmap-stage';
      const top = document.createElement('div'); top.className = 'stage-top';
      const number = document.createElement('div'); number.className = 'stage-number';
      const badge = document.createElement('b'); badge.textContent = stage.id;
      const label = document.createElement('span'); label.textContent = stage.eyebrow;
      number.append(badge, label);
      const total = document.createElement('span'); total.className = 'stage-total'; total.textContent = `${stage.trophies.length} checkpoints`;
      top.append(number, total);
      const heading = document.createElement('h3'); heading.textContent = stage.title;
      const body = document.createElement('p'); body.textContent = stage.body;
      const items = document.createElement('div'); items.className = 'stage-items';
      for (const trophyId of stage.trophies.slice(0, 5)) {
        const trophy = trophies.find(item => item.id === trophyId);
        if (!trophy) continue;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `stage-item${trophy.missable ? ' flagged' : ''}`;
        const hidden = state.spoilerMode && trophy.filters.includes('story') && !state.earned[trophy.id];
        chip.textContent = hidden ? 'Hidden story trophy' : trophy.missable ? `⚑ ${trophy.name}` : trophy.name;
        chip.title = hidden ? 'Earn this trophy to reveal its official title and description.' : `${trophy.grade} · ${trophy.description}`;
        chip.addEventListener('click', () => onSelect(trophy.id));
        items.append(chip);
      }
      if (stage.trophies.length > 5) {
        const more = document.createElement('span');
        more.className = 'stage-total';
        more.textContent = `+${stage.trophies.length - 5} checkpoints in checklist`;
        items.append(more);
      }
      card.append(top, heading, body, items);
      grid.append(card);
    }
    view.append(grid);
    const banner = document.createElement('div');
    banner.className = 'research-banner';
    banner.innerHTML = '<strong>Research note.</strong> The five linked roadmaps were unreachable during this build. The route uses the supplied trophy list and brief; hidden markers are count-aligned, while per-trophy visibility and cryptic triggers still need source confirmation.';
    view.append(banner);
  }

  window.GuideRoadmap = { renderRoadmap };
})();
