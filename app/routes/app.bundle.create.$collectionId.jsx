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
import "../css/customStyles.css";

import { useState, useCallback, useEffect } from "react";
import { NoteIcon } from "@shopify/polaris-icons";
import Select from "react-select";
import makeAnimated from "react-select/animated";
// import "../components/Bundle.css";
// import BundleTable from "../components/BundleTable.jsx";
import { useNavigate, useParams } from "@remix-run/react";

const animatedComponents = makeAnimated();
// import './customstyles.css'

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
  const[createBundleLoader,setCreateBundleLoader]=useState(false)
  const[editcreateBundlerLoader,setEditcreateBundlerLoader]=useState(false)




  const navigate = useNavigate();
  
  const [toastActive, setToastActive] = useState(false); // Toast state for deletion confirmation=useSt

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
      
      // Clean the display names by removing " - Default Title"
      const editedproductTitles = result.data.map((product) => {
        // Clean the title by removing both ' - Default Title' and ' - <number>'
        const cleanedTitle = product.displayName
          .replace(' - Default Title', '')  // Remove ' - Default Title'
          .replace(/\s-\s\d+$/, '')         // Remove ' - <number>' at the end
          .trim();                          // Trim any extra spaces
        
        return cleanedTitle;
      });
      
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
    handleInputChange()
    try {
      // setLoading(true); // Start loading when resource picker is opened
 
  
      const selected = await shopify.resourcePicker({
        type: "product",
        multiple: !singleSelection,
        filter: {
          variants: true,
        },
      });

      setCreateBundleLoader(true);
  
      const productDetails = selected.selection.flatMap((product) =>
        product.variants.map((variant) => {
          // Clean the title by removing both " - Default Title" and " - <number>"
          const cleanedTitle = variant.displayName
            .replace(' - Default Title', '')  // Remove ' - Default Title'
            .replace(/\s-\s\d+$/, '')         // Remove ' - <number>' at the end
            .trim();                          // Trim any extra spaces
      
          return {
            title: cleanedTitle,              // Use the cleaned title here
            variantId: variant.id,
            productId: product.id,
            image: product.images[0]?.originalSrc || "",
            status: product.status,
          };
        })
      );
      

      console.log("productDetails-----",productDetails)
  
      const newProductIds = selected.selection
        .map((product) =>
          product.variants.length > 1
            ? product.variants.map((variant) => variant.id)
            : [product.variants[0].id]
        )
        .flat();


        console.log("newProductIds",newProductIds);
        
  
      if (collectionId !== 0) {
        // Edit mode
      // Still loading while fetching GraphQL data
     
  
        const mergedProductIds = [...editedproductIds, ...newProductIds];
  
        await fetchGraphQLData(mergedProductIds);
       
  
        setProductIds(mergedProductIds);
        const mergedProductDetails = [
          ...editedproductIds.map((id, index) => ({
            title: productTitles[index],
            image: productImages[index],
          })),
          ...productDetails,
        ];
  
        setProductTitles(mergedProductDetails.map((product) => product.title));
        setProductImages(mergedProductDetails.map((product) => product.image));

      } else {
        setProductIds(newProductIds);
        setProductTitles(productDetails.map((product) => product.title));
        setProductImages(productDetails.map((product) => product.image));
      }
  
      // setLoading(false); // Stop loading once products are loaded
      setCreateBundleLoader(false);
  
      return selected.selection;
    } catch (error) {
      // setLoading(false); // Stop loading in case of an error
      console.error("Error picking resources:", error);
      setGeneralError("Failed to pick resources.");
      setCreateBundleLoader(false);
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
      setEditcreateBundlerLoader(true)
      setShoweditedbundle(true);
      const fetchBundle = async () => {
       
        try {
          const response = await fetch(`/api/bundles/${collectionId}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const bundle = await response.json(); // Assuming it returns an array of bundles
          console.log("BUNDLE_FETCHED_SINGLE", bundle);
        

          if (bundle) {
            setTitle(bundle.title);
            // Set other state variables if needed
            setHandle(bundle.handle);
          
            setEditedImage(bundle.image || ""); // Example: Set image if available
            // reader.readAsDataURL(acceptedFiles[0]);
            // setFile(bundle.image || ""); // Example: Set image if available
            setSelectedBunches(
              bundle.bunches.map((bunch) => ({ value: bunch, label: bunch })),
            ); // Example: Set bunches
            fetchGraphQLData(bundle.products || []);
            setEditedProductIds(bundle.products || []);
            console.log("productsids", bundle.products);
            console.log("EditedBundleLoader",editcreateBundlerLoader);
            
            
           setEditcreateBundlerLoader(false)
            
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
  console.log("EditedBundleLoader",editcreateBundlerLoader);

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
    setIsLoading(true);
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
      setIsLoading(false);
      return;
    }
  
    // If no new products are selected, use the edited products
    const productsToUpdate = productIds.length > 0 ? productIds : editedproductIds;
    console.log("productsId---------------",productIds);
    
  
    // Prepare updated data object
    const updatedData = {
      title,
      image: imageToUpdate,
      bunches: selectedBunches.map((option) => option.value),
      products: productsToUpdate, // Use existing products if no new ones are selected
      handle,
    };
    console.log("updatedData", updatedData);
  
    try {
      // Make the update request
      const response = await fetch(`/api/product/${collectionId}`, {
        method: "PUT", // Using PUT for updates
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
          setProductIds([]);
          setGeneralError("");
  
          toggleToast(); // Show success toast
  
          // Navigate back after a delay
          setTimeout(() => {
            navigate(`/app/bundles`);
          }, 2000); // Navigate back after 2 seconds
        }
        console.log("Bundle updated successfully!");
        setIsLoading(false);
        updatedToast(); // Show a success toast
      } else {
        console.error("Failed to update bundle");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("An error occurred:", error);
      setIsLoading(false);
    }
  };
  
  


  const handleDelete = async (index) => {
    // Calculate the actual index considering pagination
    const actualIndex = index + ((currentPage - 1) * itemsPerPage);
    
    console.log("Deleting product at index:", actualIndex);
    console.log("Products ids",productIds)
    // productIds.splice(index,1)
    
  
    setProductTitles((prevTitles) => {
      const updatedTitles = [...prevTitles];
      updatedTitles.splice(index, 1); // Remove the product title at the specific index
      return updatedTitles;
    });
  
    setProductImages((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1); // Remove the product image at the specific index
      return updatedImages;
    });
  
    setEditedProductIds((prevProductIds) => {
      const updatedProductIds = [...prevProductIds];
      updatedProductIds.splice(index, 1); // Remove the productId at the specific index
      console.log("Updated productIds after deletion:", updatedProductIds);
      return updatedProductIds;
    });

    setProductIds((prevProductIds) => {
      const updatedProductIds = [...prevProductIds];
      updatedProductIds.splice(actualIndex, 1); // Remove the productId at the specific actualIndex
      console.log("Updated productIds after deletion:", updatedProductIds);
      return updatedProductIds;
    });

    handleInputChange()
  
    // Prepare the updated data object for the bundle update
    const updatedData = {
      title,
      image: image || editedimage,
      bunches: selectedBunches.map((option) => option.value),
      products: editedproductIds.filter((_, i) => i !== actualIndex), 
      handle,
    };
  
    try {
      // Make the update request to the server to update the bundle
      const response = await fetch(`/api/product/${collectionId}`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      deleteToast()
  
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



editcreateBundlerLoader ? (
  // Loader for when editing data is still being fetched
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "500px",
    }}
  >
    <Spinner accessibilityLabel="Loading edit form" size="large" />
  </div>
) : (
  // The Edit Bundle form, once data has been fetched
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
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  borderStyle: "groove",
                  borderRadius: "15px",
                  padding: "10px",
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

          {createBundleLoader ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "500px",
              }}
            >
              <Spinner accessibilityLabel="Loading products" size="large" />
            </div>
          ) : (
            <IndexTable
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
                { title: "Actions" },
              ]}
              selectable={false}
              bulkActions={[]}
            >
              {rows}
            </IndexTable>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
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

      <br />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          disabled={!hasChanges}
          loading={isLoading}
          onClick={handleSubmit}
          variant="primary"
        >
          Update
        </Button>
      </div>
    </Page>
  </Frame>
)
      ) : (
        <Frame>
          <Page
            backAction={{ content: "Collections", url: "/app/bundles" }}
            title="Create a Bundle"
            compactTitle
            primaryAction={{
              content: "Save",
              onAction: handleSubmit,
              disabled:  isLoading || !hasChanges,
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
                {createBundleLoader ? (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px' }}>
    <Spinner accessibilityLabel="Loading products" size="large" />
  </div>
) : (
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
        { title: "Actions" },
      ]}
      selectable={false}
      bulkActions={[]}
    >
      {rows}
    </IndexTable>
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Pagination
        hasPrevious={currentPage > 1}
        onPrevious={handlePreviousPage}
        hasNext={currentPage < totalPages}
        onNext={handleNextPage}
      />
    </div>
  </div>
)}

              </BlockStack>
            </LegacyCard>

            {toastMarkup}
            {deletetoastMarkup}
            {/* {console.log("toastMarkup",toastMarkup)} */}
            <br />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                 disabled={!hasChanges}
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
