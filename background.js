chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "NEW_TAB") {
    chrome.tabs.create({ url: "https://www.google.com" });
  }

  if (msg.type === "CLOSE_TAB") {
    chrome.tabs.remove(sender.tab.id);
  }

  if (msg.type === "SCROLL") {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      func: (dir) => {
        window.scrollBy({ top: dir === "down" ? 500 : -500, behavior: "smooth" });
      },
      args: [msg.direction]
    });
  }

  if (msg.type === "SEARCH") {
    chrome.tabs.create({ url: "https://www.google.com/search?q=" + encodeURIComponent(msg.query) });
  }

  if (msg.type === "GET_PAGE_TEXT") {
    chrome.tabs.sendMessage(sender.tab.id, { type: "GET_PAGE_TEXT" }, sendResponse);
    return true; // for async response
  }
});
