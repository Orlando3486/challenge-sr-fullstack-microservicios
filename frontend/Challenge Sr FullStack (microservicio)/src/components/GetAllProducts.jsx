import { useState } from "react";
import { getProducts } from "../api/productApi";

export default function GetProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    setLoading(true);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      err.message || "Error al registrarse";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Lista de Productos</h2>

      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Cargando..." : "Buscar"}
      </button>

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
