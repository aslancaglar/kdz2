import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  adminUsers: defineTable({
    username: v.string(),
    passwordHash: v.string(),
    createdAt: v.number(),
  }).index("by_username", ["username"]),

  menuCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    displayOrder: v.number(),
    active: v.boolean(),
  }).index("by_slug", ["slug"])
    .index("by_display_order", ["displayOrder"]),

  menuItems: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    price: v.number(),
    priceWithFries: v.optional(v.number()),
    priceMenu: v.optional(v.number()),
    image: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    categories: v.array(v.string()),
    popular: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  }).index("by_display_order", ["displayOrder"]),

  toppingCategories: defineTable({
    categoryId: v.string(),
    name: v.string(),
    minSelection: v.number(),
    maxSelection: v.optional(v.number()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  }).index("by_display_order", ["displayOrder"]),

  toppings: defineTable({
    toppingId: v.string(),
    name: v.string(),
    price: v.optional(v.number()),
    categoryId: v.string(),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  }).index("by_category", ["categoryId"])
    .index("by_display_order", ["displayOrder"]),

  menuItemToppings: defineTable({
    menuItemId: v.id("menuItems"),
    toppingCategoryId: v.string(),
    displayOrder: v.optional(v.number()),
  }).index("by_menu_item", ["menuItemId"]),

  restaurantInfo: defineTable({
    key: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    hours: v.optional(v.array(v.object({
      day: v.string(),
      time: v.string(),
    }))),
    socialLinks: v.optional(v.object({
      facebook: v.optional(v.string()),
      instagram: v.optional(v.string()),
      twitter: v.optional(v.string()),
    })),
  }).index("by_key", ["key"]),

  orders: defineTable({
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
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  reviews: defineTable({
    name: v.string(),
    rating: v.number(),
    comment: v.string(),
    date: v.string(),
    active: v.boolean(),
  }).index("by_active", ["active"]),

  gallery: defineTable({
    title: v.string(),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    displayOrder: v.optional(v.number()),
    active: v.boolean(),
  }).index("by_active", ["active"])
    .index("by_display_order", ["displayOrder"]),
});
