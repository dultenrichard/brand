"use strict";
const copyButton = document.getElementById("copy-email");
if (copyButton && navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try { await navigator.clipboard.writeText("fromentindulten@gmail.com"); status.textContent = "Email address copied."; }
    catch { status.textContent = "Please select and copy the email address above."; }
  });
}
const form = document.getElementById("contact-form");
if (form) {
  document.getElementById("composer").hidden = false;
  const topic = new URLSearchParams(window.location.search).get("topic");
  if ([...form.elements.topic.options].some(option => option.value === topic)) form.elements.topic.value = topic;
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const name = String(fields.get("name")).trim();
    const message = String(fields.get("message")).trim();
    if (!name || !message) { document.getElementById("form-status").textContent = "Please enter your name and a message."; return; }
    const subject = fields.get("topic") + " enquiry from " + name;
    const body = message + "\n\n" + name + "\nReply email: " + fields.get("email");
    window.location.href = "mailto:fromentindulten@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    document.getElementById("form-status").textContent = "Email draft requested. Your message has not been sent by this website.";
  });
}
