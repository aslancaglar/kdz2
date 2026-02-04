import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("menuCategories")
      .order("asc")
      .collect();
    return categories.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("menuCategories")
      .filter((q) => q.eq(q.field("active"), true))
      .collect();
    return categories.sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const get = query({
  args: { id: v.id("menuCategories") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    displayOrder: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("menuCategories", {
      name: args.name,
      slug: args.slug,
      displayOrder: args.displayOrder,
      active: args.active,
    });
    return categoryId;
  },
});

export const update = mutation({
  args: {
    id: v.id("menuCategories"),
    name: v.string(),
    slug: v.string(),
    displayOrder: v.number(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      slug: args.slug,
      displayOrder: args.displayOrder,
      active: args.active,
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("menuCategories") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const updateDisplayOrder = mutation({
  args: {
    id: v.id("menuCategories"),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      displayOrder: args.displayOrder,
    });
    return args.id;
  },
});
