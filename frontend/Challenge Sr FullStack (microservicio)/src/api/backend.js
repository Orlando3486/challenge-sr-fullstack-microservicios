// productApi.js
const API = "http://localhost:3000/product";

// Obtener un producto por ID
export async function getProduct(id) {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error("Error al obtener el producto");
  return res.json();
}

// Obtener todos los productos
export async function getProducts() {
  const res = await fetch(`${API}/products`);
  if (!res.ok) throw new Error("Error al obtener productos");
  return res.json();
}

// Crear un producto
export async function createProduct(product) {
  const res = await fetch(`${API}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!res.ok) throw new Error("Error al crear el producto");
  return res.json();
}
