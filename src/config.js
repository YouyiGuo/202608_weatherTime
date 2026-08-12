import "dotenv/config";

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("缺少 OPENAI_API_KEY，請先建立 .env 檔案。");
}
