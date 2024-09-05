import React, { useEffect, useRef } from 'react';
// import './index.css';
const ProductScroller = ({ data ,handleClick}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const scrollContainer = containerRef.current;
    let scrollInterval;

    const startScrolling = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          scrollContainer.scrollBy({ left: scrollContainer.clientWidth / 4, behavior: 'smooth' });
          // Stop scrolling when the end is reached
          if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
            clearInterval(scrollInterval);
          }
        }
      }, 2000); // Adjust the interval as needed
    };

    startScrolling();

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className='container' ref={containerRef}>
      {
        data.map((item, index) => (
          <div onClick={() => handleClick(index)} className="App" key={index}>
            <img src={item.image} alt={item.title} />
            <h3>{item.title}</h3>
          </div>
        ))
      }
    </div>
  );
};

export default ProductScroller;
