import { query } from "./_generated/server";

export const listGalleryDebug = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("gallery").collect();
    },
});
