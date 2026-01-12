/**
 * WaterWise Background Service Worker
 * Handles opening the extension popup programmatically
 */

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openPopup') {
    // Open the popup by opening it in a new window or tab
    // Note: chrome.action.openPopup() only works in user gesture context
    // So we'll open the popup.html in a small popup window instead
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 400,
      height: 600,
      left: 100,
      top: 100
    });
    sendResponse({ success: true });
  }
});
