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
  try {
      const response = await fetch('http://127.0.0.1:5000/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });

      if (response.ok) {
          const data = await response.json();
          document.cookie = `token=${data.access_token}; path=/`;
          window.location.href = 'index.html';
      } else {
          handleError(response);
      }
  } catch (error) {
      console.error('Error:', error);
      displayError('An error occurred. Please try again.');
  }
}

function handleError(response) {
  if (response.status === 401) {
      displayError('Invalid email or password. Please try again.');
  } else {
      displayError('Login failed. Please try again.');
  }
}

function displayError(message) {
  const errorMessage = document.getElementById('error-message');
  if (errorMessage) {
      errorMessage.textContent = message;
  }
}
