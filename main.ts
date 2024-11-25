import { Application, Router } from "@oak/oak";
import {
  Bot,
  webhookCallback,
} from "https://deno.land/x/grammy@v1.32.0/mod.ts";
import { CommandGroup } from "https://deno.land/x/grammy_commands@v1.0.0/mod.ts";
import { parse } from "@std/yaml";
import { oakCors } from "https://deno.land/x/cors/mod.ts";

const app = new Application();
app.use(oakCors());

async function getBotToken(): Promise<string | undefined> {
  const envToken = Deno.env.get("BOT_TOKEN");
  if (envToken) return envToken;

  try {
    const configFile = await Deno.readTextFile("config/config.yaml");
    const config = parse(configFile) as Record<string, unknown>;
    return config.bot_token as string;
  } catch (e) {
    return undefined;
  }
}

const bot = new Bot((await getBotToken()) as string);
const myCommands = new CommandGroup();
myCommands.command("start", "Start the bot", (ctx) => {
  ctx.react("✍");
});
myCommands.command("version", "Show the bot version", (ctx) => {
  ctx.reply(Deno.env.get("DENO_DEPLOYMENT_ID") as string);
});
await myCommands.setCommands(bot);
bot.use(myCommands);

const router = new Router();
router.get("/", async (ctx) => {
  // redirect to the repo when someone visits the root
  ctx.response.redirect("https://github.com/matyifkbt/telegram-support-bot");
});

router.post("/webhook", webhookCallback(bot, "oak"));
app.use(router.routes());
app.use(router.allowedMethods());

const webhook = await bot.api.getWebhookInfo();
if (
  webhook.url ==
    `https://telegram-support-bot.deno.dev/webhook`
) {
  console.log("Webhook is already set");
} else {
  console.log("Setting webhook");
  bot.api.setWebhook(
    `https://telegram-support-bot.deno.dev/webhook`,
    { drop_pending_updates: true, allowed_updates: [] },
  );
  console.log("Webhook set");
}

app.listen({ port: 8000 });
