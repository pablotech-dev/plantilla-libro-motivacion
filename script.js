/* ============================================
   NUNCA ES EL CUERPO — interactividad
   Vanilla JS, sin dependencias.
   ============================================ */

/* -------- Configuración editable -------- */
var CONFIG = {
  offerHours: 72,        // duración de la oferta de lanzamiento
  bookTwoProgress: 61,   // % escrito del segundo libro
  upsellPrice: 14        // precio del pre-pedido del libro II
};

var FORMATS = {
  ebook:  { name: 'Ebook (PDF + EPUB)',  desc: 'Descarga inmediata',                 price: 19 },
  pack:   { name: 'Pack completo',        desc: 'Físico + ebook + audiolibro',        price: 29 },
  signed: { name: 'Edición firmada',      desc: 'Dedicada + videollamada 30 min',     price: 49 }
};

var QUIZ = [
  { q: '¿Cuándo se te cae la cabeza?', o: ['Justo antes de competir', 'A mitad de temporada', 'Después de una derrota o lesión'] },
  { q: '¿Qué te pesa más ahora mismo?', o: ['Compararme con los demás', 'El miedo a fallar delante de gente', 'No cumplir lo que me prometo'] },
  { q: 'Si hoy fuera tu mejor día, ¿qué harías distinto?', o: ['Tener un plan claro para la salida', 'Hablarme de otra forma', 'Cumplir lo pactado conmigo sin excusas'] }
];

var RESULTS = [
  { title: 'Te sobra ruido en la salida', text: 'Rindes en entrenamiento y te apagas cuando hay público, dorsal o cronómetro. No es falta de nivel: llegas a la línea con el sistema nervioso a tope y sin un guion.', chapter: 'Parte I · Protocolo 6 — «Los ocho minutos previos»' },
  { title: 'Tu disciplina depende del ánimo', text: 'Cuando estás motivado eres imparable; cuando no, negocias contigo mismo y pierdes. Lo que necesitas no es más ganas, es un sistema que funcione sin ellas.', chapter: 'Parte II · Protocolo 11 — «El mínimo no negociable»' },
  { title: 'Sigues entrenando desde la derrota', text: 'Arrastras un resultado, un banquillo o una lesión, y todo lo que haces ahora es una respuesta a eso. Hay un orden para volver, y no empieza por entrenar más.', chapter: 'Parte III · Protocolo 19 — «Volver en siete días»' }
];

var $  = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

/* -------- Menú móvil -------- */
function initMenu() {
  var burger = $('#burger'), menu = $('#menu');
  if (!burger || !menu) return;
  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('a', menu).forEach(function (a) {
    a.addEventListener('click', function () { menu.classList.remove('is-open'); });
  });
}

/* -------- Cuenta atrás de la oferta -------- */
function initCountdown() {
  var slots = $$('[data-clock]');
  if (!slots.length) return;
  var key = 'nec_offer_end', end = 0;
  try { end = Number(localStorage.getItem(key)) || 0; } catch (e) {}
  if (!end || end < Date.now()) {
    end = Date.now() + CONFIG.offerHours * 3600 * 1000;
    try { localStorage.setItem(key, String(end)); } catch (e) {}
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var ms = Math.max(0, end - Date.now());
    var txt = pad(Math.floor(ms / 3600000)) + 'h ' + pad(Math.floor(ms / 60000) % 60) + 'm ' + pad(Math.floor(ms / 1000) % 60) + 's';
    slots.forEach(function (el) { el.textContent = txt; });
  }
  tick();
  setInterval(tick, 1000);
}

/* -------- Barra de promoción -------- */
function initPromo() {
  var bar = $('#promo'), x = $('#promo-close');
  if (bar && x) x.addEventListener('click', function () { bar.remove(); });
}

/* -------- Diagnóstico (quiz) -------- */
function initQuiz() {
  var box = $('#quiz');
  if (!box) return;
  var res = $('#quiz-result'), step = 0, first = 0;

  function render() {
    $('#quiz-num').textContent = Math.min(step + 1, 3);
    $('#quiz-bar').style.width = Math.round((step / 3) * 100) + '%';
    $('#quiz-q').textContent = QUIZ[step].q;
    var list = $('#quiz-opts');
    list.innerHTML = '';
    QUIZ[step].o.forEach(function (label, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'opt'; b.textContent = label;
      b.addEventListener('click', function () {
        if (step === 0) first = i;
        step++;
        if (step >= 3) finish(); else render();
      });
      list.appendChild(b);
    });
  }
  function finish() {
    var r = RESULTS[first];
    $('#res-title').textContent = r.title;
    $('#res-text').textContent = r.text;
    $('#res-chapter').textContent = r.chapter;
    box.style.display = 'none';
    res.style.display = 'block';
  }
  $('#quiz-reset').addEventListener('click', function () {
    step = 0; first = 0; res.style.display = 'none'; box.style.display = 'block'; render();
  });
  render();
}

/* -------- FAQ -------- */
function initFaq() {
  $$('.faq-item').forEach(function (item) {
    var btn = $('.faq-q', item);
    btn.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      $$('.faq-item').forEach(function (o) { o.classList.remove('is-open'); $('.faq-q i', o).textContent = '+'; $('.faq-q', o).setAttribute('aria-expanded', 'false'); });
      if (!open) { item.classList.add('is-open'); $('i', btn).textContent = '−'; btn.setAttribute('aria-expanded', 'true'); }
    });
  });
}

/* -------- Lista de espera del segundo libro -------- */
function initWaitlist() {
  var form = $('#waitlist');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    form.style.display = 'none';
    $('#waitlist-ok').style.display = 'block';
    // Conecta aquí tu proveedor de email (Mailchimp, Brevo, ConvertKit…)
  });
  $('#book2-bar').style.width = CONFIG.bookTwoProgress + '%';
  $$('[data-progress]').forEach(function (el) { el.textContent = CONFIG.bookTwoProgress + '%'; });
}

/* -------- Túnel de pago -------- */
function initCheckout() {
  var modal = $('#checkout');
  if (!modal) return;
  var state = { step: 1, fmt: 'pack', upsell: false, paying: false };
  var LABELS = ['TU PEDIDO', 'UNA COSA MÁS', 'PAGO', 'LISTO'];
  var PCT = ['33%', '66%', '90%', '100%'];

  function paint() {
    $('#co-label').textContent = LABELS[state.step - 1];
    $('#co-bar').style.width = PCT[state.step - 1];
    $$('.step', modal).forEach(function (s) {
      s.classList.toggle('is-on', Number(s.dataset.step) === state.step);
    });
    $$('.fmt', modal).forEach(function (f) { f.classList.toggle('is-on', f.dataset.fmt === state.fmt); });

    var f = FORMATS[state.fmt];
    var total = f.price + (state.upsell ? CONFIG.upsellPrice : 0);
    $('#sum-name').textContent = f.name;
    $('#sum-price').textContent = f.price + ' €';
    $('#sum-upsell').style.display = state.upsell ? 'flex' : 'none';
    $('#sum-total').textContent = total + ' €';
    $('#pay-btn').textContent = state.paying ? 'Procesando…' : 'Pagar ' + total + ' € ahora';
  }

  function open(fmt) {
    state.step = 1; state.paying = false;
    if (fmt) state.fmt = fmt;
    modal.classList.add('is-open');
    paint();
  }
  function close() { modal.classList.remove('is-open'); }

  $$('[data-buy]').forEach(function (b) {
    b.addEventListener('click', function (e) { e.preventDefault(); open(b.dataset.buy); });
  });
  $('#co-close').addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });

  $$('.fmt', modal).forEach(function (f) {
    f.addEventListener('click', function () { state.fmt = f.dataset.fmt; paint(); });
  });
  $('#co-next').addEventListener('click', function () { state.step = 2; paint(); });
  $('#up-yes').addEventListener('click', function () { state.upsell = true; state.step = 3; paint(); });
  $('#up-no').addEventListener('click', function () { state.upsell = false; state.step = 3; paint(); });

  $('#pay-btn').addEventListener('click', function () {
    if (state.paying) return;
    state.paying = true; paint();
    // ▼ Sustituye este bloque por tu pasarela real (Stripe, PayPal, Redsys…)
    setTimeout(function () {
      state.paying = false; state.step = 4;
      $('#done-name').textContent = ($('#co-name').value || 'campeón');
      $('#done-email').textContent = ($('#co-email').value || 'tu correo');
      paint();
    }, 1200);
  });
  $('#done-close').addEventListener('click', close);
}

/* -------- Barra de progreso de lectura -------- */
function initReadbar() {
  var bar = $('#readbar');
  if (!bar) return;
  function update() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0) + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
}

document.addEventListener('DOMContentLoaded', function () {
  initMenu(); initPromo(); initCountdown(); initQuiz();
  initFaq(); initWaitlist(); initCheckout(); initReadbar();
});
