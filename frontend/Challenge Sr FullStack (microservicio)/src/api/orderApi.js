import { getToken } from "./authApi";

const API = "https://nestjs-ecommerce-api-deh5.onrender.com";

export async function createOrder(products) {
  const res = await fetch(`${API}/order/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ products }),
  });

  const response = await res.json();

  if (!res.ok) throw new Error(response.message || "Error al crear la orden");

  return response.data;
}

export async function getInventory(variationId, countryCode) {
  const res = await fetch(
    `${API}/order/inventory/${variationId}/${countryCode}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );

  const response = await res.json();
  if (!res.ok)
    throw new Error(response.message || "Error al obtener inventario");

  return response.data;
}

export async function getInventoryByProduct(productId) {
  const res = await fetch(`${API}/order/inventory/product/${productId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) throw new Error("Error al obtener inventario del producto");
  const response = await res.json();
  return response.data;
}
