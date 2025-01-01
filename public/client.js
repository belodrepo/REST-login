// client.js

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const recordForm = document.getElementById('recordForm');
  const recordsTable = document.getElementById('recordsTable');

  const apiBase = 'http://localhost:3000/api';

  // Handle registration
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;

      try {
        const response = await fetch(`${apiBase}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const result = await response.json();

        if (response.ok) {
          alert(result.message);
          window.location.href = '/login.html';
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    });
  }

  // Handle login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = e.target.username.value;
      const password = e.target.password.value;

      try {
        const response = await fetch(`${apiBase}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const result = await response.json();

        if (response.ok) {
          sessionStorage.setItem('username', result.username);
          alert(result.message);
          window.location.href = '/admin.html';
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    });
  }

  // Handle record submission
  if (recordForm) {
    const username = sessionStorage.getItem('username');
    if (!username) {
      alert('You must log in to access this page.');
      window.location.href = '/login.html';
    }

    document.getElementById('welcomeMessage').textContent = `Welcome, ${username}!`;

    recordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = e.target.firstName.value;
      const lastName = e.target.lastName.value;
      const birthDate = e.target.birthDate.value;

      try {
        const response = await fetch(`${apiBase}/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, birthDate }),
        });
        const result = await response.json();

        if (response.ok) {
          alert(result.message);
          fetchRecords();
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error('Error:', err);
      }
    });

    // Fetch and display records
    const fetchRecords = async () => {
      try {
        const response = await fetch(`${apiBase}/records`);
        const records = await response.json();

        recordsTable.innerHTML = records.map(record => `
          <tr>
            <td>${record.firstName}</td>
            <td>${record.lastName}</td>
            <td>${record.birthDate}</td>
          </tr>`).join('');
      } catch (err) {
        console.error('Error:', err);
      }
    };

    fetchRecords();

    // Handle logout
    document.getElementById('logoutButton').addEventListener('click', () => {
      sessionStorage.clear();
      window.location.href = '/login.html';
    });
  }
});
