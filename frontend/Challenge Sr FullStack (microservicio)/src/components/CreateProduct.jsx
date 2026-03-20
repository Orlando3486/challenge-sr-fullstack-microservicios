import { useState } from "react";
import { addProductDetails, createProduct } from "../api/productApi";

export default function CreateProduct({ onCreated }) {
  const [categoryId, setCategoryId] = useState("1");
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [about, setAbout] = useState("");
  const [variationType, setVariationType] = useState("NONE");
  const [capacity, setCapacity] = useState("1");
  const [capacityUnit, setCapacityUnit] = useState("GB");
  const [capacityType, setCapacityType] = useState("SSD");
  const [brand, setBrand] = useState("");
  const [series, setSeries] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const product = await createProduct(Number(categoryId));

      const details =
        categoryId === "1"
          ? {
              category: "Computers",
              capacity: Number(capacity),
              capacityUnit,
              capacityType,
              brand,
              series,
            }
          : null;

      await addProductDetails(product.id, {
        title,
        code,
        description,
        variationType,
        about: about
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        details,
      });

      setMessage(`Producto "${title}" creado con ID: ${product.id}`);
      onCreated?.();
      setTitle("");
      setCode("");
      setDescription("");
      setAbout("");
      setBrand("");
      setSeries("");
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Crear Producto</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}>
            <option value="1">Computers</option>
            <option value="2">Fashion</option>
          </select>
        </div>
        <div>
          <label>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Código UPC</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Sobre el producto (separado por comas)</label>
          <input
            type="text"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
        </div>
        <div>
          <label>Tipo de variación</label>
          <select
            value={variationType}
            onChange={(e) => setVariationType(e.target.value)}>
            <option value="NONE">Sin variación</option>
            <option value="OnlySize">Solo talla</option>
            <option value="OnlyColor">Solo color</option>
            <option value="SizeAndColor">Color y Talla</option>
          </select>
        </div>

        {categoryId === "1" && (
          <>
            <div>
              <label>Marca</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Serie</label>
              <input
                type="text"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Capacidad</label>
              <input
                type="number"
                value={capacity}
                min="1"
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Unidad</label>
              <select
                value={capacityUnit}
                onChange={(e) => setCapacityUnit(e.target.value)}>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
            <div>
              <label>Tipo de almacenamiento</label>
              <select
                value={capacityType}
                onChange={(e) => setCapacityType(e.target.value)}>
                <option value="SSD">SSD</option>
                <option value="HD">HD</option>
              </select>
            </div>
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Producto"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
