// samdev-pulse Preview functionality

(function() {
  'use strict';

  const usernameInput = document.getElementById('username');
  const leetcodeInput = document.getElementById('leetcode');
  const themeSelect = document.getElementById('theme-select');
  const alignSelect = document.getElementById('align-select');
  const previewImg = document.getElementById('preview-img');
  const snippet = document.getElementById('snippet');
  const copyBtn = document.getElementById('copy-btn');
  const updateBtn = document.getElementById('update-preview-btn');
  const hideTrophiesCheck = document.getElementById('hide-trophies');

  // catching base URL
  const deployUrl = window.location.hostname === 'localhost'
    ? window.location.origin
    : 'https://samdev-pulse.vercel.app';

  /* updates the preview image and markdown snippet based on form values */
  function updatePreview() {
    const username = usernameInput.value.trim() || 'SamXop123';
    const leetcode = leetcodeInput.value.trim();
    const theme = themeSelect.value;
    const align = alignSelect.value;
    const hideTrophies = hideTrophiesCheck ? hideTrophiesCheck.checked : false;

    // Build query parameters
    const params = new URLSearchParams({ username });
    if (theme) params.append('theme', theme);
    if (leetcode) params.append('leetcode', leetcode);
    if (align && align !== 'left') params.append('align', align);
    if (hideTrophies) params.append('hide_trophies', 'true');

    // Cache-busting timestamp for local preview
    const localUrl = `/api/profile?${params.toString()}&t=${Date.now()}`;
    const publicUrl = `${deployUrl}/api/profile?${params.toString()}`;

    // Updates preview image
    if (previewImg) {
      previewImg.src = localUrl;
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
    const theme = themeSelect.value;
    const align = alignSelect.value;
    const hideTrophies = hideTrophiesCheck ? hideTrophiesCheck.checked : false;

    const params = new URLSearchParams({ username });
    if (theme) params.append('theme', theme);
    if (leetcode) params.append('leetcode', leetcode);
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

  /* Handles copy button click */
  async function handleCopyClick() {
    if (!copyBtn || !snippet) return;

    try {
      await navigator.clipboard.writeText(snippet.textContent);
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        `;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  /* Sets up smooth scrolling for anchor links */
  function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
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

    if (copyBtn) {
      copyBtn.addEventListener('click', handleCopyClick);
    }

    setupSmoothScrolling();

    // Set up real-time snippet sync on every input change
    setupRealTimeSync();

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