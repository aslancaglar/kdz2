import { query } from "./_generated/server";
import { v } from "convex/values";
import { resolveItemsWithImages } from "./lib/storage";

// Re-export menu item queries from menuItems.ts for backwards compatibility
// Note: Prefer using api.menuItems.* directly in new code
export { list as getMenuItems, listByCategory as getMenuItemsByCategory, getPopularItems } from "./menuItems";

export const getToppingCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("toppingCategories").collect();

    const categoriesWithToppings = await Promise.all(
      categories.map(async (category) => {
        const toppings = await ctx.db
          .query("toppings")
          .withIndex("by_category", (q) => q.eq("categoryId", category.categoryId))
          .collect();

        return {
          id: category.categoryId,
          name: category.name,
          minSelection: category.minSelection,
          maxSelection: category.maxSelection,
          toppings: toppings.map((t) => ({
            id: t.toppingId,
            name: t.name,
            price: t.price,
          })),
        };
      })
    );

    return categoriesWithToppings;
  },
});

export const getToppingsForMenuItem = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const assignments = await ctx.db
      .query("menuItemToppings")
      .withIndex("by_menu_item", (q) => q.eq("menuItemId", args.menuItemId))
      .collect();

    const categoryIds = assignments.map((a) => a.toppingCategoryId);

    const categories = await ctx.db.query("toppingCategories").collect();
    const relevantCategories = categories.filter((c) =>
      categoryIds.includes(c.categoryId)
    );

    const categoriesWithToppings = await Promise.all(
      relevantCategories.map(async (category) => {
        const toppings = await ctx.db
          .query("toppings")
          .withIndex("by_category", (q) => q.eq("categoryId", category.categoryId))
          .collect();

        return {
          id: category.categoryId,
          name: category.name,
          minSelection: category.minSelection,
          maxSelection: category.maxSelection,
          toppings: toppings.map((t) => ({
            id: t.toppingId,
            name: t.name,
            price: t.price,
          })),
        };
      })
    );

    return categoriesWithToppings;
  },
});

export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

export const getMenuCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("menuCategories").collect();
    return categories
      .filter(cat => cat.active)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  },
});
