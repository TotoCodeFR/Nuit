import banCommandDetails from "./ban";
import unbanCommandDetails from "./unban";
import kickCommandDetails from "./kick";
import type { ModuleContext } from "@nuit-bot/api";

export async function setup(ctx: ModuleContext) {
    await ctx.api.registerCommand(banCommandDetails);

    await ctx.api.registerCommand(unbanCommandDetails);

    await ctx.api.registerCommand(kickCommandDetails);
}
