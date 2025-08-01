import React from 'react';
import Confetti from 'react-confetti';

const ConfettiOverlay = ({ show, numberOfPieces = 200 }) => {
  if (!show && numberOfPieces === 0) return null;
  return (
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={show ? numberOfPieces : 0}
      recycle={false}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  );
};

export default ConfettiOverlay;