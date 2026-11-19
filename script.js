/* Progressive enhancement only: every section, link and image works without JS. */
document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/* ---- Mobile navigation ---- */
const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector("#nav-links");
if (menuButton && navLinks) {
  const setMenu = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("is-open", open);
  };
  menuButton.addEventListener("click", () =>
    setMenu(menuButton.getAttribute("aria-expanded") !== "true"),
  );
  navLinks
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navLinks.classList.contains("is-open")) {
      setMenu(false);
      menuButton.focus();
    }
  });
}

/* ---- Screenshot enlargement (native <dialog>, focus returns to the link) ---- */
const dialog = document.querySelector(".shot-dialog");
if (dialog && typeof dialog.showModal === "function") {
  const image = dialog.querySelector("img");
  let opener;
  document.querySelectorAll("[data-zoom]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      opener = link;
      image.src = link.href;
      image.alt = link.querySelector("img")?.alt || "";
      dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add("dialog-open");
    });
  });
  dialog
    .querySelector(".dialog-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    opener?.focus({ preventScroll: true });
  });
}

/* ---- Scroll reveal, record spin and NFC demo: only run while visible ---- */
if ("IntersectionObserver" in window) {
  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          reveal.unobserve(entry.target);
        }
      }),
    { rootMargin: "0px 0px -8% 0px" },
  );
  if (!reduceMotion.matches) {
    document.querySelectorAll(".reveal").forEach((el) => {
      // Anything already on screen at load stays visible immediately.
      if (el.getBoundingClientRect().top < innerHeight) el.classList.add("is-in");
      else reveal.observe(el);
    });
  } else {
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("is-in"));
  }

  const toggleOnView = (selector, className, whenVisible) => {
    const el = document.querySelector(selector);
    if (!el) return;
    new IntersectionObserver(([entry]) =>
      el.classList.toggle(className, whenVisible === entry.isIntersecting),
    ).observe(el);
  };
  toggleOnView(".hero-stage", "is-paused", false);
  toggleOnView(".tap-demo", "is-playing", true);
} else {
  document
    .querySelectorAll(".reveal")
    .forEach((el) => el.classList.add("is-in"));
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = new Date().getFullYear();
