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

  // catching base URL
  const deployUrl = window.location.hostname === 'localhost'
    ? window.location.origin
    : 'https://samdev-pulse.vercel.app';

  /* Updates the preview image and markdown snippet based on form values */
  function updatePreview() {
    const username = usernameInput.value.trim() || 'SamXop123';
    const leetcode = leetcodeInput.value.trim();
    const theme = themeSelect.value;
    const align = alignSelect.value;

    // Build query parameters
    const params = new URLSearchParams({ username });
    if (theme) params.append('theme', theme);
    if (leetcode) params.append('leetcode', leetcode);
    if (align && align !== 'left') params.append('align', align);

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

  /* Handles the update preview button click */
  function handleUpdateClick() {
    if (!updateBtn) return;

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

  }
