/**
 * WaterWise Settings Script
 * Manages user preferences for water usage calculations
 */

const DEFAULT_ML_PER_WORD = 0.15;
const DEFAULT_USAGE_LIMITS = {
  weekly: null,
  monthly: null,
  yearly: null
};

const PRESETS = {
  conservative: 0.25,  // 25ml per 100 words
  balanced: 0.15,      // 15ml per 100 words
  optimistic: 0.08     // 8ml per 100 words
};

/**
 * Loads saved settings from storage
 */
function loadSettings() {
  chrome.storage.local.get(['mlPerWord', 'showFloatButton', 'usageLimits'], (result) => {
    const mlPerWord = result.mlPerWord || DEFAULT_ML_PER_WORD;
    document.getElementById('mlPerWord').value = mlPerWord;
    updateRangeDisplay(mlPerWord);
    updateActiveBadge(mlPerWord);

    // Load float button setting (defaults to true)
    const showFloatButton = result.showFloatButton !== undefined ? result.showFloatButton : true;
    document.getElementById('showFloatButton').checked = showFloatButton;

    const usageLimits = result.usageLimits || DEFAULT_USAGE_LIMITS;
    setLimitValue('weeklyLimit', usageLimits.weekly);
    setLimitValue('monthlyLimit', usageLimits.monthly);
    setLimitValue('yearlyLimit', usageLimits.yearly);
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
  const validationErrors = [];

  // Validate input
  if (isNaN(mlPerWord) || mlPerWord < 0.01 || mlPerWord > 1.0) {
    showMessage('Please enter a value between 0.01 and 1.0', 'error');
    return;
  }

  const weeklyLimit = parseOptionalLimit('weeklyLimit', 'Weekly', validationErrors);
  const monthlyLimit = parseOptionalLimit('monthlyLimit', 'Monthly', validationErrors);
  const yearlyLimit = parseOptionalLimit('yearlyLimit', 'Yearly', validationErrors);

  if (validationErrors.length > 0) {
    showMessage(validationErrors[0], 'error');
    return;
  }

  const usageLimits = {
    weekly: weeklyLimit,
    monthly: monthlyLimit,
    yearly: yearlyLimit
  };

  chrome.storage.local.set({ mlPerWord, showFloatButton, usageLimits }, () => {
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
  setLimitValue('weeklyLimit', DEFAULT_USAGE_LIMITS.weekly);
  setLimitValue('monthlyLimit', DEFAULT_USAGE_LIMITS.monthly);
  setLimitValue('yearlyLimit', DEFAULT_USAGE_LIMITS.yearly);
  chrome.storage.local.set({
    mlPerWord: DEFAULT_ML_PER_WORD,
    showFloatButton: true,
    usageLimits: DEFAULT_USAGE_LIMITS
  }, () => {
    showMessage('Reset to defaults and cleared usage limits', 'success');
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
 * Sets a numeric limit input value (optional)
 */
function setLimitValue(inputId, value) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = typeof value === 'number' ? value : '';
}

/**
 * Parses optional limit values with validation
 */
function parseOptionalLimit(inputId, label, errors) {
  const input = document.getElementById(inputId);
  if (!input) return null;
  const raw = input.value.trim();
  if (!raw) return null;
  const parsed = parseFloat(raw);
  if (isNaN(parsed) || parsed <= 0) {
    errors.push(`${label} limit must be a positive number`);
    return null;
  }
  return parsed;
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
