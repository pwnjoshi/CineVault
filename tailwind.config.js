/** @type {import('tailwindcss').Config} */
module.exports = {
 darkMode: 'class',
 content: [
 './src/**/*.{js,ts,jsx,tsx,mdx}'
 ],
 theme: {
 extend: {
 colors: {
 studio: {
 dark: '#090b10',
 card: '#11141c',
 surface: '#181b24',
 border: 'rgba(255, 255, 255, 0.08)',
 accent: '#EE5F29',
 cyan: '#38bdf8',
 purple: '#a78bfa',
 emerald: '#34d399',
 amber: '#fbbf24'
 }
 }
 }
 },
 plugins: []
};
