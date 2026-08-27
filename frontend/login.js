const API_BASE_URL = 'http://127.0.0.1:8000'; // Adjust to match your FastAPI server port

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const submitBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('errorMessage');

  errorMsg.textContent = '';
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  // Automatically packages 'username' and 'password' inputs into FormData
  const formData = new FormData(form);

  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      // Reads detail="invalid credentials" from your HTTPException
      throw new Error(data.detail || 'Login failed');
    }

    // 1. Save token into browser's sessionStorage
    sessionStorage.setItem('adminToken', data.token);

    // 2. Redirect to admin page
    window.location.href = 'admin.html';

  } catch (err) {
    errorMsg.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
});