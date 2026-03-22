import React, { useState } from "react";
import { getProduct } from "../api/productApi";

export default function GetProduct() {
  const [id, setId] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await getProduct(id);
      setProduct(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Producto no encontrado");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Buscar Producto Por Id</h2>
      <input
        type="text"
        placeholder="ID del producto"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? "Cargando..." : "Buscar"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {product && (
        <div>
          <h3>
            #{product.id} — {product.title ?? "Sin título"}
          </h3>

          <p>Código: {product.code ?? "N/A"}</p>

          <p>Categoría: {product.categoryId === 1 ? "Computers" : "Fashion"}</p>

          <p>Descripción: {product.description ?? "Sin descripción"}</p>

          <p>Variación: {product.variationType ?? "Sin variación"}</p>

          <p>Activo: {product.isActive ? "Sí" : "No"}</p>

          {product.about && product.about.length > 0 && (
            <div>
              <h4>Características</h4>
              <ul>
                {product.about.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {product.details && (
            <div>
              <h4>Detalles técnicos</h4>
              <p>Marca: {product.details.brand ?? "N/A"}</p>
              <p>Serie: {product.details.series ?? "N/A"}</p>
              <p>
                Capacidad: {product.details.capacity ?? "-"}{" "}
                {product.details.capacityUnit ?? ""}{" "}
                {product.details.capacityType ?? ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
