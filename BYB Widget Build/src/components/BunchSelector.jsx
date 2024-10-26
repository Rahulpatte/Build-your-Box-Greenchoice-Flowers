import React, { useEffect } from 'react';

const BunchSelector = ({ bunches, selectedBunch, onBunchChange, onContinue }) => {
  
  // Set the first bunch as selected by default on mount
  useEffect(() => {
    if (!selectedBunch && bunches.length > 0) {
      onBunchChange(bunches[0]);  // Automatically select the first bunch
    }
  }, [bunches, selectedBunch, onBunchChange]);
  console.log("Selected Bunch",selectedBunch);
  
  console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq")

  return (
    <div className="bunches">
      <h2>Choose Your Box</h2>
      <h4>SELECT NUMBER OF BUNCHES</h4>
      <form>
        {bunches.map((bunch, index) => (
          <div key={index} className={selectedBunch==bunch?"checkbox Active":"checkbox"}>
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
      <div className='bunch-placeholder'>
      <input className='bunhes-text' type='text' placeholder=''/>
      </div>
      
      <button className='btn btn--primary' onClick={onContinue} disabled={!selectedBunch}>
        Continue
      </button>
    </div>
  );
};

export default BunchSelector;
