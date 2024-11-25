import {Application} from '@oak/oak';
import {Bot, webhookCallback} from 'https://deno.land/x/grammy@v1.32.0/mod.ts';

const app = new Application(); // or whatever you're using
async function getBotToken(): Promise<string | undefined> {
  const envToken = Deno.env.get('BOT_TOKEN');
  if (envToken) return envToken;

  try {
    const configFile = await readFileStr('config/config.yaml');
    const config = parse(configFile) as Record<string, unknown>;
    return config.bot_token as string;
  } catch {
    return undefined;
  }
}
const bot = new Bot(await getBotToken() as string);
bot.on('message', async (ctx) => {
  console.log(ctx.message);
  await ctx.reply('Hello World!');
});

bot.api.setWebhook(`https://${Deno.env.get('DENO_DEPLOYMENT_ID')}.deno.dev`);

// Make sure to specify the framework you use.
app.use(webhookCallback(bot, 'oak'));
app.listen({port: 8000});
