/* ============================================================================
   BALLPOINT WITH KUSHAL — forms.js
   FAQ accordion, form submit handling (front-end only — see README §6 to
   wire a real backend), and testimonial carousel prev/next controls.
   ============================================================================ */
window.BPK = window.BPK || {};

(function () {
  /* ---------------------------- FAQ accordion ------------------------------- */
  document.querySelectorAll('.faq__item').forEach(item => {
    const btn = item.querySelector('.faq__q');
    const answer = item.querySelector('.faq__a');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq__q[aria-expanded="true"]').forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherAnswer = otherBtn.closest('.faq__item').querySelector('.faq__a');
          if (otherAnswer) otherAnswer.style.maxHeight = null;
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? null : answer.scrollHeight + 'px';
    });
  });

  /* ----------------------------- forms ---------------------------------------
     Each <form data-form> currently only shows a success message. To wire a
     real backend (Formspree / Google Forms / Mailchimp / Apps Script), set
     the form's action/method in the HTML and either let it submit normally,
     or replace the preventDefault() below with a fetch() POST. See README. */
  document.querySelectorAll('[data-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      /* TODO (see README §6): replace this block with a real submission,
         e.g.:
           fetch(form.action, { method: 'POST', body: new FormData(form) })
             .then(() => showSuccess())
             .catch(() => alert('Something went wrong — please try again.'));
      */
      showSuccess();

      function showSuccess() {
        const success = form.parentElement.querySelector('.form-success');
        form.reset();
        form.style.display = 'none';
        if (success) success.classList.add('is-visible');
      }
    });
  });

  /* ------------------------- testimonial carousel ----------------------------
     main.js renders the actual slides into [data-testimonials]; this handles
     prev/next/dot navigation once those slides exist in the DOM. */
  function initCarousel() {
    const track = document.querySelector('[data-testimonials]');
    const slides = track ? Array.from(track.children) : [];
    if (!slides.length) return;

    let index = 0;
    const dotsWrap = document.querySelector('.carousel__dots');
    if (dotsWrap) {
      dotsWrap.innerHTML = slides.map((_, i) =>
        `<button class="carousel__dot${i === 0 ? ' is-active' : ''}" data-dot="${i}" aria-label="Go to testimonial ${i + 1}"></button>`
      ).join('');
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      document.querySelectorAll('.carousel__dot').forEach((dot, di) => {
        dot.classList.toggle('is-active', di === index);
      });
    }

    document.querySelector('[data-carousel="prev"]')?.addEventListener('click', () => goTo(index - 1));
    document.querySelector('[data-carousel="next"]')?.addEventListener('click', () => goTo(index + 1));
    dotsWrap?.addEventListener('click', (e) => {
      const dot = e.target.closest('[data-dot]');
      if (dot) goTo(Number(dot.dataset.dot));
    });

    track.style.display = 'flex';
    track.style.transition = 'transform 0.4s ease';
    slides.forEach(slide => { slide.style.flex = '0 0 100%'; });
    goTo(0);
  }
  BPK.initCarousel = initCarousel;
})();
