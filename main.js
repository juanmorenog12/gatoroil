const config = window.BUSINESS_CONFIG || {};
const qsa = (s) => [...document.querySelectorAll(s)];

// Apply easy business configuration.
qsa('[data-business-name]').forEach(el => el.textContent = config.businessName || 'GATOR');
qsa('[data-phone-display]').forEach(el => el.textContent = config.phoneDisplay || '(305) 555-0148');
qsa('[data-phone-link]').forEach(el => el.href = `tel:${config.phoneHref || '+13055550148'}`);
qsa('[data-service-area]').forEach(el => el.textContent = config.serviceArea || 'Your Area');
qsa('[data-hours-short]').forEach(el => el.textContent = config.hoursShort || 'Mon–Sat');
qsa('[data-hours-full]').forEach(el => el.innerHTML = config.hoursFull || 'By appointment');
qsa('[data-area-description]').forEach(el => el.textContent = config.areaDescription || 'Mobile service in your area.');
qsa('[data-instagram-link]').forEach(el => el.href = config.instagram || '#');
qsa('[data-facebook-link]').forEach(el => el.href = config.facebook || '#');
qsa('[data-tiktok-link]').forEach(el => el.href = config.tiktok || '#');
if (config.accentColor) document.documentElement.style.setProperty('--accent', config.accentColor);
if (config.accentDark) document.documentElement.style.setProperty('--accent-dark', config.accentDark);

document.title = `${config.fullBusinessName || 'Gator Mobile Oil Services'} | Mobile Oil Change`;

document.getElementById('year').textContent = new Date().getFullYear();

const tags = document.querySelector('[data-area-tags]');
if (tags && Array.isArray(config.areaTags)) tags.innerHTML = config.areaTags.map(x => `<span>${x}</span>`).join('');

// Mobile menu.
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
qsa('.nav a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

// Reveal animation.
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
qsa('.reveal').forEach(el => observer.observe(el));

// Service cards jump to booking and preselect service.
qsa('.service-card').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    const serviceName = card.querySelector('h3')?.textContent?.trim();
    const select = document.querySelector('#service');
    if (select) {
      const option = [...select.options].find(o => o.text.toLowerCase() === serviceName.toLowerCase());
      if (option) select.value = option.value;
    }
    document.querySelector('#book')?.scrollIntoView({ behavior: 'smooth' });
  });
});

// Appointment request form:
// - Mobile/tablet: opens a pre-filled SMS to Gator.
// - Desktop/laptop: sends the request directly to Gator's email using FormSubmit AJAX.
const bookingForm = document.getElementById('bookingForm');
const formStatus = document.getElementById('formStatus');
const submitButton = bookingForm?.querySelector('.submit-btn');

function isMobileLikeDevice() {
  const ua = navigator.userAgent || '';
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
  const touchCompact = navigator.maxTouchPoints > 1 && Math.min(window.innerWidth, window.innerHeight) < 900;
  return mobileUA || touchCompact;
}

function buildAppointmentText(data) {
  return `Hi Gator Mobile Oil Services! I would like to request an appointment.\n\n` +
    `Name: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    `Vehicle: ${data.vehicle}\n` +
    `Service: ${data.service}\n` +
    `Preferred day/time: ${data.availability}\n` +
    `Service address: ${data.address}\n\n` +
    `Notes: ${data.notes || 'None'}`;
}

bookingForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.currentTarget).entries());
  const message = buildAppointmentText(data);

  if (isMobileLikeDevice()) {
    const encoded = encodeURIComponent(message);
    window.location.href = `sms:${config.phoneHref || '+13529335038'}&body=${encoded}`;
    return;
  }

  const destinationEmail = config.email || 'GatorOilServices@gmail.com';
  if (formStatus) {
    formStatus.className = 'form-status';
    formStatus.textContent = 'Sending your appointment request…';
  }
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.dataset.originalText = submitButton.innerHTML;
    submitButton.innerHTML = 'Sending…';
  }

  try {
    const payload = {
      Name: data.name,
      Phone: data.phone,
      Vehicle: data.vehicle,
      Service: data.service,
      'Preferred day/time': data.availability,
      'Service address': data.address,
      Notes: data.notes || 'None',
      _subject: `New appointment request — ${data.service} — ${data.name}`,
      _template: 'table'
    };

    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(destinationEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.success === 'false' || result.success === false) {
      throw new Error(result.message || 'Unable to send request');
    }

    if (formStatus) {
      formStatus.className = 'form-status success';
      formStatus.textContent = 'Request sent! Gator will contact you to confirm the appointment.';
    }
    e.currentTarget.reset();
  } catch (error) {
    if (formStatus) {
      formStatus.className = 'form-status error';
      formStatus.textContent = `We couldn't send the request automatically. Please call or text ${config.phoneDisplay || '(352) 933-5038'}.`;
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = submitButton.dataset.originalText || 'Send request <span>→</span>';
    }
  }
});
