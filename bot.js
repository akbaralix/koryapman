import express from "express";
import TelegramBot from "node-telegram-bot-api";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const TOKEN = "8201270787:AAELpFwtJ7IYefjAIUtxEv39kyuU-jcbo2Y";
const bot = new TelegramBot(TOKEN, { polling: true });

const buttons = {
  reply_markup: {
    keyboard: [[{ text: "📸 Rasm olish" }, { text: "🆘 Yordam" }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const receivedText = msg.text;

  if (receivedText === "/start") {
    bot.sendMessage(
      chatId,
      `Salom ${msg.from.first_name}! Botga xush kelibsiz!\n\nBotdan foydalanish uchun tugmalardan birini bosing.`,
      buttons
    );
  }

  if (receivedText === "📸 Rasm olish") {
    const url = `http://localhost:${PORT}/selfie/${chatId}`;
    bot.sendMessage(chatId, `Rasm olish uchun shu havolani bosing:\n${url}`);
  }
});

app.get("/selfie/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "selfie.html"));
});

app.listen(PORT, () => {
  console.log(`Server ishga tushdi: http://localhost:${PORT}`);
});
