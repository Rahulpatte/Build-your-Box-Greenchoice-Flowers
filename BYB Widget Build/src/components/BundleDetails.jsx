// src/components/BundleDetails.jsx
import React from 'react';
import BunchSelector from './BunchSelector';
import "../index.css"

const BundleDetails = ({ bundle, selectedBunch, onBunchChange, onContinue ,handleInputChange}) => {
  return (
    <div className="App">



      <h2>{bundle.title}</h2>
      <div className='bundle-details'>
      <div className='bundle'>
      <img  src={bundle.image} alt={bundle.title} />
      
      </div>
  
      {bundle.bunches && (
        <BunchSelector
          bunches={bundle.bunches}
          selectedBunch={selectedBunch}
          onBunchChange={onBunchChange}
          onContinue={onContinue}
          onInputChange={handleInputChange} 
        />
      )}
      </div>
    
    </div>
  );
};

export default BundleDetails;
