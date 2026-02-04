
import { api } from "./convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);

async function checkData() {
    console.log("Checking Categories...");
    const categories = await client.query(api.queries.getMenuCategories);
    console.log("Categories:", JSON.stringify(categories, null, 2));

    console.log("\nChecking Menu Items...");
    const items = await client.query(api.queries.getMenuItems);
    console.log("Total Items:", items.length);

    if (items.length > 0) {
        console.log("First Item:", JSON.stringify(items[0], null, 2));

        // Check for category mismatches
        if (categories && categories.length > 0) {
            const categorySlugs = new Set(categories.map(c => c.slug));
            const mismatchedItems = items.filter(i => !categorySlugs.has(i.category));

            if (mismatchedItems.length > 0) {
                console.log("\nWARNING: Found items with categories that don't exist in menuCategories:");
                mismatchedItems.forEach(i => console.log(`- ${i.name} (Category: ${i.category})`));
            } else {
                console.log("\nAll items map to valid categories.");
            }
        }
    } else {
        console.log("No menu items found!");
    }
}

checkData().catch(console.error);
