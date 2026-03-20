import { useState, useEffect } from "react";
import { getInventory, getInventoryByProduct } from "../api/orderApi";

export default function InventoryStatus({ refreshKey }) {
  const [searchType, setSearchType] = useState("variation");
  const [variationId, setVariationId] = useState("4");
  const [productId, setProductId] = useState("");
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);

  async function fetchInventory() {
    setLoading(true);
    setError("");
    try {
      let data;
      if (searchType === "variation") {
        data = await getInventory(Number(variationId), "EG");
        console.log("Por variación:", data);
        setInventory([data]);
      } else {
        data = await getInventoryByProduct(Number(productId));
        console.log("Por producto:", data);
        setInventory(Array.isArray(data) ? data : [data]);
      }
    } catch (err) {
      setInventory([]);
      setError(err.message || "Error al consultar inventario");
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }

  useEffect(() => {
    if (refreshKey && hasFetched) fetchInventory();
  }, [refreshKey]);

  return (
    <div>
      <h2>Stock en tiempo real</h2>

      <div>
        <label>
          <input
            type="radio"
            value="variation"
            checked={searchType === "variation"}
            onChange={() => setSearchType("variation")}
          />
          Por variación
        </label>
        <label>
          <input
            type="radio"
            value="product"
            checked={searchType === "product"}
            onChange={() => setSearchType("product")}
          />
          Por producto
        </label>
      </div>

      <div>
        {searchType === "variation" ? (
          <input
            type="number"
            placeholder="ID variación"
            value={variationId}
            onChange={(e) => setVariationId(e.target.value)}
          />
        ) : (
          <input
            type="number"
            placeholder="ID producto"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          />
        )}
        <button onClick={fetchInventory} disabled={loading}>
          {loading ? "Consultando..." : "Ver stock"}
        </button>
      </div>

      {hasFetched && error && <p style={{ color: "red" }}>Error: {error}</p>}

      {inventory.map((item) => (
        <div key={item.id}>
          <p>Variación ID: {item.productVariationId}</p>
          <p>País: {item.country?.name ?? item.countryCode}</p>
          {item.productVariation && (
            <p>
              Color: {item.productVariation.colorName} — Talla:{" "}
              {item.productVariation.sizeCode}
            </p>
          )}
          <p>
            <strong>Stock disponible: {item.quantity}</strong>
          </p>
          <p>
            Última actualización: {new Date(item.updatedAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
