import { NextResponse } from "next/server";
import { productsData } from "@/lib/products-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const category = searchParams.get("category");

  let result = productsData;

  if (id) {
    result = productsData.filter((p) => p.id === id);
  } else if (category) {
    result = productsData.filter((p) => p.category.toLowerCase().replace(/\s+/g, "-") === category.toLowerCase());
  }

  const apiProducts = result.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description,
    price: {
      code: { amount: p.pricing.code, currency: p.pricing.currency },
      ...(p.pricing.setup ? { setup: { amount: p.pricing.setup, currency: p.pricing.currency } } : {}),
    },
    features: p.features.map((f) => f.title),
    deliveryTime: p.deliveryTime,
    contact: p.contact,
    url: `https://denyskot.com/products/${p.id}`,
  }));

  return NextResponse.json({
    provider: "Finekot — AI Systems",
    website: "https://denyskot.com",
    contact: "https://t.me/shop_by_finekot_bot",
    totalProducts: productsData.length,
    products: apiProducts,
  }, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
    },
  });
}
