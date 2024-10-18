import React, { useState, useEffect } from "react";
import BundleDetails from "./components/BundleDetails";

import MoonLoader from "./components/MoonLoader";
import SuccessPopup from "./components/successfullpopup";

import TagSlider from "./components/Slider";

function App() {
  const [data, setData] = useState([]);
  const [bundle, setBundle] = useState(null);
  const [productDetails, setProductDetails] = useState([]);
  const [selectedBunch, setSelectedBunch] = useState(null);
  const [totalSelectedProducts, setTotalSelectedProducts] = useState(0);
  const [productQuantities, setProductQuantities] = useState([]);
  const [error, setError] = useState(null);
  const [showProducts, setShowProducts] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentBunchSize, setCurrentBunchSize] = useState(null);

  const [selectedTag, setSelectedTag] = useState("");
  const [filteredproduct, setFilteredproduct] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);

  const [isBunchLimitExceeded, setIsBunchLimitExceeded] = useState(false);
  const [collectionloader, setCollectionLoader] = useState(false);
  const [productloader, setProductLoader] = useState(false);
  const [modalOpenTracker, setModalOpenTracker] = useState(0);
  const [tags, setTags] = useState([]);
  const [showModelClassName, setShowModelClassName] = useState("");
  const [showCartButton, setShowCartButton] = useState(false);

  const [loading, setLoading] = useState(false); // Add loading state
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const[subscriptionlist,setSubscriptionlist]=useState([])

  async function fetchGraphQLData(productIds) {
    setProductLoader(true);
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
      console.log("Result---------", result);

      const updatedProducts = result.map((product) => ({
        ...product,
        displayName: product.displayName
          .replace(" - Default Title", "") // Remove ' - Default Title'
          .replace(/\s-\s\d+$/, "") // Remove ' - <number>' at the end
          .trim(), // Trim any extra spaces
      }));

      console.log("updatedata----------------------", updatedProducts);

      setProductDetails(updatedProducts);

      let allTags = [];

      for (let i = 0; i < result.length; i++) {
        if (result[i].product.tags && result[i].product.tags.length > 0) {
          allTags = allTags.concat(result[i].product.tags);
        }
      }

      allTags = [...new Set(allTags)];

      if (!allTags.includes("All Products")) {
        allTags.unshift("All Products");
      }

 

      setTags(allTags);

      setProductLoader(false);

      setProductQuantities(result.length);
    } catch (error) {
      setError("Failed to fetch product details");
      console.error("Error fetching product details:", error);
    }
  }


  

//   productDetails.forEach(product => {
//     if (product.sellingPlanGroups.edges.length > 0) {
//         // Accessing the name inside sellingPlanGroups
//         const sellingPlanName = product.sellingPlanGroups.edges[0].node.name;
//         console.log("Selling Plan Name:", sellingPlanName);
//     } else {
//         console.log("No selling plan for product:", product.displayName);
//     }
// });

useEffect(() => {
  // Temporary Set to store unique selling plan names
  let tempSellingPlans = new Set();

  // Loop through the productDetails array
  for (let i = 0; i < productDetails.length; i++) {
    const product = productDetails[i];

    // Check if sellingPlanGroups has edges
    if (product.sellingPlanGroups.edges.length > 0) {
      const sellingPlanName = product.sellingPlanGroups.edges[0].node.name;
      tempSellingPlans.add(sellingPlanName); // Add to the Set (ensures uniqueness)
    }
  }

  // Set the selling plans in state as an array after the loop
  setSubscriptionlist([...tempSellingPlans]);

}, [productDetails]);





console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
  const filterProductsByTag = (tag) => {
    if (tag) {
      // Filter products based on selected tag
      const filtered = productDetails.filter((item) =>
        item.product.tags.includes(tag),
      );

      console.log("filtered products", filtered);

      setFilteredproduct(filtered);
    } else {
      // Show all products if no tag is selected
      setFilteredproduct(result);
    }
  };

  const handleTagClick = (tag) => {
    console.log("Tags", tag);

    setSelectedTag(tag); // Update the selected tag
    filterProductsByTag(tag); // Filter products based on the selected tag
  };

  console.log("Tags", tags);

  const getdata = async () => {
    setCollectionLoader(true);
    try {
      let response = await fetch(
        `https://${window.location.host}/apps/bridge/api/bundles`,
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      let res = await response.json();
      console.log("RES---------------------------------", res);

      setData(res);

      setCollectionLoader(false);

      const currentUrl = window.location.href;
      const handleInUrl = currentUrl.split("/").pop();
      console.log("Current Url---------------", currentUrl);

      console.log("handleUrl ----------------------------", handleInUrl);

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

  console.log("collectionLoader", collectionloader);

  const handleBunchChange = (bunch) => {
    setSelectedBunch(bunch);

    if (totalSelectedProducts > bunch) {
      setIsBunchLimitExceeded(true);
    } else {
      setIsBunchLimitExceeded(false);
    }
    setCurrentBunchSize(bunch);
  };

  const handleContinue = () => {
    setCurrentStep(currentStep + 1);

    console.log("Product Loader", productloader);

    setShowProducts(true);
  };

  console.log("Current Step", currentStep);

  console.log("Product Loader", productloader);

  useEffect(() => {
    if (bundle && productDetails.length > 0) {
      // Ensure productQuantities has the same length as productDetails
      setProductQuantities(new Array(productDetails.length).fill(0));
    }
  }, [productDetails, bundle]);

  const handleIncrement = (index) => {
    // Ensure the index is valid
    if (modalOpenTracker > 0 && totalSelectedProducts == selectedBunch) {
      setShowModal(true);
    }

    // console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")

    if (index >= 0 && index < productQuantities.length) {
      if (totalSelectedProducts < selectedBunch) {
        console.log(
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          totalSelectedProducts,
          selectedBunch,
        );

        const updatedQuantities = [...productQuantities];
        updatedQuantities[index] += 1;
        const newTotal = totalSelectedProducts + 1;

        setProductQuantities(updatedQuantities);
        setTotalSelectedProducts(newTotal);

        console.log("newtotal", newTotal);
        console.log("selected bunch", selectedBunch);

        // Show the modal when the bunch limit is reached or exceeded
        if (newTotal >= selectedBunch) {
          setShowModal(true);
          document.body.classList.add("cart_open");
        }
      }
    } else {
      console.error("Invalid index for productQuantities");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    document.body.classList.remove("cart_open");
    setModalOpenTracker((prev) => prev + 1);
  };

  console.log("ModalOpenTracker", modalOpenTracker);

  // console.log("ShowModal", showModal);

  const handleDecrement = (index) => {
    if (productQuantities[index] > 0) {
      const updatedQuantities = [...productQuantities];
      updatedQuantities[index] -= 1;
      setProductQuantities(updatedQuantities);
      setTotalSelectedProducts((prevCount) => prevCount - 1);
    }

    if (totalSelectedProducts == 1) {
      console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj");
      setShowModal(false);
      document.body.classList.remove("cart_open");
    }
  };

  console.log("total Products", totalSelectedProducts);

  const handleClick = (i) => {
    const selectedBundle = data[i];
    // setCartBundleID(selectedBundle._id);

    console.log(
      "selected bundle----------------------------------",
      selectedBundle,
    );

    const url = `https://${window.location.host}/pages/build-your-box/${selectedBundle.handle}`;
    window.open(url, "_self"); // Use "_self" to open in the same tab
  };

  const AddtoCart = async () => {
    console.log("Add To Cart button clicked"); // Add this log to check if the button is clicked
    document.body.classList.remove("cart_open");

    try {
      setLoading(true);

      const arr = [];
      let product_price = 0;
      let productname = [];
      let productImages = [];
      let selectedSellingPlanId = null;

      if (totalSelectedProducts === Number(selectedBunch)) {
        productDetails.forEach((product, index) => {
          if (productQuantities[index] > 0) {
            product_price +=
              Number(product.price) * Number(productQuantities[index]);
            productname.push(
              product.displayName + " (x" + productQuantities[index] + ")",
            );
            productImages.push(product.product.images.edges[0].node.src);
          }
        });

        console.log("ProductDetails", productDetails);

        const response = await fetch(
          `https://${window.location.host}/apps/bridge/api/cartbundleproducts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              price: product_price,
              images: productImages,
            }),
          },
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

            {
              id: data.product.variants[0].id,
              selling_plan: 2446229792,
              quantity: 1
            }
        
          ],
        };

        console.log("Form Datawwwwwwwww:", formData);

        await fetch(`https://${window.location.host}/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        setShowSuccessPopup(true);
        setShowModal(false);
      } // Close the modal after the alert
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add items to cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getdata();
  }, []);

  let totalCartPrice = 0;

  const handleShowAllProducts = () => {
    setSelectedTag("");
    setFilteredproduct([]); // Reset filteredProducts to empty
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
    if (step === 1) {
      // Additional logic if needed when returning to the first step
      setShowProducts(false); // Show BundleDetails component
    } else if (step === 2) {
      setShowProducts(true); // Show Product Details
    } else if (step === 3) {
      // You can add any logic needed when navigating to the checkout
      console.log("Navigating to Checkout...");
    }
  };

  const closepopup = () => {
    setShowSuccessPopup(false);
    for (let i = 0; i < productQuantities.length; i++) {
      productQuantities[i] = 0;
    }
    setTotalSelectedProducts(0);
  };

  const Backbutton = () => {
    // console.log("jjjjj");
    setShowProducts(false);
  };

  return (
    <>
      {loading ? (
        <div
          className="Cart-Products-Loader"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999, // Ensure it appears above other content
            backgroundColor: "rgba(0, 0, 0, 0.3)", // Optional: to dim the background
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MoonLoader />
        </div>
      ) : (
        <>
          {showSuccessPopup && <SuccessPopup onClose={closepopup} />}

          <div className="Product-Details-container">
            {showProducts ? (
              <>
                {/* Progress Bar (appears when showProducts is true) */}
                {/* <button onClick={Backbutton}>Back</button> */}
                <div className="progress-container">
                  <div
                    className={`progress-steps ${currentStep === 1 ? "current" : currentStep > 1 ? "completed progress-steps-next" : "upcoming"} ${currentStep >= 2 ? "line-black" : ""}`}
                    onClick={() => handleStepChange(1)}
                  >
                    <div className="progress-number">1</div>
                    <div className="step-title">Select Box</div>
                    <p className="back-button" onClick={Backbutton}>
                      Back
                    </p>
                  </div>
                  <hr style={{ borderTop: "1px solid lightgrey" }}></hr>
                  <div
                    className={`progress-steps ${currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "upcoming"}`}
                    onClick={() => handleStepChange(2)}
                  >
                    <div className="progress-number">2</div>
                    <div className="step-title">Build Your Box</div>
                  </div>
                  <hr style={{ borderTop: "1px solid lightgrey" }}></hr>
                  <div
                    className={`progress-steps ${currentStep === 3 ? "current" : "upcoming"}`}
                    onClick={() => handleStepChange(3)}
                  >
                    <div className="progress-number">3</div>
                    <div className="step-title">Checkout</div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="product-details-content">
                  {/* Loader Condition - Hide the entire section if loader is true */}
                  {productloader ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MoonLoader />
                    </div>
                  ) : (
                    <>
                      <h2 className="product-details-title">{bundle.title}</h2>

                      <div className="product-details-tag">
                        <TagSlider
                          tags={tags}
                          handleTagClick={handleTagClick}
                          handleShowAllProducts={handleShowAllProducts}
                          selectedTag={selectedTag}
                        />
                      </div>

                      {/* Product List */}
                      <ul className="product-details-list">
                        {(filteredproduct.length > 0
                          ? filteredproduct
                          : productDetails
                        ).map((product, index) => (
                          <li key={index} className="product-details-item">
                            <div className="product-detail-list-container">
                              <img
                                src={
                                  product?.product?.images?.edges[0]?.node?.src
                                }
                                alt={
                                  product?.product?.images?.edges[0]?.node?.alt
                                }
                                className="product-image"
                                style={{ width: "200px", height: "auto" }}
                              />
                              <h3 className="product-name">
                                {" "}
                                {product.displayName}
                              </h3>
                              <p className="product-details-stems">
                                {
                                  product.selectedOptions[0].value ===
                                    "Default Title" &&
                                  product.selectedOptions[0].name === "Title"
                                    ? "" // Replace with an empty string if both conditions are true
                                    : `${product.selectedOptions[0].name} ${product.selectedOptions[0].value}` // Render normally otherwise
                                }
                              </p>

                              <p className="product-price">${product?.price}</p>

                              {/* Quantity controls */}
                              <div className="product-quantity-controls">
                                <button
                                  className="decrement-button"
                                  onClick={() => handleDecrement(index)}
                                >
                                  −
                                </button>
                                <span className="product-quantity">
                                  {productQuantities[index] || 0}
                                </span>
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
                    </>
                  )}
                </div>
              </>
            ) : bundle ? (
              <>
                {/* Progress Bar (appears when BundleDetails component is rendered) */}
                <div className="progress-container">
                  <div
                    className={`progress-steps ${currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "upcoming"}`}
                  >
                    <div className="progress-number">1</div>
                    <div className="step-title">Select Box</div>
                  </div>
                  <hr style={{ borderTop: "1px solid lightgrey" }}></hr>
                  <div
                    className={`progress-steps ${currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "upcoming"}`}
                  >
                    <div className="progress-number">2</div>
                    <div className="step-title">Build Your Box</div>
                  </div>
                  <div
                    className={`progress-steps ${currentStep === 3 ? "current" : "upcoming"}`}
                  >
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MoonLoader />
                  </div>
                ) : (
                  <div className="grid-container">
                    {data && data.length > 0 ? (
                      data.map((item, index) => (
                        <div
                          onClick={() => handleClick(index)}
                          className="grid-item"
                          key={item.id}
                        >
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

          <>
            <div
              className={
                showModal && totalSelectedProducts > 0
                  ? `Cart-Modal active`
                  : "Cart-Modal"
              }
            >
              {showModal && (
                <div className="cart_modal_content">
                  <div className={`Cart-Modal-1 `}>
                    <div className="Cart-Modal-2">
                      <div
                        className={
                          totalSelectedProducts === Number(selectedBunch) ||
                          totalSelectedProducts > Number(selectedBunch)
                            ? "Cart-Modal-3 active"
                            : "Cart-Modal-3"
                        }
                      >
                        {totalSelectedProducts == Number(selectedBunch) ||
                        totalSelectedProducts > Number(selectedBunch)
                          ? "Your Box is Full"
                          : "Complete Your Box"}
                        {console.log(
                          totalSelectedProducts,
                          Number(selectedBunch),
                        )}
                      </div>
                      <p className="Cart-Modal-ratio">
                        {totalSelectedProducts}/{Number(selectedBunch)}
                      </p>
                    </div>
                    <div
                      className={
                        totalSelectedProducts / Number(selectedBunch) > 1
                          ? "Cart-Modal-Progress-bar active"
                          : "Cart-Modal-Progress-bar"
                      }
                    >
                      <progress
                        value={totalSelectedProducts / Number(selectedBunch)}
                      />
                      {console.log(
                        "ratio--------------------------------------",
                        totalSelectedProducts / Number(selectedBunch),
                      )}
                    </div>
                  </div>

                  <ul className="Cart-Modal-Bundle-Bunches">
                    <div className="Cart-Modal-Bundle-Bunches-1">
                      <p>
                        {totalSelectedProducts === Number(selectedBunch) ||
                        totalSelectedProducts > Number(selectedBunch)
                          ? "If you want more products, modify your box"
                          : `Add ${Number(selectedBunch) - totalSelectedProducts} more products to complete your box.`}
                      </p>
                    </div>

                    <div className="Cart-Modal-Bundle-Bunches-2">
                      {bundle.bunches.map((bunch, index) => (
                        <li
                          className={
                            bunch === selectedBunch ? "Bunch-Active" : "Bunches"
                          }
                        >
                          <label>
                            <input
                              type="checkbox"
                              checked={bunch === selectedBunch}
                              onChange={() => handleBunchChange(bunch)}
                            />
                            {bunch} items
                          </label>
                        </li>
                      ))}
                    </div>
                  </ul>

                  <ul className="Cart-Modal-Products-List">
                    {productDetails.map((product, index) => {
                      const quantity = productQuantities[index];
                      if (quantity > 0) {
                        const itemTotal = product.price * quantity;
                        totalCartPrice += itemTotal;

                        return (
                          <div className="Cart-Modal-Products-List-1">
                            <li key={index}>
                              <div className="Cart-Modal-Products-Container">
                                <div className="Cart-Modal-Image">
                                  <img
                                    src={
                                      product?.product?.images?.edges[0]?.node
                                        ?.src
                                    }
                                    alt={
                                      product?.product?.images?.edges[0]?.node
                                        ?.alt
                                    }
                                    style={{ width: "200px", height: "auto" }}
                                  />
                                </div>
                                <div className="Cart-Modal-Product-Name_Price">
                                  <div className="Cart-Modal-Product-Name">
                                    <h3>
                                      {product.displayName.replace(
                                        " - Default Title",
                                        "",
                                      )}{" "}
                                      (x{quantity})
                                    </h3>

                                    <div className="Cart-Modal-Quantity-Controls">
                                      <button
                                        onClick={() => handleDecrement(index)}
                                      >
                                        −
                                      </button>
                                      <span>
                                        {productQuantities[index] || 0}
                                      </span>
                                      <button
                                        onClick={() => handleIncrement(index)}
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  <div className="Cart-Modal-Price">
                                    <h3>${itemTotal}</h3>
                                    <h3>${product.price}/unit</h3>
                                  </div>
                                </div>
                              </div>
                            </li>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </ul>

                  <p className="Cart-Price">
                    Total Price Box: ${totalCartPrice}
                  </p>


     


                  <div
                    className={
                      totalSelectedProducts !== Number(selectedBunch)
                        ? "Complete-Box disabled"
                        : showCartButton
                          ? "Complete-Box active"
                          : "Complete-Box"
                    }
                  >
                    <button onClick={AddtoCart}>Complete Your Box</button>
                    {console.log(
                      "fffffffffffffffffffffffffff",
                      totalSelectedProducts < Number(selectedBunch),
                    )}
                  </div>

                  <div
                    className={
                      totalSelectedProducts !== Number(selectedBunch)
                        ? "Cart-Button-Container disabled"
                        : showCartButton
                          ? "Cart-Button-Container active"
                          : "Cart-Button-Container"
                    }
                  >
                    <button
                      onClick={() => setShowCartButton(true)}
                      className="Cart-Button"
                      disabled={loading}
                    >
                      Add to Cart
                    </button>

                    <button>Subscribe Now</button>
                  </div>

                  <button
                    className="Cart-Close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
              )}
            </div>
          </>

          {error && <div className="error">Error: {error}</div>}
        </>
      )}
    </>
  );
}

export default App;
