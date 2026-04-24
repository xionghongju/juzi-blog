import React from 'react'

export interface OutfitDef {
  name: string
  emoji: string
  bodyColor: string
  render: () => React.ReactNode
}

export const OUTFITS: OutfitDef[] = [
  {
    name: '素颜出镜',
    emoji: '🤖',
    bodyColor: 'url(#ai-rg-dark)',
    render: () => null,
  },
  {
    name: '西装革履',
    emoji: '👔',
    bodyColor: '#1e293b',
    render: () => (
      <g>
        <polygon points="19,55 35,66 19,83" fill="#334155" />
        <polygon points="51,55 35,66 51,83" fill="#334155" />
        <polygon points="28,55 35,63 42,55" fill="white" />
        <polygon points="32,60 35,74 38,60 35,56" fill="#dc2626" />
        <polygon points="33,74 35,80 37,74 35,76" fill="#b91c1c" />
        <circle cx="35" cy="68" r="1.8" fill="#475569" />
        <circle cx="35" cy="74" r="1.8" fill="#475569" />
        <rect x="20" y="58" width="7" height="5" rx="1" fill="white" opacity="0.8" />
      </g>
    ),
  },
  {
    name: '大厨当家',
    emoji: '👨‍🍳',
    bodyColor: '#fef3c7',
    render: () => (
      <g>
        <ellipse cx="35" cy="10" rx="18" ry="9" fill="#fffbeb" stroke="rgba(0,0,0,0.12)" strokeWidth="1" />
        <rect x="17" y="7" width="36" height="6" rx="2" fill="#fef3c7" />
        <rect x="15" y="12" width="40" height="5" rx="2" fill="#fde68a" />
        <path d="M24 10 Q35 4 46 10" stroke="#fbbf24" strokeWidth="1.5" fill="none" />
        <rect x="18" y="55" width="34" height="26" rx="7" fill="#fffbeb" stroke="rgba(0,0,0,0.12)" strokeWidth="1" opacity="0.97" />
        <rect x="30" y="55" width="10" height="26" fill="#fef9c3" opacity="0.5" />
        <rect x="22" y="68" width="11" height="8" rx="2" fill="#fde68a" />
        <path d="M26,55 Q35,51 44,55" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="18" y1="58" x2="7" y2="54" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <line x1="52" y1="58" x2="63" y2="54" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="42" cy="60" r="2" fill="#f59e0b" />
        <circle cx="42" cy="66" r="2" fill="#f59e0b" />
      </g>
    ),
  },
  {
    name: '宇宙飞行员',
    emoji: '🚀',
    bodyColor: '#94a3b8',
    render: () => (
      <g>
        <path d="M13,26 Q35,20 57,26 L55,44 Q35,50 15,44 Z" fill="rgba(56,189,248,0.38)" stroke="#0ea5e9" strokeWidth="2"/>
        <path d="M16,28 Q35,22 54,28" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"/>
        <path d="M8,32 Q8,56 35,56 Q62,56 62,32" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"/>
        <rect x="17" y="57" width="14" height="9" rx="2" fill="#1d4ed8" />
        <circle cx="24" cy="61" r="3" fill="#f97316" opacity="0.8"/>
        <path d="M21 61 L27 61" stroke="white" strokeWidth="1" />
        <circle cx="49" cy="58" r="6" fill="#0f172a" />
        <circle cx="49" cy="58" r="4" fill="#22c55e" opacity="0.85" />
        <path d="M46 58 L52 58 M49 55 L49 61" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
        <rect x="20" y="70" width="30" height="7" rx="3" fill="#334155" />
        <circle cx="28" cy="73" r="2" fill="#f87171" opacity="0.8"/>
        <circle cx="35" cy="73" r="2" fill="#fbbf24" opacity="0.8"/>
        <circle cx="42" cy="73" r="2" fill="#4ade80" opacity="0.8"/>
      </g>
    ),
  },
  {
    name: '足球少年',
    emoji: '⚽',
    bodyColor: '#dc2626',
    render: () => (
      <g>
        <rect x="18" y="55" width="34" height="7" fill="white" opacity="0.25" />
        <rect x="18" y="69" width="34" height="7" fill="white" opacity="0.25" />
        <text x="35" y="69" textAnchor="middle" fill="white" fontSize="15" fontWeight="900" fontFamily="Arial Black, sans-serif" opacity="0.9">9</text>
        <path d="M27,55 Q35,61 43,55" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <rect x="1" y="57" width="12" height="5" rx="2" fill="white" opacity="0.45" />
        <rect x="57" y="57" width="12" height="5" rx="2" fill="white" opacity="0.45" />
        <rect x="1" y="62" width="12" height="4" rx="1" fill="#fbbf24" opacity="0.8" />
        <text x="35" y="79" textAnchor="middle" fill="white" fontSize="5" fontFamily="Arial, sans-serif" opacity="0.7">JUZI</text>
      </g>
    ),
  },
  {
    name: '超级英雄',
    emoji: '🦸',
    bodyColor: '#7c3aed',
    render: () => (
      <g>
        <path d="M19,55 L7,84 Q35,72 63,84 L51,55 Q35,63 19,55Z" fill="#dc2626" opacity="0.92"/>
        <path d="M19,55 Q35,60 51,55" stroke="#b91c1c" strokeWidth="1.5" fill="none"/>
        <polygon points="35,56 37.5,63 45,63 39,67.5 41.5,74.5 35,70 28.5,74.5 31,67.5 25,63 32.5,63" fill="#fbbf24" />
        <rect x="11" y="28" width="12" height="7" rx="3.5" fill="#1a1a2e" />
        <rect x="47" y="28" width="12" height="7" rx="3.5" fill="#1a1a2e" />
        <rect x="23" y="31" width="24" height="3" rx="1.5" fill="#1a1a2e" />
        <rect x="17" y="75" width="36" height="6" rx="3" fill="#92400e" />
        <rect x="31" y="74" width="8" height="8" rx="2" fill="#fbbf24" />
        <text x="35" y="80" textAnchor="middle" fill="#92400e" fontSize="5" fontWeight="bold">⚡</text>
      </g>
    ),
  },
  {
    name: '橘子农夫',
    emoji: '🌾',
    bodyColor: '#92400e',
    render: () => (
      <g>
        <ellipse cx="35" cy="14" rx="30" ry="7" fill="#d97706" />
        <ellipse cx="35" cy="11" rx="19" ry="10" fill="#b45309" />
        <rect x="16" y="12" width="38" height="4" rx="1" fill="#f59e0b" />
        <path d="M22 10 Q35 5 48 10" stroke="#fbbf24" strokeWidth="1.5" fill="none" opacity="0.5"/>
        <rect x="22" y="50" width="6" height="30" rx="3" fill="#1d4ed8" />
        <rect x="42" y="50" width="6" height="30" rx="3" fill="#1d4ed8" />
        <rect x="20" y="55" width="30" height="20" rx="5" fill="#2563eb" />
        <rect x="28" y="59" width="14" height="10" rx="3" fill="#1d4ed8" />
        <circle cx="35" cy="64" r="4.5" fill="#f97316" />
        <path d="M35,59.5 Q37,57 36,55" stroke="#16a34a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <circle cx="24" cy="71" r="2" fill="#92400e" opacity="0.4"/>
        <circle cx="46" cy="68" r="1.5" fill="#92400e" opacity="0.3"/>
      </g>
    ),
  },
]
