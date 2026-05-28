import type { ModuleContext } from "@nuit-bot/api";

export async function setup(ctx: ModuleContext) {
    ctx.api.registerConfig([
        {
            type: "channel",
            optional: false,
            key: "ticketChannelCreateId",
        },
    ]);
}
