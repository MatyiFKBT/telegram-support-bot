import { bot } from "~/bot/index.ts";

await bot.api.deleteWebhook();

bot.start();
