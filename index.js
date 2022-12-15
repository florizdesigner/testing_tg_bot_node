const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const cors = require("cors");

const TOKEN = "5822032611:AAFBU63FJPNoFxf5TdTzRHcgrzlTJ3T6yGw";
const webAppUrl = "https://gentle-zabaione-d86ed4.netlify.app";

const bot = new TelegramBot(TOKEN, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
  const { id } = msg.chat;
  const text = msg.text;

  if (text === "/start") {
    await bot.sendMessage(id, "Ниже появится кнопка, заполни форму", {
      reply_markup: {
        keyboard: [
          [{ text: "Заполнить форму", web_app: { url: webAppUrl + "/form" } }],
        ],
      },
    });

    await bot.sendMessage(id, "Заходи в интернет-магазин", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Сделать заказ", web_app: { url: webAppUrl } }],
        ],
      },
    });
  }
  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg?.web_app_data?.data);

      await bot.sendMessage(id, "Thanks for feedback!");
      await bot.sendMessage(id, `Your country: ${data?.country}`);
      await bot.sendMessage(id, `Your city: ${data?.city}`);

      setTimeout(async () => {
        await bot.sendMessage(
          id,
          "Готово, всю информацию вы получите в этом чате!"
        );
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  }
});

const PORT = 8000;

app.post("/", async (req, res) => {
  const { queryId, products, totalPrice } = req.body;

  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Successful purchase",
      input_message_content: {
        message_text:
          "Поздравляем с покупкой, вы приобрели товар на сумму: " + totalPrice,
      },
    });
    return res.status(200);
  } catch (e) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Не удалось приобрести товар :(",
      input_message_content: {
        message_text: "Не удалось приобрести товар :(",
      },
    });
    return res.status(500).json({});
  }
});

app.listen(PORT, () => console.log("Сервер запустился!"));
