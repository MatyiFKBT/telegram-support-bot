import { Context, SessionFlavor } from "grammy";
import { CommandsFlavor } from "@grammyjs/commands";
export const kv = await Deno.openKv();

interface SessionData {
  supportGroupID: number;
  supportGroupName: string;
}

export type ContextWithSession =
  & Context
  & CommandsFlavor
  & SessionFlavor<SessionData>;
