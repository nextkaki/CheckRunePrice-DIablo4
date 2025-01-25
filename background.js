chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "executeScript") {
    // tabId 확인
    if (!message.tabId) {
      console.error("No tabId provided in the message.");
      sendResponse({ error: "tabId is missing." });
      return;
    }

    // activeTab에서 content.js 실행
    chrome.scripting.executeScript(
      {
        target: { tabId: message.tabId },
        files: ["content.js"]
      },
      (results) => {
        if (chrome.runtime.lastError) {
          console.error("Script execution error:", chrome.runtime.lastError.message);
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        console.log("Content script executed successfully.");

        // content.js에 메시지 전송
        chrome.tabs.sendMessage(
          message.tabId,
          { action: "extractData" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error:", chrome.runtime.lastError.message);
              sendResponse({ error: chrome.runtime.lastError.message });
            } else {
              sendResponse(response);
            }
          }
        );
      }
    );

    // 비동기 응답을 위해 true 반환
    return true;
  }
});
