// Authentic founder avatars for CareerGuide AI (THPT Vinschool Ocean Park - The NEXTX 2026)

// 1. Direct Online ImgBB CDN URLs provided by the team
export const FOUNDER_ONLINE_URLS = {
  nguyen_duc_lam: 'https://i.ibb.co/9kWbPKVD/Nguy-n-c-L-m.png',
  pham_viet_duc: 'https://i.ibb.co/60RtJD7w/Ph-m-Vi-t-c-1.png',
  phan_bao_ngoc: 'https://i.ibb.co/Z63Pp7hq/Phan-B-o-Ng-c.png',
  wang_si_qi: 'https://i.ibb.co/ycrtdhdq/Wang-Si-Qi.png'
};

// 2. Local high-speed public cache
export const FOUNDER_PHOTO_PATHS: Record<string, string> = {
  nguyen_duc_lam: '/founders/nguyen_duc_lam.png',
  pham_viet_duc: '/founders/pham_viet_duc.png',
  phan_bao_ngoc: '/founders/phan_bao_ngoc.png',
  wang_si_qi: '/founders/wang_si_qi.png'
};

// High-fidelity fallback SVG portraits
export const LAM_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgLam" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="50%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#090d16"/>
    </linearGradient>
    <linearGradient id="skinLam" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffe3cf"/>
      <stop offset="100%" stop-color="#f5caa6"/>
    </linearGradient>
    <linearGradient id="hairLam" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#24222a"/>
      <stop offset="70%" stop-color="#121118"/>
      <stop offset="100%" stop-color="#050508"/>
    </linearGradient>
    <linearGradient id="navyPoloLam" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#152445"/>
      <stop offset="100%" stop-color="#0a1226"/>
    </linearGradient>
    <filter id="shadowLam" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <rect width="400" height="480" fill="url(#bgLam)"/>
  <circle cx="200" cy="180" r="140" fill="#10b981" opacity="0.12" filter="blur(30px)"/>

  <g id="body">
    <path d="M70 480 L110 330 Q200 320 290 330 L330 480 Z" fill="url(#navyPoloLam)"/>
    <path d="M165 240 L165 315 Q200 330 235 315 L235 240 Z" fill="url(#skinLam)"/>
    <path d="M165 270 Q200 295 235 270 L235 305 Q200 325 165 305 Z" fill="#e0b28e" opacity="0.4"/>

    <path d="M150 310 L195 365 L200 315 L170 295 Z" fill="#0c1836"/>
    <path d="M150 310 L195 365" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <path d="M250 310 L205 365 L200 315 L230 295 Z" fill="#0c1836"/>
    <path d="M250 310 L205 365" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
    <path d="M194 360 L194 440 L206 440 L206 360 Z" fill="#080f21"/>
    <circle cx="200" cy="385" r="3.5" fill="#f8fafc"/>
    <circle cx="200" cy="415" r="3.5" fill="#f8fafc"/>
  </g>

  <g id="head" filter="url(#shadowLam)">
    <ellipse cx="118" cy="185" rx="14" ry="22" fill="url(#skinLam)"/>
    <ellipse cx="282" cy="185" rx="14" ry="22" fill="url(#skinLam)"/>
    <path d="M125 150 C120 230 140 270 200 272 C260 270 280 230 275 150 C275 90 125 90 125 150 Z" fill="url(#skinLam)"/>

    <path d="M142 160 Q165 154 182 160" stroke="#1f1d24" stroke-width="4.5" stroke-linecap="round" fill="none"/>
    <path d="M218 160 Q235 154 258 160" stroke="#1f1d24" stroke-width="4.5" stroke-linecap="round" fill="none"/>

    <g id="eyesLam">
      <ellipse cx="163" cy="178" rx="12" ry="7.5" fill="#ffffff"/>
      <ellipse cx="163" cy="178" rx="6.5" ry="6.5" fill="#18151b"/>
      <circle cx="165" cy="176" r="2" fill="#ffffff"/>
      <ellipse cx="237" cy="178" rx="12" ry="7.5" fill="#ffffff"/>
      <ellipse cx="237" cy="178" rx="6.5" ry="6.5" fill="#18151b"/>
      <circle cx="239" cy="176" r="2" fill="#ffffff"/>
    </g>

    <g id="glassesLam">
      <rect x="140" y="162" width="46" height="32" rx="10" fill="none" stroke="#111827" stroke-width="4"/>
      <rect x="214" y="162" width="46" height="32" rx="10" fill="none" stroke="#111827" stroke-width="4"/>
      <path d="M186 174 Q200 170 214 174" fill="none" stroke="#111827" stroke-width="4" stroke-linecap="round"/>
    </g>

    <path d="M197 185 L195 212 Q200 216 205 212" fill="none" stroke="#d49e7a" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M182 238 Q200 244 218 238" stroke="#c07865" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M120 145 C115 70 160 40 200 38 C245 40 285 70 280 145 C275 125 260 100 240 105 C220 110 210 135 195 138 C175 140 165 110 140 120 C125 125 120 138 120 145 Z" fill="url(#hairLam)"/>
  </g>
</svg>
`)}`;

export const NGOC_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgNgoc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1022"/>
      <stop offset="50%" stop-color="#2d1537"/>
      <stop offset="100%" stop-color="#130919"/>
    </linearGradient>
    <linearGradient id="skinNgoc" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff0e5"/>
      <stop offset="100%" stop-color="#fedbc7"/>
    </linearGradient>
    <linearGradient id="hairNgoc" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2c1e21"/>
      <stop offset="60%" stop-color="#1c1114"/>
      <stop offset="100%" stop-color="#0d080a"/>
    </linearGradient>
  </defs>

  <rect width="400" height="480" fill="url(#bgNgoc)"/>
  <circle cx="200" cy="180" r="140" fill="#f43f5e" opacity="0.15" filter="blur(32px)"/>
  <path d="M110 140 C90 220 85 360 95 480 L305 480 C315 360 310 220 290 140 Z" fill="url(#hairNgoc)"/>

  <g id="headNgoc">
    <ellipse cx="125" cy="190" rx="10" ry="18" fill="url(#skinNgoc)"/>
    <ellipse cx="275" cy="190" rx="10" ry="18" fill="url(#skinNgoc)"/>
    <path d="M130 155 C126 230 145 268 200 270 C255 268 274 230 270 155 C270 95 130 95 130 155 Z" fill="url(#skinNgoc)"/>
    <rect x="146" y="166" width="42" height="30" rx="12" fill="none" stroke="#d1d5db" stroke-width="2.5"/>
    <rect x="212" y="166" width="42" height="30" rx="12" fill="none" stroke="#d1d5db" stroke-width="2.5"/>
    <path d="M188 176 Q200 172 212 176" fill="none" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M182 234 Q200 248 218 234" stroke="#e11d48" stroke-width="4" stroke-linecap="round" fill="none"/>
  </g>
</svg>
`)}`;

export const SI_QI_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgSiQi" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#140f2b"/>
      <stop offset="50%" stop-color="#241b47"/>
      <stop offset="100%" stop-color="#0b0818"/>
    </linearGradient>
    <linearGradient id="skinSiQi" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fff2ea"/>
      <stop offset="100%" stop-color="#fddfcf"/>
    </linearGradient>
    <linearGradient id="hairSiQi" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#28222d"/>
      <stop offset="100%" stop-color="#09070c"/>
    </linearGradient>
  </defs>

  <rect width="400" height="480" fill="url(#bgSiQi)"/>
  <circle cx="200" cy="180" r="140" fill="#818cf8" opacity="0.15" filter="blur(32px)"/>
  <path d="M105 135 C80 230 80 370 90 480 L310 480 C320 370 320 230 295 135 Z" fill="url(#hairSiQi)"/>

  <g id="headSiQi">
    <ellipse cx="124" cy="188" rx="10" ry="18" fill="url(#skinSiQi)"/>
    <ellipse cx="276" cy="188" rx="10" ry="18" fill="url(#skinSiQi)"/>
    <path d="M128 152 C125 228 144 268 200 270 C256 268 275 228 272 152 C272 92 128 92 128 152 Z" fill="url(#skinSiQi)"/>
    <rect x="144" y="162" width="44" height="32" rx="11" fill="none" stroke="#422006" stroke-width="3.5"/>
    <rect x="212" y="162" width="44" height="32" rx="11" fill="none" stroke="#422006" stroke-width="3.5"/>
    <path d="M188 174 Q200 170 212 174" fill="none" stroke="#422006" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M184 236 Q200 243 216 236" stroke="#c2636f" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  </g>
</svg>
`)}`;

export const DUC_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgDuc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c1e2e"/>
      <stop offset="50%" stop-color="#132f48"/>
      <stop offset="100%" stop-color="#08141f"/>
    </linearGradient>
    <linearGradient id="skinDuc" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffe4d2"/>
      <stop offset="100%" stop-color="#f7caa8"/>
    </linearGradient>
  </defs>

  <rect width="400" height="480" fill="url(#bgDuc)"/>
  <circle cx="200" cy="180" r="140" fill="#0ea5e9" opacity="0.15" filter="blur(32px)"/>

  <g id="headDuc">
    <ellipse cx="118" cy="185" rx="14" ry="22" fill="url(#skinDuc)"/>
    <ellipse cx="282" cy="185" rx="14" ry="22" fill="url(#skinDuc)"/>
    <path d="M125 145 C120 228 142 268 200 270 C258 268 280 228 275 145 C275 88 125 88 125 145 Z" fill="url(#skinDuc)"/>
    <path d="M180 238 Q200 242 220 238" stroke="#b45309" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  </g>
</svg>
`)}`;

export const PERMANENT_FOUNDER_AVATARS: Record<string, string> = {
  wang_si_qi: SI_QI_AVATAR,
  pham_viet_duc: DUC_AVATAR,
  nguyen_duc_lam: LAM_AVATAR,
  phan_bao_ngoc: NGOC_AVATAR
};
