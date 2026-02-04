import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("reviews").order("desc").collect();
    },
});

export const listActive = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("reviews")
            .withIndex("by_active", (q) => q.eq("active", true))
            .order("desc")
            .collect();
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        rating: v.number(),
        comment: v.string(),
        date: v.string(),
        active: v.boolean(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("reviews", args);
    },
});

export const update = mutation({
    args: {
        id: v.id("reviews"),
        active: v.optional(v.boolean()),
        name: v.optional(v.string()),
        rating: v.optional(v.number()),
        comment: v.optional(v.string()),
        date: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const remove = mutation({
    args: { id: v.id("reviews") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
