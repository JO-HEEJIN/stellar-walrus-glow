async function createUser() {
    const username = document.getElementById('createUsername').value;
    const email = document.getElementById('createEmail').value;
    const password = document.getElementById('createPassword').value;
    
    try {
        const response = await fetch('/api/auth/create-test-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        
        const data = await response.json();
        const resultDiv = document.getElementById('createResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = data.message;
        resultDiv.className = response.ok ? 'result success' : 'result error';
    } catch (error) {
        const resultDiv = document.getElementById('createResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = 'Error: ' + error.message;
        resultDiv.className = 'result error';
    }
}

async function testLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        const resultDiv = document.getElementById('loginResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = JSON.stringify(data, null, 2);
        resultDiv.className = response.ok ? 'result success' : 'result error';
        
        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);
        }
    } catch (error) {
        const resultDiv = document.getElementById('loginResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = 'Error: ' + error.message;
        resultDiv.className = 'result error';
    }
}

async function testMe() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        const resultDiv = document.getElementById('meResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = JSON.stringify(data, null, 2);
        resultDiv.className = response.ok ? 'result success' : 'result error';
    } catch (error) {
        const resultDiv = document.getElementById('meResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = 'Error: ' + error.message;
        resultDiv.className = 'result error';
    }
}

async function testLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST'
        });
        const data = await response.json();
        const resultDiv = document.getElementById('logoutResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = data.message;
        resultDiv.className = response.ok ? 'result success' : 'result error';
        
        if (response.ok) {
            localStorage.removeItem('token');
        }
    } catch (error) {
        const resultDiv = document.getElementById('logoutResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = 'Error: ' + error.message;
        resultDiv.className = 'result error';
    }
}

// Set up event listeners when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('createBtn').addEventListener('click', createUser);
    document.getElementById('loginBtn').addEventListener('click', testLogin);
    document.getElementById('meBtn').addEventListener('click', testMe);
    document.getElementById('logoutBtn').addEventListener('click', testLogout);
});