import { input } from "@inquirer/prompts";
import { client, DEFAULT_MODEL } from "./lib/openai.js";
import * as allTools from "./tools/index.js";
import { toOpenAITool } from "./utils/func-tool.js";
import { spinner } from "./utils/spinner.js";

const systemPrompt = `
你是天氣與時間助理，請使用繁體中文回答。
當使用者詢問現在時間、幾點、日期或台灣時間時，必須呼叫 get_current_time 工具。
當使用者詢問天氣、溫度、濕度或某城市天氣狀況時，必須呼叫 get_weather 工具。
如果同一個問題同時包含時間與天氣，請在同一輪流程中呼叫兩個工具，再把結果整合成自然、簡潔的回答。
不要自行猜測即時時間或即時天氣。
`.trim();

const toolList = Object.values(allTools);
const tools = toolList.map(toOpenAITool);
const toolsByName = Object.fromEntries(toolList.map((tool) => [tool.name, tool]));
const MAX_TOOL_ROUNDS = 8;

export class ChatManager {
  constructor() {
    this.history = [{ role: "developer", content: systemPrompt }];
  }

  async start() {
    try {
      while (true) {
        const userQuestion = (await input({ message: "請輸入你的問題：" })).trim();

        if (userQuestion === "") continue;
        if (userQuestion.toLowerCase() === "exit") {
          console.log("再會。");
          break;
        }

        this.history.push({ role: "user", content: userQuestion });
        await this.respond();
      }
    } catch (err) {
      if (err.name === "ExitPromptError") {
        console.log("\n再會。");
      } else {
        throw err;
      }
    }
  }

  async respond() {
    for (let round = 1; round <= MAX_TOOL_ROUNDS; round += 1) {
      const spin = spinner("思考中...").start();

      const response = await client.responses.create({
        model: DEFAULT_MODEL,
        input: this.history,
        tools,
        tool_choice: "auto",
      });

      spin.stop();
      this.history.push(...response.output);

      const functionCalls = response.output.filter(
        (item) => item.type === "function_call",
      );

      if (functionCalls.length === 0) {
        console.log(response.output_text);
        return;
      }

      for (const functionCall of functionCalls) {
        const fnName = functionCall.name;
        const tool = toolsByName[fnName];
        if (!tool) {
          throw new Error(`模型要求了未註冊的工具：${fnName}`);
        }

        const args = tool.parameters.parse(JSON.parse(functionCall.arguments));
        console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

        const result = await tool.fn(args);
        console.log(`[tool 結果] ${JSON.stringify(result)}`);

        this.history.push({
          type: "function_call_output",
          call_id: functionCall.call_id,
          output: JSON.stringify(result),
        });
      }
    }

    throw new Error(`Tool calling 超過 ${MAX_TOOL_ROUNDS} 輪，已停止執行`);
  }
}
