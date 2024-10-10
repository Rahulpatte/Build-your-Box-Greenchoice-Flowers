import React, { useEffect, useState, useCallback } from 'react';
import { IndexTable, Card, Page, Button, Thumbnail, Modal, TextContainer, Toast, Frame, ButtonGroup,Spinner ,InlineStack,Text,Pagination} from '@shopify/polaris';
import { useNavigate } from '@remix-run/react';

export default function CollectionsTable({ productId }) {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const[viewloading,setViewLoading] = useState(true);
  const [deleteModalActive, setDeleteModalActive] = useState(false);  // Modal for deletion
  const [bundleToDelete, setBundleToDelete] = useState(null); // Keep track of the bundle to delete
  const [toastActive, setToastActive] = useState(false); // Toast state for deletion confirmation
  const [bundleIndex, setBundleIndex] = useState(null);
  const navigate = useNavigate();
const[productData,setProductData] = useState([]);



  // -----------------------------------view products modal------------------------------------------------

  const [viewproductsactive, setViewProductsActive] = useState(false);

  const handleviewproductsChange = useCallback(() => setViewProductsActive(!viewproductsactive), [viewproductsactive]);

  const handleScrollBottom = useCallback(() => alert('Scrolled to bottom'), []);






// ------------------------------------Pagination--------------------------------------------------------------

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5; // Set the number of items per page

// Calculate the starting and ending index for the current page
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;

// Get the bundles to display on the current page
const paginatedBundles = bundles.slice(startIndex, endIndex);

// Pagination handler
const handleNextPage = useCallback(() => {
  setCurrentPage((prevPage) => prevPage + 1);
}, []);

const handlePreviousPage = useCallback(() => {
  setCurrentPage((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
}, []);






  



  const toggleToast = useCallback(() => setToastActive((active) => !active), []);

  const toastMarkup = toastActive ? (
    <Toast content="Deleted Successfully" onDismiss={toggleToast} />
  ) : null;

  // Toggle delete modal
  const toggleDeleteModal = useCallback(() => setDeleteModalActive(!deleteModalActive), [deleteModalActive]);

  const fetchGraphQLData = async (productIds) => {
    
try {
  const response = await fetch(
    `/api/editproductDetails`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productIds }), // Send product IDs to the backend
    },
  );
  const result = await response.json();
  
  console.log("Product Details Result", result);

 
  const updatedProducts = result.data.map(product => ({
    ...product,
    displayName: product.displayName
      .replace(" - Default Title", "")   // Remove ' - Default Title'
      .replace(/\s-\s\d+$/, "")          // Remove ' - <number>' at the end
      .trim()                            // Trim any extra spaces
  }));

  console.log("updated products----------------",updatedProducts);
  
  

setProductData(updatedProducts)
setViewLoading(false)

} catch (error) {
  
}
  
  };


  const handleDeleteBundle = async () => {
    if (!bundleToDelete) return;

    try {
      const response = await fetch(`/api/bundles/delete/${bundleToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBundles(bundles.filter((bundle) => bundle._id !== bundleToDelete));
        toggleDeleteModal();
        toggleToast(); // Show the toast after successful deletion
      } else {
        const error = await response.json();
        console.error('Failed to delete bundle:', error.error);
      }
    } catch (error) {
      console.error('Failed to delete bundle:', error);
    }
  };

  const handleEditBundle = (bundle) => {
    return navigate(`/app/bundle/create/${bundle._id}`);
  };

  const confirmDeleteBundle = (bundleId) => {
    setBundleToDelete(bundleId);  // Set bundle to delete
    toggleDeleteModal();          // Open the modal
  };

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await fetch(`/api/bundles`);
        const data = await response.json();
      
        
        console.log("data",data);
        
        setBundles(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch bundles:', error);
        // setLoading(false);
      }
    };

    fetchBundles();
  }, [productId]);

  console.log('bundles',bundles[9]);

  const handleviewbundle=(index)=>{
    console.log("index",index);

    const actualIndex = index + ((currentPage - 1) * itemsPerPage);
    console.log("actualindex",actualIndex);
    

    setBundleIndex(actualIndex);
    // console.log("bundles",bundles);
    console.log("bundles",bundles[index]);
    


    const ids= bundles.map((bundle) => bundle.products);
    // console.log("ids",ids);
    fetchGraphQLData(ids[actualIndex]);
    setViewProductsActive(true);
    
    
    if(!viewproductsactive){
      setProductData([]);
    }
    setViewLoading(true);
    
  }

  console.log("productData",productData);

  const resourceName = {
    singular: 'bundle',
    plural: 'bundles',
  };

  const rowMarkup = paginatedBundles.map((bundle, index) => (
    <IndexTable.Row
      id={bundle._id}
      key={bundle._id}
      position={index}
    >

     
      <IndexTable.Cell>
        <Thumbnail source={bundle.image} alt={bundle.title} />
      </IndexTable.Cell>
     

      <IndexTable.Cell>{bundle.title}</IndexTable.Cell>
      <IndexTable.Cell>{bundle.bunches.join(', ')}</IndexTable.Cell>
      <IndexTable.Cell>{bundle.products.length}</IndexTable.Cell>
      {/* <IndexTable.Cell>{new Date(bundle.createdAt).toLocaleString()}</IndexTable.Cell> */}
      <IndexTable.Cell>
        <div style={{display: 'flex', justifyContent: 'center' ,alignItems: 'center'}}>
        <InlineStack gap="500">
      <Button onClick={() => handleEditBundle(bundle)}>Edit</Button>
        <Button destructive onClick={() => confirmDeleteBundle(bundle._id)}>Delete</Button>
        <Button onClick={() => handleviewbundle(index)}>Preview</Button>

      </InlineStack>
   
        </div>
  
      </IndexTable.Cell>
    </IndexTable.Row>
  ));
  const totalPages = Math.ceil(bundles.length / itemsPerPage); 

  return (
<>
{viewproductsactive && (
   <div style={{height: '0px'}}>
     <Frame>
       <Modal
         open={viewproductsactive}
         title="Products"
         onClose={handleviewproductsChange}
       >
         {viewloading ? (

<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '500px'}}>
<Spinner accessibilityLabel="Loading products" size="large" />

</div>

           
         ) : (
           productData.map((product, index) => (
             <Modal.Section key={index}>
               <div style={{ display: 'flex', alignItems: 'center', marginRight: '24px', justifyContent: 'space-between' }}>
                 <img
                   src={product.product.images.edges[0].node.src}
                   alt={product.displayName}
                   style={{
                     width: '50px',
                     height: '50px',
                     borderRadius: '10px',
                     marginRight: '16px',
                   }}
                 />
                 <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                   {product.displayName}
                 </span>
                 <span style={{ fontSize: '16px', color: '#666' }}>
                   ${product.price}
                 </span>
               </div>
             </Modal.Section>
           ))
         )}
       </Modal>
     </Frame>
   </div>
)}


    <Frame>
      <Page >

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="heading2xl" as="h4">
        All Bundles
      </Text>
      <ButtonGroup>
          <Button 
            primary
            onClick={() => navigate(`/app/bundle/create/0`)}
            accessibilityLabel="Create Collection"
          >
            Create a Bundle
          </Button>
        </ButtonGroup>
        </div>

     
        <br/>


      


<Card>
  <IndexTable
    resourceName={resourceName}
    itemCount={bundles.length}
    loading={loading}
    headings={[
      { title: 'Image',  },
      { title: 'Title',  },
      { title: 'Bunches',  },
      { title: 'Products',  },
      { title: 'Actions', alignment: 'center' },
    ]}
    selectable={false}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <IndexTable.Row>
      {bundles.map((bundle, index) => (
        <IndexTable.Cell key={index} align="center" flush="true" >
          {/* Add your row content here */}
        </IndexTable.Cell>
      ))}
    </IndexTable.Row>
    </div>
   
    {rowMarkup}
  </IndexTable>
  <div style={{display: 'flex', justifyContent: 'flex-end' }}>
  <Pagination
    hasPrevious={currentPage > 1}
    onPrevious={handlePreviousPage}
    hasNext={currentPage < totalPages}
    onNext={handleNextPage}
  />
  </div>

</Card>

    

        {/* Delete confirmation modal */}
        {deleteModalActive && (
          <Modal
            open={deleteModalActive}
            onClose={toggleDeleteModal}
            title="Confirm Deletion"
            primaryAction={{
              content: 'Yes, Delete',
              destructive: true,
              onAction: handleDeleteBundle,
            }}
            secondaryActions={[
              {
                content: 'Cancel',
                onAction: toggleDeleteModal,
              },
            ]}
          >
            <Modal.Section>
              <TextContainer>
                <p>Are you sure you want to delete this bundle? This action cannot be undone.</p>
              </TextContainer>
            </Modal.Section>
          </Modal>
        )}

        {toastMarkup}
      </Page>
    </Frame>

    </>
  );
}
