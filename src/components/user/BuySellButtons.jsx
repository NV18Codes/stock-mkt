import React from 'react';

const BuySellButtons = ({ onBuy, onSell }) => (
  <div style={{ marginTop: '1em', textAlign: 'center' }}>
    <button className="btn" style={{ marginRight: '1em' }} onClick={onBuy}>Buy</button>
    <button className="btn" onClick={onSell}>Sell</button>
  </div>
);

export default BuySellButtons; 