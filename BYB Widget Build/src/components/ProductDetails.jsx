// src/components/ProductDetails.jsx
import React from 'react';

const ProductDetails = ({ products, onAddToCart, totalSelectedProducts, maxProducts }) => {
  return (
    <div className="products">
      <h2>Product Details</h2>
      {products.length > 0 ? (
        products.map((product, index) => (
          <div key={index} className="product">
            <h3>{product.title}</h3>
            {product.images && product.images.edges.length > 0 && (
              <img src={product.images.edges[0].node.src} alt={product.title} />
            )}
            <p>{product.description}</p>
            <a href={product.onlineStoreUrl} target="_blank" rel="noopener noreferrer">View on Store</a>
            <div className="product-actions">
              <button
                onClick={() => onAddToCart(index)}
                disabled={totalSelectedProducts >= maxProducts}
              >
                + Add to Cart
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>No products found</p>
      )}
    </div>
  );
};

export default ProductDetails;
