"use strict";
const copyButton = document.getElementById("copy-email");
if (copyButton && navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText("fromentindulten@gmail.com");
      status.textContent = "Email address copied.";
    } catch {
      status.textContent = "Please select and copy the email address above.";
    }
  });
}
const form = document.getElementById("contact-form");
if (form) {
  document.getElementById("composer").hidden = false;
  const topic = new URLSearchParams(window.location.search).get("topic");
  if ([...form.elements.topic.options].some((option) => option.value === topic))
    form.elements.topic.value = topic;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const name = String(fields.get("name")).trim();
    const message = String(fields.get("message")).trim();
    if (!name || !message) {
      document.getElementById("form-status").textContent =
        "Please enter your name and a message.";
      return;
    }
    const subject = fields.get("topic") + " enquiry from " + name;
    const body =
      message + "\n\n" + name + "\nReply email: " + fields.get("email");
    window.location.href =
      "mailto:fromentindulten@gmail.com?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    document.getElementById("form-status").textContent =
      "Email draft requested. Your message has not been sent by this website.";
  });
}

// Native disclosures work without JavaScript; enhance dismissal and exclusivity.
const navDropdowns = [...document.querySelectorAll(".nav-dropdown")];
function closeDropdowns(except = null) {
  navDropdowns.forEach((dropdown) => {
    if (dropdown !== except) dropdown.open = false;
  });
}
navDropdowns.forEach((dropdown) => {
  const summary = dropdown.querySelector("summary");
  summary.addEventListener("click", () => {
    if (!dropdown.open) closeDropdowns(dropdown);
  });
  dropdown.addEventListener("toggle", () => {
    if (dropdown.open) closeDropdowns(dropdown);
  });
  dropdown
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => closeDropdowns()));
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".nav-dropdown")) closeDropdowns();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const open = navDropdowns.find((dropdown) => dropdown.open);
  if (open) {
    closeDropdowns();
    open.querySelector("summary").focus();
  }
});
document.addEventListener("focusin", (event) => {
  if (!event.target.closest(".nav-dropdown")) closeDropdowns();
});

// Open a collapsed account when a direct section link points inside it.
function revealLinkedSection() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  let parent = target.parentElement;
  while (parent) {
    if (parent.matches("details")) parent.open = true;
    parent = parent.parentElement;
  }
  requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
}
window.addEventListener("hashchange", revealLinkedSection);
revealLinkedSection();

// Skill filters use URL state so every skill is a shareable entry point.
const skillSearch = document.getElementById("skill-search");
if (skillSearch) {
  const cards = [...document.querySelectorAll(".skill-card")];
  const filters = [...document.querySelectorAll(".skill-filter")];
  let selected = "";
  const aliases = {
    leadership: "lead mentor management",
    instruction: "teach training coaching",
    communication: "speaking writing advocacy presentation",
    organization: "administration logistics coordination",
    "customer-service": "sales retail hospitality customers",
    research: "analysis evidence investigation",
    planning: "project preparation",
    budgeting: "cost finance money",
    "problem-solving": "practical technical troubleshooting",
    teamwork: "team collaboration",
    adaptability: "flexible flexibility",
  };
  function renderSkills(updateUrl = false) {
    const query = skillSearch.value.trim().toLowerCase();
    let count = 0;
    cards.forEach((card) => {
      const skills = card.dataset.skills.split(" ");
      const searchable = (
        card.textContent +
        " " +
        skills.map((s) => aliases[s] || "").join(" ")
      ).toLowerCase();
      const visible =
        (!selected || skills.includes(selected)) &&
        query.split(/\s+/).every((word) => searchable.includes(word));
      card.hidden = !visible;
      if (visible) count++;
    });
    filters.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.skill === selected),
      ),
    );
    document.getElementById("skill-count").textContent =
      `${count} ${count === 1 ? "example" : "examples"} shown`;
    document.querySelector(".no-results").hidden = count > 0;
    if (updateUrl) {
      const url = new URL(location.href);
      selected
        ? url.searchParams.set("skill", selected)
        : url.searchParams.delete("skill");
      query ? url.searchParams.set("q", query) : url.searchParams.delete("q");
      history.replaceState(null, "", url);
    }
  }
  function restoreSkills() {
    const params = new URLSearchParams(location.search);
    selected = filters.some(
      (button) => button.dataset.skill === params.get("skill"),
    )
      ? params.get("skill")
      : "";
    skillSearch.value = params.get("q") || "";
    renderSkills();
  }
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      selected = button.dataset.skill;
      renderSkills(true);
    }),
  );
  skillSearch.addEventListener("input", () => renderSkills(true));
  document.getElementById("clear-skills").addEventListener("click", () => {
    selected = "";
    skillSearch.value = "";
    renderSkills(true);
    skillSearch.focus();
  });
  window.addEventListener("popstate", restoreSkills);
  restoreSkills();
  document.querySelector(".skill-controls").hidden = false;
}

// Award assets stay separate from layout. Empty entries are intentionally omitted.
const awardGallery = document.getElementById("award-gallery");
if (awardGallery) {
  const localAsset = (value) => {
    if (typeof value !== "string" || !value.trim()) return null;
    const url = new URL(value, location.href);
    return url.origin === location.origin &&
      /\.(png|jpe?g|webp|pdf)$/i.test(url.pathname)
      ? url.href
      : null;
  };
  fetch("./data/awards.json")
    .then((response) => {
      if (!response.ok) throw new Error("Collection unavailable");
      return response.json();
    })
    .then((records) => {
      const collection = document.createDocumentFragment();
      records.forEach((record) => {
        const image = localAsset(record.image);
        const documentUrl = localAsset(record.document);
        if (!image && !documentUrl) return;
        const card = document.createElement("article");
        card.className = "award-artifact";
        if (image) {
          const link = document.createElement("a");
          link.href = image;
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          const img = document.createElement("img");
          img.src = image;
          img.alt = record.alt || record.title;
          img.loading = "lazy";
          img.decoding = "async";
          link.append(img);
          card.append(link);
        }
        const title = document.createElement("h3");
        title.textContent = record.title;
        card.append(title);
        if (record.caption) {
          const p = document.createElement("p");
          p.textContent = record.caption;
          card.append(p);
        }
        const story = document.createElement("a");
        story.href = "#" + encodeURIComponent(record.id);
        story.textContent = "Read the story ↗";
        story.className = "text-link";
        card.append(story);
        if (documentUrl) {
          const link = document.createElement("a");
          link.href = documentUrl;
          link.textContent = "View certificate ↗";
          link.className = "text-link";
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          card.append(link);
        }
        collection.append(card);
      });
      if (collection.childNodes.length)
        awardGallery.replaceChildren(collection);
    })
    .catch(() => {
      /* The useful static collection introduction remains visible. */
    });
}

// Compact navigation for tablet and mobile.
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
const mobileHeader = document.querySelector(".floating-header");
if (mobileHeader && mobileMenuToggle) {
  const primaryLinks = document.getElementById("primary-links");
  const closeMobileMenu = () => {
    mobileHeader.classList.remove("menu-open");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileMenuToggle.querySelector(".mobile-menu-icon").textContent = "☰";
    closeDropdowns();
  };
  const openMobileMenu = () => {
    mobileHeader.classList.add("menu-open");
    mobileMenuToggle.setAttribute("aria-expanded", "true");
    mobileMenuToggle.querySelector(".mobile-menu-icon").textContent = "×";
    mobileHeader.classList.remove("header-hidden");
  };
  mobileMenuToggle.addEventListener("click", () => {
    mobileHeader.classList.contains("menu-open")
      ? closeMobileMenu()
      : openMobileMenu();
  });
  primaryLinks?.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", closeMobileMenu),
  );
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileHeader.classList.contains("menu-open")) {
      closeMobileMenu();
      mobileMenuToggle.focus();
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMobileMenu();
  });
}

// Keep navigation available at the top and on upward scroll; clear the view on descent.
const floatingHeader = document.querySelector(".floating-header");
if (floatingHeader) {
  let previousScroll = Math.max(0, window.scrollY);
  let scrollQueued = false;
  function updateHeader() {
    const current = Math.max(0, window.scrollY);
    const delta = current - previousScroll;
    const interacting =
      floatingHeader.contains(document.activeElement) ||
      floatingHeader.querySelector("details[open]") ||
      floatingHeader.classList.contains("menu-open");
    if (current < 80 || interacting || delta < -5)
      floatingHeader.classList.remove("header-hidden");
    else if (delta > 5) floatingHeader.classList.add("header-hidden");
    if (Math.abs(delta) > 5) previousScroll = current;
    scrollQueued = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollQueued) {
        requestAnimationFrame(updateHeader);
        scrollQueued = true;
      }
    },
    { passive: true },
  );
  floatingHeader.addEventListener("focusin", () =>
    floatingHeader.classList.remove("header-hidden"),
  );
}
