document.addEventListener("DOMContentLoaded", () => {

    /* ===============================
       PRELOAD + PAGE ENTER ANIMATION
       (Giữ nguyên logic tải ảnh và hiệu ứng chuyển trang)
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
                setTimeout(() => {
                    if (loader) loader.remove();
                }, 350);

                if (page) {
                    page.classList.remove("preload-hidden");
                    page.classList.add("preload-show");
                }
            }, 200);
        }
    }


    /* ===============================
       REGISTER LOGIC (API-READY VỚI FAKE MODE)
    =============================== */
    
    // Cài đặt chuyển đổi Fake/API
    const USE_FAKE = true; // Đặt thành false khi chuyển sang môi trường thật
    
    // ⚠️ ĐỊNH NGHĨA API URL ĐĂNG KÝ CỦA BẠN TẠI ĐÂY!
    const API_URL = "https://your-backend-api.com/api/auth/register"; 

    // MOCK DATA (Giả lập email đã tồn tại)
    const MOCK_REGISTERED_EMAILS = ["admin@gmail.com", "user1@gmail.com"];

    // Đồng bộ hóa ID với HTML cuối cùng:
    const registerForm = document.getElementById('registerForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerButton = document.getElementById('registerButton');
    const errorMessage = document.getElementById('errorMessage');

    if (!registerForm) return;

    /* ---------- UTIL FUNCTIONS ---------- */
    
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
        if (registerButton) {
            registerButton.classList.toggle("loading", state);
            registerButton.disabled = state;
        }
    }

    /**
     * Xử lý logic Đăng ký: Fake Data hoặc API Call
     */
    async function handleRegister(fullName, email, password) {
        if (USE_FAKE) {
            // Delay để mô phỏng thời gian gọi API
            await new Promise(resolve => setTimeout(resolve, 800)); 
            
            // ---------- FAKE REGISTER LOGIC ----------
            if (MOCK_REGISTERED_EMAILS.includes(email)) {
                // Giả lập lỗi email đã tồn tại
                throw new Error("Email này đã được sử dụng. Vui lòng thử email khác.");
            }
            // Giả lập đăng ký thành công
            return { success: true, message: "Registration successful" }; 
        } else {
            // ---------- API REGISTER LOGIC ----------
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password }),
            });

            if (!response.ok) {
                const errorResponse = await response.json().catch(() => ({})); 
                const errorMessageText = errorResponse.message || "Đăng ký thất bại. Vui lòng thử lại.";
                throw new Error(errorMessageText);
            }
            // API trả về thành công
            return await response.json(); 
        }
    }


    /* ---------- FORM SUBMIT HANDLER (ASYNC/AWAIT) ---------- */
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMessage();
        
        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // 1. KIỂM TRA INPUTS CỤC BỘ
        if (!fullName || !email || !password || !confirmPassword) {
             showMessage("Vui lòng nhập đầy đủ thông tin.");
             return;
        }
        
        if (password.length < 6) {
            showMessage("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Mật khẩu xác nhận không khớp.");
            return;
        }
        
        setLoading(true);

        try {
            // 2. GỌI HÀM XỬ LÝ (FAKE hoặc API)
            await handleRegister(fullName, email, password);

            // Đăng ký thành công (chỉ xảy ra nếu handleRegister không ném lỗi)
            showMessage("Tạo tài khoản thành công! Đang chuyển hướng đến trang đăng nhập...", "success");

            // Chuyển hướng sau một khoảng thời gian ngắn
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1800);

        } catch (error) {
            // Xử lý lỗi mạng, lỗi server, hoặc lỗi mô phỏng (email đã tồn tại)
            console.error("Register attempt failed:", error.message);
            showMessage(error.message);

        } finally {
            // Luôn đặt trạng thái Loading về false (trừ khi đang redirect)
            if (!document.location.href.includes("login.html")) {
                setLoading(false);
            }
        }
    });

});