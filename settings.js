/**
 * WaterWise Settings Script
 * Manages user preferences for water usage calculations
 */

const DEFAULT_ML_PER_WORD = 0.15;

const PRESETS = {
  conservative: 0.25,  // 25ml per 100 words
  balanced: 0.15,      // 15ml per 100 words
  optimistic: 0.08     // 8ml per 100 words
};

/**
 * Loads saved settings from storage
 */
function loadSettings() {
  chrome.storage.local.get(['mlPerWord', 'showFloatButton'], (result) => {
    const mlPerWord = result.mlPerWord || DEFAULT_ML_PER_WORD;
    document.getElementById('mlPerWord').value = mlPerWord;
    updateRangeDisplay(mlPerWord);
    updateActiveBadge(mlPerWord);

    // Load float button setting (defaults to true)
    const showFloatButton = result.showFloatButton !== undefined ? result.showFloatButton : true;
    document.getElementById('showFloatButton').checked = showFloatButton;
  });
}

/**
 * Updates the range display text
 */
function updateRangeDisplay(mlPerWord) {
  const mlPer100Words = (mlPerWord * 100).toFixed(1);
  document.getElementById('rangeDisplay').textContent = `= ${mlPer100Words}ml per 100 words`;
}

/**
 * Updates which preset badge is active
 */
function updateActiveBadge(mlPerWord) {
  const badges = document.querySelectorAll('.badge');
  badges.forEach(badge => {
    const preset = badge.dataset.preset;
    const presetValue = PRESETS[preset];

    // Check if this preset matches the current value (with small tolerance)
    if (Math.abs(presetValue - mlPerWord) < 0.01) {
      badge.classList.add('badge-active');
    } else {
      badge.classList.remove('badge-active');
    }
  });
}

/**
 * Saves settings to storage
 */
function saveSettings() {
  const mlPerWord = parseFloat(document.getElementById('mlPerWord').value);
  const showFloatButton = document.getElementById('showFloatButton').checked;

  // Validate input
  if (isNaN(mlPerWord) || mlPerWord < 0.01 || mlPerWord > 1.0) {
    showMessage('Please enter a value between 0.01 and 1.0', 'error');
    return;
  }

  chrome.storage.local.set({ mlPerWord, showFloatButton }, () => {
    showMessage('Settings saved successfully! 💧', 'success');
    updateRangeDisplay(mlPerWord);
    updateActiveBadge(mlPerWord);
  });
}

/**
 * Resets settings to default
 */
function resetSettings() {
  document.getElementById('mlPerWord').value = DEFAULT_ML_PER_WORD;
  document.getElementById('showFloatButton').checked = true;
  chrome.storage.local.set({ mlPerWord: DEFAULT_ML_PER_WORD, showFloatButton: true }, () => {
    showMessage('Reset to default (0.15ml/word)', 'success');
    updateRangeDisplay(DEFAULT_ML_PER_WORD);
    updateActiveBadge(DEFAULT_ML_PER_WORD);
  });
}

/**
 * Shows a save/error message
 */
function showMessage(text, type) {
  const messageEl = document.getElementById('saveMessage');
  messageEl.textContent = text;
  messageEl.className = `save-message ${type} show`;

  setTimeout(() => {
    messageEl.classList.remove('show');
  }, 3000);
}

/**
 * Applies a preset value
 */
function applyPreset(preset) {
  const value = PRESETS[preset];
  if (value) {
    document.getElementById('mlPerWord').value = value;
    updateRangeDisplay(value);
    updateActiveBadge(value);
  }
}

/**
 * Closes the settings window
 */
function goBack() {
  window.close();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();

  // Set up event listeners
  document.getElementById('saveButton').addEventListener('click', saveSettings);
  document.getElementById('resetButton').addEventListener('click', resetSettings);
  document.getElementById('backButton').addEventListener('click', goBack);

  // Input change listener
  const input = document.getElementById('mlPerWord');
  input.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      updateRangeDisplay(value);
      updateActiveBadge(value);
    }
  });

  // Preset badge listeners
  document.querySelectorAll('.badge').forEach(badge => {
    badge.addEventListener('click', () => {
      const preset = badge.dataset.preset;
      applyPreset(preset);
    });
  });

  // Save on Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveSettings();
    }
  });
});
