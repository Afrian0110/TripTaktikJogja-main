import { getUsers } from './api.js';

const token = localStorage.getItem('token');

getUsers(token).then(data => {
  console.log('Data pengguna:', data.users);
}).catch(err => {
  console.error('Gagal mengambil data pengguna:', err);
});
