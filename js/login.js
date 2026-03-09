import config from './config.js';

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Reset errors
    document.getElementById('usernameError').style.display = 'none';
    document.getElementById('passwordError').style.display = 'none';
    
    const username = document.getElementById('user').value.trim();
    const password = document.getElementById('pass').value.trim();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    // Validation
    if (!username) {
        showError('usernameError', 'Username is required');
        return;
    }
    if (!password) {
        showError('passwordError', 'Password is required');
        return;
    }
    
    try {
        // Loading state
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        let response;
        if (config.useMockData) {
            // Mock response
            response = await mockLogin(username, password);
        } else {
            // Real API call
            response = await fetch(`${config.apiBaseUrl}/auth/login`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
        }
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('authToken', data.token || '');
            window.location.href = 'main.html';
        } else {
            showError('passwordError', data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('passwordError', 'Login failed. Please try again.');
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});

// Mock login function
async function mockLogin(username, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (username === 'admin' && password === 'admin123') {
                resolve({
                    ok: true,
                    json: () => Promise.resolve({ token: 'mock-token' })
                });
            } else {
                resolve({
                    ok: false,
                    json: () => Promise.resolve({ message: 'Invalid credentials' })
                });
            }
        }, 500);
    });
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
}