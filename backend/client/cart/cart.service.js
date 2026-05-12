import prisma from "../../core/config/db.js";
import { ApiError } from "../../core/utils/ApiError.js";

const getOrCreateCart = async (clientId) => {
  let cart = await prisma.cart.findUnique({
    where: { clientId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { clientId },
    });
  }

  return cart;
};

export const getCart = async (userId) => {
  const client = await prisma.clientProfile.findUnique({
    where: { userId },
  });
  if (!client) throw new ApiError(404, "العميل غير موجود");

  const cart = await prisma.cart.findUnique({
    where: { clientId: client.id },
    include: {
      items: {
        include: {
          service: {
            select: {
              id: true,
              nameAr: true,
              name: true,
              category: true,
              isActive: true,
            },
          },
        },
      },
    },
  });

  if (!cart) return { items: [], total: 0 };

  return {
    id: cart.id,
    items: cart.items.map((i) => ({
      id: i.id,
      service: i.service,
    })),
    total: cart.items.length,
  };
};

export const addToCart = async (userId, serviceId) => {
  const client = await prisma.clientProfile.findUnique({
    where: { userId },
  });
  if (!client) throw new ApiError(404, "العميل غير موجود");

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });
  if (!service || !service.isActive) {
    throw new ApiError(404, "الخدمة غير موجودة أو غير متاحة");
  }

  const cart = await getOrCreateCart(client.id);

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_serviceId: {
        cartId: cart.id,
        serviceId,
      },
    },
  });

  if (existing) {
    throw new ApiError(409, "الخدمة موجودة في السلة مسبقاً");
  }

  await prisma.cartItem.create({
    data: { cartId: cart.id, serviceId },
  });

  return getCart(userId);
};

export const removeFromCart = async (userId, serviceId) => {
  const client = await prisma.clientProfile.findUnique({
    where: { userId },
  });
  if (!client) throw new ApiError(404, "العميل غير موجود");

  const cart = await prisma.cart.findUnique({
    where: { clientId: client.id },
  });
  if (!cart) throw new ApiError(404, "السلة فارغة");

  const item = await prisma.cartItem.findUnique({
    where: {
      cartId_serviceId: {
        cartId: cart.id,
        serviceId,
      },
    },
  });
  if (!item) throw new ApiError(404, "الخدمة غير موجودة في السلة");

  await prisma.cartItem.delete({
    where: {
      cartId_serviceId: {
        cartId: cart.id,
        serviceId,
      },
    },
  });

  return getCart(userId);
};

export const clearCart = async (userId) => {
  const client = await prisma.clientProfile.findUnique({
    where: { userId },
  });
  if (!client) throw new ApiError(404, "العميل غير موجود");

  const cart = await prisma.cart.findUnique({
    where: { clientId: client.id },
  });
  if (!cart) return { items: [], total: 0 };

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return { items: [], total: 0 };
};
