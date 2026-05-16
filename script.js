// Home page script
const toggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-links a");

toggle.innerHTML = "☰";

toggle.onclick = () => {
  navLinks.classList.toggle("active");
};

navItems.forEach(link => {
  link.addEventListener("click", () => {
    // Remove active class from all links
    navItems.forEach(item => item.classList.remove("active"));
    // Add active class to clicked link
    link.classList.add("active");
  });
});

const sections = document.querySelectorAll("section[id]");

function setActiveLink(sectionId) {
  navItems.forEach(item => {
    const href = item.getAttribute("href");
    if (href === `#${sectionId}` || href.endsWith(`#${sectionId}`)) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function onScrollHighlight() {
  if (!sections.length) return;
  let currentSectionId = sections[0].id;
  const scrollPos = window.scrollY + window.innerHeight / 3;

  sections.forEach(section => {
    const top = section.offsetTop;
    if (scrollPos >= top) {
      currentSectionId = section.id;
    }
  });

  setActiveLink(currentSectionId);
}

window.addEventListener("scroll", onScrollHighlight);
window.addEventListener("load", onScrollHighlight);
window.addEventListener("resize", onScrollHighlight);

// Booking page script

// 1. Disable past dates
const dateInput = document.querySelector('input[type="date"]');
if (dateInput) {
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);
}

// 2. Show/clear inline errors
function showError(input, message) {
  clearError(input);
  input.style.borderColor = "#ff4d4d";
  input.style.boxShadow = "0 0 12px rgba(255, 77, 77, 0.5)";
  const error = document.createElement("span");
  error.className = "error-msg";
  error.textContent = message;
  error.style.cssText = "color:#ff4d4d; font-size:0.75rem; margin-top:4px; display:block;";
  input.parentNode.insertBefore(error, input.nextSibling);
}

function clearError(input) {
  input.style.borderColor = "";
  input.style.boxShadow = "";
  const existing = input.parentNode.querySelector(".error-msg");
  if (existing) existing.remove();
}

// 3. Validate form, return true if valid
function validateForm() {
  let valid = true;

  form.querySelectorAll(".error-msg, .service-error").forEach(el => el.remove());
  form.querySelectorAll("input, textarea").forEach(el => {
    el.style.borderColor = "";
    el.style.boxShadow = "";
  });

  const name = form.querySelector('input[type="text"]');
  if (!name.value.trim()) {
    showError(name, "Full name is required.");
    valid = false;
  }

  const email = form.querySelector('input[type="email"]');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    showError(email, "Email is required.");
    valid = false;
  } else if (!emailRegex.test(email.value.trim())) {
    showError(email, "Enter a valid email address.");
    valid = false;
  }

  const phone = form.querySelector('input[pattern]');
  if (!phone.value.trim()) {
    showError(phone, "Phone number is required.");
    valid = false;
  } else if (!/^[0-9]{11}$/.test(phone.value.trim())) {
    showError(phone, "Phone number must be exactly 11 digits.");
    valid = false;
  }

  const checked = form.querySelectorAll('input[name="services"]:checked');
  const checkboxGroup = form.querySelector(".checkbox-group");
  if (checked.length === 0) {
    const error = document.createElement("span");
    error.className = "service-error";
    error.textContent = "Please select at least one service.";
    error.style.cssText = "color:#ff4d4d; font-size:0.75rem; margin-top:4px; display:block;";
    checkboxGroup.parentNode.appendChild(error);
    valid = false;
  }

  const date = form.querySelector('input[type="date"]');
  if (!date.value) {
    showError(date, "Please select a booking date.");
    valid = false;
  }

  return valid;
}

// 4. Collect form data into an object
function getFormData() {
  const checked = [...form.querySelectorAll('input[name="services"]:checked')]
    .map(cb => cb.parentNode.querySelector("span").textContent);

  const rawDate = form.querySelector('input[type="date"]').value;
  const formatted = new Date(rawDate + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  return {
    name: form.querySelector('input[type="text"]').value.trim(),
    email: form.querySelector('input[type="email"]').value.trim(),
    phone: form.querySelector('input[pattern]').value.trim(),
    services: checked,
    date: formatted,
    notes: form.querySelector("textarea").value.trim() || "None"
  };
}

// 5. Show confirmation summary (replaces form content)
function showConfirmation(data) {
  savedFormHTML = form.innerHTML;

  const serviceList = data.services.map(s => `
    <li style="padding: 4px 0; color: #fff;">✓ ${s}</li>
  `).join("");

  form.innerHTML = `
    <div style="text-align:center; margin-bottom: 24px;">
      <h2 style="color:#00d5d5; font-size:1.4rem; margin-bottom:6px;">Review Your Booking</h2>
      <p style="color:#aaa; font-size:0.85rem;">Please confirm your details before submitting.</p>
    </div>

    <div style="
      background: rgba(0,161,161,0.08);
      border: 1px solid rgba(0,213,213,0.3);
      border-radius: 12px;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      font-size: 0.88rem;
    ">
      <div style="display:flex; justify-content:space-between; border-bottom: 0.5px solid rgba(255,255,255,0.1); padding-bottom:10px;">
        <span style="color:#aaa;">Full Name</span>
        <span style="color:#fff; font-weight:500;">${data.name}</span>
      </div>
      <div style="display:flex; justify-content:space-between; border-bottom: 0.5px solid rgba(255,255,255,0.1); padding-bottom:10px;">
        <span style="color:#aaa;">Email</span>
        <span style="color:#fff;">${data.email}</span>
      </div>
      <div style="display:flex; justify-content:space-between; border-bottom: 0.5px solid rgba(255,255,255,0.1); padding-bottom:10px;">
        <span style="color:#aaa;">Phone</span>
        <span style="color:#fff;">${data.phone}</span>
      </div>
      <div style="display:flex; justify-content:space-between; border-bottom: 0.5px solid rgba(255,255,255,0.1); padding-bottom:10px; gap:20px;">
        <span style="color:#aaa; flex-shrink:0;">Services</span>
        <ul style="list-style:none; text-align:right; margin:0; padding:0;">
          ${serviceList}
        </ul>
      </div>
      <div style="display:flex; justify-content:space-between; border-bottom: 0.5px solid rgba(255,255,255,0.1); padding-bottom:10px;">
        <span style="color:#aaa;">Date</span>
        <span style="color:#fff;">${data.date}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="color:#aaa;">Notes</span>
        <span style="color:#fff; max-width:60%; text-align:right;">${data.notes}</span>
      </div>
    </div>

    <div style="display:flex; gap:12px; margin-top:24px;">
      <button id="back-btn" style="
        flex:1; padding:14px;
        background: transparent;
        border: 1px solid rgba(0,213,213,0.5);
        border-radius: 12px;
        color: #00d5d5;
        font-size: 0.95rem;
        cursor: pointer;
        transition: 0.3s;
      ">← Edit Booking</button>

      <button id="confirm-btn" style="
        flex:1; padding:14px;
        background: linear-gradient(135deg, #00a1a1, #006666);
        border: none;
        border-radius: 12px;
        color: white;
        font-size: 0.95rem;
        cursor: pointer;
        transition: 0.3s;
      ">Confirm Booking</button>
    </div>
  `;

  // Back button — restore the form with all filled values
  document.getElementById("back-btn").addEventListener("click", () => {
    form.innerHTML = savedFormHTML;
    restoreFormData(data);
    bindSubmit();
  });

  // Confirm button — show success
  document.getElementById("confirm-btn").addEventListener("click", () => {
    showSuccess(data.name);
  });
}

// 6. Restore form fields with previously entered data
function restoreFormData(data) {
  form.querySelector('input[type="text"]').value = data.name;
  form.querySelector('input[type="email"]').value = data.email;
  form.querySelector('input[pattern]').value = data.phone;
  form.querySelector('input[type="date"]').value =
    form.querySelector('input[type="date"]').value || "";

  // Re-set date from formatted back to yyyy-mm-dd
  const rawDate = new Date(data.date);
  const yyyy = rawDate.getFullYear();
  const mm = String(rawDate.getMonth() + 1).padStart(2, "0");
  const dd = String(rawDate.getDate()).padStart(2, "0");
  form.querySelector('input[type="date"]').value = `${yyyy}-${mm}-${dd}`;

  // Re-check services
  data.services.forEach(serviceName => {
    form.querySelectorAll('input[name="services"]').forEach(cb => {
      if (cb.parentNode.querySelector("span").textContent === serviceName) {
        cb.checked = true;
      }
    });
  });

  form.querySelector("textarea").value = data.notes === "None" ? "" : data.notes;

  // Re-apply min date
  const today = new Date().toISOString().split("T")[0];
  form.querySelector('input[type="date"]').setAttribute("min", today);
}

// 7. Show success screen
function showSuccess(name) {
  form.innerHTML = `
    <div style="
      text-align: center;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    ">
      <div style="
        width: 70px; height: 70px;
        border-radius: 50%;
        background: rgba(0, 161, 161, 0.15);
        border: 2px solid #00d5d5;
        display: flex; align-items: center; justify-content: center;
        font-size: 2rem;
      ">✓</div>
      <h2 style="color: #00d5d5; font-size: 1.5rem;">Booking Confirmed!</h2>
      <p style="color: #ccc; font-size: 0.9rem; max-width: 360px; line-height: 1.6;">
        Thank you, <strong style="color:white;">${name}</strong>! Your appointment has been submitted to
        <strong style="color:white;">826 Auto Aesthetic & Protection</strong>.
        We'll be in touch shortly.
      </p>
      <a href="index.html" style="
        margin-top: 10px;
        padding: 12px 30px;
        background: linear-gradient(135deg, #00a1a1, #006666);
        border-radius: 10px;
        color: white;
        text-decoration: none;
        font-size: 0.9rem;
      ">Back to Home</a>
    </div>
  `;
}

// 8. Bind submit event
const form = document.querySelector(".booking-form");
let savedFormHTML = "";

function bindSubmit() {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (validateForm()) {
      showConfirmation(getFormData());
    }
  });
}

bindSubmit();
