import banCommandDetails from "./ban";
import unbanCommandDetails from "./unban";
import type { ModuleContext } from "@nuit-bot/api";

export async function setup(ctx: ModuleContext) {
    await ctx.api.registerCommand(banCommandDetails);

    await ctx.api.registerCommand(unbanCommandDetails);
}
