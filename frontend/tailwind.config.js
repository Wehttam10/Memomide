export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1e293b', // slate-800
          dark: '#0f172a',    // slate-900
          light: '#475569',   // slate-600
          muted: '#64748b',   // slate-500
        },
        mist: {
          DEFAULT: '#f8fafc', // slate-50
          hover: '#f1f5f9',   // slate-100
          border: '#e2e8f0',  // slate-200
          darker: '#f1f5f9',  // slate-100
        },
        coral: {
          DEFAULT: '#ef6f6c',
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          500: '#ef6f6c',
          600: '#db5c59',
          700: '#be413f',
          800: '#9f1239',
          900: '#881337',
        },
        teal: {
          DEFAULT: '#0f9f9a',
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          500: '#0f9f9a',
          600: '#0d8581',
          700: '#115e5b',
          800: '#0f766e',
          900: '#134e4a',
        },
        amber: {
          DEFAULT: '#f0a202',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f0a202',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        violet: {
          DEFAULT: '#6366f1',
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'elegant': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
        'elegant': '300ms',
      },
    },
  },
  plugins: [],
};
