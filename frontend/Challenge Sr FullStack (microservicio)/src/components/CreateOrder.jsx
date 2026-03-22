import { useState } from "react";
import { createOrder } from "../api/orderApi";

export default function CreateOrder({ onOrderCreated }) {
  const [variationId, setVariationId] = useState("");
  const [countryCode, setCountryCode] = useState("EG");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const result = await createOrder([
        {
          productVariationId: Number(variationId),
          countryCode,
          quantity: Number(quantity),
        },
      ]);
      setMessage(`Orden creada: ${result.orderId}`);
      onOrderCreated?.();
      setVariationId("");
      setQuantity(1);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Crear Orden</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID de variación del producto</label>
          <input
            type="number"
            placeholder="ej: 4"
            value={variationId}
            onChange={(e) => setVariationId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>País</label>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}>
            <option value="EG">Egypt (EG)</option>
          </select>
        </div>
        <div>
          <label>Cantidad</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : "Crear Orden"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
