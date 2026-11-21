interface AquaMindLogoProps {
  size?: number;
  className?: string;
}

export function AquaMindLogo({ size = 28, className = '' }: AquaMindLogoProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="amDropGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="amLeafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ADE80" />
          <stop offset="100%" stopColor="#15803D" />
        </linearGradient>
      </defs>
      {/* Blue outer water droplet */}
      <path
        d="M17.5 3.5 C17.5 3.5 7 15.2 7 22.4 C7 28.4 11.7 32.5 17.5 32.5 C23.3 32.5 28 28.4 28 22.4 C28 15.2 17.5 3.5 17.5 3.5 Z"
        fill="url(#amDropGrad)"
      />
      {/* Crisp inner water reflection */}
      <path
        d="M15.2 8.2 C12.5 13 10.2 17.6 10.2 21.8 C10.2 25.4 12.6 28.1 15.8 29 C13.7 26.8 13.1 23.8 13.6 20.6 C14.1 17.2 15.6 13.4 15.2 8.2 Z"
        fill="#E0F2FE"
        opacity="0.88"
      />
      {/* Vibrant green leaf overlapping lower-right curve */}
      <path
        d="M17.2 29.8 C17.2 29.8 16.4 21.4 22.8 16.5 C27.2 13.1 30.8 14.2 30.8 14.2 C30.8 14.2 31.6 20.8 27.2 26.1 C23.7 30.3 18.8 30.6 17.2 29.8 Z"
        fill="url(#amLeafGrad)"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M18.2 28.9 C20.8 25.2 24.4 20.8 28.7 16.7"
        fill="none"
        stroke="#DCFCE7"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
