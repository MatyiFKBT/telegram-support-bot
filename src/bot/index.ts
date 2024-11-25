import { CommandGroup } from "@grammyjs/commands";
import { Bot, GrammyError, HttpError, session } from "grammy";
import { getBotToken } from "~/utils/token.ts";
import { DenoKVAdapter } from "@grammyjs/denoKV";
import { ContextWithSession, kv } from "~/utils/kv.ts";

export const bot = new Bot<ContextWithSession>((await getBotToken()) as string);
bot.use(session({
  storage: new DenoKVAdapter(kv),
  initial: () => ({ supportGroupID: 0, supportGroupName: "" }),
  getSessionKey: (ctx) => {
    return "main";
  },
}));
const myCommands = new CommandGroup<ContextWithSession>();
bot.command("start", (ctx) => {
  if (ctx.match.startsWith("setup-group-")) {
    const [, , chatId, messageId] = ctx.match.split("-");
    console.log(chatId, messageId);
    ctx.session.supportGroupID = ctx.chat.id;
    ctx.session.supportGroupName = ctx.chat.title as string;
    ctx.reply("Group connected");
    bot.api.editMessageText(
      chatId,
      parseInt(messageId),
      `
👤 Username: ${ctx.me.username}

⚙️ Current group: ${
        ctx.session.supportGroupID === 0
          ? "<not set>"
          : ctx.session.supportGroupName
      }
      `,
    );
    ctx.react("🫡");
  } else {
    ctx.react("👀");
  }
});
myCommands.command("version", "Show the bot version", (ctx) => {
  ctx.reply(Deno.env.get("DENO_DEPLOYMENT_ID") as string);
});

myCommands.command("setup", "See/update settings", async (ctx) => {
  const msg = await ctx.reply(
    `
👤 Username: ${ctx.me.username}

⚙️ Current group: ${
      ctx.session.supportGroupID === 0
        ? "<not set>"
        : ctx.session.supportGroupName
    }
`,
  );
  bot.api.editMessageReplyMarkup(msg.chat.id, msg.message_id, {
    reply_markup: {
      inline_keyboard: [[
        {
          text: "Update connected group",
          url:
            `https://t.me/${bot.botInfo.username}?startgroup=setup-group-${msg.chat.id}-${msg.message_id}`,
        },
      ]],
    },
  });
});
bot.on("callback_query:data", (ctx) => {
  console.log(ctx.callbackQuery.data);
});

// await myCommands.setCommands(bot);
bot.use(myCommands);

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});
