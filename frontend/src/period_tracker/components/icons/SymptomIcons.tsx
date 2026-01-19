// Symptom Icons - Exact match from design

export const CrampsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Two stylized hands clutching an area suggesting abdomen or stomach */}
    <path d="M7 10C7 10 6 12 6 14C6 15.5 7.5 17 9 17C10.5 17 12 15.5 12 14C12 12 11 10 11 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <path d="M17 10C17 10 18 12 18 14C18 15.5 16.5 17 15 17C13.5 17 12 15.5 12 14C12 12 13 10 13 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    <ellipse cx="9" cy="12.5" rx="1.2" ry="1.5" fill="currentColor"/>
    <ellipse cx="15" cy="12.5" rx="1.2" ry="1.5" fill="currentColor"/>
  </svg>
);

export const InsomniaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Crescent moon */}
    <path d="M18 8C18 12.4183 14.4183 16 10 16C9.2643 16 8.5601 15.8589 7.9135 15.5989C7.9135 15.5989 9.5 14 9.5 12C9.5 10 7.9135 8.4011 7.9135 8.4011C8.5601 8.1411 9.2643 8 10 8C14.4183 8 18 8 18 8Z" fill="currentColor"/>
  </svg>
);

export const TenderBreastIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stylized plant with three leaves, possibly symbolizing sensitivity or growth */}
    <path d="M12 8L10.5 11.5L12 15L13.5 11.5L12 8Z" fill="currentColor"/>
    <path d="M12 15L10.5 17.5L12 20L13.5 17.5L12 15Z" fill="currentColor" opacity="0.7"/>
    <path d="M12 4L10.5 6.5L12 9L13.5 6.5L12 4Z" fill="currentColor" opacity="0.7"/>
    <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const AcneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Face with small raised bump (like a pimple) on the cheek */}
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="9" cy="10" r="1" fill="currentColor"/>
    <circle cx="15" cy="10" r="1" fill="currentColor"/>
    <path d="M9 14C9 14 10.5 16 12 16C13.5 16 15 14 15 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="16" cy="13" r="1.5" fill="currentColor" opacity="0.85"/>
  </svg>
);

export const FatigueIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Tired or dizzy face, characterized by two "X" marks for eyes */}
    <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <line x1="8" y1="10" x2="10" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="10" y1="10" x2="8" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="14" y1="10" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="16" y1="10" x2="14" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M9 16C9 16 10.5 18 12 18C13.5 18 15 16 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const BackacheIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Beetle/tick-like insect with multiple legs, conveying crawling or persistent pain */}
    <ellipse cx="12" cy="12" rx="6" ry="4" fill="currentColor"/>
    <circle cx="9.5" cy="11" r="0.8" fill="white"/>
    <circle cx="14.5" cy="11" r="0.8" fill="white"/>
    <line x1="6" y1="12" x2="4" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="6" y1="12" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="12" x2="20" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="12" x2="20" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="8" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="16" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const CravingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Fork and knife */}
    <path d="M8 4V20M8 4L6 6M8 4L10 6M8 8L6 10M8 8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M16 4V20M16 4C16 4 16 8 16 10C16 11.5 15 12 14 12C13 12 12 11.5 12 10C12 8 12 4 12 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
);

export const ItchingIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Triangular warning sign with exclamation mark inside */}
    <path d="M12 4L4 20H20L12 4Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="16" r="1" fill="currentColor"/>
  </svg>
);
