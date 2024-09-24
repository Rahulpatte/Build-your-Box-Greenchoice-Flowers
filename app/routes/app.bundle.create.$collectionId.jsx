import {
  TextField,
  Button,
  DropZone,
  Thumbnail,
  Text,
  
  Page,
  LegacyCard,
  IndexTable,
  useIndexResourceState,
 
  BlockStack,
  Toast,
  Frame,
  Pagination,
  LegacyStack,
  InlineStack,Spinner
} from "@shopify/polaris";
import * as React from "react";
// import { useNavigate } from '@remix-run/react';

import { EditIcon } from "@shopify/polaris-icons";
// import "../css/customStyles.css";

import { useState, useCallback, useEffect } from "react";
import { NoteIcon } from "@shopify/polaris-icons";
import Select from "react-select";
import makeAnimated from "react-select/animated";
// import "../components/Bundle.css";
// import BundleTable from "../components/BundleTable.jsx";
import { useNavigate, useParams } from "@remix-run/react";

const animatedComponents = makeAnimated();

// export const loader = () => {}
// export const action = () => {}

function Bundle() {
  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  
  const [productTitles, setProductTitles] = useState([]);
  const [productImages, setProductImages] = useState([]);

  const [files, setFiles] = useState([]);
  const [image, setImage] = useState("");
  const [editedimage, setEditedImage] = useState(null);
  const [selectedBunches, setSelectedBunches] = useState([]);
  const [titleError, setTitleError] = useState("");
  const [imageError, setImageError] = useState("");
  const [bunchesError, setBunchesError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [productIds, setProductIds] = useState([]); // State to store product IDs
  const [editingIndex, setEditingIndex] = useState(null); 
  const[editedproductIds,setEditedProductIds] = useState([]);
  const { collectionId } = useParams();
  // const [productDetails, setProductDetails] = useState([]);

const[viewloading,setViewLoading]=useState(false);


  const navigate = useNavigate();
  
  const [toastActive, setToastActive] = useState(false); // Toast state for deletion confirmation

  const [updateActive, setUpdateActive] = useState(false); //

  



  const [showeditedbundle, setShoweditedbundle] = useState(false);
  const [loading, setLoading] = useState(true);

  const [hasChanges, setHasChanges] = useState(false);
 
  const [file, setFile] = useState(null);

  const toggleToast = useCallback(
    () => setToastActive((toastActive) => !toastActive),
    [],
  );
  const toastMarkup = toastActive ? (
    <Toast content="Bundle Added" onDismiss={toggleToast} />
  ) : null;

  // -------------- toggleupdated--------------------------------------------

  const updatedToast = useCallback(
    () => setUpdateActive((updateActive) => !updateActive),
    [],
  );
  const updatedtoastMarkup = updateActive ? (
    <Toast content="Bundle successfully Updated " onDismiss={updatedToast} />
  ) : null;

  //  -------------------------------





   // -------------- DeleteActive--------------------------------------------
   const [deleteActive, setDeleteActive] = useState(false); //

   const deleteToast = useCallback(
    () => setDeleteActive((deleteActive) => !deleteActive),
    [],
  );
  const deletetoastMarkup = deleteActive ? (
    <Toast content="  Deleted  successfully" onDismiss={deleteToast} />
  ) : null;

  //  -------------------------------

  const [isLoading, setIsLoading] = useState(false);

  // ------------------------------------------


  const handleBunchesChange = (selectedOptions) => {
    setSelectedBunches(selectedOptions || []);

    // Clear the bunches error when the user starts selecting options
    if (bunchesError) {
      setBunchesError(false); // Reset the error state
    }
    handleInputChange()
  };

  const generateOptions = () => {
    return Array.from({ length: 20 }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    }));
  };

  const handleInputChange = () => {
    setHasChanges(true); // Mark as changed when any input is modified
  };

  const fetchGraphQLData = async (productIds) => {
    try {
      const response = await fetch(`/api/editproductDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productIds }), // Send product IDs to the backend
      });
      const result = await response.json();

      console.log("Product Details Result", result.data);

      const editedproductTitles = result.data.map(
        (product) => product.displayName,
      );

      const editedproductImages = result.data.map(
        (element) => element.product.images.edges[0].node.src,
      );

      setProductTitles(editedproductTitles);
      setProductImages(editedproductImages);
      setLoading(false);
    } catch (error) {
      // setLoading (true)
    }


  };

  const resourcePicker = async (singleSelection = false) => {
    try {
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: !singleSelection,
        filter: {
          variants: true,
        },
      });
  
      const productDetails = selected.selection.flatMap((product) =>
        product.variants.map((variant) => ({
          title: variant.displayName,
          variantId: variant.id,
          productId: product.id,
          image: product.images[0]?.originalSrc || "",
          status: product.status,
        }))
      );
  
      // Extract new variant IDs
      const newProductIds = selected.selection
        .map((product) =>
          product.variants.length > 1
            ? product.variants.map((variant) => variant.id)
            : [product.variants[0].id]
        )
        .flat();
  
      if (collectionId !== 0) {
        // Edit mode
        
  
        // Merge new product IDs with existing `editedproductIds`
        const mergedProductIds = [...editedproductIds, ...newProductIds];
  setViewLoading(true)
        // Fetch additional data for all products (old + new)
        await fetchGraphQLData(mergedProductIds);
  
        // Now update product IDs, titles, and images
        setProductIds(mergedProductIds);
  
        // Update the UI with titles and images after fetching all product data
        const mergedProductDetails = [
          ...editedproductIds.map((id, index) => ({
            title: productTitles[index], // Use existing titles from state for edited products
            image: productImages[index], // Use existing images from state for edited products
          })),
          ...productDetails,
        ];
  
        setProductTitles(mergedProductDetails.map((product) => product.title));
        setProductImages(mergedProductDetails.map((product) => product.image));
        
  setViewLoading(false)
        console.log("mergedProductIds", mergedProductIds);
      } else {
        // Create mode: directly update state without fetching additional data
        // setLoading(true);
        setProductIds(newProductIds);
        setProductTitles(productDetails.map((product) => product.title));
        setProductImages(productDetails.map((product) => product.image));
      }
  
      // Return the selected products for further processing
      return selected.selection;
    } catch (error) {
      console.error("Error picking resources:", error);
      setGeneralError("Failed to pick resources.");
      return null;
    }
  };
  


  // ------------------------------------Pagination--------------------------------------------------------------

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5; // Set the number of items per page


const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;

// Get the bundles to display on the current page
const paginatedTitles = productTitles.slice(startIndex, endIndex);

// Pagination handler
const handleNextPage = useCallback(() => {
  setCurrentPage((prevPage) => prevPage + 1);
}, []);

const handlePreviousPage = useCallback(() => {
  setCurrentPage((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
}, []);
// -------------------------------------------------------------------------------------------------------------------





  const colourOptions = generateOptions();

  useEffect(() => {
    console.log("COLLECTION_ID", collectionId);
    if (collectionId != 0) {
      console.log("running");
      const fetchBundle = async () => {
        try {
          const response = await fetch(`/api/bundles/${collectionId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const bundle = await response.json(); // Assuming it returns an array of bundles
          // console.log("BUNDLE_FETCHED_SINGLE", bundle);

          if (bundle) {
            setTitle(bundle.title);
            // Set other state variables if needed
            setHandle(bundle.handle);
            // setProductImages(bundle.images || []); // Example: Set images if available
            // setImage(bundle.image || ""); // Example: Set image if available
            console.log("image", bundle.image);
            // setFile(bundle.image || ""); // Example: Set image if available
            setEditedImage(bundle.image || ""); // Example: Set image if available
            // reader.readAsDataURL(acceptedFiles[0]);
            // setFile(bundle.image || ""); // Example: Set image if available
            setSelectedBunches(
              bundle.bunches.map((bunch) => ({ value: bunch, label: bunch })),
            ); // Example: Set bunches
            fetchGraphQLData(bundle.products || []);
            setEditedProductIds(bundle.products || []);
            console.log("productsids", bundle.products);
            
           
            setShoweditedbundle(true);
            // console.log("showeditedbundle", showeditedbundle);
          } else {
            console.error("Bundle not found");
          }
        } catch (error) {
          console.log(error);
        }
      };

      fetchBundle();
    }
    return () => console.log("BUNDLE_UNMOUNTED");
  }, [collectionId]);

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => {
      // Reset file and image state
      setFile(acceptedFiles[0]); // Set the first accepted file
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Base64 string representation of the image
        
        // Clear the image error once the image is loaded
        if (imageError) {
          setImageError(false); // Clear the image error
        }
      };
  
      // Read the image file as Base64
      reader.readAsDataURL(acceptedFiles[0]);
  
      // Optionally log the file reader data
      console.log("reader", reader);
    },
    [imageError] // Add imageError as a dependency
  );
  
  const handleclosedropzone = () => {
    setFile(null);
    setEditedImage(null);
    handleInputChange()
  };

  // console.log("showeditedbundle", showeditedbundle);

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
  const fileUpload = !files.length && <DropZone.FileUpload />;
  const uploadedFile = file && (
    // <LegacyStack>

    <div
      className="dropzone-container"
      style={{
        position: "relative",
        padding: "10px",
        justifyContent: "center",
        alignItems: "center",
        width: "max-content",
        margin: "0px auto 0px",
      }}
    >
      {/* <button style={{position: "absolute", top: '-5px', right: "-10px"}} onClick={handleclosedropzone}> X </button> */}
      <img
        src={
          validImageTypes.includes(file.type)
            ? window.URL.createObjectURL(file)
            : NoteIcon
        }
        height={200}
        width={300}
      />
    </div>

    // </LegacyStack>
  );
  // console.log("uploadedFile", uploadedFile);
  // console.log("editedImage", editedimage);

  const handleTitleChange = useCallback(
    (newValue) => {
      setTitle(newValue);

      // Automatically update handle when the title changes
      const updatedHandle = newValue.replace(/\s+/g, "-").toLowerCase();
      setHandle(updatedHandle);

      // Clear the title error when the user starts typing
      if (titleError) {
        setTitleError(false); // Reset the error state
      }

      handleInputChange()
    },
    [titleError],
  );

  const handleHandleChange = useCallback((newValue) => {
    // Replace spaces with hyphens
    const updatedValue = newValue.replace(/\s+/g, "-").toLowerCase();
    setHandle(updatedValue);

    console.log("handle", updatedValue);
  }, []);

  const handleSubmit = async () => {
    setIsLoading(true); // Start loading
    let valid = true;
  
    // Validation for title
    if (!title.trim()) {
      setTitleError("Title is required.");
      valid = false;
    } else {
      setTitleError("");
    }
  
    // Use existing image if no new image is uploaded
    const imageToUpdate = image || editedimage;
  
    // Validation for image (only if there's no existing image)
    if (!imageToUpdate) {
      setImageError("An image is required.");
      valid = false;
    } else {
      setImageError("");
    }
  
    // Validation for bunches
    if (selectedBunches.length === 0) {
      setBunchesError("At least one bunch must be selected.");
      valid = false;
    } else {
      setBunchesError("");
    }
  
    // Stop loading and return early if form is not valid
    if (!valid) {
      setIsLoading(false); // Stop loading when validation fails
      return; // Exit function
    }
  
    const productsToUpdate = productIds.length > 0 ? productIds : editedproductIds;
  
    // Prepare updated data object
    const updatedData = {
      title,
      image: imageToUpdate,
      bunches: selectedBunches.map((option) => option.value),
      products: productsToUpdate,
      handle,
    };
  
    try {
      // Make the update request
      const response = await fetch(`/api/product/${collectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        // Clear fields if not editing
        if (!showeditedbundle) {
          setFiles([]);
          setImage("");
          setHandle("");
          setSelectedBunches([]);
          setGeneralError("");
          toggleToast(); // Show success toast
  
          // Navigate back after a delay
          setTimeout(() => {
            navigate(`/app/bundles`);
          }, 2000);
        }
  
        console.log("Bundle updated successfully!");
        setIsLoading(false); // Stop loading after successful update
        updatedToast(); // Show a success toast
      } else {
        console.error("Failed to update bundle");
        setIsLoading(false); // Stop loading on failure
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setIsLoading(false); // Stop loading on error
    }
  };
  

  const handleEdit = async (index) => {
    console.log("editing product variant ids:", editedproductIds);
    // console.log("editing product id at index", editedproductIds[index]);
  
    // Calculate the actual index considering pagination
    const actualIndex = index + ((currentPage - 1) * itemsPerPage);
    setEditingIndex(actualIndex);
  
    // Open resource picker to select a new product
    const selectedProduct = await resourcePicker(true); // Open resource picker with single selection
  
    if (selectedProduct && selectedProduct.length > 0) {
      // Create a copy of the current product titles, images, and productIds
      const updatedTitles = [...productTitles];
      const updatedImages = [...productImages];
      const updatedProductIds = [...editedproductIds]; // Copy the existing product IDs
      console.log("updatedProductIds", updatedProductIds);
      
  
      // Update the specific product data based on the selection
      updatedTitles[actualIndex] = selectedProduct[0].title;
      updatedImages[actualIndex] = selectedProduct[0].images[0]?.originalSrc || "";
  
      // Update the product ID at the actual index with the new selected product ID
      updatedProductIds[actualIndex] = selectedProduct[0].id;
      console.log("updatedProductIds", updatedProductIds);
      // Update the state with the modified arrays
      setProductTitles(updatedTitles);
      setProductImages(updatedImages);
      setEditedProductIds(updatedProductIds); // Update product IDs in state
  
      // Prepare the updated data object for the bundle
      const updatedData = {
        title,
        image: image || editedimage,
        bunches: selectedBunches.map((option) => option.value),
        products: updatedProductIds, // Send updated products (with the edited product)
        handle,
      };
  
      try {
        // Make the update request to the server to update the bundle
        const response = await fetch(`/api/product/${collectionId}`, {
          method: "PUT", // Using PUT for updates
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        });

        console.log("response", response);
        
  
        if (response.ok) {
          console.log("Bundle updated successfully after product edit!");
        } else {
          console.error("Failed to update the bundle after product edit");
        }
      } catch (error) {
        console.error("An error occurred while updating the bundle:", error);
      }
    }
  };
  
  const handleDelete = async (index) => {
    // Calculate the actual index considering pagination
    const actualIndex = index + ((currentPage - 1) * itemsPerPage);
    // console.log('ProductIds:', productIds);
    
  
    // Create a copy of the product titles, images, and productIds
    const updatedTitles = [...productTitles];
    const updatedImages = [...productImages];
    const updatedProductIds = [...productIds]; // Also update productIds
    // console.log("updatedProductIds", updatedProductIds);
    console.log("editedproductIds", editedproductIds);
    
    console.log("index", index); 
  
    // Remove the product data from the arrays using the actual index
    updatedTitles.splice(index, 1);
    updatedImages.splice(index, 1);
    editedproductIds.splice(index, 1); // Remove the productId as well
    
    // Update the state with the modified arrays
    setProductTitles(updatedTitles);
    setProductImages(updatedImages);
    // setProductIds(updatedProductIds); // Update productIds as well
  
    // Prepare the updated data object
    const updatedData = {
      title,
      image: image || editedimage,
      bunches: selectedBunches.map((option) => option.value),
      products: editedproductIds, // Updated products after deletion
      handle,
    };
  
    try {
      // Make the update request to the server to update the bundle
      const response = await fetch(`/api/product/${collectionId}`, {
        method: "PUT", // Using PUT for updates
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      deleteToast();
  
      if (response.ok) {
        console.log("Bundle updated successfully after product deletion!");
      } else {
        console.error("Failed to update the bundle after product deletion");
      }
    } catch (error) {
      console.error("An error occurred while updating the bundle:", error);
    }
  };
  


  // IndexTable setup
  const resourceName = {
    singular: "product",
    plural: "products",
  };

 const actualIndex = (index) => index + ((currentPage - 1) * itemsPerPage);






// -------------------------------------Products table----------------------------------------



const { selectedResources, allResourcesSelected, handleSelectionChange } =
  useIndexResourceState(productIds);

const rows = paginatedTitles.map((title, index) => (
  <IndexTable.Row
    id={actualIndex(index).toString()} // Use the actual index here
    key={actualIndex(index)}
    selected={selectedResources.includes(actualIndex(index).toString())} // Use the actual index here
    position={actualIndex(index)} // Position with the actual index
  >
    <IndexTable.Cell>{actualIndex(index) + 1}</IndexTable.Cell> {/* Display actual index + 1 */}
    <IndexTable.Cell>
      <Thumbnail source={productImages[actualIndex(index)]} alt={title} />
    </IndexTable.Cell>
    <IndexTable.Cell>{title}</IndexTable.Cell>
    {/* <IndexTable.Cell>{productStatus[actualIndex(index)]}</IndexTable.Cell> */}
    <IndexTable.Cell>
      <InlineStack gap="500">
        <Button onClick={() => handleEdit(actualIndex(index))}>Edit</Button>
        {/* <EditIcon/> */}
        <Button onClick={() => handleDelete(actualIndex(index))}>Delete</Button>
      </InlineStack>
    </IndexTable.Cell>
  </IndexTable.Row>
));



// -------------------------------------Products table----------------------------------------
  const totalPages = Math.ceil(productTitles.length / itemsPerPage); 
  return (
    <>

 
      {showeditedbundle ? (
        <Frame>
          <Page
            backAction={{ content: "Collections", url: "/app/bundles" }}
            title="Edit the Bundle"
            compactTitle
            primaryAction={{
              content: "Update",
              onAction: handleSubmit,
              disabled: isLoading || !hasChanges,
            }}
          >
            <LegacyCard title="Add below details" sectioned>
              <BlockStack gap="500">
                <TextField
                  label="Title"
                  value={title}
                  onChange={handleTitleChange}
                  error={titleError}
                />

                <TextField
                  label="Handle"
                  value={handle}
                  onChange={handleHandleChange}
                />

                <div>
                  <Text>Upload Image for Collection</Text>

                  {!editedimage ? (
                    <div>
                      <DropZone
                        onDrop={handleDropZoneDrop}
                        allowMultiple={false}
                        accept="image/*"
                        type="image"
                      >
                        {uploadedFile && (
                          <div>
                            {/* Image display */}
                            {uploadedFile}
                            {/* Close button with event stop propagation */}
                            <div
                              style={{ position: "absolute", top: 0, right: 0 }}
                            >
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevents triggering DropZone click event
                                  handleclosedropzone();
                                }}
                              >
                                X
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Show DropZone if no file is uploaded */}
                        {!uploadedFile && fileUpload}
                      </DropZone>
                    </div>
                  ) : (
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        justifyContent: "center", // Center horizontally
                        alignItems: "center", // Center vertically
                        height: "100%",
                        borderStyle: "groove",
                        borderRadius: "15px",
                        padding: "10px",
                        // Adjust height as needed
                      }}
                    >
                      {/* Display the uploaded or edited image */}
                      <img
                        src={editedimage}
                        width={300}
                        height={250}
                        alt="uploaded"
                      />

                      {/* Close (X) button to remove the image */}
                      <div style={{ position: "absolute", top: 0, right: 0 }}>
                        <Button
                          className="close-button"
                          onClick={() => {
                            handleclosedropzone(); // Clear the image
                          }}
                        >
                          X
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Text>Select Number of Bunches</Text>
                  <Select
                    closeMenuOnSelect={false}
                    components={animatedComponents}
                    isMulti
                    options={colourOptions}
                    value={selectedBunches}
                    onChange={handleBunchesChange}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderColor: bunchesError ? "red" : base.borderColor,
                      }),
                    }}
                  />
                </div>
                <div>
                  <Button onClick={() => resourcePicker(false)}>
                    Choose Products for this Bundle
                  </Button>
                </div>

{viewloading?(<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px'}}>
<Spinner accessibilityLabel="Loading products" size="large" />

</div>
):(<IndexTable
  resourceName={resourceName}
  itemCount={productTitles.length}
  selectedItemsCount={
    allResourcesSelected ? "All" : selectedResources.length
  }
  loading={loading}
  onSelectionChange={handleSelectionChange}
  headings={[
    { title: "ID" },
    { title: "Image" },
    { title: "Title" },
    // { title: "Status" },
    { title: "Actions" },
  ]}
  selectable={false}
  bulkActions={[]}

>
  {rows}
</IndexTable>)}

                
                <div style={{display: 'flex', justifyContent: 'flex-end' }}>
  <Pagination
    hasPrevious={currentPage > 1}
    onPrevious={handlePreviousPage}
    hasNext={currentPage < totalPages}
    onNext={handleNextPage}
  />
  </div>
              </BlockStack>
            </LegacyCard>

            {updatedtoastMarkup}
            {deletetoastMarkup}

            {/* {console.log("toastMarkup",updatedtoastMarkup)}  */}
            {/* <Button onClick={handleSubmit} variant="primary">Update</Button> */}

            <br />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
              // disabled="true"
              disabled={!hasChanges}
                loading={isLoading}
                onClick={handleSubmit}
                variant="primary"
              >
                Update
              </Button>
              {/* <Button loading>Save product</Button>; */}
            </div>
          </Page>

          {/* <Button onClick={handleSubmit} variant="primary">Save</Button>; */}
        </Frame>
      ) : (
        <Frame>
          <Page
            backAction={{ content: "Collections", url: "/app/bundles" }}
            title="Create a Bundle"
            compactTitle
            primaryAction={{
              content: "Save",
              onAction: handleSubmit,
              disabled: isLoading,
            }}
          >
            <LegacyCard title="Add below details" sectioned>
              <BlockStack gap="500">
                <TextField
                  label="Title"
                  value={title}
                  onChange={handleTitleChange}
                  error={titleError}
                />

                <TextField
                  label="bundle Url"
                  value={handle}
                  onChange={handleHandleChange}
                />

                <div>
                  <Text>Upload Image for Bundle</Text>

                  {/* Conditionally render the button when there's no uploaded file */}

                  {/* DropZone for uploading image */}
                  <DropZone
                    onDrop={handleDropZoneDrop}
                    allowMultiple={false}
                    accept="image/*"
                    type="image"
                  >
                    {uploadedFile && (
                      <div style={{ position: "relative" }}>
                        {/* Image display */}
                        {uploadedFile}
                        {/* Close button with event stop propagation */}
                        <div style={{ position: "absolute", top: 0, right: 0 }}>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents triggering DropZone click event
                              handleclosedropzone();
                            }}
                          >
                            X
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Show DropZone if no file is uploaded */}
                    {!uploadedFile && fileUpload}
                  </DropZone>

                  {/* Error message */}
                  <div style={{ color: "red" }}>
  <Text>{imageError}</Text>
</div>
                </div>

                <div>
                  <Text>Select Number of Bunches</Text>
                  <div className="bunches">
                    <Select
                      closeMenuOnSelect={false}
                      components={animatedComponents}
                      isMulti
                      options={colourOptions}
                      value={selectedBunches}
                      onChange={handleBunchesChange}
                      styles={{
                        control: (base, state) => ({
                          ...base,
                          borderColor: bunchesError ? "red" : base.borderColor,
                        }),
                      }}
                    />
                  </div>
                </div>
                <div>
                  <Button onClick={() => resourcePicker(false)}>
                    Choose Products for this Bundle
                  </Button>
                </div>

                <div className="productTable">
                  <IndexTable
                    resourceName={resourceName}
                    itemCount={productTitles.length}
                    selectedItemsCount={
                      allResourcesSelected ? "All" : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                      { title: "ID" },
                      { title: "Image" },
                      { title: "Title" },
                      // { title: "Status" },
                      { title: "Actions" },
                    ]}
                    selectable={false}
                    bulkActions={[]}
                    // pagination={{
                    //   hasNext: true,
                    //   hasPrevious: true,
                    //   onNext: () => handleNextPage,
                    //   onPrevious: () => handlePreviousPage,
                    // }}
                  >
                    {rows}
                  </IndexTable>
                </div>
              </BlockStack>
            </LegacyCard>

            {toastMarkup}
            {deletetoastMarkup}
            {/* {console.log("toastMarkup",toastMarkup)} */}
            <br />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                loading={isLoading}
                onClick={handleSubmit}
                variant="primary"
              >
                Save
              </Button>
            </div>
          </Page>
        </Frame>
      )}
    </>
  );
}

export default Bundle;
