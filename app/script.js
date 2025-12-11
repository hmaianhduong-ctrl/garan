const header = document.getElementById('header');
const logo = document.getElementById('logo');


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
