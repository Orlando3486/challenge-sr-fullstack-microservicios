import { getToken } from "./authApi";

export async function getProducts() {
  const res = await fetch(
    `https://nestjs-ecommerce-api-deh5.onrender.com/product/products`
  );
  if (!res.ok) throw new Error("Error al obtener productos");
  const response = await res.json();
  return response.data;
}

export async function getProduct(id) {
  if (!id) throw new Error("ID requerido");
  const res = await fetch(
    `https://nestjs-ecommerce-api-deh5.onrender.com/${id}`
  );
  if (!res.ok) throw new Error("Producto no encontrado");
  const response = await res.json();
  return response.data;
}

export async function createProduct(categoryId) {
  const res = await fetch(`https://nestjs-ecommerce-api-deh5.onrender.com`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ categoryId }),
  });

  const response = await res.json();
  if (!res.ok)
    throw new Error(response.message || "Error al crear el producto");
  return response.data;
}

export async function addProductDetails(productId, details) {
  const res = await fetch(
    `https://nestjs-ecommerce-api-deh5.onrender.com/product/${productId}/details`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(details),
    }
  );
  if (!res.ok) throw new Error("Error al agregar detalles");
  const response = await res.json();
  return response.data;
}
