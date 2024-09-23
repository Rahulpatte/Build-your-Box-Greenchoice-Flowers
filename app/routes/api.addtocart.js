export const action=async({ request, params })=>{
    const { session } = await authenticate.public.appProxy(request);
    console.log("REQUEST", session)
    const {shop, accessToken} = await session;
    console.log(shop, accessToken, "ACCESS_AND_SHOP")
  
    
      // Ensure the request is a POST method
      if (request.method !== 'POST') {
        return { status: 405, message: 'Method not allowed' };
      }
  
      const requestBody = await request.json(); 
}