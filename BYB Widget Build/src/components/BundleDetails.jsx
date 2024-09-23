// src/components/BundleDetails.jsx
import React from 'react';
import BunchSelector from './BunchSelector';
import "../index.css"

const BundleDetails = ({ bundle, selectedBunch, onBunchChange, onContinue }) => {
  return (
    <div className="App">
      <h2>Bundle Details</h2>
      <div className='bundle-details'>
      <div className='bundle'>
      <img style={{ width: "350px", height: "250px" }} src={bundle.image} alt={bundle.title} />
      <h3>{bundle.title}</h3>
      </div>
  
      {bundle.bunches && (
        <BunchSelector
          bunches={bundle.bunches}
          selectedBunch={selectedBunch}
          onBunchChange={onBunchChange}
          onContinue={onContinue}
        />
      )}
      </div>
    
    </div>
  );
};

export default BundleDetails;
