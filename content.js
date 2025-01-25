// XPath로 요소를 찾는 함수 정의
function getElementsByXPath(xpath, parent = document) {
    const results = [];
    const query = document.evaluate(xpath, parent, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (let i = 0; i < query.snapshotLength; i++) {
        results.push(query.snapshotItem(i));
    }
    return results;
}

// 메시지를 받으면 실행
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractData") {
        try {
            const prices = [];

            // 1. 아이템 목록 컨테이너 찾기
            const itemContainer = getElementsByXPath("//div[contains(@class, 'grid') and contains(@class, 'w-fit')]")[0];
            if (!itemContainer) {
                console.error("Item container not found");
                sendResponse({ error: "Item container not found" });
                return;
            }

            // 2. 개별 아이템 탐색
            const items = getElementsByXPath(".//div[contains(@class, 'bg-[#111212]') and contains(@class, 'border-2')]", itemContainer);
            console.log(`Found ${items.length} items`);

            // 3. 각 아이템의 가격 추출
            items.forEach((item, index) => {
                const priceElement = getElementsByXPath(".//span[contains(@class, 'font-pt-serif') and contains(@class, 'text-yellow-200')]", item)[0];
                if (priceElement) {
                    console.log(`Raw price text for Item ${index + 1}:`, priceElement.textContent);

                    // small 태그 제거
                    const smallElement = priceElement.querySelector("small");
                    if (smallElement) {
                        console.log(`Small element found for Item ${index + 1}, removing:`, smallElement.textContent);
                        smallElement.remove(); // `small` 태그 제거
                    }

                    // 숫자만 추출
                    let priceText = priceElement.textContent || "";
                    priceText = priceText.replace(/[^\d]/g, ""); // 숫자만 남김
                    const price = parseInt(priceText, 10);
                    console.log(`Processed price for Item ${index + 1}:`, price);

                    prices.push(price);
                } else {
                    console.log(`No price element found for Item ${index + 1}`);
                }
            });

            // 4. 합계 및 평균 계산
            const total = prices.reduce((sum, price) => sum + price, 0);
            const average = prices.length ? Math.floor(total / prices.length) : 0; // 소수점 제거


            console.log("Total:", total);
            console.log("Average:", average);

            sendResponse({ total, average, prices });
        } catch (error) {
            console.error("Error extracting data:", error);
            sendResponse({ error: "Error extracting data" });
        }
    }

    // 응답을 비동기로 처리
    return true;
});
