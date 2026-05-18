const toggle    = document.getElementById("menu-toggle");
const navLinks  = document.querySelector(".nav-links");
const navItems  = document.querySelectorAll(".nav-links a");

if (toggle) {
  toggle.innerHTML = "☰";
  toggle.onclick = (e) => {
    e.stopPropagation();
    navLinks.classList.toggle("active");
  };
}

document.addEventListener("click", (e) => {
  if (navLinks && navLinks.classList.contains("active") && !navLinks.contains(e.target) && e.target !== toggle) {
    navLinks.classList.remove("active");
  }
});

navItems.forEach(link => {
  link.addEventListener("click", () => {
    navItems.forEach(item => item.classList.remove("active"));
    link.classList.add("active");
    if (navLinks) navLinks.classList.remove("active");
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
    if (scrollPos >= section.offsetTop) {
      currentSectionId = section.id;
    }
  });

  setActiveLink(currentSectionId);
}

window.addEventListener("scroll", onScrollHighlight);
window.addEventListener("load",   onScrollHighlight);
window.addEventListener("resize", onScrollHighlight);


const revealSections = document.querySelectorAll("#services, #about, .reviews-section, #contact");

if (revealSections.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealSections.forEach(section => {
    section.classList.add("scroll-reveal");
    revealObserver.observe(section);
  });
}


/* BOOKING FORM & CONFIRMATION */
const form = document.querySelector(".booking-form");
let savedFormHTML = "";

function disableBookedDates() {
  const dateInput = document.querySelector('input[type="date"]');
  if (!dateInput) return;

const localDate = new Date();
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(localDate.getDate()).padStart(2, '0');
  const todayLocal = `${year}-${month}-${day}`;

  dateInput.setAttribute("min", todayLocal);
  dateInput.setCustomValidity("");

  dateInput.addEventListener("input", function() {
    const bookedDates = JSON.parse(localStorage.getItem("bookedDates")) || [];
    
    if (bookedDates.includes(this.value)) {
      this.setCustomValidity("This date is already fully booked. Please select another date.");
      this.reportValidity();
      this.value = ""; 
    } else {
      this.setCustomValidity("");
    }
  });
}

disableBookedDates();

function showError(input, message) {
  clearError(input);
  input.style.borderColor = "#ff4d4d";
  input.style.boxShadow   = "0 0 12px rgba(255, 77, 77, 0.5)";
  const error       = document.createElement("span");
  error.className   = "error-msg";
  error.textContent = message;
  error.style.cssText = "color:#ff4d4d; font-size:0.75rem; margin-top:4px; display:block;";
  input.parentNode.insertBefore(error, input.nextSibling);
}

function clearError(input) {
  input.style.borderColor = "";
  input.style.boxShadow   = "";
  if (input.parentNode) {
    const existing = input.parentNode.querySelector(".error-msg");
    if (existing) existing.remove();
  }
}

function validateForm() {
  let valid = true;

  form.querySelectorAll(".error-msg, .service-error").forEach(el => el.remove());
  form.querySelectorAll("input, textarea").forEach(el => {
    el.style.borderColor = "";
    el.style.boxShadow   = "";
  });

  const name = form.querySelector('#fullname');
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

  const phone = form.querySelector('input[type="tel"]');
  if (!phone.value.trim()) {
    showError(phone, "Phone number is required.");
    valid = false;
  } else {
    const rawDigits = phone.value.replace(/\D/g, "");

    if (rawDigits.length !== 11) {
      showError(phone, "Phone number must be exactly 11 digits.");
      valid = false;
    } else if (!rawDigits.startsWith("09")) {
      showError(phone, "The phone number must start with 09.");
      valid = false;
    }
  }

  const brand = form.querySelector('#vehicle-brand');
  if (!brand.value.trim()) {
    showError(brand, "Vehicle type/brand is required.");
    valid = false;
  }

  const model = form.querySelector('#vehicle-model');
  if (!model.value.trim()) {
    showError(model, "Vehicle model is required.");
    valid = false;
  }

const year = form.querySelector('#vehicle-year');
const currentYearValue = parseInt(year.value.trim(), 10);
const maxAllowedYear = new Date().getFullYear() + 1; 

if (!year.value.trim()) {
  showError(year, "Vehicle year is required.");
  valid = false;
} else if (isNaN(currentYearValue)) {
  showError(year, "Please enter a valid numeric year.");
  valid = false;
} else if (currentYearValue > maxAllowedYear) {
  showError(year, `Vehicle year cannot be further than the year ${maxAllowedYear}.`);
  valid = false;
} else if (currentYearValue < 1900) {
  showError(year, "Please enter a realistic vehicle year.");
  valid = false;
}

  const checked = form.querySelectorAll('input[name="services"]:checked');
  const checkboxGroup = form.querySelector(".checkbox-group");
  if (checked.length === 0) {
    const error       = document.createElement("span");
    error.className   = "service-error";
    error.textContent = "Please select at least one service.";
    error.style.cssText = "color:#ff4d4d; font-size:0.75rem; margin-top:4px; display:block;";
    checkboxGroup.parentNode.appendChild(error);
    valid = false;
  }

  const date = form.querySelector('input[type="date"]');
  if (!date.value) {
    showError(date, "Please select a booking date.");
    valid = false;
  } else {
    const bookedDates = JSON.parse(localStorage.getItem("bookedDates")) || [];
    if (bookedDates.includes(date.value)) {
      showError(date, "This date is already fully booked.");
      valid = false;
    }
  }

  return valid;
}

function getFormData() {
  const checked = [...form.querySelectorAll('input[name="services"]:checked')]
    .map(cb => cb.parentNode.querySelector("span").textContent);

  const rawDate   = form.querySelector('input[type="date"]').value;
  const formatted = new Date(rawDate + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });

  return {
    name:         form.querySelector('#fullname').value.trim(),
    email:        form.querySelector('input[type="email"]').value.trim(),
    phone:        form.querySelector('input[type="tel"]').value.trim(),
    vehicleBrand: form.querySelector('#vehicle-brand').value.trim(),
    vehicleModel: form.querySelector('#vehicle-model').value.trim(),
    vehicleYear:  form.querySelector('#vehicle-year').value.trim(),
    services:     checked,
    date:         formatted,
    rawDate:      rawDate,
    notes:        form.querySelector("textarea").value.trim() || "None"
  };
}


/* PHONE NUMBER FORMATTING */
const phoneInput = document.getElementById("phone");

if (phoneInput) {
  phoneInput.removeAttribute("oninput");

  phoneInput.addEventListener("input", (e) => {
    let digits = e.target.value.replace(/\D/g, "");
    digits = digits.substring(0, 11);

    let formattedValue = "";
    if (digits.length > 0) {
      formattedValue += digits.substring(0, 4);
    }
    if (digits.length >= 5) {
      formattedValue += " " + digits.substring(4, 7);
    }
    if (digits.length >= 8) {
      formattedValue += " " + digits.substring(7, 11);
    }

    e.target.value = formattedValue;
    phoneInput.setCustomValidity("");
  });

  phoneInput.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      const value = e.target.value;
      if (value.endsWith(" ")) {
        e.preventDefault();
        e.target.value = value.substring(0, value.length - 2);
      }
    }
  });
}

function showConfirmation(data) {
  const serviceList = data.services.map(s => `
    <li style="padding: 4px 0; color: #fff;">✓ ${s}</li>
  `).join("");

  form.innerHTML = `
    <div style="text-align:center; margin-bottom: 24px;">
      <h2 style="color:#00d5d5; font-size:1.4rem; margin-bottom:6px;">Review Your Booking</h2>
      <p style="color:#aaa; font-size:0.85rem;">Please confirm your details before submitting.</p>
    </div>

    <div style="background: rgba(0,161,161,0.08); border: 1px solid rgba(0,213,213,0.3); border-radius: 12px; padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; font-size: 0.88rem;">
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
        <span style="color:#aaa;">Vehicle Specification</span>
        <span style="color:#fff; font-weight:500; text-align:right;">${data.vehicleBrand} ${data.vehicleModel} (${data.vehicleYear})</span>
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
      <div style="display:flex; justify-content:space-between; padding-top:4px;">
        <span style="color:#aaa;">Notes</span>
        <span style="color:#fff; max-width:60%; text-align:right;">${data.notes}</span>
      </div>
    </div>

    <div style="display:flex; gap:12px; margin-top:24px;">
      <button type="button" id="back-btn" style="flex:1; padding:14px; background: transparent; border: 1px solid rgba(0,213,213,0.5); border-radius: 12px; color: #00d5d5; font-size: 0.95rem; cursor: pointer; transition: 0.3s;">← Edit Booking</button>
      <button type="button" id="confirm-btn" style="flex:1; padding:14px; background: linear-gradient(135deg, #00a1a1, #006666); border: none; border-radius: 12px; color: white; font-size: 0.95rem; cursor: pointer; transition: 0.3s;">Confirm Booking</button>
    </div>
  `;

  document.getElementById("back-btn").addEventListener("click", () => {
    form.innerHTML = savedFormHTML;
    restoreFormData(data);
    bindSubmit();
  });

  document.getElementById("confirm-btn").addEventListener("click", () => {
    let bookedDates = JSON.parse(localStorage.getItem("bookedDates")) || [];
    
    if (!bookedDates.includes(data.rawDate)) {
      bookedDates.push(data.rawDate);
      localStorage.setItem("bookedDates", JSON.stringify(bookedDates));
    }

    disableBookedDates(); 
    showSuccess(data.name);
  });
}

function restoreFormData(data) {
  form.querySelector('#fullname').value  = data.name;
  form.querySelector('input[type="email"]').value = data.email;
  form.querySelector('input[type="tel"]').value   = data.phone;
  
  form.querySelector('#vehicle-brand').value = data.vehicleBrand;
  form.querySelector('#vehicle-model').value = data.vehicleModel;
  form.querySelector('#vehicle-year').value  = data.vehicleYear;

  form.querySelector('input[type="date"]').value  = data.rawDate;

  data.services.forEach(serviceName => {
    form.querySelectorAll('input[name="services"]').forEach(cb => {
      if (cb.parentNode.querySelector("span").textContent === serviceName) {
        cb.checked = true;
      }
    });
  });

  form.querySelector("textarea").value = data.notes === "None" ? "" : data.notes;
  disableBookedDates(); 
}

function showSuccess(name) {
  const popup = document.createElement("div");
  popup.className = "popup-overlay active";

  popup.innerHTML = `
      <div class="popup-box">
        <div class="popup-icon">✓</div>
        <h2 style="margin-top: 15px;">Booking Submitted!</h2>
        <p style="margin-top: 10px; color: #ccc;">
          Thank you for booking, <strong>${name}</strong>!<br>
          We'll confirm your appointment with <strong>826 Auto Aesthetic & Protection</strong> shortly.
        </p>
        <a href="index.html" class="popup-btn">Back to Home</a>
      </div>
  `;
  document.body.appendChild(popup);
}

function bindSubmit() {
  if (!form) return;

  form.onsubmit = function (e) {
    e.preventDefault();
    const submitBtn = form.querySelector(".btn");

    if (validateForm()) {
      if (submitBtn) {
        submitBtn.classList.add("loading");
        submitBtn.innerHTML = "Processing...";
      }

      setTimeout(() => {
        showConfirmation(getFormData());
      }, 800);
    }
  };
}

if (form) {
  savedFormHTML = form.innerHTML;
  bindSubmit();
}


/* IMAGE LIGHTBOX OVERLAY GALLERY SYSTEM*/
let imageOverlay = document.getElementById("image-overlay");
let overlayImg   = document.getElementById("overlay-img");

if (!imageOverlay) {
  imageOverlay = document.createElement("div");
  imageOverlay.id = "image-overlay";
  
  const backdrop = document.createElement("div");
  backdrop.className = "overlay-backdrop";
  
  overlayImg = document.createElement("img");
  overlayImg.id = "overlay-img";
  overlayImg.alt = "Expanded Gallery View";
  
  const closeBtn = document.createElement("span");
  closeBtn.className = "overlay-close";
  closeBtn.innerHTML = "&times;";

  imageOverlay.appendChild(backdrop);
  imageOverlay.appendChild(overlayImg);
  imageOverlay.appendChild(closeBtn);
  document.body.appendChild(imageOverlay);

  const style = document.createElement("style");
  style.textContent = `
    #image-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(10, 10, 10, 0.96);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 100005;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    #image-overlay.active {
      display: flex;
      opacity: 1;
    }
    .overlay-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    #overlay-img {
      position: relative;
      max-width: 85%;
      max-height: 80vh;
      object-fit: contain;
      border: 2px solid rgba(0, 213, 213, 0.3);
      border-radius: 12px;
      box-shadow: 0 0 35px rgba(0, 213, 213, 0.25);
      z-index: 100006;
      transform: scale(0.95);
      transition: transform 0.3s ease;
    }
    #image-overlay.active #overlay-img {
      transform: scale(1);
    }
    .overlay-close {
      position: absolute;
      top: 30px;
      right: 45px;
      color: #fff;
      font-size: 44px;
      font-weight: bold;
      cursor: pointer;
      z-index: 100008;
      transition: color 0.2s, transform 0.2s;
      user-select: none;
    }
    .overlay-close:hover {
      color: #00d5d5;
      transform: scale(1.1);
    }
    .overlay-controls button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 36px;
      padding: 10px 22px;
      cursor: pointer;
      border-radius: 8px;
      z-index: 100007;
      user-select: none;
      transition: all 0.3s ease;
    }
    .overlay-controls button:hover {
      background: linear-gradient(135deg, #00a1a1, #006666);
      border-color: #00d5d5;
      box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
    }
    .overlay-controls button.prev { left: 40px; }
    .overlay-controls button.next { right: 40px; }
    
    @media (max-width: 768px) {
      .overlay-controls button { padding: 8px 15px; font-size: 26px; }
      .overlay-controls button.prev { left: 15px; }
      .overlay-controls button.next { right: 15px; }
      .overlay-close { top: 20px; right: 25px; font-size: 38px; }
    }
  `;
  document.head.appendChild(style);
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeOverlay();
  });
}

let activeStackOrder = null;
let activeStackIndex = 0;

function closeOverlay() {
  if (imageOverlay) {
    imageOverlay.classList.remove("active");
    setTimeout(() => {
      if (!imageOverlay.classList.contains("active")) {
        imageOverlay.style.display = "none";
      }
    }, 300);
  }
  activeStackOrder = null;
  document.body.style.overflow = ""; 
}

let overlayControls = null;
let overlayPrevBtn  = null;
let overlayNextBtn  = null;

if (imageOverlay) {
  overlayControls = document.createElement("div");
  overlayControls.className = "overlay-controls";

  overlayPrevBtn           = document.createElement("button");
  overlayPrevBtn.className = "prev";
  overlayPrevBtn.innerHTML = "‹";

  overlayNextBtn           = document.createElement("button");
  overlayNextBtn.className = "next";
  overlayNextBtn.innerHTML = "›";

  overlayControls.appendChild(overlayPrevBtn);
  overlayControls.appendChild(overlayNextBtn);
  imageOverlay.appendChild(overlayControls);

  overlayPrevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!activeStackOrder || activeStackOrder.length <= 1) return;
    activeStackIndex = (activeStackIndex - 1 + activeStackOrder.length) % activeStackOrder.length;
    overlayImg.src   = activeStackOrder[activeStackIndex].src;
    overlayImg.alt   = activeStackOrder[activeStackIndex].alt || "";
  });

  overlayNextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!activeStackOrder || activeStackOrder.length <= 1) return;
    activeStackIndex = (activeStackIndex + 1) % activeStackOrder.length;
    overlayImg.src   = activeStackOrder[activeStackIndex].src;
    overlayImg.alt   = activeStackOrder[activeStackIndex].alt || "";
  });
}

const stackedContainers = document.querySelectorAll(".stacked");

stackedContainers.forEach(container => {
  const imgs = Array.from(container.querySelectorAll("img"));
  if (!imgs.length) return;

  imgs.forEach(i => {
    i.setAttribute("draggable", "false");
    i.style.pointerEvents = "none";
  });

  const order = imgs.slice();

  function isStackedResponsiveMode() {
    return window.matchMedia("(max-width: 992px)").matches;
  }

  function applyOrder() {
    const n          = order.length;
    const responsive = isStackedResponsiveMode();

    order.forEach((img, idx) => {
      if (responsive) {
        img.style.position  = "static";
        img.style.left      = "";
        img.style.top       = "";
        img.style.width     = "100%";
        img.style.height    = "auto";
        img.style.transform = "none";
        img.style.zIndex    = "";
      } else {
        const offsetX = idx * 28;
        const offsetY = idx * 18;
        const rot     = -2 + idx * 1;
        img.style.position  = "absolute";
        img.style.left      = "0";
        img.style.top       = "0";
        img.style.width     = "70%";
        img.style.height    = "100%";
        img.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rot}deg)`;
        img.style.zIndex    = String(n - idx);
      }

      img.style.objectFit    = "cover";
      img.style.borderRadius = "18px";
      img.style.transition   = "transform 0.35s ease, z-index 0s";
    });
  }

  applyOrder();
  window.addEventListener("resize", applyOrder);

  container.style.cursor = "pointer";
  container.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    activeStackOrder = order.slice();
    activeStackIndex = 0;
    if (overlayImg && imageOverlay) {
      overlayImg.src = activeStackOrder[activeStackIndex].src;
      overlayImg.alt = activeStackOrder[activeStackIndex].alt || "";
      imageOverlay.style.display = "flex";
      setTimeout(() => imageOverlay.classList.add("active"), 10);
      document.body.style.overflow = "hidden";
    }
  });
});

const allDetailImages = Array.from(document.querySelectorAll(".feature-image, .pd-image, .about-image"));
const nonStacked = allDetailImages.filter(img => !img.closest(".stacked"));

if (nonStacked.length && imageOverlay && overlayImg) {
  nonStacked.forEach((img, index) => {
    img.setAttribute("draggable", "false");
    img.style.pointerEvents = "auto";
    img.style.cursor = "pointer";

    img.addEventListener("click", (e) => {
      e.stopPropagation();
      activeStackOrder = nonStacked;
      activeStackIndex = index;

      overlayImg.src = img.src;
      overlayImg.alt = img.alt || "Expanded image";
      imageOverlay.style.display = "flex";
      setTimeout(() => imageOverlay.classList.add("active"), 10);
      document.body.style.overflow = "hidden";
    });
  });
}

/* --- LIGHTBOX OVERLAY DISMISS CONTEXTS --- */
if (imageOverlay) {
  imageOverlay.addEventListener("click", (event) => {
    const t              = event.target;
    const clickedOnImage = overlayImg && (t === overlayImg || overlayImg.contains(t));
    const clickedOnPrev  = overlayPrevBtn && overlayPrevBtn.contains(t);
    const clickedOnNext  = overlayNextBtn && overlayNextBtn.contains(t);
    const clickedOnClose = t.classList.contains("overlay-close");
    
    if (!clickedOnImage && !clickedOnPrev && !clickedOnNext || clickedOnClose) {
      closeOverlay();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    return closeOverlay();
  }

  if (
    (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
    activeStackOrder && activeStackOrder.length > 1 &&
    imageOverlay &&
    imageOverlay.classList.contains("active")
  ) {
    event.preventDefault();

    if (event.key === "ArrowLeft") {
      activeStackIndex = (activeStackIndex - 1 + activeStackOrder.length) % activeStackOrder.length;
    } else {
      activeStackIndex = (activeStackIndex + 1) % activeStackOrder.length;
    }

    overlayImg.src = activeStackOrder[activeStackIndex].src;
    overlayImg.alt = activeStackOrder[activeStackIndex].alt || "";
  }
});
