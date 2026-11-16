/* contact.js — contact form (validation + preview before sending) */

const PROJECT_SUBJECTS = ["personal", "business", "landing", "ui"];

function updateSmsLink() {
    const smsLink = document.getElementById("smsLink");
    if (!smsLink) return;
    const body = currentLang === "fa"
        ? "سلام وقت بخیر، سفارش طراحی سایت داشتم لطفا تماس بگیرید"
        : "Hello, I would like to order a website design. Please contact me.";
    smsLink.href = "sms:09915580367?body=" + encodeURIComponent(body);
}

const contactFormEl = document.getElementById("contactFormEl");
const formSubject = document.getElementById("formSubject");
const projectDetailsWrap = document.getElementById("projectDetailsWrap");
const formMessage = document.getElementById("formMessage");
const charCount = document.getElementById("charCount");

formMessage.addEventListener("input", () => {
    charCount.textContent = formMessage.value.length;
});

formSubject.addEventListener("change", () => {
    const value = formSubject.value;
    if (PROJECT_SUBJECTS.includes(value)) {
        projectDetailsWrap.classList.add("open");
    } else {
        projectDetailsWrap.classList.remove("open");
    }
    formSubject.classList.remove("invalid");
    document.getElementById("errorSubject").classList.remove("visible");
});

["formName", "formContact", "formMessage"].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("input", () => {
        el.classList.remove("invalid");
        const errorId = "error" + id.charAt(4).toUpperCase() + id.slice(5);
        const errorEl = document.getElementById(errorId);
        if (errorEl) errorEl.classList.remove("visible");
    });
});

function validateForm() {
    let isValid = true;

    const name = document.getElementById("formName");
    const contact = document.getElementById("formContact");
    const subject = document.getElementById("formSubject");
    const message = document.getElementById("formMessage");

    if (!name.value.trim() || name.value.trim().length < 2) {
        name.classList.add("invalid");
        document.getElementById("errorName").classList.add("visible");
        isValid = false;
    }

    const contactVal = contact.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
    if (!contactVal || (!emailRegex.test(contactVal) && !phoneRegex.test(contactVal))) {
        contact.classList.add("invalid");
        document.getElementById("errorContact").classList.add("visible");
        isValid = false;
    }

    if (!subject.value) {
        subject.classList.add("invalid");
        document.getElementById("errorSubject").classList.add("visible");
        isValid = false;
    }

    if (!message.value.trim() || message.value.trim().length < 10) {
        message.classList.add("invalid");
        document.getElementById("errorMessage").classList.add("visible");
        isValid = false;
    }

    return isValid;
}

contactFormEl.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm()) {
        const firstInvalid = contactFormEl.querySelector(".invalid");
        if (firstInvalid) {
            firstInvalid.focus();
            firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        return;
    }

    openPreviewModal();
});

const previewModal = document.getElementById("previewModal");
const previewFields = document.getElementById("previewFields");
const previewSendBtn = document.getElementById("previewSendBtn");

function openPreviewModal() {
    const name = document.getElementById("formName").value.trim();
    const contact = document.getElementById("formContact").value.trim();
    const subjectValue = formSubject.value;
    const subjectText = formSubject.options[formSubject.selectedIndex].text;
    const message = document.getElementById("formMessage").value.trim();

    const siteType = document.getElementById("formSiteType").value.trim();
    const business = document.getElementById("formBusiness").value.trim();
    const features = document.getElementById("formFeatures").value.trim();
    const currentSite = document.getElementById("formCurrentSite").value.trim();

    previewFields.innerHTML = "";

    const fields = [
        { label: t("preview.field.name"), value: name },
        { label: t("preview.field.contact"), value: contact },
        { label: t("preview.field.subject"), value: subjectText },
        { label: t("preview.field.message"), value: message }
    ];

    if (PROJECT_SUBJECTS.includes(subjectValue)) {
        if (siteType) fields.push({ label: t("preview.field.siteType"), value: siteType });
        if (business) fields.push({ label: t("preview.field.business"), value: business });
        if (features) fields.push({ label: t("preview.field.features"), value: features });
        if (currentSite) fields.push({ label: t("preview.field.currentSite"), value: currentSite });
    }

    fields.forEach(field => {
        const div = document.createElement("div");
        div.className = "preview-field";

        const label = document.createElement("div");
        label.className = "preview-label";
        label.textContent = field.label;

        const value = document.createElement("div");
        value.className = "preview-value";
        value.textContent = field.value;

        div.appendChild(label);
        div.appendChild(value);
        previewFields.appendChild(div);
    });

    let emailBody = `${t("preview.field.name")}: ${name}\n`;
    emailBody += `${t("preview.field.contact")}: ${contact}\n`;
    emailBody += `${t("preview.field.subject")}: ${subjectText}\n`;
    emailBody += `---\n${t("preview.field.message")}:\n${message}\n`;

    if (PROJECT_SUBJECTS.includes(subjectValue)) {
        if (siteType) emailBody += `\n---\n${t("preview.field.siteType")}: ${siteType}`;
        if (business) emailBody += `\n${t("preview.field.business")}: ${business}`;
        if (features) emailBody += `\n${t("preview.field.features")}: ${features}`;
        if (currentSite) emailBody += `\n${t("preview.field.currentSite")}: ${currentSite}`;
    }

    const emailSubject = t("preview.emailSubject");
    const mailtoLink = `mailto:m9215112@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    previewSendBtn.href = mailtoLink;

    previewModal.classList.add("open");
    document.body.classList.add("modal-open");
}

function closePreviewModal() {
    previewModal.classList.remove("open");
    document.body.classList.remove("modal-open");
}

previewModal.addEventListener("click", (e) => {
    if (e.target === previewModal) closePreviewModal();
});

onReady(initFaq);
onLanguageChange(updateSmsLink);
