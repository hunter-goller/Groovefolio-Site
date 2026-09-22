/* Content and image links also work without JavaScript. */
document.documentElement.classList.add("js");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
function closeMenu() {
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(expanded));
  navigation.classList.toggle("is-open", expanded);
});
navigation
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
});
const featureButtons = [...document.querySelectorAll("[data-feature]")];
function selectFeature(selected) {
  featureButtons.forEach((button) => {
    const active = button === selected;
    button.setAttribute("aria-pressed", String(active));
    document.getElementById(button.getAttribute("aria-controls")).hidden =
      !active;
  });
}
featureButtons.forEach((button) =>
  button.addEventListener("click", () => selectFeature(button)),
);
selectFeature(featureButtons[0]);
const dialog = document.querySelector(".screenshot-dialog");
let previousFocus;
if (typeof dialog.showModal === "function") {
  document.querySelectorAll("[data-zoom]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      previousFocus = link;
      const image = dialog.querySelector("img");
      image.src = link.href;
      image.alt = link.querySelector("img")?.alt || link.textContent.trim();
      dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add("dialog-open");
    });
  });
  dialog
    .querySelector("button")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    previousFocus?.focus({ preventScroll: true });
  });
}
document.querySelector("[data-year]").textContent = new Date().getFullYear();
