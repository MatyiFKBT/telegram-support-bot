import { Application, Router } from "@oak/oak";
import { webhookCallback } from "grammy";
import { bot } from "~/bot/index.ts";
import { cors } from "@momiji/cors";

const app = new Application();

app.use(cors());

const router = new Router();
router.get("/", async (ctx) => {
  // redirect to the repo when someone visits the root
  ctx.response.redirect("https://github.com/matyifkbt/telegram-support-bot");
});

router.post("/webhook", webhookCallback(bot, "oak"));
app.use(router.routes());
app.use(router.allowedMethods());

const webhook = await bot.api.getWebhookInfo();
if (webhook.url == `https://telegram-support-bot.deno.dev/webhook`) {
  console.log("Webhook is already set");
} else {
  console.log("Setting webhook");
  bot.api.setWebhook(`https://telegram-support-bot.deno.dev/webhook`, {
    drop_pending_updates: true,
    allowed_updates: [],
  });
  console.log("Webhook set");
}

app.listen({ port: 8000 });
