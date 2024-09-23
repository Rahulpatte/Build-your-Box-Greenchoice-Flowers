// src/components/BunchSelector.jsx
import React from 'react';

const BunchSelector = ({ bunches, selectedBunch, onBunchChange, onContinue }) => {
  return (
    <div className="bunches">
      <h4>Bunches</h4>
      <form>
        {bunches.map((bunch, index) => (
          <div key={index} className="checkbox">
            <input
              type="radio"
              id={`bunch-${bunch}`}
              name="bunch"
              value={bunch}
              checked={selectedBunch === bunch}
              onChange={() => onBunchChange(bunch)}
            />
            <label htmlFor={`bunch-${bunch}`}>Bunch Size: {bunch}</label>
          </div>
        ))}
      </form>
      <button onClick={onContinue} disabled={!selectedBunch}>Continue</button>
    </div>
  );
};

export default BunchSelector;
