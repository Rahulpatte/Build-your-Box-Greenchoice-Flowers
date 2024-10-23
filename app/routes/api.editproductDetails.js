import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const payload = await request.json();
  const { productIds } = payload;  // Extract productIds from the payload
  console.log("PAYLOAD", payload);

  const arr = [];

  // Loop through each product ID and make the GraphQL query
  for (let i = 0; i < productIds.length; i++) {
    const productId = productIds[i];  // Get the product ID

    const response = await admin.graphql(
      `#graphql
      # query {
      #   productVariant(id: "${productId}") {
      #     id
      #     displayName
      #     price
      #     product {
      #       id
      #       description
      #       images(first: 1) {
      #         edges {
      #           node {
      #             src
      #           }
      #         }
      #       }
      #     }
      #   }
      # }
      
      
 #graphql
 query {
    collection(id: "${productId}") {
      id
      title
      handle
      updatedAt
      image {
        url
      }
    }
  }
      
      `
    );

    const data = await response.json();
    console.log("DATA-------------------------------------", data);
    
    arr.push(data.data.collection);
  }

  // Do something with the array of product variants
  console.log("Product Variants Data", arr);

  return { success: true, data: arr };
};
