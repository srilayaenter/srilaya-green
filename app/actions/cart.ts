"use server";

import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addToCart(variantId: string, quantity: number = 1) {
  try {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) return { success: false, error: "Product variant not found" };
    if (variant.stock < quantity) return { success: false, error: "Insufficient stock" };

    const cookieStore = await cookies();
    let cartId = cookieStore.get("cartId")?.value;

    if (!cartId) {
      const newCart = await prisma.cart.create({ data: {} });
      cartId = newCart.id;
      cookieStore.set("cartId", cartId!, {
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        path: "/",
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId, variantId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId,
          variantId,
          quantity,
          price: variant.price,
          gstRate: variant.product.gstRate,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    console.error("addToCart server action error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  try {
    if (quantity < 1) return { success: false, error: "Quantity must be at least 1" };

    const item = await prisma.cartItem.findUnique({ where: { id: cartItemId }, include: { variant: true } });
    if (!item) return { success: false, error: "Cart item not found" };
    if (item.variant.stock < quantity) return { success: false, error: "Insufficient stock" };

    await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    console.error("updateCartItemQuantity error:", error);
    return { success: false, error: error.message };
  }
}

export async function removeCartItem(cartItemId: string) {
  try {
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    console.error("removeCartItem error:", error);
    return { success: false, error: error.message };
  }
}
