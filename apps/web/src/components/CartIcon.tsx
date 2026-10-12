'use client';

import React from 'react';
import Image from 'next/image';

interface CartIconProps {
  className?: string;
  size?: number;
  useImage?: boolean;
}

export const CartIcon: React.FC<CartIconProps> = ({
  className = 'w-5 h-5',
  size,
  useImage = false,
}) => {
  if (useImage) {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <Image
          src="/cart-icon.png"
          alt="Cart"
          width={size || 24}
          height={size || 24}
          className="object-contain w-full h-full"
        />
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
    >
      {/* Angled Push Handle */}
      <path
        d="M 12 16 L 22 22 L 35 60"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Basket Outer Rim */}
      <path
        d="M 28 28 L 86 28 L 76 60 L 35 60 Z"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Horizontal Wire Grid Lines */}
      <line x1="31" y1="39" x2="82" y2="39" strokeWidth="5" strokeLinecap="round" />
      <line x1="33" y1="50" x2="78" y2="50" strokeWidth="5" strokeLinecap="round" />
      {/* Vertical Wire Grid Lines */}
      <line x1="44" y1="28" x2="43" y2="60" strokeWidth="5" strokeLinecap="round" />
      <line x1="58" y1="28" x2="57" y2="60" strokeWidth="5" strokeLinecap="round" />
      <line x1="72" y1="28" x2="70" y2="60" strokeWidth="5" strokeLinecap="round" />
      {/* Chassis Beam Under Basket */}
      <path
        d="M 32 67 L 76 67"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Dual Cart Wheels */}
      <circle cx="41" cy="79" r="6" strokeWidth="6" />
      <circle cx="68" cy="79" r="6" strokeWidth="6" />
    </svg>
  );
};
