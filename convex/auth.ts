import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAdmin = mutation({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existing) {
      throw new Error("Admin user already exists");
    }

    const passwordHash = await hashPassword(args.password);

    const adminId = await ctx.db.insert("adminUsers", {
      username: args.username,
      passwordHash,
      createdAt: Date.now(),
    });

    return adminId;
  },
});

export const verifyAdmin = query({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("adminUsers")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!admin) {
      return null;
    }

    const isValid = await verifyPassword(args.password, admin.passwordHash);

    if (isValid) {
      return {
        id: admin._id,
        username: admin.username,
      };
    }

    return null;
  },
});

export const signupUser = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      phone: args.phone,
      street: args.street,
      city: args.city,
      zipCode: args.zipCode,
      passwordHash,
      createdAt: Date.now(),
    });

    return {
      id: userId,
      firstName: args.firstName,
      lastName: args.lastName,
      email: args.email,
      street: args.street,
      city: args.city,
      zipCode: args.zipCode
    };
  },
});

export const verifyUser = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      return null;
    }

    const isValid = await verifyPassword(args.password, user.passwordHash);

    if (isValid) {
      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        street: user.street,
        city: user.city,
        zipCode: user.zipCode
      };
    }

    return null;
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db
      .query("users")
      .order("desc")
      .collect();

    // Fetch order counts for each user
    const usersWithOrderCounts = await Promise.all(
      users.map(async (user) => {
        const orderCount = (await ctx.db
          .query("orders")
          .filter((q) => q.eq(q.field("userId"), user._id))
          .collect()).length;
        return { ...user, orderCount };
      })
    );

    return usersWithOrderCounts;
  },
});

export const listUserOrders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

export const updateUser = mutation({
  args: {
    id: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    street: v.optional(v.string()),
    city: v.optional(v.string()),
    zipCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const removeUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}
