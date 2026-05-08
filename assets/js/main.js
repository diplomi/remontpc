// Настройки контактов (поменяйте под себя)
const CONTACTS = {
  phone: "+79197590259",
  phonePretty: "+7 (919) 759-02-59",
  email: "service@yandex.ru",
};

function qs(sel, root = document) {
  return root.querySelector(sel);
}
function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

function applyContacts() {
  qsa("[data-phone]").forEach((a) => {
    if (!(a instanceof HTMLAnchorElement)) return;
    a.href = `tel:${CONTACTS.phone}`;
    a.textContent = a.textContent.includes("+7") ? CONTACTS.phonePretty : a.textContent;
  });

  qsa("[data-email]").forEach((a) => {
    if (!(a instanceof HTMLAnchorElement)) return;
    a.href = `mailto:${CONTACTS.email}`;
    a.textContent = CONTACTS.email;
  });
}

function initYear() {
  setText(qs("[data-year]"), String(new Date().getFullYear()));
}

function normalizePhone(raw) {
  const digits = String(raw || "").replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("8")) return `+7${digits.slice(1)}`;
  if (digits.startsWith("7")) return `+${digits}`;
  return digits ? `+7${digits}` : "";
}

function initBurger() {
  const burger = qs("[data-burger]");
  const nav = qs("[data-nav]");
  if (!(burger instanceof HTMLButtonElement) || !(nav instanceof HTMLElement)) return;

  function close() {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-label", "Открыть меню");
  }
  function toggle() {
    nav.classList.toggle("is-open");
    burger.setAttribute("aria-label", nav.classList.contains("is-open") ? "Закрыть меню" : "Открыть меню");
  }

  burger.addEventListener("click", toggle);
  nav.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof HTMLAnchorElement) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
  document.addEventListener("click", (e) => {
    if (!nav.classList.contains("is-open")) return;
    const t = e.target;
    if (t instanceof Node && (nav.contains(t) || burger.contains(t))) return;
    close();
  });
}

function initHashScrollOffset() {
  const header = qs("[data-header]");
  if (!(header instanceof HTMLElement)) return;

  function apply() {
    const id = decodeURIComponent(location.hash || "").slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 12);
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  window.addEventListener("hashchange", apply);
  // Если зашли сразу по ссылке с якорем
  if (location.hash) setTimeout(apply, 0);
}

function initActiveNav() {
  const page = document.documentElement.getAttribute("data-page");
  if (!page) return;
  qsa("[data-navlink]").forEach((a) => {
    if (!(a instanceof HTMLAnchorElement)) return;
    if (a.getAttribute("data-navlink") !== page) return;
    a.setAttribute("aria-current", "page");
    a.classList.add("is-active");
  });
}

function initFaqSingleOpen() {
  const items = qsa(".faq-item");
  if (!items.length) return;
  items.forEach((d) => {
    if (!(d instanceof HTMLDetailsElement)) return;
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      items.forEach((other) => {
        if (other !== d && other instanceof HTMLDetailsElement) other.open = false;
      });
    });
  });
}

function initForm() {
  const form = qs("[data-request-form]");
  const status = qs("[data-form-status]");
  if (!(form instanceof HTMLFormElement) || !(status instanceof HTMLElement)) return;

  function showDialog(title, message) {
    // Use native <dialog> when available; fallback to alert.
    if (typeof HTMLDialogElement === "undefined") {
      window.alert(`${title}\n\n${message}`);
      return;
    }

    let dialog = qs("[data-request-dialog]");
    if (!(dialog instanceof HTMLDialogElement)) {
      dialog = document.createElement("dialog");
      dialog.setAttribute("data-request-dialog", "");
      dialog.className = "request-dialog";
      dialog.innerHTML = `
        <form method="dialog" class="request-dialog__body">
          <h3 class="request-dialog__title"></h3>
          <p class="request-dialog__text"></p>
          <div class="request-dialog__actions">
            <button value="ok" class="btn">Ок</button>
          </div>
        </form>
      `;
      document.body.appendChild(dialog);

      dialog.addEventListener("click", (e) => {
        const t = e.target;
        if (t === dialog) dialog.close();
      });
    }

    const titleEl = qs(".request-dialog__title", dialog);
    const textEl = qs(".request-dialog__text", dialog);
    if (titleEl) titleEl.textContent = title;
    if (textEl) textEl.textContent = message;

    dialog.showModal();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";

    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const phoneRaw = String(fd.get("phone") || "").trim();
    const phone = normalizePhone(phoneRaw);
    const device = String(fd.get("device") || "").trim();
    const problem = String(fd.get("problem") || "").trim();

    if (!phone || phone.length < 10) {
      status.textContent = "Пожалуйста, укажите телефон.";
      return;
    }
    if (!device || !problem) {
      status.textContent = "Пожалуйста, заполните устройство и описание проблемы.";
      return;
    }

    showDialog("Ваша заявка принята", "Мы свяжемся с вами в ближайшее время.");
    form.reset();
  });
}

applyContacts();
initYear();
initBurger();
initHashScrollOffset();
initActiveNav();
initFaqSingleOpen();
initForm();

