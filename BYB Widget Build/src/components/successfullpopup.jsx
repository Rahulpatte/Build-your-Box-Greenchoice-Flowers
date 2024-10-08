const SuccessPopup = ({ onClose }) => {
    return (
      <div className="success-popup-overlay">
        <div className="success-popup">
          <h3>Box added to cart!</h3>
          <div>
          <button className="Success-popup-ok" onClick={onClose}>Ok</button>
          <button className="Success-popup-viewcart" onClick={() => window.location.href = 'https://test-build-your-box.myshopify.com/cart'}>
  View Cart
</button>
</div>
        </div>
      </div>
    );
  };
  
  export default SuccessPopup