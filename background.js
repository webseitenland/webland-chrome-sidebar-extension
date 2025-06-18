/* © Webseitenland – https://webseitenland.de – Code & Design by Webseitenland. See LICENSE for details. */

// when installing the extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Webland Sidebar Extension wurde installiert');
  
  // activate sidebar button
  chrome.sidePanel.setOptions({
    enabled: true,
    path: 'sidebar.html'
  });
});

// open sidebar when clicking on extension icon
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// receive messages from sidebar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getCurrentTab') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        sendResponse({ tab: tabs[0] });
      } else {
        sendResponse({ error: 'Kein aktiver Tab gefunden' });
      }
    });
    return true; // important for asynchronous responses
  }
}); 