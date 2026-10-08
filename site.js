"use strict";

const UMAMI_SRC = "https://cloud.umami.is/script.js";
const UMAMI_WEBSITE_ID = "83a9f356-ddca-4004-a55c-96f06d9a6b14";
const pendingAnalyticsEvents = [];

function storedAnalyticsPreference() {
  try {
    return localStorage.getItem("privacy-analytics");
  } catch {
    return null;
  }
}

function analyticsAllowed() {
  if (navigator.globalPrivacyControl === true) return false;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return false;
  return storedAnalyticsPreference() !== "off";
}

function flushAnalyticsEvents() {
  if (!analyticsAllowed() || !window.umami?.track) return;
  while (pendingAnalyticsEvents.length) {
    const [name, payload] = pendingAnalyticsEvents.shift();
    window.umami.track(name, payload);
  }
}

function loadAnalytics() {
  if (!analyticsAllowed() || document.querySelector('script[data-website-id="' + UMAMI_WEBSITE_ID + '"]')) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = UMAMI_SRC;
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  script.dataset.domains = "dultenrichard.github.io";
  script.dataset.excludeSearch = "true";
  script.addEventListener("load", flushAnalyticsEvents, { once: true });
  document.head.append(script);
}

const safeCampaignContext = (() => {
  const params = new URLSearchParams(window.location.search);
  const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
  const context = {};
  allowed.forEach((key) => {
    const value = params.get(key);
    if (value) context[key] = value.slice(0, 100);
  });
  return context;
})();

function trackEvent(name, data = {}) {
  if (!analyticsAllowed()) return;
  const payload = { ...safeCampaignContext, ...data };
  if (window.umami && typeof window.umami.track === "function") {
    window.umami.track(name, payload);
  } else {
    pendingAnalyticsEvents.push([name, payload]);
  }
}

loadAnalytics();

function compactLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 100);
}

document.addEventListener("DOMContentLoaded", () => {

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );
    document
      .querySelectorAll(".detail, .skill-card, .card, .award-artifact, .feature-row, .recognition-list li, .interest-lines > div, .section-copy")
      .forEach((element) => {
        element.classList.add("reveal-item");
        revealObserver.observe(element);
      });
  }

  const privacyStatus = document.getElementById("privacy-analytics-status");
  const disableAnalytics = document.getElementById("privacy-disable-analytics");
  const enableAnalytics = document.getElementById("privacy-enable-analytics");

  function updatePrivacyStatus() {
    if (!privacyStatus) return;
    if (navigator.globalPrivacyControl === true) {
      privacyStatus.textContent = "Analytics off — Global Privacy Control is enabled.";
    } else if (navigator.doNotTrack === "1" || window.doNotTrack === "1") {
      privacyStatus.textContent = "Analytics off — Do Not Track is enabled.";
    } else {
      privacyStatus.textContent = analyticsAllowed()
        ? "Analytics enabled for this browser."
        : "Analytics disabled for this browser.";
    }
  }

  disableAnalytics?.addEventListener("click", () => {
    try { localStorage.setItem("privacy-analytics", "off"); } catch {}
    pendingAnalyticsEvents.length = 0;
    updatePrivacyStatus();
  });

  enableAnalytics?.addEventListener("click", () => {
    if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1") {
      updatePrivacyStatus();
      return;
    }
    try { localStorage.setItem("privacy-analytics", "on"); } catch {}
    loadAnalytics();
    updatePrivacyStatus();
  });

  updatePrivacyStatus();

  trackEvent("page_loaded", { page: window.location.pathname });

  if (window.location.pathname.endsWith("/contact.html")) {
    trackEvent("contact_view");
  }

  const prefilledTopic = new URLSearchParams(window.location.search).get("topic");
  if (prefilledTopic) {
    trackEvent("contact_topic_prefill", { topic: compactLabel(prefilledTopic) });
  }

  document.querySelectorAll(".nav-dropdown").forEach((dropdown) => {
    dropdown.addEventListener("toggle", () => {
      if (dropdown.open) {
        trackEvent("nav_open", {
          section: compactLabel(dropdown.querySelector("summary")?.textContent),
        });
      }
    });
  });

  const seenSections = new Set();
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
          const id = entry.target.id;
          if (!id || seenSections.has(id)) return;
          seenSections.add(id);
          trackEvent("section_view", { section: id });
        });
      },
      { threshold: [0.5] },
    );
    document.querySelectorAll("main section[id], main .detail[id]").forEach((section) =>
      observer.observe(section),
    );
  }

  const scrollMilestones = new Set();
  window.addEventListener("scroll", () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const percent = Math.round((window.scrollY / scrollable) * 100);
    [25, 50, 75, 90].forEach((mark) => {
      if (percent >= mark && !scrollMilestones.has(mark)) {
        scrollMilestones.add(mark);
        trackEvent("scroll_depth", { percent: mark });
      }
    });
  }, { passive: true });
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");
  if (!link) return;
  const href = link.getAttribute("href") || "";
  const label = compactLabel(link.textContent);

  if (link.closest(".dropdown-panel")) {
    trackEvent("nav_click", { label, destination: href.slice(0, 160) });
  }
  if (link.matches(".button, .text-link")) {
    trackEvent("cta_click", { label, destination: href.slice(0, 160) });
  }
  if (href.startsWith("mailto:")) {
    trackEvent("email_click", {
      placement: link.closest(".contact-options")
        ? "contact_options"
        : link.closest(".dropdown-panel")
          ? "nav_dropdown"
          : link.closest(".actions")
            ? "actions"
            : "other",
    });
    return;
  }
  if (link.classList.contains("social-link")) {
    let platform = "other";
    if (href.includes("linkedin.com")) platform = "linkedin";
    else if (href.includes("github.com")) platform = "github";
    else if (href.includes("instagram.com")) platform = "instagram";
    trackEvent("social_click", { platform });
    return;
  }
  try {
    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin && /^https?:$/.test(url.protocol)) {
      trackEvent("outbound_click", { host: url.hostname.slice(0, 100) });
    }
  } catch {}
  if (link.closest(".award-artifact") && /certificate|document/i.test(label)) {
    trackEvent("certificate_view", { label });
  }
  if (window.location.pathname.endsWith("/sources.html")) {
    trackEvent("source_open", { label, destination: href.slice(0, 160) });
  }
});

const copyButton = document.getElementById("copy-email");
if (copyButton && navigator.clipboard && window.isSecureContext) {
  copyButton.hidden = false;
  copyButton.addEventListener("click", async () => {
    const status = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText("fromentindulten@gmail.com");
      status.textContent = "Email address copied.";
      trackEvent("email_copy");
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
    trackEvent("contact_prepare", { topic: compactLabel(fields.get("topic")) });
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
      trackEvent("skill_filter", { skill: selected });
      renderSkills(true);
    }),
  );
  skillSearch.addEventListener("input", () => renderSkills(true));
  document.getElementById("clear-skills").addEventListener("click", () => {
    selected = "";
    skillSearch.value = "";
    trackEvent("skill_clear");
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
    const url = new URL(value.startsWith("/") ? "https://raw.githack.com/dultenrichard/brand/preview-pull-7/" + value.slice(1) : value, location.href);
    return url.origin === location.origin &&
      /\.(png|jpe?g|webp|pdf)$/i.test(url.pathname)
      ? url.href
      : null;
  };
  fetch("https://raw.githack.com/dultenrichard/brand/preview-pull-7/data/awards.json")
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
    floatingHeader.classList.toggle("is-scrolled", current > 20);
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


// Animated vertical record timeline.
(() => {
  const timeline = document.querySelector("[data-story-timeline]");
  if (!timeline) return;
  const items = [...timeline.querySelectorAll(".story-year")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
  } else {
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    items.forEach((item) => reveal.observe(item));
  }

  if ("IntersectionObserver" in window) {
    const active = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a,b) => Math.abs(a.boundingClientRect.top - window.innerHeight * .42) - Math.abs(b.boundingClientRect.top - window.innerHeight * .42));
      if (!visible.length) return;
      items.forEach((item) => item.classList.remove("is-active"));
      visible[0].target.classList.add("is-active");
    }, { threshold: [0.25,0.55], rootMargin: "-28% 0px -48% 0px" });
    items.forEach((item) => active.observe(item));
  }

  let queued = false;
  const updateProgress = () => {
    const rect = timeline.getBoundingClientRect();
    const viewportAnchor = window.innerHeight * .48;
    const span = Math.max(1, rect.height - 60);
    const travelled = Math.min(span, Math.max(0, viewportAnchor - rect.top));
    timeline.style.setProperty("--timeline-progress", (travelled / span).toFixed(4));
    queued = false;
  };
  const queueProgress = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateProgress);
  };
  window.addEventListener("scroll", queueProgress, { passive: true });
  window.addEventListener("resize", queueProgress);
  updateProgress();
})();
