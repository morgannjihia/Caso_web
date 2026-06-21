// ============================================
// Contact form -> Firestore (contact.html only)
// ============================================

// Contact / join form -> Firestore
// This only runs on pages that include a <form id="contact-form">
import { db } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const form = document.getElementById("contact-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById("form-status");
    const submitBtn = form.querySelector("button[type='submit']");

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      institution: form.institution.value.trim(),
      zone: form.zone.value,
      type: form.type.value,
      message: form.message.value.trim(),
      createdAt: serverTimestamp(),
      status: "new"
    };

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
      await addDoc(collection(db, "submissions"), data);
      statusEl.textContent = "Thank you — your message has been received. Someone from CASO will reach out soon.";
      statusEl.className = "form-status success";
      form.reset();
    } catch (err) {
      console.error("Submission error:", err);
      statusEl.textContent = "Something went wrong sending your message. Please try again or email casoadvents@gmail.com directly.";
      statusEl.className = "form-status error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });
}
