// popup.js

// Open the overlay assistant on current page
document.getElementById("openOverlay").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["overlay.js"]
  });
});

// Summarize the current page content
document.getElementById("summarize").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: summarizePage
  });
});

function summarizePage() {
  const content = document.body.innerText;
  const summary = content.slice(0, 300) + "..."; // TEMP: just trimming
  alert("Summary:\n" + summary);
}

// Voice Command using Web Speech API
document.getElementById("startVoice").addEventListener("click", () => {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = async (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    console.log("Voice command:", command);

    if (command.includes("close tab")) {
      chrome.runtime.sendMessage({ action: "closeTab" });
    } else if (command.startsWith("search for")) {
      const query = command.replace("search for", "").trim();
      window.open("https://www.google.com/search?q=" + encodeURIComponent(query));
    } else {
      alert("Unrecognized voice command: " + command);
    }
  };
});
