import React from 'react';

export default function NationalEmblem({ className = "w-10 h-10", color = "#0B2546" }) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="State Emblem of India"
    >
      {/* Three Lions Silhouette Profile */}
      <path
        d="M50 8 C46 8, 42 12, 42 17 C42 19, 43 21, 45 22 C41 23, 38 27, 38 31 C38 34, 40 37, 43 38 C39 40, 36 44, 36 49 C36 54, 40 58, 45 59 C44 61, 44 63, 44 65 L44 75 C44 77, 46 79, 49 80 L49 83 C45 83, 41 84, 37 86 C32 88, 28 92, 28 97 L72 97 C72 92, 68 88, 63 86 C59 84, 55 83, 51 83 L51 80 C54 79, 56 77, 56 75 L56 65 C56 63, 56 61, 55 59 C60 58, 64 54, 64 49 C64 44, 61 40, 57 38 C60 37, 62 34, 62 31 C62 27, 59 23, 55 22 C57 21, 58 19, 58 17 C58 12, 54 8, 50 8 Z"
        fill={color}
      />
      {/* Left Lion Mane & Profile */}
      <path
        d="M32 24 C28 24, 25 28, 25 32 C25 35, 27 38, 29 39 C26 41, 23 45, 23 50 C23 55, 27 59, 32 60 C32 63, 34 66, 36 68 L41 64 C38 62, 36 58, 36 54 C36 49, 39 45, 43 43 C42 41, 42 38, 42 35 C42 30, 45 26, 49 24 C45 21, 38 21, 32 24 Z"
        fill={color}
      />
      {/* Right Lion Mane & Profile */}
      <path
        d="M68 24 C72 24, 75 28, 75 32 C75 35, 73 38, 71 39 C74 41, 77 45, 77 50 C77 55, 73 59, 68 60 C68 63, 66 66, 64 68 L59 64 C62 62, 64 58, 64 54 C64 49, 61 45, 57 43 C58 41, 58 38, 58 35 C58 30, 55 26, 51 24 C55 21, 62 21, 68 24 Z"
        fill={color}
      />
      {/* Ashoka Chakra in Abacus */}
      <circle cx="50" cy="90" r="5" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="90" r="1.5" fill={color} />
      <line x1="50" y1="85" x2="50" y2="95" stroke={color} strokeWidth="0.8" />
      <line x1="45" y1="90" x2="55" y2="90" stroke={color} strokeWidth="0.8" />
      <line x1="46.5" y1="86.5" x2="53.5" y2="93.5" stroke={color} strokeWidth="0.8" />
      <line x1="46.5" y1="93.5" x2="53.5" y2="86.5" stroke={color} strokeWidth="0.8" />
      {/* Galloping Horse on Left */}
      <path d="M34 89 C32 87, 30 88, 29 90 C31 91, 33 91, 35 91 Z" fill={color} />
      {/* Bull on Right */}
      <path d="M66 89 C68 87, 70 88, 71 90 C69 91, 67 91, 65 91 Z" fill={color} />
      {/* Base Pedestal */}
      <rect x="22" y="97" width="56" height="3" rx="1" fill={color} />
      {/* Motto "सत्यमेव जयते" (Stylized Devanagari script base) */}
      <text
        x="50"
        y="108"
        textAnchor="middle"
        fontSize="7.5"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill={color}
        letterSpacing="0.8"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
}
