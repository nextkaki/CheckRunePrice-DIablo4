document.getElementById("calculate").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tabs found.");
      return;
    }

    const tabId = tabs[0].id; // 활성 탭의 ID 가져오기

    // background.js로 메시지 전달
    chrome.runtime.sendMessage(
      { action: "executeScript", tabId },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError.message);
          return;
        }

        if (response.error) {
          console.error("Script execution error:", response.error);
        } else {
          console.log("Response received:", response); // 성공 로그

          // 평균과 합계 표시
          const averageElement = document.getElementById("average");
          const totalElement = document.getElementById("total");

          averageElement.textContent = `Average: ${response.average.toLocaleString()}`;
          totalElement.textContent = `Total: ${response.total.toLocaleString()}`;
        }
      }
    );
  });
});
