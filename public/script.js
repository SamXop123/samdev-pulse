// samdev-pulse Preview functionality

// Navbar light/dark theme toggle
(function () {
  'use strict';

  const THEME_KEY = 'theme';
  const LIGHT_THEME = 'light';

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) { }
  }

  function applyTheme(theme) {
    const isLight = theme === LIGHT_THEME;
    document.documentElement.classList.remove('light-theme-pending');
    document.body.classList.toggle('light-theme', isLight);

    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(isLight));
      toggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
      toggle.title = isLight ? 'Switch to dark theme' : 'Switch to light theme';
    }
  }

  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    const savedTheme = getStoredTheme();

    applyTheme(savedTheme === LIGHT_THEME ? LIGHT_THEME : 'dark');

    if (!toggle) return;

    toggle.addEventListener('click', function () {
      const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : LIGHT_THEME;
      applyTheme(nextTheme);
      storeTheme(nextTheme);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();

(function () {
  'use strict';

  const usernameInput = document.getElementById('username');
  const leetcodeInput = document.getElementById('leetcode');
  const codeforcesInput = document.getElementById('codeforces');
  const codechefInput = document.getElementById('codechef');
  const themeSelect = document.getElementById('theme-select');
  const alignSelect = document.getElementById('align-select');
  const previewImg = document.getElementById('preview-img');
  const snippet = document.getElementById('snippet');
  const copyButtons = document.querySelectorAll('.copy-btn');
  const updateBtn = document.getElementById('update-preview-btn');
  const downloadBtn = document.getElementById('download-png-btn');
  const hideTrophiesCheck = document.getElementById('hide-trophies');

  // catching base URL
  const deployUrl = window.location.hostname === 'localhost'
    ? window.location.origin
    : 'https://samdev-pulse.vercel.app';

  /* updates the preview image and markdown snippet based on form values */
  function updatePreview() {
    const username = usernameInput.value.trim() || 'SamXop123';
    const leetcode = leetcodeInput.value.trim();
    const codeforces = codeforcesInput ? codeforcesInput.value.trim() : '';
    const codechef = codechefInput ? codechefInput.value.trim() : '';
    const theme = themeSelect.value;
    const align = alignSelect.value;
    const hideTrophies = hideTrophiesCheck ? hideTrophiesCheck.checked : false;

    // Build query parameters
    const params = new URLSearchParams({ username });
    if (theme) params.append('theme', theme);
    if (leetcode) params.append('leetcode', leetcode);
    if (codeforces) params.append('codeforces', codeforces);
    if (codechef) params.append('codechef', codechef);
    if (align && align !== 'left') params.append('align', align);
    if (hideTrophies) params.append('hide_trophies', 'true');

    // Cache-busting timestamp for local preview
    const localUrl = `/api/profile?${params.toString()}&t=${Date.now()}`;
    const publicUrl = `${deployUrl}/api/profile?${params.toString()}`;

    // Show loading spinner while fetching
    if (previewImg) {
      const loadingUrl = `/api/profile/loading?theme=${encodeURIComponent(theme || 'dark')}`;
      previewImg.src = loadingUrl;

      // After a brief delay, fetch the actual profile
      // This allows the loading spinner to be visible
      setTimeout(() => {
        previewImg.src = localUrl;
      }, 300);
    }

    // Updates markdown snippet
    if (snippet) {
      snippet.textContent = `![samdev-pulse](${publicUrl})`;
    }
  }

  /* Updates only the markdown snippet in real-time without reloading the preview image */
  function updateSnippetOnly() {
    const username = usernameInput.value.trim() || 'SamXop123';
    const leetcode = leetcodeInput.value.trim();
    const codeforces = codeforcesInput ? codeforcesInput.value.trim() : '';
    const codechef = codechefInput ? codechefInput.value.trim() : '';
    const theme = themeSelect.value;
    const align = alignSelect.value;
    const hideTrophies = hideTrophiesCheck ? hideTrophiesCheck.checked : false;

    const params = new URLSearchParams({ username });
    if (theme) params.append('theme', theme);
    if (leetcode) params.append('leetcode', leetcode);
    if (codeforces) params.append('codeforces', codeforces);
    if (codechef) params.append('codechef', codechef);
    if (align && align !== 'left') params.append('align', align);
    if (hideTrophies) params.append('hide_trophies', 'true');

    const publicUrl = `${deployUrl}/api/profile?${params.toString()}`;

    if (snippet) {
      snippet.textContent = `![samdev-pulse](${publicUrl})`;
    }
  }

  /* Handles the update preview button click */
  function handleUpdateClick() {
    if (!updateBtn) return;

    const username = usernameInput.value.trim();
    const errorMsg = document.getElementById('username-error');

    // Show validation message if username is empty
    if (!username) {
      if (errorMsg) {
        errorMsg.style.display = 'block';
        usernameInput.focus();
      }
      return; // Stop here — don't make API call
    }

    // Hide error if username is now filled
    if (errorMsg) errorMsg.style.display = 'none';

    updateBtn.disabled = true;
    updateBtn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
    </svg>
    Updating...
  `;

    updatePreview();

    setTimeout(() => {
      updateBtn.disabled = false;
      updateBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
      </svg>
      Update Preview
    `;
    }, 500);
  }
  const DOWNLOAD_BTN_HTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
    Download PNG
  `;


  /* Handles png download */
  async function handleDownloadPng() {
    if (!previewImg || !previewImg.src) {
      alert('Preview not available');
      return;
    }

    try {
      downloadBtn.disabled = true;

      downloadBtn.innerHTML = 'Generating PNG...';

      // fetch SVG
      const response = await fetch(previewImg.src);

      const svgText = await response.text();

      // create SVG blob
      const svgBlob = new Blob([svgText], {
        type: 'image/svg+xml;charset=utf-8',
      });

      const url = URL.createObjectURL(svgBlob);

      // create image
      const img = new Image();

      img.onload = () => {
        const scale = 3;

        const canvas = document.createElement('canvas');

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');

        // high quality scaling
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0);

        // convert canvas → png
        canvas.toBlob((blob) => {
          const pngUrl = URL.createObjectURL(blob);

          const a = document.createElement('a');

          const username =
            usernameInput.value.trim() || 'github-user';

          a.href = pngUrl;

          a.download = `${username}-samdev-pulse.png`;

          document.body.appendChild(a);

          a.click();

          document.body.removeChild(a);

          URL.revokeObjectURL(pngUrl);
        }, 'image/png');

        URL.revokeObjectURL(url);

        downloadBtn.disabled = false;
        downloadBtn.innerHTML = DOWNLOAD_BTN_HTML;
      };

      img.src = url;

    } catch (error) {
      console.error(error);

      downloadBtn.disabled = false;
      downloadBtn.innerHTML = DOWNLOAD_BTN_HTML;

      alert('Failed to generate PNG');
    }
  }
  const resetBtn = document.getElementById('resetBtn');

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {

      usernameInput.value = '';
      leetcodeInput.value = '';

      if (codeforcesInput) {
        codeforcesInput.value = '';
      }

      if (codechefInput) {
        codechefInput.value = '';
      }

      if (themeSelect) {
        themeSelect.selectedIndex = 0;
      }

      if (alignSelect) {
        alignSelect.selectedIndex = 0;
      }

      if (hideTrophiesCheck) {
        hideTrophiesCheck.checked = false;
      }

      const errorMsg = document.getElementById('username-error');

      if (errorMsg) {
        errorMsg.style.display = 'none';
      }

      updatePreview();
    });
  }
  /* Handles copy button click */
  // async function handleCopyClick() {
  //   if (!copyBtn || !snippet) return;

  //   try {
  //     await navigator.clipboard.writeText(snippet.textContent);
  //     copyBtn.innerHTML = `
  //       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  //         <polyline points="20 6 9 17 4 12"/>
  //       </svg>
  //       Copied!
  //     `;
  //     setTimeout(() => {
  //       copyBtn.innerHTML = `
  //         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  //           <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  //         </svg>
  //         Copy
  //       `;
  //     }, 2000);
  //   } catch (err) {
  //     console.error('Failed to copy:', err);
  //   }
  // }

  function setupThemeCardClicks() {
    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const theme = card.dataset.theme || '';

        // Update the dropdown
        if (themeSelect) {
          themeSelect.value = theme;
          updateSnippetOnly();
        }

        // Scroll to preview section
        const previewSection = document.getElementById('preview');
        if (previewSection) {
          previewSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (usernameInput && usernameInput.value.trim()) {
          updatePreview();
        }
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });
  }

  /* Sets up smooth scrolling for anchor links */
  function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* Sets up real-time listeners so the markdown snippet stays
     in sync with all input changes instantly, without requiring
     the user to click "Update Preview" */
  function setupRealTimeSync() {
    // Typing in username or leetcode fields updates snippet instantly
    if (usernameInput) {
      usernameInput.addEventListener('input', () => {
        const errorMsg = document.getElementById('username-error');
        if (errorMsg && usernameInput.value.trim()) {
          errorMsg.style.display = 'none';
        }
        updateSnippetOnly();
      });
    }
    if (leetcodeInput) {
      leetcodeInput.addEventListener('input', updateSnippetOnly);
    }
    if (codeforcesInput) {
      codeforcesInput.addEventListener('input', updateSnippetOnly);
    }
    if (codechefInput) {
      codechefInput.addEventListener('input', updateSnippetOnly);
    }

    // Changing theme, alignment, or hide-trophies updates snippet instantly
    if (themeSelect) {
      themeSelect.addEventListener('change', updateSnippetOnly);
    }
    if (alignSelect) {
      alignSelect.addEventListener('change', updateSnippetOnly);
    }
    if (hideTrophiesCheck) {
      hideTrophiesCheck.addEventListener('change', updateSnippetOnly);
    }
  }

  /* this function initialize all event listeners */
  function init() {
    if (updateBtn) {
      updateBtn.addEventListener('click', handleUpdateClick);
    }
    if (downloadBtn) {
      downloadBtn.addEventListener('click', handleDownloadPng);
    }


    copyButtons.forEach((button) => {
      button.addEventListener('click', async () => {

        const wrapper =
          button.closest('.code-wrapper, .code-section');

        const snippet = wrapper.querySelector('code');

        if (!snippet) return;

        try {
          await navigator.clipboard.writeText(
            snippet.textContent
          );


          const originalHTML = button.innerHTML;

          const hasCopyText =
            button.textContent.trim().toLowerCase().includes('copy');

          if (hasCopyText) {
            button.innerHTML = `
          <svg width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied
        `;
          } else {
            button.innerHTML = `
          <svg width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
          }

          setTimeout(() => {
            button.innerHTML = originalHTML;
          }, 2000);



        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    });

    setupSmoothScrolling();

    // Set up real-time snippet sync on every input change
    setupRealTimeSync();

    setupThemeCardClicks();

    if (usernameInput && usernameInput.value.trim()) {
      updateSnippetOnly();
    }
  }

  // runs initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Scroll-to-top button
(function () {
  'use strict';

  const SCROLL_THRESHOLD = 320;

  function createScrollToTopButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Scroll to top');
    button.setAttribute('title', 'Scroll to top');
    button.setAttribute('aria-hidden', 'true');
    button.tabIndex = -1;
    button.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M5 12l7-7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    let isVisible = false;
    let ticking = false;

    function setVisibility(shouldShow) {
      if (shouldShow === isVisible) return;

      isVisible = shouldShow;
      button.classList.toggle('is-visible', isVisible);
      button.setAttribute('aria-hidden', String(!isVisible));
      button.tabIndex = isVisible ? 0 : -1;
    }

    function updateVisibility() {
      setVisibility(window.scrollY > SCROLL_THRESHOLD);
      ticking = false;
    }

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateVisibility);
        ticking = true;
      }
    }

    function scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }

    function mount() {
      document.body.appendChild(button);
      button.addEventListener('click', scrollToTop);
      window.addEventListener('scroll', handleScroll, { passive: true });
      updateVisibility();
    }

    function destroy() {
      button.removeEventListener('click', scrollToTop);
      window.removeEventListener('scroll', handleScroll);
      button.remove();
    }

    return { mount, destroy };
  }

  function initScrollToTop() {
    const scrollToTop = createScrollToTopButton();

    scrollToTop.mount();

    window.addEventListener('pagehide', function handlePageHide(event) {
      if (event.persisted) return;
      scrollToTop.destroy();
      window.removeEventListener('pagehide', handlePageHide);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollToTop);
  } else {
    initScrollToTop();
  }
})();

// Hamburger Menu
(function () {
  'use strict';

  function initHamburger() {
    const hamburger = document.getElementById('nav-hamburger');
    const navMenu = document.getElementById('nav-menu');

    if (!hamburger || !navMenu) return;

    // Toggle open/close
    hamburger.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when any nav link is clicked (smooth-scroll already handles the jump)
    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navMenu.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu on outside click
    document.addEventListener('click', function (e) {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        navMenu.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHamburger);
  } else {
    initHamburger();
  }
})();

// Active scrollspy navbar
(function () {
  'use strict';

  function initActiveNavbar() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.navbtn a');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', function () {
      let current = '';

      sections.forEach(function (section) {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActiveNavbar);
  } else {
    initActiveNavbar();
  }
})();

// ── Theme Gallery: Search & Filter + Show More ──
(function () {
  function initThemeFilter() {
    const searchInput = document.getElementById('themeSearch');
    const chips = document.querySelectorAll('.theme-chip');
    const cards = document.querySelectorAll('#themesGrid .theme-card');
    const emptyState = document.getElementById('themeEmptyState');
    const countEl = document.getElementById('themeResultCount');
    const showMoreBtn = document.getElementById('themeShowMoreBtn');
    const showMoreWrap = document.getElementById('themeShowMoreWrapper');
    const suggestionsBox = document.getElementById('themeSearchSuggestions');

    if (!searchInput || !emptyState || !countEl) return;

    const totalCount = cards.length;
    const INITIAL_SHOW = 8;

    const countAllEl = document.getElementById('count-all');
    if (countAllEl) countAllEl.textContent = totalCount;

    let activeCategory = 'all';
    let searchQuery = '';
    let showingAll = false;

    const themeNames = Array.from(cards).map(card => {
      const nameEl = card.querySelector('.theme-name');
      if (!nameEl) return '';

      const nameClone = nameEl.cloneNode(true);
      nameClone.querySelectorAll('.default-badge').forEach(badge => badge.remove());
      return nameClone.textContent.trim();
    }).filter(Boolean);

    let activeSuggestionIndex = -1;

    function hideSuggestions() {
      if (!suggestionsBox || !suggestionsBox.classList.contains('visible')) return;

      suggestionsBox.innerHTML = '';
      suggestionsBox.classList.remove('visible');
      searchInput.setAttribute('aria-expanded', 'false');
      searchInput.removeAttribute('aria-activedescendant');
      activeSuggestionIndex = -1;
    }

    function selectSuggestion(themeName) {
      searchInput.value = themeName;
      searchQuery = themeName.toLowerCase();
      showingAll = false;
      filterThemes();
      hideSuggestions();
      searchInput.focus();
    }

    // Render case-insensitive theme-name suggestions as the user types. Empty
    // queries or queries with no matching names keep the dropdown hidden.
    function updateSuggestions() {
      if (!suggestionsBox) return;

      const query = searchInput.value.trim().toLowerCase();
      if (!query) {
        hideSuggestions();
        return;
      }

      const matches = themeNames.filter(name => name.toLowerCase().includes(query));
      if (!matches.length) {
        hideSuggestions();
        return;
      }

      suggestionsBox.innerHTML = '';
      activeSuggestionIndex = -1;
      searchInput.removeAttribute('aria-activedescendant');

      matches.forEach((name, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.id = `theme-suggestion-${index}`;
        item.className = 'theme-search-suggestion';
        item.setAttribute('role', 'option');
        item.textContent = name;
        item.addEventListener('click', () => selectSuggestion(name));
        suggestionsBox.appendChild(item);
      });

      suggestionsBox.classList.add('visible');
      searchInput.setAttribute('aria-expanded', 'true');
    }

    function highlightSuggestion(suggestions) {
      suggestions.forEach((item, index) => {
        if (index === activeSuggestionIndex) {
          item.classList.add('highlighted');
          searchInput.setAttribute('aria-activedescendant', item.id);
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('highlighted');
        }
      });
    }

    // ── Core filter function ──
    function filterThemes() {
      const isFiltering = searchQuery !== '' || activeCategory !== 'all';
      let visible = 0;
      let shownSoFar = 0;

      cards.forEach(card => {
        const name = card.querySelector('.theme-name').textContent.toLowerCase();
        const desc = card.querySelector('.theme-desc').textContent.toLowerCase();
        const cat = card.dataset.cat || '';
        const colors = (card.dataset.colors || '').toLowerCase();

        const matchesCat = activeCategory === 'all' || cat === activeCategory;
        const matchesSearch = searchQuery === '' ||
          name.includes(searchQuery) ||
          desc.includes(searchQuery) ||
          cat.includes(searchQuery) ||
          colors.includes(searchQuery);

        const matches = matchesCat && matchesSearch;

        if (matches) {
          visible++;

          if (isFiltering || showingAll) {
            // When filtering or expanded: show all matches
            card.style.display = '';
          } else {
            // Default state: show only first INITIAL_SHOW
            if (shownSoFar < INITIAL_SHOW) {
              card.style.display = '';
              shownSoFar++;
            } else {
              card.style.display = 'none';
            }
          }
        } else {
          card.style.display = 'none';
        }
      });

      // Empty state
      emptyState.style.display = visible === 0 ? 'block' : 'none';

      // Result count text
      if (isFiltering) {
        countEl.textContent = `Showing ${visible} of ${totalCount} themes`;
      } else if (showingAll) {
        countEl.textContent = `Showing all ${totalCount} themes`;
      } else {
        countEl.textContent = `Showing ${Math.min(INITIAL_SHOW, visible)} of ${totalCount} themes`;
      }

      if (isFiltering || visible <= INITIAL_SHOW) {
        showMoreWrap.style.display = 'none';
      } else {
        showMoreWrap.style.display = 'flex';
        showMoreBtn.textContent = showingAll ? 'Show Less' : `Show All Themes (${visible})`;
        showMoreBtn.innerHTML = showingAll
          ? `Show Less <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`
          : `Show All Themes (${visible}) <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`;
        showMoreBtn.classList.toggle('expanded', showingAll);
      }
    }

    // ── Show More button click ──
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', () => {
        showingAll = !showingAll;
        filterThemes();
        if (!showingAll) {
          document.getElementById('themes')
            .scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // ── Search input ──
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.trim().toLowerCase();
      showingAll = false;  // reset expansion on new search
      filterThemes();
      updateSuggestions();
    });

    searchInput.addEventListener('focus', updateSuggestions);

    searchInput.addEventListener('keydown', e => {
      const suggestions = suggestionsBox.querySelectorAll('.theme-search-suggestion');
      if (!suggestions.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestions.length;
        highlightSuggestion(suggestions);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestions.length) % suggestions.length;
        highlightSuggestion(suggestions);
      } else if (e.key === 'Enter') {
        if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
          e.preventDefault();
          selectSuggestion(suggestions[activeSuggestionIndex].textContent);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        hideSuggestions();
      }
    });

    // Close autocomplete when the user clicks away from the search area.
    document.addEventListener('click', e => {
      if (suggestionsBox.classList.contains('visible') && !searchInput.parentElement.contains(e.target)) {
        hideSuggestions();
      }
    });

    // ── Chip clicks ──
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeCategory = chip.dataset.cat;
        showingAll = false;  // reset expansion on category change
        filterThemes();
      });
    });

    // Run on load
    filterThemes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeFilter);
  } else {
    initThemeFilter();
  }
})();
