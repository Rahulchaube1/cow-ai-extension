const askBtn = document.getElementById("ask");
const voiceBtn = document.getElementById("voice");
const summarizeBtn = document.getElementById("summarize");
const promptInput = document.getElementById("prompt");
const responseDiv = document.getElementById("response");

const API_KEY = "AIzaSyAALfUjOspmSgKiHTv74zUB1-MJOaUhj68";

askBtn.addEventListener("click", async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return;

  await askGemini(prompt);
});

async function askGemini(prompt) {
  responseDiv.textContent = "⏳ Thinking...";
  try {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await res.json();
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from Gemini.";
    responseDiv.textContent = output;
  } catch (err) {
    responseDiv.textContent = "❌ Error: " + err.message;
  }
}

// 🎙️ Voice Input
voiceBtn.addEventListener("click", () => {
  const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript.toLowerCase().trim();
    promptInput.value = text;

    if (handleCommand(text)) {
      return;
    }

    askGemini(text);
  };
  recognition.start();
});

// 🔥 Voice Command Handler
function handleCommand(command) {
  if (command.includes("open new tab")) {
    chrome.runtime.sendMessage({ type: "NEW_TAB" });
    responseDiv.textContent = "🆕 Opening new tab...";
    return true;
  }

  if (command.includes("close tab")) {
    chrome.runtime.sendMessage({ type: "CLOSE_TAB" });
    responseDiv.textContent = "❌ Closing current tab...";
    return true;
  }

  if (command.includes("scroll down")) {
    chrome.runtime.sendMessage({ type: "SCROLL", direction: "down" });
    responseDiv.textContent = "⬇️ Scrolling down...";
    return true;
  }

  if (command.includes("scroll up")) {
    chrome.runtime.sendMessage({ type: "SCROLL", direction: "up" });
    responseDiv.textContent = "⬆️ Scrolling up...";
    return true;
  }

  if (command.startsWith("search for ")) {
    const query = command.replace("search for ", "");
    chrome.runtime.sendMessage({ type: "SEARCH", query });
    responseDiv.textContent = `🔍 Searching for ${query}...`;
    return true;
  }

  return false;
}

// 🧠 Summarize Page
summarizeBtn.addEventListener("click", () => {
  responseDiv.textContent = "📄 Reading page content...";
  chrome.runtime.sendMessage({ type: "GET_PAGE_TEXT" }, async (res) => {
    if (res?.text) {
      const summaryPrompt = `Summarize this web page in simple terms:\n\n${res.text}`;
      await askGemini(summaryPrompt);
    } else {
      responseDiv.textContent = "❌ Couldn't read page content.";
    }
  });
});
