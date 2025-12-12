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
        logo.classList.remove('white');
        logo.classList.add('colored');
        logo.src = 'https://i.postimg.cc/7b4MF0XW/logo-colored.png';
      } else {
        header.classList.remove('scrolled');
        logo.classList.remove('colored');
        logo.classList.add('white');
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
});
