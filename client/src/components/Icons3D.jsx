import React from 'react';

// High-fidelity, vibrant 3D Medical Specialty & Feature Icons with volumetric gradients & highlights

export function HeartIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #FFE4E6 0%, #FECDD3 50%, #FDA4AF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 20px -5px rgba(244, 63, 94, 0.35), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(225, 29, 72, 0.2)',
      position: 'relative',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <defs>
          <radialGradient id="heart3d" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="50%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#9F1239" />
          </radialGradient>
          <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#881337" floodOpacity="0.4" />
          </filter>
        </defs>
        <path
          d="M24 41.5s-16-9.8-16-22.5A10.5 10.5 0 0 1 18.5 8.5c3.2 0 6.2 1.5 8 4 1.8-2.5 4.8-4 8-4A10.5 10.5 0 0 1 45 19c0 12.7-16 22.5-16 22.5L24 41.5z"
          fill="url(#heart3d)"
          filter="url(#shadow3d)"
        />
        {/* Specular highlight */}
        <ellipse cx="16" cy="14" rx="4" ry="2" transform="rotate(-30 16 14)" fill="#FFFFFF" opacity="0.65" />
      </svg>
    </div>
  );
}

export function SparklesIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #FCD34D 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.35), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(180, 83, 9, 0.2)',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="spark3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="60%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <path
          d="M24 4L28.5 17.5L42 22L28.5 26.5L24 40L19.5 26.5L6 22L19.5 17.5L24 4Z"
          fill="url(#spark3d)"
        />
        <circle cx="36" cy="10" r="4" fill="#F59E0B" opacity="0.8" />
        <circle cx="12" cy="34" r="3" fill="#F59E0B" opacity="0.8" />
      </svg>
    </div>
  );
}

export function BrainIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 50%, #C4B5FD 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 20px -5px rgba(124, 58, 237, 0.35), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(91, 33, 182, 0.2)',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="brain3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="60%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
        </defs>
        <path
          d="M22 10a7 7 0 0 0-14 3.5 8 8 0 0 0-1 9 7.5 7.5 0 0 0 4 13.5 7 7 0 0 0 11 0V10zm4 0v26a7 7 0 0 0 11 0 7.5 7.5 0 0 0 4-13.5 8 8 0 0 0-1-9A7 7 0 0 0 26 10z"
          fill="url(#brain3d)"
        />
        <line x1="24" y1="9" x2="24" y2="38" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function BabyIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 20px -5px rgba(2, 132, 199, 0.35), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(3, 105, 161, 0.2)',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <defs>
          <radialGradient id="baby3d" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </radialGradient>
        </defs>
        <circle cx="24" cy="22" r="14" fill="url(#baby3d)" />
        <circle cx="19" cy="20" r="2.5" fill="#FFFFFF" />
        <circle cx="29" cy="20" r="2.5" fill="#FFFFFF" />
        <path d="M20 27c1.5 2 6.5 2 8 0" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M12 12c-3 0-5 2.5-5 5.5s2 5.5 5 5.5" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
        <path d="M36 12c3 0 5 2.5 5 5.5s-2 5.5-5 5.5" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function FemaleIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 50%, #F472B6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 20px -5px rgba(219, 39, 119, 0.35), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(157, 23, 77, 0.2)',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="fem3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="60%" stopColor="#DB2777" />
            <stop offset="100%" stopColor="#9D174D" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="18" r="11" stroke="url(#fem3d)" strokeWidth="5" fill="none" />
        <path d="M24 29v14M17 37h14" stroke="url(#fem3d)" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function ToothIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 50%, #5EEAD4 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 20px -5px rgba(13, 148, 136, 0.35), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(15, 118, 110, 0.2)',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="tooth3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="60%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#0F766E" />
          </linearGradient>
        </defs>
        <path
          d="M14 8c-6 0-9 4-9 10 0 6 3 13 6 19 2 4 4 7 7 7s3-4 4-8c1-4 2-8 2-8s1 4 2 8c1 4 2 8 4 8s5-3 7-7c3-6 6-13 6-19 0-6-3-10-9-10-4 0-6 3-8 3s-4-3-8-3z"
          fill="url(#tooth3d)"
        />
        <ellipse cx="18" cy="14" rx="4" ry="2" fill="#FFFFFF" opacity="0.6" />
      </svg>
    </div>
  );
}

export function StethoscopeIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 50%, #86EFAC 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 20px -5px rgba(22, 163, 74, 0.35), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(21, 128, 61, 0.2)',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="steth3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="60%" stopColor="#16A34A" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        <path
          d="M10 8v12a10 10 0 0 0 20 0V8m-20 0h-4M30 8h4m-14 22v8a4 4 0 0 0 8 0v-4"
          stroke="url(#steth3d)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="38" cy="30" r="5" fill="#16A34A" />
        <circle cx="38" cy="30" r="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function ActivityIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 50%, #FDBA74 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 20px -5px rgba(234, 88, 12, 0.35), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(194, 65, 12, 0.2)',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <defs>
          <linearGradient id="act3d" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="60%" stopColor="#EA580C" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>
        <path
          d="M6 24h9l6-16 8 32 6-16h7"
          stroke="url(#act3d)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function Hospital3DIcon({ size = 52 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #38BDF8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 16px -4px rgba(2, 132, 199, 0.3), inset 0 2px 3px rgba(255,255,255,0.8)',
    }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 6v4" />
        <path d="M14 8h-4" />
        <path d="M18 18h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2" />
        <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18Z" />
      </svg>
    </div>
  );
}

export function Video3DIcon({ size = 52 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #CCFBF1 0%, #99F6E4 50%, #2DD4BF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 16px -4px rgba(13, 148, 136, 0.3), inset 0 2px 3px rgba(255,255,255,0.8)',
    }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="#0F766E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
        <rect x="2" y="6" width="14" height="12" rx="3" />
      </svg>
    </div>
  );
}

export function Shield3DIcon({ size = 52 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 50%, #34D399 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 16px -4px rgba(5, 150, 105, 0.3), inset 0 2px 3px rgba(255,255,255,0.8)',
    }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    </div>
  );
}

export function Clock3DIcon({ size = 52 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 50%, #818CF8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.3), inset 0 2px 3px rgba(255,255,255,0.8)',
    }}>
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </div>
  );
}

export const SPECIALTY_3D_MAP = {
  cardiology: HeartIcon3D,
  dermatology: SparklesIcon3D,
  neurology: BrainIcon3D,
  pediatrics: BabyIcon3D,
  gynecology: FemaleIcon3D,
  dentistry: ToothIcon3D,
  'general-medicine': StethoscopeIcon3D,
  orthopedics: ActivityIcon3D,
};

// ==========================================
// 3D HOSPITAL DIAGNOSTIC & IMAGING SERVICES
// ==========================================

export function XRayIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0369A1 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 22px -5px rgba(2, 132, 199, 0.45), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.5)',
      position: 'relative',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <rect x="6" y="6" width="36" height="36" rx="8" stroke="#38BDF8" strokeWidth="2.5" fill="#0284C7" fillOpacity="0.2" />
        <line x1="24" y1="12" x2="24" y2="36" stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" />
        <path d="M16 18c4 2 12 2 16 0" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M14 24c5 3 15 3 20 0" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16 30c4 2 12 2 16 0" stroke="#BAE6FD" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="6" fill="#38BDF8" opacity="0.3" />
      </svg>
    </div>
  );
}

export function CtScanIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #E0F2FE 0%, #7DD3FC 50%, #0284C7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 22px -5px rgba(2, 132, 199, 0.4), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(3, 105, 161, 0.3)',
      position: 'relative',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="16" stroke="#0369A1" strokeWidth="4.5" />
        <circle cx="24" cy="24" r="9" fill="#0C4A6E" />
        <rect x="15" y="22" width="18" height="4" rx="2" fill="#38BDF8" />
        <line x1="8" y1="24" x2="40" y2="24" stroke="#F43F5E" strokeWidth="1.8" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}

export function MriScanIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #EDE9FE 0%, #C4B5FD 50%, #7C3AED 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 22px -5px rgba(124, 58, 237, 0.4), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(91, 33, 182, 0.3)',
      position: 'relative',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="24" rx="16" ry="17" stroke="#6D28D9" strokeWidth="4" />
        <circle cx="24" cy="24" r="8" fill="#4C1D95" />
        <path d="M12 24h24" stroke="#A78BFA" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M24 14v20" stroke="#DDD6FE" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="24" r="3" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

export function SonographyIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #CCFBF1 0%, #5EEAD4 50%, #0D9488 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 22px -5px rgba(13, 148, 136, 0.4), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(15, 118, 110, 0.3)',
      position: 'relative',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <rect x="18" y="8" width="12" height="12" rx="3" fill="#134E4A" />
        <path d="M16 20h16l-3 4H19l-3-4z" fill="#042F2E" />
        <path d="M16 28c4 3 12 3 16 0" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        <path d="M12 34c7 4 17 4 24 0" stroke="#CCFBF1" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M8 40c10 5 22 5 32 0" stroke="#99F6E4" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function BloodTestIcon3D({ size = 56 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '24%',
      background: 'linear-gradient(135deg, #FFE4E6 0%, #FDA4AF 50%, #E11D48 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 22px -5px rgba(225, 29, 72, 0.4), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(159, 18, 57, 0.3)',
      position: 'relative',
    }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 48 48" fill="none">
        <rect x="19" y="8" width="10" height="26" rx="5" stroke="#FFFFFF" strokeWidth="2.5" fill="#FFE4E6" fillOpacity="0.4" />
        <rect x="17" y="6" width="14" height="4" rx="2" fill="#BE123C" />
        <path d="M20 22h8v7a4 4 0 0 1-8 0v-7z" fill="#BE123C" />
        <path d="M36 28c0 3.5-3 6.5-6 6.5s-6-3-6-6.5c0-3 6-9.5 6-9.5s6 6.5 6 9.5z" fill="#9F1239" />
        <circle cx="28" cy="28" r="1.5" fill="#FFFFFF" opacity="0.8" />
      </svg>
    </div>
  );
}
