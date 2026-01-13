/**
 * WaterWise - ChatGPT Water Usage Tracker
 *
 * Complete rewrite with proper message-level tracking
 */

// Water usage setting (loaded from storage, defaults to 0.15)
let mlPerWord = 0.15;
let showFloatButton = true; // Default to showing the button

// Load user's custom settings
chrome.storage.local.get(['mlPerWord', 'showFloatButton'], (result) => {
  if (result.mlPerWord !== undefined) {
    mlPerWord = result.mlPerWord;
  }
  if (result.showFloatButton !== undefined) {
    showFloatButton = result.showFloatButton;
  }
  updateFloatButtonVisibility();
});

// Listen for setting changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.mlPerWord) {
    mlPerWord = changes.mlPerWord.newValue;
  }
  if (area === 'local' && changes.showFloatButton) {
    showFloatButton = changes.showFloatButton.newValue;
    updateFloatButtonVisibility();
  }
});

/**
 * Gets the current chat ID from the URL
 */
function getChatId() {
  const url = window.location.pathname;
  const match = url.match(/\/c\/([^/]+)/);
  return match ? match[1] : 'default';
}

/**
 * Estimates water usage based on response length
 */
function estimateWaterUsage(text) {
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const ml = words * mlPerWord;
  return ml / 1000; // Convert to liters
}

/**
 * Gets a unique message ID from the message element
 * Uses ChatGPT's data-message-id if available, otherwise creates one
 */
function getMessageId(messageElement) {
  // Try to get ChatGPT's native message ID
  const nativeId = messageElement.getAttribute('data-message-id');
  if (nativeId) return nativeId;

  // Fallback: create a stable ID based on element position
  const parent = messageElement.parentElement;
  if (!parent) return null;

  const allMessages = parent.querySelectorAll('[data-message-author-role="assistant"]');
  const index = Array.from(allMessages).indexOf(messageElement);

  return `msg-${index}`;
}

/**
 * Checks if message is currently streaming
 */
function isMessageStreaming(messageElement) {
  // Check for streaming indicators
  const streamingButton = document.querySelector('button[data-testid="stop-button"]');
  if (!streamingButton) return false;

  // Additional checks
  const hasStreamingClass = messageElement.classList.contains('result-streaming');
  const hasStreamingChild = messageElement.querySelector('[class*="streaming"]');

  return hasStreamingClass || hasStreamingChild || streamingButton !== null;
}

/**
 * Gets or creates storage for a specific chat's messages
 */
async function getChatMessages(chatId) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['chatMessages'], (result) => {
      const chatMessages = result.chatMessages || {};
      if (!chatMessages[chatId]) {
        chatMessages[chatId] = {};
      }
      resolve(chatMessages[chatId]);
    });
  });
}

// Queue to prevent race conditions when saving multiple messages
let saveQueue = Promise.resolve();

/**
 * Saves water usage for a specific message (queued to prevent race conditions)
 */
async function saveMessageWaterUsage(chatId, messageId, waterUsed) {
  // Add to queue to prevent concurrent writes
  saveQueue = saveQueue.then(() => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['chatMessages'], (result) => {
        const chatMessages = result.chatMessages || {};
        if (!chatMessages[chatId]) {
          chatMessages[chatId] = {};
        }

        // Store water usage for this specific message
        const existingEntry = chatMessages[chatId][messageId];
        const existingTimestamp = existingEntry && typeof existingEntry === 'object'
          ? existingEntry.timestamp
          : null;
        const timestamp = typeof existingTimestamp === 'number' ? existingTimestamp : Date.now();
        chatMessages[chatId][messageId] = { waterUsed, timestamp };

        console.log(`WaterWise: Saving message ${messageId} = ${waterUsed.toFixed(4)}L to storage`);

        chrome.storage.local.set({ chatMessages }, () => {
          console.log(`WaterWise: Saved! chatMessages[${chatId}] now has ${Object.keys(chatMessages[chatId]).length} messages`);
          resolve();
        });
      });
    });
  });

  return saveQueue;
}

/**
 * Recalculates total water usage for a chat by summing all its messages
 */
async function recalculateChatTotal(chatId) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['chatMessages', 'chats'], (result) => {
      const chatMessages = result.chatMessages || {};
      const chats = result.chats || {};

      const messages = chatMessages[chatId] || {};
      const totalWaterForChat = Object.values(messages).reduce((sum, entry) => {
        const waterValue = typeof entry === 'number' ? entry : entry?.waterUsed;
        return sum + (typeof waterValue === 'number' ? waterValue : 0);
      }, 0);
      const messageCount = Object.keys(messages).length;

      console.log(`WaterWise: Recalculating chat ${chatId}:`);
      console.log('  Message count:', messageCount);
      console.log('  Individual messages:', messages);
      console.log('  Message values:', Object.values(messages));
      console.log('  Total for this chat:', totalWaterForChat.toFixed(4) + 'L');

      // Update chat info
      if (!chats[chatId]) {
        chats[chatId] = {
          id: chatId,
          waterUsed: 0,
          messageCount: 0,
          lastUpdated: Date.now(),
          url: window.location.href
        };
      }

      chats[chatId].waterUsed = totalWaterForChat;
      chats[chatId].messageCount = messageCount;
      chats[chatId].lastUpdated = Date.now();
      chats[chatId].url = window.location.href;

      // Calculate total water across all chats
      const totalWater = Object.values(chats).reduce((sum, chat) => sum + chat.waterUsed, 0);

      console.log(`WaterWise: Total water across all chats: ${totalWater.toFixed(4)}L`);

      chrome.storage.local.set({ chats, totalWater }, () => resolve(totalWaterForChat));
    });
  });
}

/**
 * Creates and injects water usage badge into message
 */
async function addWaterBadge(messageElement) {
  // Skip if already has badge
  if (messageElement.querySelector('.water-badge')) return;

  // Skip if streaming
  if (isMessageStreaming(messageElement)) return;

  // Get the actual message content (markdown or prose container)
  const contentElement = messageElement.querySelector('[class*="markdown"]') ||
                        messageElement.querySelector('[data-message-author-role="assistant"]') ||
                        messageElement;

  const text = contentElement.textContent || '';
  if (text.length === 0) return;

  const chatId = getChatId();
  const messageId = getMessageId(messageElement);

  if (!messageId) return;

  // Calculate water usage
  const waterUsed = estimateWaterUsage(text);

  console.log(`WaterWise: Message ${messageId} - Text length: ${text.length} chars, ${text.split(/\s+/).length} words, ${waterUsed.toFixed(4)}L`);

  // Check if we've already stored this message
  const chatMessages = await getChatMessages(chatId);
  const isNewMessage = !chatMessages[messageId];

  // Save message water usage (will update if content changed)
  await saveMessageWaterUsage(chatId, messageId, waterUsed);

  // Recalculate chat total
  await recalculateChatTotal(chatId);

  // Create badge
  const badge = document.createElement('div');
  badge.className = 'water-badge';

  const dropIcon = document.createElement('span');
  dropIcon.className = 'water-drop-icon';
  dropIcon.textContent = '💧';

  const waterText = document.createElement('span');
  waterText.className = 'water-text';

  if (waterUsed < 0.001) {
    waterText.textContent = `${(waterUsed * 1000).toFixed(2)}ml water`;
  } else if (waterUsed < 1) {
    waterText.textContent = `${(waterUsed * 1000).toFixed(1)}ml water`;
  } else {
    waterText.textContent = `${waterUsed.toFixed(2)}L water`;
  }

  badge.appendChild(dropIcon);
  badge.appendChild(waterText);

  // Find the best place to insert the badge
  const messageContent = messageElement.querySelector('[class*="markdown"]') || messageElement;
  messageContent.appendChild(badge);

  console.log(`WaterWise: ${isNewMessage ? 'Added' : 'Updated'} message ${messageId} - ${waterUsed.toFixed(4)}L`);
}

/**
 * Process all assistant messages
 */
function processMessages() {
  // Find all assistant messages
  const selectors = [
    '[data-message-author-role="assistant"]',
    '.group.w-full.text-token-text-primary',
    '[class*="agent-turn"]'
  ];

  let messages = [];
  for (const selector of selectors) {
    const found = document.querySelectorAll(selector);
    if (found.length > 0) {
      messages = Array.from(found).filter(el => {
        // Filter for assistant messages only
        const isUser = el.querySelector('[data-message-author-role="user"]');
        return !isUser;
      });
      if (messages.length > 0) break;
    }
  }

  // Process each message
  messages.forEach(msg => {
    addWaterBadge(msg);
  });

  console.log(`WaterWise: Processed ${messages.length} messages`);
}

/**
 * Recalculate everything on page load/navigation
 */
async function recalculateCurrentChat() {
  const chatId = getChatId();
  await recalculateChatTotal(chatId);
  console.log(`WaterWise: Recalculated totals for chat ${chatId}`);
}

/**
 * Creates and injects the floating button
 */
function createFloatButton() {
  // Check if button already exists
  if (document.querySelector('.waterwise-float-button')) return;

  const button = document.createElement('div');
  button.className = 'waterwise-float-button';
  button.innerHTML = '💧';
  button.title = 'Open WaterWise';

  // Add click handler to open extension popup
  button.addEventListener('click', () => {
    // Since we can't directly open the popup programmatically in MV3,
    // we'll show a message prompting the user to click the extension icon
    // Or we could create a custom modal/panel
    openWaterWisePanel();
  });

  document.body.appendChild(button);
  updateFloatButtonVisibility();
}

/**
 * Updates button visibility based on setting
 */
function updateFloatButtonVisibility() {
  const button = document.querySelector('.waterwise-float-button');
  if (!button) return;

  if (showFloatButton) {
    button.classList.remove('hidden');
  } else {
    button.classList.add('hidden');
  }
}

/**
 * Creates the inline panel structure
 */
function createInlinePanel() {
  // Check if panel already exists
  if (document.querySelector('.waterwise-panel')) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'waterwise-panel-overlay';
  overlay.addEventListener('click', closeWaterWisePanel);

  // Create panel
  const panel = document.createElement('div');
  panel.className = 'waterwise-panel';

  // Create header
  const header = document.createElement('div');
  header.className = 'waterwise-panel-header';
  header.innerHTML = `
    <div class="waterwise-panel-title">💧 WaterWise</div>
    <button class="waterwise-panel-close">×</button>
  `;

  // Create content container
  const content = document.createElement('div');
  content.className = 'waterwise-panel-content';
  content.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: #666;">Loading...</div>';

  // Assemble panel
  panel.appendChild(header);
  panel.appendChild(content);

  // Add to page
  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  // Add close button handler
  header.querySelector('.waterwise-panel-close').addEventListener('click', closeWaterWisePanel);

  // Load the popup content via iframe
  loadPanelContent(content);
}

/**
 * Loads popup.html content into the panel
 */
function loadPanelContent(contentContainer) {
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('popup.html');
  iframe.style.cssText = `
    width: 100%;
    height: calc(100vh - 64px);
    border: none;
    display: block;
    background: white;
  `;

  // Add load event listener to handle errors
  iframe.addEventListener('load', () => {
    console.log('WaterWise: Panel content loaded successfully');
  });

  iframe.addEventListener('error', (e) => {
    console.error('WaterWise: Error loading panel content', e);
    contentContainer.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Error loading content. Please try again.</div>';
  });

  contentContainer.innerHTML = '';
  contentContainer.style.padding = '0';
  contentContainer.appendChild(iframe);
}

/**
 * Opens the WaterWise inline panel
 */
function openWaterWisePanel() {
  createInlinePanel();

  // Show panel with animation
  setTimeout(() => {
    const overlay = document.querySelector('.waterwise-panel-overlay');
    const panel = document.querySelector('.waterwise-panel');
    if (overlay) overlay.classList.add('show');
    if (panel) panel.classList.add('show');
  }, 10);
}

/**
 * Closes the WaterWise inline panel
 */
function closeWaterWisePanel() {
  const overlay = document.querySelector('.waterwise-panel-overlay');
  const panel = document.querySelector('.waterwise-panel');

  if (overlay) overlay.classList.remove('show');
  if (panel) panel.classList.remove('show');

  // Remove from DOM after animation
  setTimeout(() => {
    if (overlay && overlay.parentElement) overlay.remove();
    if (panel && panel.parentElement) panel.remove();
  }, 300);
}

/**
 * Initialize the extension
 */
function init() {
  console.log('WaterWise: Initializing...');

  // Recalculate current chat totals
  recalculateCurrentChat();

  // Process existing messages
  processMessages();

  // Create floating button
  createFloatButton();

  // Observe DOM for new messages
  const observer = new MutationObserver((mutations) => {
    // Debounce: only process after mutations settle
    clearTimeout(window._waterwiseTimer);
    window._waterwiseTimer = setTimeout(() => {
      processMessages();
    }, 500);
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('WaterWise: Initialized and observing');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
