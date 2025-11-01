import express from "express";
import TelegramBot from "node-telegram-bot-api";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Bot token
const TOKEN = "8201270787:AAELpFwtJ7IYefjAIUtxEv39kyuU-jcbo2Y";
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
      `📷 Rasm olish uchun quyidagi havolani bosing:\n${url}`
    );
  }
});

// Selfie sahifa
app.get("/selfie/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: ${BASE_URL} (PORT: ${PORT})`);
});

