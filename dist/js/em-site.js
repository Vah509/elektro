// em-site.js — спільні скрипти сайту (гамбургер-меню, FAQ-акордеон, лайтбокс галереї)

document.addEventListener('DOMContentLoaded', () => {

  /* ===== Гамбургер-меню ===== */
  const burger = document.querySelector('.em-burger');
  const mobileNav = document.querySelector('.em-mobile-nav');
  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.toggle('open');
      mobileNav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  /* ===== FAQ-акордеон ===== */
  document.querySelectorAll('.em-faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.em-faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.em-faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.em-faq-question').setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ===== Розкривачі розділів мобільного меню (Продукція / Послуги) =====
     На відміну від FAQ, можуть бути відкриті обидва одночасно. */
  document.querySelectorAll('.em-mobile-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
      const sub = document.getElementById(btn.getAttribute('aria-controls'));
      if (sub) sub.classList.toggle('open', isOpen);
    });
  });

  /* ===== Лайтбокс галереї фото =====
     Активується тільки для .em-gallery-item, у яких заповнений
     атрибут data-full (посилання на повнорозмірне фото).
     Поки фото-заглушки — data-full порожній, клік нічого не робить.
     Коли додасте реальні фото: просто пропишіть data-full="/шлях/до/фото.jpg"
     на потрібному .em-gallery-item — більше нічого міняти не треба. */
  const lightbox = document.querySelector('.em-lightbox');
  const lightboxImg = document.querySelector('.em-lightbox-img');
  const lightboxCaption = document.querySelector('.em-lightbox-caption');
  const lightboxClose = document.querySelector('.em-lightbox-close');

  function emOpenLightbox(src, caption) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = caption || '';
    if (lightboxCaption) lightboxCaption.textContent = caption || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function emCloseLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.em-gallery-item').forEach(item => {
    const full = item.getAttribute('data-full');
    if (!full) return; // фото ще не додано — пропускаємо, клік не активний
    item.addEventListener('click', () => {
      emOpenLightbox(full, item.getAttribute('data-caption') || '');
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', emCloseLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) emCloseLightbox();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') emCloseLightbox();
  });

});
