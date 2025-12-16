document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       PRELOAD + PAGE ENTER ANIMATION
    =============================== */
    const page = document.getElementById("pageRoot");
    const loader = document.getElementById("globalLoader");

    if (page) page.classList.add("preload-hidden");

    const imagesToLoad = [
        "https://res.cloudinary.com/dbysgwcva/image/upload/v1764259473/user-login_bpanvw.png",
        "https://res.cloudinary.com/dbysgwcva/image/upload/v1764259289/user-login-elis_wplwo7.png"
    ];

    let loadedCount = 0;
    imagesToLoad.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = checkLoaded;
    });

    function checkLoaded() {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
            setTimeout(() => {
                if (loader) loader.style.opacity = "0";
                // Dùng loader.remove() thay vì display = "none"
                setTimeout(() => { if (loader) loader.remove(); }, 350); 
                if (page) {
                    page.classList.remove("preload-hidden");
                    page.classList.add("preload-show");
                }
            }, 200);
        }
    }

    /* ===============================
       LOGIN LOGIC
    =============================== */
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    const errorMessage = document.getElementById('errorMessage');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');

    const USE_FAKE = true; // true = fake login, false = API
    const API_URL = "https://your-backend-api.com/api/auth/login"; 

    // Thêm trường 'token' vào FAKE_USERS để đồng bộ với API data structure
    const FAKE_USERS = [
        { email: "user1@gmail.com", password: "password123", role: "user", avatarUrl: "https://i.pravatar.cc/40?img=1", token: "fake_user_token_1" },
        { email: "admin@gmail.com", password: "adminpass", role: "admin", avatarUrl: "https://i.pravatar.cc/40?img=2", token: "fake_admin_token_xyz" },
        { email: "test@gmail.com", password: "test1234", role: "user", avatarUrl: "https://i.pravatar.cc/40?img=3", token: "fake_user_token_3" }
    ];

    if (!loginForm) return;

    function showMessage(msg, type = "error") {
        if (errorMessage) {
            errorMessage.textContent = msg;
            errorMessage.classList.add('show');
            errorMessage.classList.remove('error', 'success');
            errorMessage.classList.add(type);
        }
    }

    function hideMessage() {
        if (errorMessage) {
            errorMessage.textContent = "";
            errorMessage.classList.remove('show', 'error', 'success');
        }
    }

    function setLoading(state) {
        if (loginButton) {
            loginButton.classList.toggle("loading", state);
            loginButton.disabled = state;
        }
    }

    function redirectUser(role) {
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect');
        
        if (redirectTo) {
            window.location.href = decodeURIComponent(redirectTo);
            return;
        }
        
        switch (role) {
            case "admin": window.location.href = "dashboard.html"; break;
            case "user":
            default: window.location.href = "index.html"; break;
        }
    }

    /**
     * Xử lý logic Login: Fake Data hoặc API Call
     * @param {string} email
     * @param {string} password
     * @returns {Promise<Object>} user object containing {token, role, avatarUrl, ...}
     */
    async function handleLogin(email, password) {
        if (USE_FAKE) {
            // Delay để mô phỏng thời gian gọi API
            await new Promise(resolve => setTimeout(resolve, 800)); 
            
            // ---------- FAKE LOGIN ----------
            const user = FAKE_USERS.find(u => u.email === email && u.password === password);
            if (!user) {
                // Thêm delay nhỏ trước khi trả về lỗi để có vẻ "thật" hơn
                await new Promise(resolve => setTimeout(resolve, 200)); 
                throw new Error("Email hoặc mật khẩu không hợp lệ.");
            }
            return user; 
        } else {
            // ---------- API LOGIN ----------
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                const errResp = await response.json().catch(() => ({}));
                const msg = errResp.message || "Đăng nhập thất bại. Vui lòng thử lại.";
                throw new Error(msg);
            }
            const data = await response.json();
            return data; 
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();
        setLoading(true);

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showMessage("Vui lòng nhập đầy đủ email và mật khẩu.");
            setLoading(false);
            return;
        }

        try {
            const user = await handleLogin(email, password);

            // Lưu trạng thái login
            localStorage.setItem('isLoggedIn', 'true');
            // Đảm bảo sử dụng user.token (hoặc một token an toàn nếu cần)
            localStorage.setItem('userToken', user.token); 
            localStorage.setItem('userAvatarUrl', user.avatarUrl || 'https://i.pravatar.cc/40');

            // Chuyển hướng sau khi lưu LocalStorage
            setTimeout(() => redirectUser(user.role || 'user'), 100);

        } catch (err) {
            console.error("Login failed:", err.message);
            showMessage(err.message);
        } finally {
            setLoading(false);
        }
    });

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideMessage();
            showMessage("Link khôi phục mật khẩu đã được gửi qua email.", "success"); // Đổi sang success
            setTimeout(hideMessage, 4000);
        });
    }
    

});

