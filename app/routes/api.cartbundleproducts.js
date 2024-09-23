
import { authenticate } from "../shopify.server.js";

export const action = async ({ request, params }) => {
    try {
      const { session, admin } = await authenticate.public.appProxy(request);
  
    //   console.log("REQUEST", session);
      const { shop, accessToken } = session;
  
      // Parse request body to get the selected products
      const requestBody = await request.json();
      // console.log("BODYREQUET", requestBody);
      // const { items } = requestBody; // Selected products from frontend
      // console.log("ITEMS", items);

      const{price, images} = requestBody

      console.log("PRICE", price);
      console.log("IMAGE", images);
      
      const formattedImages = images.map(image => ({ src: image }));

      console.log("FORMATTEDIMAGES", formattedImages);
      
  
      // const formattedImages = image.map(image => ({ src: image }));
      // console.log("FORMATTEDIMAGES", formattedImages);
      
      // Create the new product
      const product = new admin.rest.resources.Product({ session: session });
      // console.log("Prod", product);
      
      product.title = "Build Your Box";
      // product.images=requestBody.image
      // product.price = 999;
      product.images = formattedImages

      product.variants = [{"price": price}];

      await product.save({
        update: true,
      });
  
      return {
        status: 200,
        message: 'Product updated successfully',
        product: product
      };
    } catch (error) {
      console.log("Error:", error);
      return {
        status: 500,
        message: 'Error while updating product',
      };
    }
  };
  