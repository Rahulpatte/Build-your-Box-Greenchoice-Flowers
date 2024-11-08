import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  console.log("Coming ----------------");
  
  const { session, admin } = await authenticate.public.appProxy(request);
  const { shop, accessToken } = session;

  console.log(shop, accessToken, "ACCESS_AND_SHOP");
  // Ensure the request is a POST method
  if (request.method !== "POST") {
    return { status: 405, message: "Method not allowed" };
  }

  const requestBody = await request.json(); // Parse the request body
console.log("requestBody", requestBody);

  const { productIds } = requestBody;
  const arr = [];
console.log("productIds", productIds);

  for (let i = 0; i < productIds.length; i++) {
    const response = await admin.graphql(
      `
      #graphql
    #   query {
    #     productVariant(id: "${productIds[i]}") {
    #        sellingPlanGroups(first:10) {
    #   edges {
    #     node {
    #       id
    #       name
    #     }
    #   }
    # }
    #       id
    #       displayName
    #       price
    #       selectedOptions {
    #       value
    #       optionValue{
    #       name
    #       }
    #       name
    #       }
    #       product {
    #         id
    #         tags
    #         description
    #         images(first: 1) {
    #           edges {
    #             node {
    #               src
                  
    #             }
    #           }
    #         }
    #       }
    #     }
    #   }
      
    query {
    collection(id: "${productIds[i]}") {
      id
      title
      handle
      updatedAt
      image {
        url
      }
      products(first: 10) {
      edges {
        node {
          id
          title
          handle
          priceRangeV2 {
            minVariantPrice {
              amount
            }
            maxVariantPrice {
              amount
            }
          }
          images(first: 1) {
            edges {
              node {
                src
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                price
                sku
              }
            }
          }
        }
      }
    }

    }
  }
      
      `,
      
    );
    
    const data = await response.json();
    console.log("fetchproductdata", data);
    
    arr.push(data.data.collection);
  }

  
  //   return gids.map(gid => {
  //     const parts = gid.split('/');
  //     return parts.pop(); // This returns the last part of the array
  //   });
  // };

  // const ids = extractNumericIds(productIds).join('%2C');
  // console.log("productIds", productIds);

  // const ids = productIds.join('%2C');
  // console.log(ids);

  // const response = await fetch(`https://${shop}/admin/api/2024-07/products.json?ids=${ids}.json`, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "X-Shopify-Access-Token": accessToken
  //   }
  // })

  // const data = await response.json();
  // console.log(data);

  return arr;
};
