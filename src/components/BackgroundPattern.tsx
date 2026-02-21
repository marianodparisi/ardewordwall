export function BackgroundPattern() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <svg
        className="absolute w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Large blob — top left — primary */}
        <ellipse cx="120" cy="80" rx="280" ry="220" fill="#E8583A" opacity="0.06" />

        {/* Medium blob — top right — secondary */}
        <ellipse cx="1300" cy="150" rx="220" ry="180" fill="#F5B731" opacity="0.07" />

        {/* Small blob — center left — accent */}
        <circle cx="60" cy="500" r="160" fill="#F07C5A" opacity="0.05" />

        {/* Large blob — bottom right — primary */}
        <ellipse cx="1350" cy="780" rx="260" ry="200" fill="#E8583A" opacity="0.06" />

        {/* Organic blob — center — secondary */}
        <path
          d="M680 350 Q750 280 830 340 Q910 400 860 480 Q810 560 720 530 Q630 500 640 420 Q650 340 680 350Z"
          fill="#F5B731"
          opacity="0.04"
        />

        {/* Bottom left blob — accent */}
        <ellipse cx="200" cy="820" rx="240" ry="160" fill="#F07C5A" opacity="0.06" />

        {/* Top center — warm */}
        <circle cx="720" cy="50" r="120" fill="#D94425" opacity="0.04" />

        {/* Mid right — secondary */}
        <ellipse cx="1200" cy="460" rx="180" ry="140" fill="#F5B731" opacity="0.05" />

        {/* Organic shape — bottom center */}
        <path
          d="M600 800 Q680 740 770 780 Q860 820 820 890 Q780 960 690 940 Q600 920 560 860 Q520 800 600 800Z"
          fill="#E8583A"
          opacity="0.04"
        />

        {/* Small accent circles scattered */}
        <circle cx="400" cy="200" r="60" fill="#F07C5A" opacity="0.05" />
        <circle cx="1050" cy="300" r="45" fill="#F5B731" opacity="0.06" />
        <circle cx="300" cy="650" r="50" fill="#E8583A" opacity="0.04" />
        <circle cx="900" cy="600" r="70" fill="#D94425" opacity="0.03" />
        <circle cx="1100" cy="700" r="40" fill="#F5B731" opacity="0.05" />
      </svg>
    </div>
  )
}
