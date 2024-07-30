document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');

  if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const email = loginForm.email.value;
          const password = loginForm.password.value;
          await loginUser(email, password);
      });
  }
});

async function loginUser(email, password) {
  const errorMessage = document.getElementById('error-message');
  try {
      const response = await fetch('http://localhost:5000/login', { // Assurez-vous que c'est l'URL correcte
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || response.statusText);
      }

      const data = await response.json();
      document.cookie = `token=${data.access_token}; path=/`;
      window.location.href = 'index.html';

  } catch (error) {
      errorMessage.textContent = `Login failed: ${error.message}`;
      console.error('Error during login:', error);
  }
}
