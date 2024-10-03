import React, { useState, useEffect } from "react";
import BundleDetails from "./components/BundleDetails";
import { Loader } from "./components/Loader";
import { useNavigate } from 'react-router-dom';

function App() {
  console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");

  const [data, setData] = useState([]);
  const [bundle, setBundle] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [selectedBunch, setSelectedBunch] = useState(null);
  const [totalSelectedProducts, setTotalSelectedProducts] = useState(0);
  const [productQuantities, setProductQuantities] = useState([]);
  const [error, setError] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal for displaying cart
  const [currentBunchSize, setCurrentBunchSize] = useState(null);
  const [totalcartprice, setTotalCartPrice] = useState(0);
  
  const [currentStep, setCurrentStep] = useState(1);


  const[isBunchLimitExceeded,setIsBunchLimitExceeded]=useState(false)


// const [cartBundleID,setCartBundleID]=useState("");

const [loading, setLoading] = useState(false); // Add loading state

  async function fetchGraphQLData(productIds) {
    try {
      const response = await fetch(
        `https://${window.location.host}/apps/bridge/api/fetchproductdetails`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productIds }), // Send product IDs to the backend
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Product Details Result", result);

      // setProductDetails(result.products);
      // setProductQuantities(new Array(result.products.length).fill(0));
      setProductDetails(result);
      setProductQuantities(result.length);
    } catch (error) {
      setError("Failed to fetch product details");
      console.error("Error fetching product details:", error);
    }
  }

  const getcartproducts = async () => {
    const response = await fetch(
      `https://${window.location.host}/apps/bridge/api/cartbundleproducts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      },
    );
    console.log("RESPONSE", response);

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  };

  // create product

  useEffect(() => {
    getcartproducts();
  }, []);

  const getdata = async () => {
    try {
      let response = await fetch(
        `https://${window.location.host}/apps/bridge/api/bundles`,
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      let res = await response.json();
      // console.log("RES", res.products);
      
      setData(res);

      const currentUrl = window.location.href;
      const handleInUrl = currentUrl.split("/").pop();

      const foundBundle = res.find((item) => item.handle === handleInUrl);
      console.log("foundBundle", foundBundle);
      

      if (foundBundle) {
        setBundle(foundBundle);
        await fetchGraphQLData(foundBundle.products);
      }
    } catch (error) {
      setError("Failed to fetch bundle data");
      console.error("Error fetching bundle data:", error);
    }
  };

  const handleBunchChange = (bunch) => {
    setSelectedBunch(bunch);

    console.log("Bunch",bunch);
    
 if(totalSelectedProducts>bunch){
  setIsBunchLimitExceeded(true)
 }else{
  setIsBunchLimitExceeded(false)
 }
    setCurrentBunchSize(bunch); // Update current bunch size
  };

  const handleContinue = () => {

    setCurrentStep(2)
    setShowProducts(true);
  };

  useEffect(() => {
    if (bundle && productDetails.length > 0) {
      // Ensure productQuantities has the same length as productDetails
      setProductQuantities(new Array(productDetails.length).fill(0));
    }
  }, [productDetails, bundle]);
  
  const handleIncrement = (index) => {
    // Ensure the index is valid
    if (index >= 0 && index < productQuantities.length) {
      if (totalSelectedProducts < selectedBunch) {
        const updatedQuantities = [...productQuantities];
        updatedQuantities[index] += 1;
        const newTotal = totalSelectedProducts + 1;
  
        setProductQuantities(updatedQuantities);
        setTotalSelectedProducts(newTotal);
  
        // Show the modal when the bunch limit is reached
        if (newTotal >= selectedBunch) {
          setShowModal(true);
        }
      }
    } else {
      console.error("Invalid index for productQuantities");
    }
  };
  

  // console.log("ShowModal", showModal);

  const handleDecrement = (index) => {
    if (productQuantities[index] > 0) {
      const updatedQuantities = [...productQuantities];
      updatedQuantities[index] -= 1;
      setProductQuantities(updatedQuantities);
      setTotalSelectedProducts((prevCount) => prevCount - 1);
    }
  };

  const handleClick = (i) => {
    const selectedBundle = data[i];
    // setCartBundleID(selectedBundle._id);

    const url = `https://${window.location.host}/pages/build-your-box/${selectedBundle.handle}`;
    window.open(url, "_blank");
  };

  const AddtoCart = async () => {
    console.log("Add To Cart button clicked"); // Add this log to check if the button is clicked
  
    try {
      setLoading(true);
      const arr = [];
      let product_price = 0;
      let productname = [];
      let productImages = [];
  
      productDetails.forEach((product, index) => {
        if (productQuantities[index] > 0) {
          product_price += Number(product.price) * Number(productQuantities[index]);
          productname.push(product.displayName + " (x" + productQuantities[index] + ")");
          productImages.push(product.product.images.edges[0].node.src);
        }
      });
  
      console.log("Price:", product_price); // Check if the product price is calculated properly
      console.log("Product names:", productname); // Check the product names
  
      const response = await fetch(
        `https://${window.location.host}/apps/bridge/api/cartbundleproducts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ price: product_price, images: productImages }),
        }
      );
  
      const data = await response.json();
  
      let formData = {
        items: [
          {
            id: data.product.variants[0].id,
            quantity: 1,
            properties: {
              items: productname.join(", "),
            },
          },
        ],
      };
  
      console.log("Form Data:", formData); // Log the form data before making the cart request
  
      await fetch(`https://${window.location.host}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      alert("Items added to cart successfully");
      setShowModal(false); // Close the modal after the alert
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add items to cart.");
    } finally {
      setLoading(false);  <h3></h3>
    }
  };
  
// console.log("productDetails", productDetails);
  useEffect(() => {
    getdata();
  }, []);




  let totalCartPrice = 0;





  return (
    <>
    {/* Main Content - Product Details or Bundle Details */}
    <div className="Product-Details-container">
      {showProducts ? (
        <>
          {/* Progress Bar (appears when showProducts is true) */}
          <div className="progress-container">
            <div className={`progress-step ${currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming'}`}>
              <div className="progress-number">1</div>
              <div className="step-title">Select Box</div>
            </div>
            <hr style={{ borderTop: "1px solid lightgrey" }}></hr>
            <div className={`progress-step ${currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming'}`}>
              <div className="progress-number">2</div>
              <div className="step-title">Build Your Box</div>
            </div>
            <div className={`progress-step ${currentStep === 3 ? 'current' : 'upcoming'}`}>
              <div className="progress-number">3</div>
              <div className="step-title">Checkout</div>
            </div>
          </div>
  
          {/* Product Details */}
          <div className="product-details-content">
            <h2 className="product-details-title">{bundle.title}</h2>
            <ul className="product-details-list">
              {productDetails.map((product, index) => (
                <li key={index} className="product-details-item">
                  <h3 className="product-name">{product.displayName}</h3>
                  <img
                    src={product?.product?.images?.edges[0]?.node?.src}
                    alt={product?.product?.images?.edges[0]?.node?.alt}
                    className="product-image"
                    style={{ width: "200px", height: "auto" }}
                  />
                  <p className="product-price">{product?.price}</p>
  
                  <div className="product-quantity-controls">
                    <button className="decrement-button" onClick={() => handleDecrement(index)}>
                      -
                    </button>
                    <span className="product-quantity">{productQuantities[index] || 0}</span>
                    <button className="increment-button" onClick={() => handleIncrement(index)}>
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : bundle ? (
        <>
          {/* Progress Bar (appears when BundleDetails component is rendered) */}
          <div className="progress-container">
            <div className={`progress-step ${currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming'}`}>
              <div className="progress-number">1</div>
              <div className="step-title">Select Box</div>
            </div>
            <hr style={{ borderTop: "1px solid lightgrey" }}></hr>
            <div className={`progress-step ${currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming'}`}>
              <div className="progress-number">2</div>
              <div className="step-title">Build Your Box</div>
            </div>
            <div className={`progress-step ${currentStep === 3 ? 'current' : 'upcoming'}`}>
              <div className="progress-number">3</div>
              <div className="step-title">Checkout</div>
            </div>
          </div>
  
          {/* Bundle Details */}
          <BundleDetails
            bundle={bundle}
            selectedBunch={selectedBunch}
            onBunchChange={handleBunchChange}
            onContinue={handleContinue}
          />
        </>
      ) : (
        <div className="grid-container">
          {data?.map((item, index) => (
            <div onClick={() => handleClick(index)} className="grid-item" key={index}>
              <img src={item.image} alt={item.title} />
              <h2>{item.title}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  
    {/* Modal and Cart Handling */}
    {showModal && (
      <>
        <div style={modalStyles}>
          <h2>Selected Products</h2>
          <ul>
            {productDetails.map((product, index) => {
              const quantity = productQuantities[index];
              if (quantity > 0) {
                const itemTotal = product.price * quantity;
                totalCartPrice += itemTotal;
  
                return (
                  <li key={index}>
                    <h3>{product.displayName} (x{quantity})</h3>
                    <img
                      src={product?.product?.images?.edges[0]?.node?.src}
                      alt={product?.product?.images?.edges[0]?.node?.alt}
                      style={{ width: "200px", height: "auto" }}
                    />
                    <h3>{itemTotal}</h3>
                    <div>
                      <button onClick={() => handleDecrement(index)}>-</button>
                      <span>{productQuantities[index] || 0}</span>
                      <button onClick={() => handleIncrement(index)}>+</button>
                    </div>
                  </li>
                );
              }
              return null;
            })}
          </ul>
          <p>Total Price: {totalCartPrice}</p>
          <button onClick={AddtoCart} disabled={loading}>
            {loading ? "Adding..." : "Add To Cart"}
          </button>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
        <div style={overlayStyles} />
      </>
    )}
  
    {error && <div className="error">Error: {error}</div>}
  </>
  
  );
}

export default App;
