import { useState } from "react";
import { getProducts } from "../api/productApi";

export default function GetProducts() {
  //   const [id, setId] = useState("");
  const [product, setProduct] = useState(null);

  async function handleSearch() {
    const data = await getProducts();

    setProduct(data);
  }

  return (
    <div>
      <h2>Buscar Productos</h2>

      {/* <input
        placeholder="products"
        value={id}
        onChange={(e) => setId(e.target.value)}
      /> */}

      <button onClick={handleSearch}>Buscar</button>

      {product && <pre>{JSON.stringify(product, null, 2)}</pre>}
    </div>
  );
}
