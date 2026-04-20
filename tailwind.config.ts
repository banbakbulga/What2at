import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        toss: {
          blue: '#FF7E36',
          'blue-dark': '#E56A1E',
          'blue-light': '#FFF3EB',
          bg: '#F2F4F6',
          text: '#333D4B',
          'text-secondary': '#8B95A1',
          'text-tertiary': '#B0B8C1',
          border: '#E5E8EB',
          card: '#FFFFFF',
          error: '#F04452',
          'error-light': '#FFF0F1',
          // 다크 모드
          'dark-bg': '#17171C',
          'dark-card': '#212126',
          'dark-elevated': '#2C2C35',
          'dark-text': '#ECECEC',
          'dark-text-secondary': '#8B8B94',
          'dark-text-tertiary': '#62626A',
          'dark-border': '#2C2C35',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          'sans-serif',
        ],
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
