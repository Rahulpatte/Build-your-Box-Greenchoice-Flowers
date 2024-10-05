import React, { useState, useEffect } from "react";
import BundleDetails from "./components/BundleDetails";
// import { Loader } from "./components/Loader";
// import { useNavigate } from 'react-router-dom';
import MoonLoader from "./components/MoonLoader";

function App() {
  console.log(";lllllllllllllllllllllllllllllllllllllllllll");

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
  
  const [selectedTag, setSelectedTag] = useState("");
  const[filteredproduct,setFilteredproduct]=useState([])
  const [currentStep, setCurrentStep] = useState(1);


  const[isBunchLimitExceeded,setIsBunchLimitExceeded]=useState(false)
  const[collectionloader,setCollectionLoader]=useState(true)
const[tags,setTags]=useState([])

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

      setProductDetails(result);
      
      let allTags = [];

      // Loop through the result array
      for (let i = 0; i < result.length; i++) {
        // Assuming result[i].product.tags is an array
        if (result[i].product.tags && result[i].product.tags.length > 0) {
          // Concatenate the tags into the allTags array
          allTags = allTags.concat(result[i].product.tags);
        }
      }
      
      allTags = [...new Set(allTags)];
     
      setTags(allTags)


      
     
      setProductQuantities(result.length);
    } catch (error) {
      setError("Failed to fetch product details");
      console.error("Error fetching product details:", error);
    }
  }


  const filterProductsByTag = (tag) => {
    if (tag) {
      // Filter products based on selected tag
      const filtered = productDetails.filter((item) =>
        item.product.tags.includes(tag)
      );

      console.log("filtered products",filtered);
      

      setFilteredproduct(filtered);
    } else {
      // Show all products if no tag is selected
      setFilteredproduct(result);
    }
  };



  const handleTagClick = (tag) => {
    console.log("Tags",tag)

    setSelectedTag(tag); // Update the selected tag
    filterProductsByTag(tag); // Filter products based on the selected tag
  };


  console.log("Tags",tags)






  const getdata = async () => {
    setCollectionLoader(true)
    try {
      let response = await fetch(
        `https://${window.location.host}/apps/bridge/api/bundles`,
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      let res = await response.json();
      // console.log("RES", res.products);
      
      setData(res);

      setCollectionLoader(false)

      const currentUrl = window.location.href;
      const handleInUrl = currentUrl.split("/").pop();

      const foundBundle = res.find((item) => item.handle === handleInUrl);
      // console.log("foundBundle", foundBundle);
      

      if (foundBundle) {
        setBundle(foundBundle);
        await fetchGraphQLData(foundBundle.products);
      }
    } catch (error) {
      setError("Failed to fetch bundle data");
      console.error("Error fetching bundle data:", error);
    }
  };

  console.log("collectionLoader",collectionloader);
  

  const handleBunchChange = (bunch) => {
    setSelectedBunch(bunch);

    // console.log("Bunch",bunch);
    // console.log("totalselected products------------------------",totalSelectedProducts)
 if(totalSelectedProducts>bunch){
  setIsBunchLimitExceeded(true)
 }else{
  setIsBunchLimitExceeded(false)
 }
    setCurrentBunchSize(bunch); // Update current bunch size
  };

  const handleContinue = () => {

    console.log("Current Step", currentStep)

    setCurrentStep(currentStep)
// console.log("bundle------------------------------------------------------",bundle.products)

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
    window.open(url, "_self"); // Use "_self" to open in the same tab
  };
  
  const AddtoCart = async () => {
    console.log("Add To Cart button clicked"); // Add this log to check if the button is clicked
  
    try {
      setLoading(true);
      const arr = [];
      let product_price = 0;
      let productname = [];
      let productImages = [];
  
  

      if(totalSelectedProducts === Number(selectedBunch)){
        productDetails.forEach((product, index) => {
          if (productQuantities[index] > 0) {
            product_price += Number(product.price) * Number(productQuantities[index]);
            productname.push(product.displayName + " (x" + productQuantities[index] + ")");
            productImages.push(product.product.images.edges[0].node.src);
          }
        });
  
        console.log("ProductDetails",productDetails);
        
    
       // Check the product names
    
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
        setShowModal(false);
      } // Close the modal after the alert
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

  const handleShowAllProducts = () => {
    setFilteredproduct([]); // Reset filteredProducts to empty
  };


  const handleStepChange = (step) => {
    setCurrentStep(step);
    if (step === 1) {
      // Additional logic if needed when returning to the first step
      setShowProducts(false); // Show BundleDetails component
    } else if (step === 2) {
      setShowProducts(true);  // Show Product Details
    } else if (step === 3) {
      // You can add any logic needed when navigating to the checkout
      console.log("Navigating to Checkout...");
    }
  };
  


  return (
    <>
    {/* Main Content - Product Details or Bundle Details */}
    <div className="Product-Details-container">
      {showProducts ? (
        <>
          {/* Progress Bar (appears when showProducts is true) */}
          <div className="progress-container">
            <div className={`progress-step ${currentStep === 1 ? 'current' : currentStep > 1 ? 'completed progress-step-next' : 'upcoming'}` } onClick={() => handleStepChange(1)}>
              <div className="progress-number">1</div>
              <div className="step-title">Select Box</div>
            </div>
            <hr style={{ borderTop: "1px solid lightgrey" }}></hr>
            <div className={`progress-step ${currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming'}`} onClick={() => handleStepChange(2)}>
              <div className="progress-number">2</div>
              <div className="step-title">Build Your Box</div>
            </div>
            <div className={`progress-step ${currentStep === 3 ? 'current' : 'upcoming'}`}onClick={() => handleStepChange(3)}>
              <div className="progress-number">3</div>
              <div className="step-title">Checkout</div>
            </div>
          </div>
  
          {/* Product Details */}
          <div className="product-details-content">
            <h2 className="product-details-title">{bundle.title}</h2>
            <div className="product-details-tag">
            <h3 onClick={handleShowAllProducts}>All Products</h3>

              {tags.map((tag)=>{
                return (
                  <h3 className= {selectedTag === tag? "Active-Products-tags":"Products-tags"} onClick={() => handleTagClick(tag)}>{tag}</h3>
                )
              })}
            </div>
            <ul className="product-details-list">
  {(filteredproduct.length > 0 ? filteredproduct : productDetails).map((product, index) => (
    <li key={index} className="product-details-item">
      <div className="product-detail-list-container">
        <img
          src={product?.product?.images?.edges[0]?.node?.src}
          alt={product?.product?.images?.edges[0]?.node?.alt}
          className="product-image"
          style={{ width: "200px", height: "auto" }}
        />
        <h3 className="product-name">{product.displayName}</h3>
        <p className="product-price">{product?.price}</p>

        {/* Quantity controls */}
        <div className="product-quantity-controls">
          <button
            className="decrement-button"
            onClick={() => handleDecrement(index)}
          >
            −
          </button>
          <span className="product-quantity">{productQuantities[index] || 0}</span>
          <button
            className="increment-button"
            onClick={() => handleIncrement(index)}
          >
            +
          </button>
        </div>
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
        <div>
        {/* Show loader only when collectionloader is true */}
        {collectionloader ? (
          <div style={{display:'flex', justifyContent:"center", alignItems:"center"}}>
               <MoonLoader />
          </div>
       
        ) : (
          <div className="grid-container">
            {data && data.length > 0 ? (
              data.map((item) => (
                <div onClick={() => handleClick(item.id)} className="grid-item" key={item.id}>
                  <img src={item.image} alt={item.title} />
                  <h2>{item.title}</h2>
                </div>
              ))
            ) : (
              <h2>No items found</h2>
            )}
          </div>
        )}
      </div>

      
      )}
    </div>
  
    {/* Modal and Cart Handling */}
    {showModal && (
      <>
        <div className="Cart-Modal">

<div>
  <div>
    <div>
    {totalSelectedProducts==Number(selectedBunch)?"Your Box is Full":"Complete Your Box"}
    </div>
    <p>{totalSelectedProducts}/{Number(selectedBunch)}</p>
  </div>
  <div>
  <progress value={totalSelectedProducts/Number(selectedBunch)}/>
  </div>
</div>

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
          <ul>
            {productDetails.map((product, index) => {
             
              const quantity = productQuantities[index];
              if (quantity > 0) {
                const itemTotal = product.price * quantity;
                totalCartPrice += itemTotal;
             
                return (
                  
                  <li key={index}>
                    <div className="Cart-Modal-Products-Container">
                      <div>
                      <img
                      src={product?.product?.images?.edges[0]?.node?.src}
                      alt={product?.product?.images?.edges[0]?.node?.alt}
                      style={{ width: "200px", height: "auto" }}
                    />
                      </div>
                  
                   <div>
                   <h3>{product.displayName} (x{quantity})</h3>
                   
                   <div className="Cart-Modal-Quantity-Controls">
                     <button onClick={() => handleDecrement(index)}>-</button>
                     <span>{productQuantities[index] || 0}</span>
                     <button onClick={() => handleIncrement(index)}>+</button>
                   </div>
                   </div>
                    
<div>
  <h3>{product.price}</h3>
<h3>{itemTotal}</h3>
</div>


                   
                    </div>
                  
                  </li>
                );
              }
              return null;
            })}
          </ul>
          <p>Total Price: {totalCartPrice}</p>
          <button onClick={AddtoCart} disabled={loading }>
            {loading ? "Adding..." : "Add To Cart"}
          </button>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
        <div  />
      </>
    )}
  
    {error && <div className="error">Error: {error}</div>}
  </>
  
  );
}

export default App;
