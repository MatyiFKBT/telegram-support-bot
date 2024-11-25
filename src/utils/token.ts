import { parse } from "@std/yaml";
export async function getBotToken(): Promise<string | undefined> {
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
