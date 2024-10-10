import React, { useState } from "react";
import "../index.css"

const TagSlider = ({ tags, handleTagClick, selectedTag ,handleShowAllProducts}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleTags = 3;

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < tags.length - visibleTags) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  console.log("setu index------------",currentIndex,tags.length - visibleTags)

  // tag.length<3?"slider-arrow inactive"
console.log("current index------------",currentIndex==tags.length - visibleTags)
  return (
    <div className="slider-container">
      <button className={tags.length<3?"slider-arrow inactive":currentIndex==0?"slider-arrow left disable":"slider-arrow left"} onClick={handlePrev}>
       
      </button>
      <div className="slider-wrapper">
        <div className="slider">
          {tags.slice(currentIndex, currentIndex + visibleTags).map((tag) => (
            <h3
              key={tag}
              className={selectedTag === tag || (tag === "All Products" && selectedTag === "") ? "active-tag" : "tag"}
              onClick={() => {
                if (tag === "All Products") {
                  handleShowAllProducts(); // Call this function if "All Products" is clicked
                } else {
                  handleTagClick(tag); // Otherwise, call the usual tag click handler
                }
              }}
            >
              {tag}
            </h3>
          ))}
        </div>
      </div>
      <button className={tags.length<3?"slider-arrow inactive":currentIndex==tags.length - visibleTags?"slider-arrow right disable":"slider-arrow right"} onClick={handleNext}>
       
      </button>
    </div>
  );
};

export default TagSlider;
