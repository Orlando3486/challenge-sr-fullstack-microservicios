import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProducts();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return <p>Cargando productos...</p>;
  }

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
              Marca: {p.details?.brand ?? "Desconocida"} — Categoría:{" "}
              {p.details?.category ?? `ID ${p.categoryId}`} — Activo:{" "}
              {p.isActive ? "Sí" : "No"}
              <br />
              Descripción: {p.description ?? "Sin descripción"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
