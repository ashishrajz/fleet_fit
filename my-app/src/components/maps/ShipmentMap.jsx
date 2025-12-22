export default function ShipmentMap({ source, destination }) {
    return (
      <div className="w-full h-48 bg-slate-50 flex items-center justify-center">
        <svg
          viewBox="0 0 400 450"
          className="h-full w-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect width="100%" height="100%" fill="#f8fafc" />
  
          {/* India rough silhouette (schematic but recognizable) */}
          <path
            d="M170 30
               L230 60
               L260 110
               L250 160
               L280 220
               L260 300
               L230 360
               L200 410
               L180 360
               L160 320
               L140 260
               L120 200
               L130 140
               L150 90
               Z"
            fill="#e5e7eb"
            stroke="#64748b"
            strokeWidth="2"
          />
  
          {/* Source marker */}
          <circle cx="180" cy="180" r="6" fill="#16a34a" />
          <text x="190" y="176" fontSize="12" fill="#166534">
            {source}
          </text>
  
          {/* Destination marker */}
          <circle cx="220" cy="280" r="6" fill="#dc2626" />
          <text x="230" y="276" fontSize="12" fill="#991b1b">
            {destination}
          </text>
  
          {/* Route line */}
          <line
            x1="180"
            y1="180"
            x2="220"
            y2="280"
            stroke="#0f172a"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </svg>
      </div>
    );
  }
  