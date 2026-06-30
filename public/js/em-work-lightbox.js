// em-work-lightbox.js — лайтбокс для сторінки виконаної роботи
// Окремий від галерейного лайтбоксу em-site.js
// Відкривається через window.emOpenWorkLightbox(photos, startIdx)

(function () {
  const lightbox = document.querySelector('.em-lightbox');
  const lightboxImg = document.querySelector('.em-lightbox-img');
  const lightboxCaption = document.querySelector('.em-lightbox-caption');
  const lightboxClose = document.querySelector('.em-lightbox-close');
  const lightboxPrev = document.querySelector('.em-lightbox-prev');
  const lightboxNext = document.querySelector('.em-lightbox-next');

  if (!lightbox) return;

  let lbPhotos = [];
  let lbIndex = 0;

  function showSlide(idx) {
    if (!lbPhotos.length) return;
    lbIndex = ((idx % lbPhotos.length) + lbPhotos.length) % lbPhotos.length;
    if (lightboxImg) {
      lightboxImg.src = lbPhotos[lbIndex].src;
      lightboxImg.alt = lbPhotos[lbIndex].caption;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = lbPhotos[lbIndex].caption;
    }
  }

  function openLightbox(photos, startIdx) {
    lbPhotos = photos;
    showSlide(startIdx);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Публічний інтерфейс для WorkPhotos.astro
  window.emOpenWorkLightbox = openLightbox;

  // Кнопки
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev)  lightboxPrev.addEventListener('click',  e => { e.stopPropagation(); showSlide(lbIndex - 1); });
  if (lightboxNext)  lightboxNext.addEventListener('click',  e => { e.stopPropagation(); showSlide(lbIndex + 1); });

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
  });

  // Клавіатура
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showSlide(lbIndex - 1);
    if (e.key === 'ArrowRight')  showSlide(lbIndex + 1);
  });

  // Свайп
  let tsX = 0;
  lightbox.addEventListener('touchstart', e => { tsX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tsX;
    if (Math.abs(dx) > 50) showSlide(lbIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });
})();
