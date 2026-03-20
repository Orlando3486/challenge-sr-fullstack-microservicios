import React, { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts();
        // ✅ Asegurate que sea array aunque venga vacío
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        // ✅ Si no hay productos, simplemente mostrá lista vacía
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // ✅ Mostrá los campos reales del producto
  return (
    <div>
      <h2>Lista de Productos</h2>
      {products.length === 0 ? (
        <p>No hay productos aún</p>
      ) : (
        <ul>
          {products.map((p) => (
            <li key={p.id}>
              <strong>
                #{p.id} — {p.title ?? "Sin título"}
              </strong>
              <br />
              Categoría: {p.category?.name ?? `ID ${p.categoryId}`} — Activo:{" "}
              {p.isActive ? "✅ Sí" : "❌ No"} — Descripción:{" "}
              {p.description ?? "Sin descripción"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
