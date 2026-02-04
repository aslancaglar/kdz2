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
    return categories
      .filter(cat => cat.active !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  },
});

export const getToppingsForMenuItem = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    // Get assignments and sort them by displayOrder
    const assignments = await ctx.db
      .query("menuItemToppings")
      .withIndex("by_menu_item", (q) => q.eq("menuItemId", args.menuItemId))
      .collect();

    const sortedAssignments = assignments.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    const categoryIds = sortedAssignments.map((a) => a.toppingCategoryId);

    const allCategories = await ctx.db.query("toppingCategories").collect();

    const categoriesWithToppings = await Promise.all(
      categoryIds.map(async (categoryId) => {
        const category = allCategories.find((c) => c.categoryId === categoryId);
        if (!category || category.active === false) return null;

        const toppings = await ctx.db
          .query("toppings")
          .withIndex("by_category", (q) => q.eq("categoryId", category.categoryId))
          .collect();

        const activeToppings = toppings
          .filter(t => t.active !== false)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
          .map((t) => ({
            id: t.toppingId,
            name: t.name,
            price: t.price,
          }));

        if (activeToppings.length === 0) return null;

        return {
          id: category.categoryId,
          name: category.name,
          minSelection: category.minSelection,
          maxSelection: category.maxSelection,
          toppings: activeToppings,
        };
      })
    );

    return categoriesWithToppings.filter((c): c is NonNullable<typeof c> => c !== null);
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
