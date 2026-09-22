const copyButton = document.querySelector("#copy-email");
const emailField = document.querySelector("#support-email");
const copyStatus = document.querySelector("#copy-status");

copyButton.hidden = false;
copyButton.addEventListener("click", async () => {
  copyButton.disabled = true;
  try {
    await navigator.clipboard.writeText(emailField.value);
    copyStatus.textContent =
      "Email address copied. Paste it into your email app.";
  } catch {
    emailField.focus();
    emailField.select();
    emailField.setSelectionRange(0, emailField.value.length);
    copyStatus.textContent =
      "Automatic copying is unavailable. The address is selected—choose Copy, then paste it into your email app.";
  } finally {
    copyButton.disabled = false;
  }
});
