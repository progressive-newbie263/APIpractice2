document.querySelector('.register-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch('http://localhost:8082/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to register: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Registration successful:', result);

        // Redirect or notify user on success
        alert("Account created successfully! Please sign in");
        window.location.href = "./sign-in.html";
    } catch (error) {
        console.error("Error:", error);
        alert("Registration failed. Please try again.");
    }
});

