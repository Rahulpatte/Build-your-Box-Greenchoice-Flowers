import React, { useState, useEffect } from "react";
import BundleDetails from "./components/BundleDetails";
import { Loader } from "./components/Loader";
import { useNavigate } from 'react-router-dom';

function App() {
  console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz");

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
    setShowModal(false);
    setTotalSelectedProducts(0);
    setProductQuantities(new Array(productDetails.length).fill(0)); // Reset product quantities
    setCurrentBunchSize(bunch); // Update current bunch size
  };

  const handleContinue = () => {
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
  

  console.log("ShowModal", showModal);

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
    try {
    
      setLoading(true);
      const arr = [];
      let product_price = 0;
     let productname=[]
     let productImages=[]
      
      {productDetails.map((product, index) => {
        if (productQuantities[index] > 0) {
          console.log("cartProducts",productDetails);
          
          product_price += Number(product.price) * Number(productQuantities[index]);
          // console.log('product_price', product.displayName);
          productname.push(product.displayName +" "+"(x"+productQuantities[index]+")");
// console.log("productImages",product.product.images.edges[0].node.src);
productImages.push(product.product.images.edges[0].node.src);
         
          // })
        }
      })}
        
          console.log("productname", productname);
          console.log("productImages", productImages);
          
           
          // ),
      // )}


      
      
      const response = await fetch(
        `https://${window.location.host}/apps/bridge/api/cartbundleproducts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({price: product_price, images: productImages}),
        },
      );


      // JSON.stringify({price: product_price, image: productDetails});

      const data = await response.json();
      console.log("DATA", data);

      let formData = {
        items: [
          {
            id: data.product.variants[0].id,
            quantity: 1,

            properties: {
              items: productname
                .map((product) => product)
                .join(", "),
            },
          },
        ],
      };

      fetch(`https://${window.location.host}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }).then((response) => {
        return response.json();
      });

      // console.log("API Response", data);

      alert("Items added to product successfully");
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add items to product.");
    }
    finally {
      setLoading(false); // Stop loader when operation completes
    }
  };
// console.log("productDetails", productDetails);
  useEffect(() => {
    getdata();
  }, []);

const handleCartButton= () => {
  window.location.href = 'https://greenchoice-flowers-subscriptions.myshopify.com/cart'; 
}
  return (
    <>
      <h1 className="heading">Build Your Box</h1>
     

      <button onClick={handleCartButton}>Cart</button>
      {/* <PacmanLoader /> */}

      <div className="container">
        {showProducts ? (
          <div>
            <h2>Product Details</h2>
            <ul>
              {productDetails.map((product, index) => (
                <li key={index}>
                  <h3>{product.displayName}</h3>
                  <img
                    src={product?.product?.images?.edges[0]?.node?.src}
                    alt={product?.product?.images?.edges[0]?.node?.alt}
                    style={{ width: "200px", height: "auto" }}
                  />
                  <p>{product?.product?.description}</p>
                  <div>
                    <button onClick={() => handleDecrement(index)}>-</button>
                    <span>{productQuantities[index] || 0}</span>
                    <button onClick={() => handleIncrement(index)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
            <p>
              Total Selected Products: {totalSelectedProducts}/{selectedBunch}
            </p>
          </div>
        ) : bundle ? (
          <BundleDetails
            bundle={bundle}
            selectedBunch={selectedBunch}
            onBunchChange={handleBunchChange}
            onContinue={handleContinue}
          />
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

      {/* <button onClick={createProduct}>Create Product</button> */}
      {showModal && (
        <>
          {console.log(showModal, "showModal")}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              justifyContent: "center",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "20px",
              zIndex: 1000,
              boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
              borderRadius: "10px",
            }}
          >
            <h2>Selected Products</h2>
            <div>
           
            </div>
           
            <ul>
              {productDetails.map(
                (product, index) =>
                  productQuantities[index] > 0 && (
                    <li key={index}>
                      <h3>
                        {product.displayName} (x{productQuantities[index]})
                      </h3>
                      <img
                        src={product?.product?.images?.edges[0]?.node?.src}
                        alt={product?.product?.images?.edges[0]?.node?.alt}
                        style={{ width: "200px", height: "auto" }}
                      />
                    </li>
                  ),
              )}
               <button onClick={AddtoCart} disabled={loading} style={{ padding: '10px', fontSize: '16px' }}>
      {loading ? (
        <>
          Adding to Cart
          <Loader /> {/* Loader component */}
        </>
      ) : (
        'Add to Cart'
      )}
    </button>
            </ul>
            <h2>Bunches</h2>
      <ul>
        {bundle.bunches.map((bunch, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                checked={bunch === selectedBunch} // Preselect the checkbox if the bunch matches selectedBunch
                onChange={() => handleBunchChange(bunch)} // Update selectedBunch on change
              />
              Bunch {index + 1}: {bunch}
            </label>
          </li>
        ))}
      </ul>
   
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>

          {/* Modal Overlay to close the modal when clicking outside */}
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
            }}
          />
        </>
      )}

      {error && <div className="error">Error: {error}</div>}
    </>
  );
}

export default App;
