import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createOrder = mutation({
  args: {
    items: v.array(v.object({
      menuItemId: v.string(),
      name: v.string(),
      price: v.number(),
      selectedSize: v.optional(v.union(
        v.literal("normal"),
        v.literal("avec-frites"),
        v.literal("menu")
      )),
      selectedToppings: v.optional(v.array(v.object({
        categoryId: v.string(),
        toppingIds: v.array(v.string()),
      }))),
      finalPrice: v.number(),
    })),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      items: args.items,
      totalPrice: args.totalPrice,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return orderId;
  },
});

export const addItemToOrder = mutation({
  args: {
    orderId: v.id("orders"),
    item: v.object({
      menuItemId: v.string(),
      name: v.string(),
      price: v.number(),
      selectedSize: v.optional(v.union(
        v.literal("normal"),
        v.literal("avec-frites"),
        v.literal("menu")
      )),
      selectedToppings: v.optional(v.array(v.object({
        categoryId: v.string(),
        toppingIds: v.array(v.string()),
      }))),
      finalPrice: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updatedItems = [...order.items, args.item];
    const newTotal = updatedItems.reduce((sum, item) => sum + item.finalPrice, 0);

    await ctx.db.patch(args.orderId, {
      items: updatedItems,
      totalPrice: newTotal,
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});

export const removeItemFromOrder = mutation({
  args: {
    orderId: v.id("orders"),
    itemIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const updatedItems = order.items.filter((_, index) => index !== args.itemIndex);
    const newTotal = updatedItems.reduce((sum, item) => sum + item.finalPrice, 0);

    await ctx.db.patch(args.orderId, {
      items: updatedItems,
      totalPrice: newTotal,
      updatedAt: Date.now(),
    });

    return args.orderId;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return args.orderId;
  },
});

export const clearOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      items: [],
      totalPrice: 0,
      updatedAt: Date.now(),
    });
    return args.orderId;
  },
});

export const deleteOrder = mutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.orderId);
  },
});
