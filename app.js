(function () {
  "use strict";

  /* ---------- Creator types ---------- */
  var ICONS = {
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>',
    shirt: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    gem: '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
    food: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    activity: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'
  };

  var TYPES = [
    { name: "Lifestyle", icon: "coffee" },
    { name: "Fashion", icon: "shirt" },
    { name: "Beauty", icon: "gem" },
    { name: "Food", icon: "food" },
    { name: "Fitness", icon: "activity" },
    { name: "Travel", icon: "plane" },
    { name: "Tech", icon: "cpu" },
    { name: "Comedy & Memes", icon: "smile" }
  ];

  var grid = document.getElementById("typesGrid");
  if (grid) {
    TYPES.forEach(function (t) {
      var card = document.createElement("div");
      card.className = "type-card reveal";
      var briefHref = "mailto:" + CAPTR_CONFIG.email +
        "?subject=" + encodeURIComponent("Brand brief: " + t.name + " creators") +
        "&body=" + encodeURIComponent("Hi CAPTR,\n\nWe are looking for " + t.name + " creators.\n\nBrand:\nWhat we want to promote:\nGoal of the campaign:\n\nThanks!");
      card.innerHTML =
        '<div class="type-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[t.icon] + '</svg></div>' +
        '<p class="type-name">' + t.name + '</p>' +
        '<a class="type-cta" href="' + briefHref + '"><b>Brief us</b> for this type</a>' +
        '<a class="type-cta" href="#join" data-type="' + t.name + '"><b>Join</b> as this type</a>';
      grid.appendChild(card);
    });
    grid.addEventListener("click", function (e) {
      var a = e.target.closest("a[data-type]");
      if (!a) return;
      var sel = document.getElementById("f-type");
      if (sel) {
        sel.value = a.getAttribute("data-type");
        sel.classList.remove("invalid");
      }
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Creator form ---------- */
  var form = document.getElementById("creatorForm");
  if (!form) return;
  var status = document.getElementById("formStatus");
  var btn = document.getElementById("submitBtn");
  var startedAt = Date.now();

  function setStatus(msg, kind) {
    status.textContent = msg || "";
    status.className = "form-status" + (kind ? " " + kind : "");
  }
  function markInvalid(el, bad) {
    el.classList.toggle("invalid", !!bad);
  }
  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("");
    var ok = true;

    ["f-name", "f-ig", "f-followers", "f-city", "f-wa", "f-email"].forEach(function (id) {
      var el = document.getElementById(id);
      var bad = !el.value.trim();
      if (id === "f-email") bad = bad || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
      if (id === "f-wa") bad = bad || el.value.replace(/[^\d]/g, "").length < 10;
      markInvalid(el, bad);
      if (bad) ok = false;
    });

    var typeSel = document.getElementById("f-type");
    var badType = !typeSel.value;
    markInvalid(typeSel, badType);
    if (badType) ok = false;

    var insights = document.getElementById("f-insights");
    var demo = document.getElementById("f-demo");
    var maxBytes = CAPTR_CONFIG.maxFileMB * 1024 * 1024;
    var insightsFile = insights.files[0];
    var demoFile = demo.files[0];
    var badInsights = !insightsFile || insightsFile.size > maxBytes || !/^image\//.test(insightsFile.type);
    markInvalid(insights, badInsights);
    if (badInsights) ok = false;
    if (demoFile && (demoFile.size > maxBytes || !/^image\//.test(demoFile.type))) {
      markInvalid(demo, true);
      ok = false;
    } else {
      markInvalid(demo, false);
    }

    var consent = document.getElementById("f-consent");
    if (!consent.checked) {
      ok = false;
      setStatus("Please tick the consent checkbox so we can contact you.", "err");
    }
    if (!ok) {
      if (!status.textContent) setStatus("Please fill the highlighted fields (images up to " + CAPTR_CONFIG.maxFileMB + " MB).", "err");
      return;
    }

    // honeypot: bots fill it, humans never see it
    if (document.getElementById("f-website").value) {
      form.hidden = true;
      document.getElementById("formThanks").hidden = false;
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending...";
    setStatus("Uploading your application, hold on...", "");

    Promise.all([
      insightsFile ? readFileAsDataURL(insightsFile) : null,
      demoFile ? readFileAsDataURL(demoFile) : null
    ]).then(function (imgs) {
      var payload = {
        name: document.getElementById("f-name").value.trim(),
        instagram: document.getElementById("f-ig").value.trim(),
        ig_link: document.getElementById("f-iglink").value.trim(),
        other_platforms: document.getElementById("f-other").value.trim(),
        followers: document.getElementById("f-followers").value.trim(),
        avg_views: document.getElementById("f-views").value.trim(),
        engagement: document.getElementById("f-eng").value.trim(),
        content_type: typeSel.value,
        city: document.getElementById("f-city").value.trim(),
        languages: document.getElementById("f-lang").value.trim(),
        collabs: document.getElementById("f-collabs").value.trim(),
        whatsapp: document.getElementById("f-wa").value.trim(),
        email: document.getElementById("f-email").value.trim(),
        consent: "yes",
        elapsed_s: Math.round((Date.now() - startedAt) / 1000),
        insights_file: imgs[0] ? { name: insightsFile.name, data: imgs[0] } : null,
        demographics_file: imgs[1] && demoFile ? { name: demoFile.name, data: imgs[1] } : null
      };

      return fetch(CAPTR_CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).then(function (res) { return res.json(); });
    }).then(function (out) {
      if (out && out.ok) {
        form.hidden = true;
        var th = document.getElementById("formThanks");
        th.hidden = false;
        th.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        throw new Error((out && out.error) || "rejected");
      }
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = "Apply to join";
      setStatus("Something went wrong sending the form. Please try again, or email your details to " + CAPTR_CONFIG.email + ".", "err");
    });
  });
})();
