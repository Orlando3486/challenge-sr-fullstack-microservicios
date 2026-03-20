import React, { useState } from "react";
import { getProduct } from "../api/productApi";

export default function GetProduct() {
  const [id, setId] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    try {
      const data = await getProduct(id);
      setProduct(data);
      setError("");
    } catch (err) {
      setError("Producto no encontrado");
      setProduct(null);
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
      <button onClick={handleSearch}>Buscar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {product && (
        <div>
          <h3>
            #{product.id} — {product.title}
          </h3>
          <p>Categoría: {product.categoryId === 1 ? "Computers" : "Fashion"}</p>
          <p>Descripción: {product.description}</p>
          <p>Variación: {product.variationType}</p>
          <p>Activo: {product.isActive ? "✅ Sí" : "❌ No"}</p>
          {product.details && (
            <div>
              <p>Marca: {product.details.brand}</p>
              <p>Serie: {product.details.series}</p>
              <p>
                Capacidad: {product.details.capacity}{" "}
                {product.details.capacityUnit} {product.details.capacityType}
              </p>
            </div>
          )}
          <p>Sobre el producto: {product.about?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
