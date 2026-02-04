import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { resolveImageUrl, resolveItemsWithImages } from "./lib/storage";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    const sortedItems = items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const itemsWithImages = await resolveItemsWithImages(ctx, sortedItems);

    // Add topping category IDs for each item (sorted by display order)
    const itemsWithToppings = await Promise.all(
      itemsWithImages.map(async (item) => {
        const assignments = await ctx.db
          .query("menuItemToppings")
          .withIndex("by_menu_item", (q) => q.eq("menuItemId", item._id))
          .collect();
        // Sort by display order
        const sorted = assignments.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
        return {
          ...item,
          toppingCategoryIds: sorted.map((a) => a.toppingCategoryId),
        };
      })
    );

    return itemsWithToppings;
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    const sortedItems = items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return resolveItemsWithImages(ctx, sortedItems);
  },
});

export const get = query({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    return {
      ...item,
      image: await resolveImageUrl(ctx, item),
    };
  },
});

export const getPopularItems = query({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("menuItems").collect();
    const popularItems = allItems.filter((item) => item.popular === true);
    return resolveItemsWithImages(ctx, popularItems);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    priceWithFries: v.optional(v.number()),
    priceMenu: v.optional(v.number()),
    image: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    category: v.string(),
    popular: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const itemId = await ctx.db.insert("menuItems", {
      name: args.name,
      description: args.description,
      price: args.price,
      priceWithFries: args.priceWithFries,
      priceMenu: args.priceMenu,
      image: args.image,
      imageStorageId: args.imageStorageId,
      category: args.category,
      popular: args.popular ?? false,
      displayOrder: args.displayOrder ?? 0,
      active: args.active ?? true,
    });
    return itemId;
  },
});

export const update = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    priceWithFries: v.optional(v.number()),
    priceMenu: v.optional(v.number()),
    image: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    category: v.string(),
    popular: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the existing item to check if we need to delete the old image
    const existingItem = await ctx.db.get(args.id);

    // If there's a new storage ID and it's different from the old one, delete the old image
    if (existingItem?.imageStorageId &&
      args.imageStorageId &&
      existingItem.imageStorageId !== args.imageStorageId) {
      await ctx.storage.delete(existingItem.imageStorageId);
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      price: args.price,
      priceWithFries: args.priceWithFries,
      priceMenu: args.priceMenu,
      image: args.image,
      imageStorageId: args.imageStorageId,
      category: args.category,
      popular: args.popular,
      displayOrder: args.displayOrder,
      active: args.active,
    });
    return args.id;
  },
});

export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    // Get the item first to clean up its image
    const item = await ctx.db.get(args.id);
    if (item?.imageStorageId) {
      await ctx.storage.delete(item.imageStorageId);
    }
    await ctx.db.delete(args.id);
  },
});

export const updateDisplayOrder = mutation({
  args: {
    id: v.id("menuItems"),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      displayOrder: args.displayOrder,
    });
    return args.id;
  },
});
