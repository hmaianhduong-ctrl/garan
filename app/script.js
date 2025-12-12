/* ============================
   HEADER SCROLL EFFECT
============================ */
document.addEventListener("DOMContentLoaded", () => {
  const header = document.getElementById('header');
  const logo = document.getElementById('logo');

  if (header && logo) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 550) {
        header.classList.add('scrolled');
        logo.src = 'https://i.postimg.cc/7b4MF0XW/logo-colored.png';
      } else {
        header.classList.remove('scrolled');
        logo.src = 'https://i.postimg.cc/dDFmbrnX/logo-white.png?v=1';
      }
    });
  }

  /* ============================
     LIKE BUTTON + COUNTER
  ============================ */
  let liked = false;
  let likeCount = 123;

  const likeBtn = document.getElementById("likeBtn");
  const likeCountElm = document.getElementById("likeCount");

  if (likeBtn && likeCountElm) {
    likeBtn.addEventListener("click", () => {
      liked = !liked;

      likeBtn.innerHTML = liked
        ? '<i class="fa-solid fa-thumbs-up"></i>'
        : '<i class="fa-regular fa-thumbs-up"></i>';

      likeCount += liked ? 1 : -1;
      likeCountElm.textContent = likeCount;
    });
  }

  /* ============================
     NAV UNDERLINE CLICK ANIMATION
  ============================ */
  const navLinks = document.querySelectorAll("header nav a");

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      // remove clicked from all
      navLinks.forEach(l => l.classList.remove("clicked"));

      // add clicked to the clicked link
      link.classList.add("clicked");

      // save state
      localStorage.setItem("activeMenu", link.getAttribute("href"));
    });
  });

  // Restore underline when page reloads
  const activeMenu = localStorage.getItem("activeMenu");
  if (activeMenu) {
    navLinks.forEach(link => {
      if (link.getAttribute("href") === activeMenu) {
        link.classList.add("clicked");
      }
    });
  }

}); // <-- đóng đúng chỗ
