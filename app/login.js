document.addEventListener("DOMContentLoaded", () => {

    const page = document.getElementById("pageRoot");
    const loader = document.getElementById("globalLoader");

    // Khi vào trang, panel ẩn + chuẩn bị animation
    page.classList.add("preload-hidden");

    const imagesToLoad = [
        "https://res.cloudinary.com/dbysgwcva/image/upload/v1764259473/user-login_bpanvw.png",
        "https://res.cloudinary.com/dbysgwcva/image/upload/v1764259289/user-login-elis_wplwo7.png"
    ];

    let loadedCount = 0;
    imagesToLoad.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = checkLoaded;
        img.onerror = checkLoaded;
    });

    function checkLoaded() {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
            setTimeout(() => {
                loader.style.opacity = "0";
                setTimeout(() => loader.style.display = "none", 350);

                // Fade-in + slide-up mượt hơn
                page.classList.remove("preload-hidden");
                page.classList.add("preload-show");

            }, 200);
        }
    }

    // LOGIN LOGIC
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    
    // NEW: References for new features
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const googleLoginBtn = document.getElementById('googleLoginBtn');

    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash;
    }

    const FAKE_USERS = [
        { email: "user1@gmail.com", passwordHash: simpleHash("password123"), role: "user" },
        { email: "admin@gmail.com", passwordHash: simpleHash("adminpass"), role: "admin" },
        { email: "test@gmail.com", passwordHash: simpleHash("test1234"), role: "user" }
    ];

    // NEW: Forgot Password Handler
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideError();
            
            // Display the success message
            showError("Link đăng nhập đã được gửi qua mail của bạn.");
            
            // Optional: Hide the message after a delay
            setTimeout(hideError, 5000);
        });
    }
    
    // NEW: Google Login Button Handler
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideError();
            
            // Display a temporary message
            showError("Đang chuyển hướng đến Google...");
            
            // Optional: Hide the message after a delay
            setTimeout(hideError, 3000);
        });
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        hideError();
        loginButton.classList.add('loading');
        loginButton.disabled = true;

        setTimeout(() => {
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const match = FAKE_USERS.find(u => u.email === email && u.passwordHash === simpleHash(password));

            loginButton.classList.remove('loading');
            loginButton.disabled = false;

            if (match) {
				loginButton.classList.remove('loading');
				loginButton.disabled = false;
				
                 if (email === "user1@gmail.com") {
                    window.location.href = "user.html";
                } else if (email === "admin@gmail.com") {
                    window.location.href = "dashboard.html";
                }
            } else {
                showError("Invalid email or password. Please try again.");
            }
        }, 1200);
    });

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.add('show');
    }

    function hideError() {
        errorMessage.textContent = "";
        errorMessage.classList.remove('show');
    }
});