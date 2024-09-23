// src/components/BundleDetails.jsx
import React from 'react';
import BunchSelector from './BunchSelector';

const BundleDetails = ({ bundle, selectedBunch, onBunchChange, onContinue }) => {
  return (
    <div className="App">
      <h2>Bundle Details</h2>
      <img src={bundle.image} alt={bundle.title} />
      <h3>{bundle.title}</h3>
      {bundle.bunches && (
        <BunchSelector
          bunches={bundle.bunches}
          selectedBunch={selectedBunch}
          onBunchChange={onBunchChange}
          onContinue={onContinue}
        />
      )}
    </div>
  );
};

export default BundleDetails;
