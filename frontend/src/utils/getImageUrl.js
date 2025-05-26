// // utils/getImageUrl.js
// export const getImageUrl = (relativePath = '') => {
//   // ① .env 에 넣은 API URL 사용, 없으면 기본값
//   const base =
//     import.meta.env.VITE_API_URL ||
//     process.env.REACT_APP_API_URL ||
//     'http://localhost:5000';

//   // ② 앞쪽 \, / 제거 → uploads/xxx.jpg
//   const cleaned = relativePath.replace(/^[\\/]+/, '').replace(/\\/g, '/');
//   return `${base}/${cleaned}`;
// };
