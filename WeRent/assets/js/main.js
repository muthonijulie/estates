//TOOGLE MENU BAR
   const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
const openIcon = document.getElementById('openIcon');
const closeIcon = document.getElementById('closeIcon');

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');

  if (navLinks.classList.contains('active')) {
    openIcon.style.display = 'none';
    closeIcon.style.display = 'block';
  } else {
    openIcon.style.display = 'block';
    closeIcon.style.display = 'none';
  }
});


