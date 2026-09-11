(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const status = $('#status-message');
  let statusTimer;
  function announce(message) {
    clearTimeout(statusTimer);
    status.textContent = message;
    status.classList.add('show');
    statusTimer = setTimeout(() => status.classList.remove('show'), 4500);
  }
  const themeButton = $('.theme-toggle');
  function syncTheme() {
    const dark = document.documentElement.dataset.theme !== 'light';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeButton.setAttribute('title', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeButton.setAttribute('aria-pressed', String(!dark));
    $('meta[name="theme-color"]').content = dark ? '#131521' : '#efedf6';
  }
  syncTheme();
  themeButton.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('after-hours-theme', theme); } catch { announce('Theme changed for this page. Your browser could not save the preference.'); }
    syncTheme();
  });
  window.addEventListener('storage', event => {
    if (event.key === 'after-hours-theme' && ['light', 'dark'].includes(event.newValue)) {
      document.documentElement.dataset.theme = event.newValue;
      syncTheme();
    }
  });

  let entries = [];
  let indexReady = true;
  try { entries = JSON.parse($('#search-index').textContent); } catch { indexReady = false; }
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('en').trim();
  const params = () => new URLSearchParams(location.search);
  function replaceParam(key, value) {
    const url = new URL(location.href);
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  const searchControllers = [];
  $$('[data-search]').forEach(panel => {
    const input = $('[data-query]', panel);
    const clear = $('[data-clear-search]', panel);
    const results = $('[data-search-results]', panel);
    const count = $('[data-search-count]', panel);
    const standalone = Boolean(panel.closest('.search-page'));
    let composing = false;
    function render() {
      if (composing) return;
      const query = normalize(input.value);
      clear.hidden = !input.value;
      if (standalone) replaceParam('q', input.value.trim());
      results.replaceChildren();
      if (!indexReady) {
        count.textContent = 'Search is unavailable.';
        const fallback = document.createElement('a');
        fallback.href = '/post/'; fallback.className = 'button'; fallback.textContent = 'Browse all entries';
        results.append(fallback); return;
      }
      const words = query.split(/\s+/).filter(Boolean);
      const matches = entries.map(entry => {
        const title = normalize(entry.title);
        const topics = normalize(entry.tags.join(' ') + ' ' + entry.category);
        const haystack = normalize([entry.title, entry.description, entry.content, topics].join(' '));
        return {entry, match: words.every(word => haystack.includes(word)), score: words.reduce((score, word) => score + (title.includes(word) ? 6 : 0) + (topics.includes(word) ? 3 : 0), 0)};
      }).filter(item => item.match).sort((a, b) => b.score - a.score);
      count.textContent = query ? `${matches.length} ${matches.length === 1 ? 'entry' : 'entries'} found` : `${entries.length} entries to explore`;
      if (!matches.length) {
        const empty = document.createElement('div'); empty.className = 'search-empty';
        const heading = document.createElement('h3'); heading.textContent = 'No entries found.';
        const help = document.createElement('p'); help.textContent = 'Try a shorter phrase, a topic like fuzzing, or clear your search.';
        empty.append(heading, help); results.append(empty); return;
      }
      matches.forEach(({entry}) => {
        const a = document.createElement('a'); a.href = entry.url; a.className = 'search-result';
        const meta = document.createElement('span'); meta.className = 'meta'; meta.textContent = `${entry.category} · ${entry.date} · ${entry.minutes} min read`;
        const title = document.createElement('h3'); title.textContent = entry.title;
        const description = document.createElement('p'); description.textContent = entry.description;
        a.append(meta, title, description); results.append(a);
      });
    }
    input.addEventListener('compositionstart', () => { composing = true; });
    input.addEventListener('compositionend', () => { composing = false; render(); });
    input.addEventListener('input', render);
    clear.addEventListener('click', () => { input.value = ''; render(); input.focus(); });
    if (standalone) input.value = params().get('q') || '';
    render(); searchControllers.push({panel, input, render});
  });
  const dialog = $('#search-dialog');
  let returnFocus;
  function openSearch(trigger) {
    if (dialog.open) return;
    returnFocus = trigger || document.activeElement;
    dialog.showModal();
    const controller = searchControllers.find(item => dialog.contains(item.panel));
    controller.render(); controller.input.focus();
  }
  function closeSearch() { dialog.close(); }
  $$('.search-trigger').forEach(trigger => trigger.addEventListener('click', event => { event.preventDefault(); openSearch(trigger); }));
  $('[data-close-search]').addEventListener('click', closeSearch);
  dialog.addEventListener('close', () => { if (returnFocus instanceof HTMLElement && returnFocus.isConnected) returnFocus.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeSearch(); } });
  document.addEventListener('keydown', event => {
    if (event.isComposing || event.keyCode === 229) return;
    const typing = event.target instanceof Element && Boolean(event.target.closest('input,textarea,[contenteditable="true"]'));
    if ((event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) || (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey))) {
      event.preventDefault(); openSearch();
    }
    if (event.key === 'Escape') {
      if (dialog.open) { event.preventDefault(); closeSearch(); return; }
      const menu = $('.mobile-menu');
      if (menu.open) { menu.open = false; $('summary', menu).focus(); }
    }
  });

  const listControllers = [];
  $$('[data-filter-list]').forEach(list => {
    const cards = $$('[data-entry]', list);
    const filters = $$('[data-filter]', list);
    const queryInput = $('[data-list-query]', list);
    const topicInput = $('[data-topic-filter]', list);
    const cardTopics = new Map(cards.map(card => {
      try { return [card, JSON.parse(card.dataset.topicList || '[]').map(normalize)]; }
      catch { return [card, []]; }
    }));
    const clear = $('[data-list-clear]', list);
    const empty = $('[data-filter-empty]', list);
    const count = $('[data-filter-count]', list);
    const more = $('[data-load-more]', list);
    let selected = 'all';
    let limit = 9;
    let composing = false;
    function matchesCard(card) {
      const query = normalize(queryInput?.value || '');
      const topic = normalize(topicInput?.value || '');
      return (selected === 'all' || card.dataset.categories.split(' ').includes(selected))
        && (!topic || cardTopics.get(card).includes(topic))
        && query.split(/\s+/).every(word => normalize(card.dataset.title + ' ' + card.dataset.topics).includes(word));
    }
    function apply() {
      if (composing) return;
      const matches = cards.filter(matchesCard);
      cards.forEach(card => { card.hidden = !matches.includes(card) || (more && matches.indexOf(card) >= limit); });
      filters.forEach(button => { const active = selected === button.dataset.filter; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
      empty.hidden = matches.length !== 0;
      count.textContent = `${matches.length} ${matches.length === 1 ? 'entry' : 'entries'}`;
      if (more) more.hidden = matches.length <= limit;
      if (clear) clear.hidden = !queryInput.value;
    }
    function restore() {
      const type = params().get('type');
      selected = filters.some(button => button.dataset.filter === type) ? type : 'all';
      if (queryInput) queryInput.value = params().get('q') || '';
      if (topicInput) {
        const requestedTopic = params().get('topic') || '';
        const option = [...topicInput.options].find(option => normalize(option.value) === normalize(requestedTopic));
        topicInput.value = option?.value || '';
      }
      limit = 9; apply();
    }
    filters.forEach(button => button.addEventListener('click', () => { selected = button.dataset.filter; limit = 9; replaceParam('type', selected === 'all' ? '' : selected); apply(); }));
    if (topicInput) {
      topicInput.addEventListener('change', () => { limit = 9; replaceParam('topic', topicInput.value); apply(); });
      topicInput.disabled = false;
    }
    if (queryInput) {
      queryInput.addEventListener('compositionstart', () => { composing = true; });
      queryInput.addEventListener('compositionend', () => { composing = false; limit = 9; replaceParam('q', queryInput.value.trim()); apply(); });
      queryInput.addEventListener('input', () => { if (!composing) { limit = 9; replaceParam('q', queryInput.value.trim()); apply(); } });
      clear.addEventListener('click', () => { queryInput.value = ''; replaceParam('q', ''); apply(); queryInput.focus(); });
    }
    $('[data-reset-filter]', list)?.addEventListener('click', () => { selected = 'all'; if (queryInput) queryInput.value = ''; if (topicInput) topicInput.value = ''; replaceParam('type', ''); replaceParam('q', ''); replaceParam('topic', ''); limit = 9; apply(); (queryInput || filters[0]).focus(); });
    more?.addEventListener('click', () => { const next = cards.find(card => card.hidden && matchesCard(card)); limit += 9; apply(); next?.querySelector('h3 a')?.focus(); });
    restore(); listControllers.push(restore);
  });
  window.addEventListener('popstate', () => {
    listControllers.forEach(restore => restore());
    searchControllers.filter(({panel}) => panel.closest('.search-page')).forEach(controller => { controller.input.value = params().get('q') || ''; controller.render(); });
  });

  async function copy(text, button, success, failure) {
    const original = [...button.childNodes].map(node => node.cloneNode(true));
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied'; announce(success);
      setTimeout(() => { button.replaceChildren(...original); button.disabled = false; }, 1800);
    } catch {
      button.disabled = false; announce(failure);
    }
  }
  $$('[data-copy-link]').forEach(button => button.addEventListener('click', () => copy(location.origin + location.pathname, button, 'Article link copied.', 'Could not copy. Select and copy the URL from your address bar.')));
  const codePreviewLines = 15;
  $$(".prose pre").forEach((pre, index) => {
    const code = $("code", pre);
    if (!code) return;
    const wrapper = pre.parentElement.classList.contains("highlight")
      ? pre.parentElement
      : document.createElement("div");
    if (!pre.parentElement.classList.contains("highlight")) {
      wrapper.className = "code-block";
      pre.before(wrapper);
      wrapper.append(pre);
    }
    const toolbar = document.createElement("div");
    toolbar.className = "code-toolbar";
    const languageName =
      code.dataset.lang ||
      code.className.match(/language-([\w+-]+)/)?.[1] ||
      "text";
    const fullText = code.textContent;
    const lines = fullText.replace(/\n$/, "").split("\n");
    const language = document.createElement("span");
    language.textContent = `${languageName} · ${lines.length} ${lines.length === 1 ? "line" : "lines"}`;
    const actions = document.createElement("div");
    actions.className = "code-actions";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Copy code";
    button.setAttribute("aria-label", "Copy code block");
    button.addEventListener("click", () =>
      copy(
        fullText,
        button,
        "Full code block copied.",
        "Could not copy. Select the code and copy it manually.",
      ),
    );
    pre.id ||= `article-code-${index + 1}`;
    pre.tabIndex = 0;
    pre.setAttribute("aria-label", `${languageName} code block`);
    if (lines.length > codePreviewLines) {
      // Clone a DOM range so the preview keeps syntax highlighting and exact whitespace.
      // The original code remains intact for copying, expanding, and printing.
      const cutoff = lines.slice(0, codePreviewLines).join("\n").length;
      const walker = document.createTreeWalker(code, NodeFilter.SHOW_TEXT);
      let remaining = cutoff;
      let node;
      while ((node = walker.nextNode())) {
        if (remaining <= node.textContent.length) break;
        remaining -= node.textContent.length;
      }
      if (node) {
        const range = document.createRange();
        range.setStart(code, 0);
        range.setEnd(node, remaining);
        const preview = code.cloneNode(false);
        preview.removeAttribute("id");
        preview.classList.add("code-preview");
        preview.append(range.cloneContents());
        preview.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
        code.classList.add("code-full");
        code.hidden = true;
        pre.append(preview);
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "code-toggle";
        toggle.setAttribute("aria-controls", pre.id);
        const hint = document.createElement("p");
        hint.className = "code-fold-hint";
        hint.id = `${pre.id}-hint`;
        hint.setAttribute("aria-live", "polite");
        pre.setAttribute("aria-describedby", hint.id);
        function setExpanded(expanded) {
          code.hidden = !expanded;
          preview.hidden = expanded;
          toggle.textContent = expanded ? "Collapse ↑" : "Expand ↓";
          toggle.setAttribute("aria-expanded", String(expanded));
          toggle.setAttribute(
            "aria-label",
            expanded
              ? "Collapse code block to 15 lines"
              : `Expand code block to show all ${lines.length} lines`,
          );
          hint.textContent = expanded
            ? `All ${lines.length} lines`
            : `Showing ${codePreviewLines} of ${lines.length} lines`;
          pre.classList.toggle("code-collapsed", !expanded);
        }
        toggle.addEventListener("click", () =>
          setExpanded(toggle.getAttribute("aria-expanded") !== "true"),
        );
        setExpanded(false);
        actions.append(toggle);
        pre.after(hint);
      }
    }
    actions.append(button);
    toolbar.append(language, actions);
    pre.before(toolbar);
  });
  $$('.prose table').forEach(table => { const wrapper = document.createElement('div'); wrapper.className = 'table-scroll'; wrapper.tabIndex = 0; wrapper.setAttribute('role', 'region'); wrapper.setAttribute('aria-label', 'Scrollable article table'); table.before(wrapper); wrapper.append(table); });
  const article = $('#article-content');
  if (article) {
    const progress = $('.reading-progress span');
    let scheduled = false;
    function updateProgress() {
      const top = article.getBoundingClientRect().top + scrollY;
      const range = Math.max(1, article.scrollHeight - innerHeight);
      progress.style.width = `${Math.max(0, Math.min(100, ((scrollY - top) / range) * 100))}%`;
      scheduled = false;
    }
    window.addEventListener('scroll', () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateProgress); } }, {passive: true});
    window.addEventListener('resize', updateProgress); updateProgress();
    if ('ResizeObserver' in window) new ResizeObserver(updateProgress).observe(article);
    const links = $$('.toc a');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(events => {
        const visible = events.filter(event => event.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        const id = visible[0].target.id;
        links.forEach(link => { if (decodeURIComponent(link.hash.slice(1)) === id) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
      }, {rootMargin: '-5% 0px -70% 0px'});
      $$('h2,h3', article).forEach(heading => observer.observe(heading));
    }
    if (matchMedia('(max-width: 850px)').matches) $('.toc').open = false;
  }
  // Progressive enhancement: never expose an enabled action before its handler exists.
  $$('button[data-enhance]').forEach(button => { button.disabled = false; });
})();
