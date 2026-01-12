/**
 * WaterWise Popup Script
 * Displays water usage statistics and visualizations
 */

let chartInstance = null;

/**
 * Formats water amount for display
 */
function formatWater(liters) {
  if (liters < 0.001) {
    return `${(liters * 1000).toFixed(2)}ml`;
  } else if (liters < 1) {
    return `${(liters * 1000).toFixed(0)}ml`;
  } else if (liters < 10) {
    return `${liters.toFixed(2)}L`;
  } else {
    return `${liters.toFixed(1)}L`;
  }
}

/**
 * Gets a comparison message based on total water usage
 */
function getComparisonText(liters) {
  if (liters < 0.5) {
    return `That's less than a water bottle! 🍼`;
  } else if (liters < 2) {
    return `That's about ${Math.round(liters / 0.5)} water bottles 💧`;
  } else if (liters < 10) {
    return `That's about ${(liters / 3.78).toFixed(1)} gallons of water 🚰`;
  } else if (liters < 50) {
    return `That's about ${Math.round(liters / 10)} toilet flushes 🚽`;
  } else if (liters < 200) {
    return `That's about ${Math.round(liters / 50)} bathtubs 🛁`;
  } else {
    return `That's about ${(liters / 378.5).toFixed(1)} filled bathtubs! 🏊`;
  }
}

/**
 * Formats a timestamp as relative time
 */
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Creates a simple bar chart using canvas
 */
function createChart(chatData) {
  const canvas = document.getElementById('waterChart');
  const ctx = canvas.getContext('2d');

  // Set canvas size
  const container = canvas.parentElement;
  canvas.width = container.clientWidth - 24;
  canvas.height = container.clientHeight - 24;

  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  if (chatData.length === 0) {
    ctx.fillStyle = '#999';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', width / 2, height / 2);
    return;
  }

  // Sort by water usage and take top 5
  const topChats = chatData
    .sort((a, b) => b.waterUsed - a.waterUsed)
    .slice(0, 5);

  const maxWater = Math.max(...topChats.map(c => c.waterUsed), 0.001);
  const barHeight = (height - 40) / topChats.length;
  const padding = 4;

  topChats.forEach((chat, i) => {
    const barWidth = (chat.waterUsed / maxWater) * (width - 80);
    const y = i * barHeight + padding;

    // Draw bar
    const gradient = ctx.createLinearGradient(0, y, barWidth, y);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1B5CB8');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, barWidth, barHeight - padding * 2);

    // Draw value
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    const label = formatWater(chat.waterUsed);
    ctx.fillText(label, barWidth + 8, y + (barHeight - padding * 2) / 2 + 4);
  });
}

/**
 * Renders the chat list
 */
function renderChatList(chats) {
  const container = document.getElementById('chatListContainer');

  if (chats.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">💬</div>
        <p>No conversations tracked yet</p>
        <p class="empty-hint">Start chatting on ChatGPT to see water usage data</p>
      </div>
    `;
    return;
  }

  // Sort by most recent
  const sortedChats = chats.sort((a, b) => b.lastUpdated - a.lastUpdated);

  container.innerHTML = sortedChats.map(chat => `
    <div class="chat-item" data-url="${chat.url}">
      <div class="chat-header">
        <div class="chat-title">Chat ${chat.id.substring(0, 8)}...</div>
        <div class="chat-water">${formatWater(chat.waterUsed)}</div>
      </div>
      <div class="chat-meta">
        <span>${chat.messageCount} messages</span>
        <span>${formatRelativeTime(chat.lastUpdated)}</span>
      </div>
    </div>
  `).join('');

  // Add click handlers
  container.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', () => {
      const url = item.dataset.url;
      chrome.tabs.create({ url });
    });
  });
}

/**
 * Updates all stats and visualizations
 */
function updateStats() {
  chrome.storage.local.get(['chats', 'totalWater', 'mlPerWord', 'chatMessages'], (result) => {
    const chats = result.chats || {};
    const totalWater = result.totalWater || 0;
    const mlPerWord = result.mlPerWord || 0.15;
    const chatMessages = result.chatMessages || {};
    const chatArray = Object.values(chats);

    console.log('WaterWise Popup: Storage data:', {
      totalWater: totalWater.toFixed(4) + 'L',
      numChats: chatArray.length,
      chats: chats,
      chatMessages: chatMessages
    });

    // Update overview stats
    document.getElementById('totalWater').textContent = formatWater(totalWater);
    document.getElementById('chatCount').textContent = chatArray.length;

    const totalMessages = chatArray.reduce((sum, chat) => sum + chat.messageCount, 0);
    document.getElementById('messageCount').textContent = totalMessages;

    // Update comparison text
    document.getElementById('comparisonText').textContent = getComparisonText(totalWater);

    // Update info text with current setting
    const mlPer100Words = (mlPerWord * 100).toFixed(1);
    document.getElementById('infoText').textContent = `Based on your setting: ~${mlPer100Words}ml per 100 words`;

    // Update chart
    createChart(chatArray);

    // Update chat list
    renderChatList(chatArray);
  });
}

/**
 * Clears all stored data
 */
function clearData() {
  if (confirm('Are you sure you want to clear all water usage data? This will reset everything.')) {
    chrome.storage.local.clear(() => {
      console.log('WaterWise: All data cleared');
      updateStats();
    });
  }
}

/**
 * Cleans up old/invalid data structure (for migration from v1.x)
 */
function cleanupOldData() {
  chrome.storage.local.get(null, (allData) => {
    const keysToRemove = [];

    // Remove old v1.x keys
    if (allData.processedMessages) {
      keysToRemove.push('processedMessages');
    }

    if (keysToRemove.length > 0) {
      chrome.storage.local.remove(keysToRemove, () => {
        console.log('WaterWise: Cleaned up old data keys:', keysToRemove);
      });
    }
  });
}

/**
 * Opens the settings page in a new popup window
 */
function openSettings() {
  chrome.windows.create({
    url: chrome.runtime.getURL('settings.html'),
    type: 'popup',
    width: 650,
    height: 700,
    left: 100,
    top: 100
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Detect if we're in an iframe (inline panel)
  if (window.self !== window.top) {
    document.body.classList.add('inline-panel');
  }

  // Clean up old data first
  cleanupOldData();

  // Update stats
  updateStats();

  // Set up buttons
  document.getElementById('clearData').addEventListener('click', clearData);
  document.getElementById('settingsButton').addEventListener('click', openSettings);

  // Listen for storage changes (real-time updates)
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.chats || changes.totalWater || changes.chatMessages)) {
      console.log('WaterWise Popup: Storage changed, updating stats');
      updateStats();
    }
  });

  // Refresh stats every 2 seconds while popup is open (backup)
  setInterval(updateStats, 2000);
});
