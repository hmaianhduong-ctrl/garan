document.addEventListener("DOMContentLoaded", () => {

    const page = document.getElementById("pageRoot");
    const loader = document.getElementById("globalLoader");

    // PRELOAD
    const images = [
        "https://res.cloudinary.com/dbysgwcva/image/upload/v1764259473/user-login_bpanvw.png",
        "https://res.cloudinary.com/dbysgwcva/image/upload/v1764259289/user-login-elis_wplwo7.png"
    ];

    let loaded = 0;
    images.forEach(src => {
        const img = new Image();
        img.src = src;
        img.onload = img.onerror = () => {
            loaded++;
            if (loaded === images.length) {
                setTimeout(() => {
                    loader.style.opacity = "0";
                    setTimeout(() => loader.remove(), 350);
                    page.classList.remove("preload-hidden");
                    page.classList.add("preload-show");
                }, 200);
            }
        };
    });

    // FORM
    const form = document.getElementById("registerForm");
    const btn = document.getElementById("registerBtn");
    const msg = document.getElementById("formMessage");

    function showMessage(text, type="error"){
        msg.textContent = text;
        msg.className = `message show ${type}`;
    }

    function hideMessage(){
        msg.textContent = "";
        msg.className = "message";
    }

    form.addEventListener("submit", (e)=>{
        e.preventDefault();
        hideMessage();

        const name = document.getElementById("fullname").value.trim();
        const email = document.getElementById("email").value.trim();
        const pass = document.getElementById("password").value;
        const confirm = document.getElementById("confirmPassword").value;

        if(!name || !email || !pass || !confirm){
            showMessage("Please fill in all fields.");
            return;
        }

        if(pass.length < 6){
            showMessage("Password must be at least 6 characters.");
            return;
        }

        if(pass !== confirm){
            showMessage("Passwords do not match.");
            return;
        }

        btn.classList.add("loading");
        btn.disabled = true;

        setTimeout(()=>{
            btn.classList.remove("loading");
            btn.disabled = false;

            showMessage("Account created successfully! Redirecting...", "success");

            setTimeout(()=>{
                window.location.href = "login.html";
            }, 1600);

        }, 1400);
    });

    // GOOGLE REGISTER (mock)
    document.getElementById("googleRegisterBtn")
        .addEventListener("click", e => {
            e.preventDefault();
            showMessage("Redirecting to Google...", "success");
            setTimeout(hideMessage, 3000);
        });

});
