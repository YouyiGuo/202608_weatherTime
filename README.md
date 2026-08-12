# 作業 4：整合天氣與時間工具

本作業參考 `AI AGENT LOCAL/ai-agent-js-v2-2.5-tool-calling-current-time` 的 Function Calling 寫法，整合課程中的天氣工具與時間工具，建立一個可以回答「現在時間」與「天氣狀況」的互動式助理。

## 實作內容

- `src/tools/weather.js`：天氣工具，呼叫 OpenWeather API 查詢指定城市即時天氣
- `src/tools/current_time.js`：時間工具，回傳台灣目前時間
- `src/tools/index.js`：工具註冊中心
- `src/utils/func-tool.js`：將本地工具轉成 OpenAI Responses API 可用的 tool schema
- `src/chat-manager.js`：聊天管理程式，處理對話迴圈與 Function Calling
- `src/main.js`：主程式

## 執行方式

```bash
npm install
npm start
```

`.env` 需設定：

```bash
OPENAI_API_KEY=你的 OpenAI API Key
OPENWEATHER_API_KEY=你的 OpenWeather API Key
```

輸入 `exit` 可結束對話。

## 測試問題

1. `現在幾點？`
   - 預期：AI 呼叫 `get_current_time`

2. `台北天氣如何？`
   - 預期：AI 呼叫 `get_weather`

3. `現在幾點？台北天氣好嗎？`
   - 預期：AI 同一輪回答中呼叫 `get_current_time` 與 `get_weather`，並整合回答

## 截圖證明方式

程式會在呼叫工具時輸出：

```text
[呼叫 tool] get_current_time({})
[tool 結果] "2026/8/12 下午..."

[呼叫 tool] get_weather({"city":"Taipei"})
[tool 結果] {"city":"Taipei","temperature":...,"humidity":...,"description":"..."}
```

截圖中只要看到 `[呼叫 tool]`、`[tool 結果]` 與 AI 最後整合回答，即可證明工具有被正確呼叫。

## 實際測試結果

目前尚未填入實際 API 執行結果。設定 `.env` 後執行 `npm start`，將以下 3 題的終端輸出截圖或貼上文字即可。

### 測試 1：現在幾點？

待執行後填入。

### 測試 2：台北天氣如何？

待執行後填入。

### 測試 3：現在幾點？台北天氣好嗎？

待執行後填入。

## 與作業 4 驗收標準對照

- 兩個工具都能正確呼叫：已註冊 `get_current_time` 與 `get_weather`
- AI 能根據問題選擇正確工具：system prompt 已說明時間問題呼叫時間工具、天氣問題呼叫天氣工具
- 一次問兩個問題時能呼叫兩個工具並整合回答：主程式支援同一輪多個 `function_call`
