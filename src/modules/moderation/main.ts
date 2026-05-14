import banCommandDetails from "./ban";
import type { ModuleContext } from "@nuit-bot/api";

export async function setup(ctx: ModuleContext) {
    await ctx.api.registerCommand(banCommandDetails);
}
