// content.js

// Extract visible readable text from the current page
function extractVisibleText() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let text = "";
  let node;
  while (node = walker.nextNode()) {
    if (node.parentNode && node.parentNode.offsetParent !== null) {
      text += node.textContent.trim() + " ";
    }
  }
  return text;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_PAGE_TEXT") {
    const text = extractVisibleText();
    sendResponse({ text });
  }
});
