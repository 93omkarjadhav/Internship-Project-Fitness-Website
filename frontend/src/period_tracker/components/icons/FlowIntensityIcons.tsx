// Flow Intensity Icons - Exact match from design

export const SpottingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Two small, irregular, connected circles (resembling cells or tiny droplets) */}
    <ellipse cx="9" cy="12" rx="2.5" ry="3" fill="currentColor" opacity="0.9"/>
    <ellipse cx="15" cy="12" rx="2.5" ry="3" fill="currentColor" opacity="0.9"/>
    <path d="M11.5 12C11.5 12 12.5 12 13.5 12" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
  </svg>
);

export const LightIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Single classic teardrop or water droplet shape */}
    <path d="M12 7C12 7 8 11 8 15C8 17.2091 9.79086 19 12 19C14.2091 19 16 17.2091 16 15C16 11 12 7 12 7Z" fill="currentColor"/>
  </svg>
);

export const MediumIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Simple glass or cup, filled approximately halfway */}
    <rect x="7" y="8" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <rect x="7" y="14" width="10" height="6" rx="1" fill="currentColor"/>
    <path d="M8 7L9 8M16 7L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const HeavyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Three horizontal wavy lines, suggesting movement or strong current */}
    <path d="M5 9C5.5 8.5 8 8.5 8.5 9C9 9.5 11.5 9.5 12 9C12.5 8.5 15 8.5 15.5 9C16 9.5 17 9.5 17.5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M5 12C5.5 11.5 8 11.5 8.5 12C9 12.5 11.5 12.5 12 12C12.5 11.5 15 11.5 15.5 12C16 12.5 17 12.5 17.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M5 15C5.5 14.5 8 14.5 8.5 15C9 15.5 11.5 15.5 12 15C12.5 14.5 15 14.5 15.5 15C16 15.5 17 15.5 17.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);
