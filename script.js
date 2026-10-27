(function () {
  'use strict';
  const cfg = window.PGE_CONFIG || {};
  const views = ['home', 'product', 'problem', 'machine'];
  const $ = (selector) => document.querySelector(selector);
  const endpoint = String(cfg.formspreeEndpoint || '').trim();
  const validEndpoint = /^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+\/?$/.test(endpoint);

  function showView() {
    const requested = location.hash.replace(/^#/, '').toLowerCase();
    const current = views.includes(requested) ? requested : 'home';
    views.forEach(name => { $('#view-' + name).hidden = name !== current; });
    document.title = (current === 'home' ? 'Pokégrand Exchange' : ({product:'Request a Product',problem:'Report a Problem',machine:'Request a Machine'}[current]) + ' | PGE');
    window.scrollTo({top: 0, behavior: 'instant'});
  }
  window.addEventListener('hashchange', showView);
  showView();

  const ig = cfg.instagram || 'https://www.instagram.com/pokegrandexchange/';
  $('#instagram-header').href = ig;
  $('#business-instagram').href = ig;
  const email = cfg.businessEmail || 'pokegrandexchange@gmail.com';
  $('#business-email').href = 'mailto:' + email;
  $('#business-email span').textContent = email;
  const phone = String(cfg.phone || '5612070337').replace(/\D/g, '');
  $('#business-phone').href = 'tel:+' + (phone.length === 10 ? '1' : '') + phone;
  $('#business-phone span').textContent = phone.length === 10 ? `(${phone.slice(0,3)}) ${phone.slice(3,6)}-${phone.slice(6)}` : phone;
  $('#year').textContent = new Date().getFullYear();

  document.querySelectorAll('form[data-form-type]').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const status = form.querySelector('.form-status');
      status.className = 'form-status';
      if (!validEndpoint) {
        status.classList.add('error');
        status.textContent = 'Submissions are not connected yet. Please contact us directly at ' + email + '.';
        return;
      }
      if (!form.reportValidity()) return;
      const button = form.querySelector('button[type=submit]');
      const original = button.innerHTML;
      const data = new FormData(form);
      data.append('form_type', form.dataset.formType);
      data.append('_subject', 'PGE — ' + form.dataset.formType);
      data.append('_replyto', String(data.get('email') || ''));
      button.disabled = true;
      button.textContent = 'Sending…';
      status.textContent = '';
      try {
        const response = await fetch(endpoint, {method:'POST',body:data,headers:{Accept:'application/json'}});
        if (!response.ok) throw new Error('Submission not accepted');
        form.reset();
        status.classList.add('success');
        status.textContent = 'Thanks! Your ' + form.dataset.formType.toLowerCase() + ' was submitted successfully.';
      } catch (error) {
        status.classList.add('error');
        status.textContent = 'We couldn’t send your request. Please try again, or email ' + email + ' directly.';
      } finally {
        button.disabled = false;
        button.innerHTML = original;
      }
    });
  });
})();
