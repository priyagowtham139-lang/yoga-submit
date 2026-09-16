(function () {
  "use strict";

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- preloader ---------- */
  window.addEventListener("load", function () {
    var p = $(".preloader");
    if (p) {
      p.classList.add("hide");
      setTimeout(function () { p.remove(); }, 700);
    }
  });

  /* ---------- header scroll state ---------- */
  var header = $(".site-header") || $(".dash-top");
  var progress = $(".scroll-progress");
  function onScroll() {
    var st = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", st > 40);
    if (progress) {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      progress.style.width = (max > 0 ? (st / max) * 100 : 0) + "%";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- hamburger / mobile menu ---------- */
  var burger = $("#hamburgerBtn");
  var menu = $("#mobileMenu");
  var backdrop = $("#menuBackdrop");
  function toggleMenu(force) {
    if (!menu) return;
    var open = typeof force === "boolean" ? force : !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    if (backdrop) backdrop.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    if (open) {
      document.body.style.setProperty("--scroll-y", window.scrollY + "px");
    } else {
      var scrollY = parseInt(getComputedStyle(document.body).getPropertyValue("--scroll-y")) || 0;
      document.body.style.removeProperty("--scroll-y");
      document.body.style.removeProperty("position");
      document.body.style.removeProperty("width");
      document.body.style.removeProperty("top");
      window.scrollTo(0, scrollY);
    }
    if (burger) {
      burger.classList.toggle("active", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.innerHTML = open
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    }
  }
  if (burger && menu) {
    burger.addEventListener("click", function () { toggleMenu(); });
    if (backdrop) backdrop.addEventListener("click", function () { toggleMenu(false); });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { toggleMenu(false); }); });
    menu.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".mm-close")) toggleMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") toggleMenu(false);
    });
  }

  /* ---------- dashboard sidebar (mobile) ---------- */
  var dashBurger = $("#dashHamburger");
  var dashSide = $("#dashSide");
  var dashBackdrop = $("#dashBackdrop");
  function closeDashSide() {
    if (dashSide) dashSide.classList.remove("open");
    if (dashBackdrop) dashBackdrop.classList.remove("open");
    document.body.classList.remove("menu-open");
  }
  if (dashBurger && dashSide) {
    dashBurger.addEventListener("click", function () {
      var open = dashSide.classList.toggle("open");
      document.body.classList.toggle("menu-open", open);
      if (dashBackdrop) dashBackdrop.classList.toggle("open", open);
    });
    if (dashBackdrop) dashBackdrop.addEventListener("click", closeDashSide);
    $$("a", dashSide).forEach(function (a) {
      a.addEventListener("click", function () {
        if (getComputedStyle(dashBurger).display !== "none") closeDashSide();
      });
    });
    var dashClose = $(".dash-close", dashSide);
    if (dashClose) dashClose.addEventListener("click", closeDashSide);
  }

  /* ---------- active nav highlight ---------- */
  var page = document.body.dataset.page;
  if (page) {
    $$(".desktop-nav a, .mobile-nav a, .dash-nav a").forEach(function (a) {
      if (a.dataset.nav === page) a.classList.add("active");
    });
  }

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var el = en.target;
        var d = parseFloat(el.dataset.delay) || 0;
        el.style.transitionDelay = d * 90 + "ms";
        el.classList.add("in");
        io.unobserve(el);
      }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- counters ---------- */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      var target = parseInt(el.dataset.count, 10) || 0;
      var t0 = null;
      function tick(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 2000, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.4 });
  $$(".count").forEach(function (el) { cio.observe(el); });

  /* ---------- progress bars in dashboards ---------- */
  var pio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var b = en.target;
        if (b.dataset && b.dataset.w) b.style.width = b.dataset.w + "%";
        pio.unobserve(b);
      }
    });
  }, { threshold: 0.3 });
  $$(".dash-progress span").forEach(function (el) { pio.observe(el); });

  /* ---------- hover spotlight ---------- */
  $$(".spot, .step").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    });
  });

  /* ---------- 3D tilt ---------- */
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
    $$(".tilt").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(950px) rotateY(" + (x * 10) + "deg) rotateX(" + (-y * 10) + "deg) translateY(-8px)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- heading ornaments draw on view ---------- */
  var oio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var p = en.target.querySelector("path");
        if (p) p.style.transition = "stroke-dashoffset 1.6s " + 0.15 + "s ease";
        p.style.strokeDashoffset = "0";
        oio.unobserve(en.target);
      }
    });
  }, { threshold: 0.4 });
  $$(".ornament").forEach(function (o) { oio.observe(o); });

  /* ---------- expandable footer accordion ---------- */
  $$(".f-acc").forEach(function (acc) {
    var head = $(".acc-head", acc);
    var panel = $(".acc-panel", acc);
    if (head) {
      head.addEventListener("click", function () {
        var isOpen = acc.classList.toggle("open");
        if (panel && window.innerWidth <= 640) {
          panel.style.maxHeight = isOpen ? panel.scrollHeight + 40 + "px" : "";
        }
      });
      if (window.innerWidth <= 640) {
        panel.style.maxHeight = "0px";
        acc.classList.remove("open");
      }
    }
  });
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 640) {
      $$(".f-acc").forEach(function (acc) {
        acc.classList.remove("open");
        var panel = $(".acc-panel", acc);
        if (panel) panel.style.maxHeight = "0px";
      });
    } else {
      $$(".f-acc").forEach(function (acc) {
        acc.classList.add("open");
        var panel = $(".acc-panel", acc);
        if (panel) panel.style.maxHeight = panel.scrollHeight + 40 + "px";
      });
    }
  });

  /* ---------- social icons -> 404 with previous section ---------- */
  function currentSection() {
    var secs = $$("section[data-sec]");
    var current = "";
    for (var i = 0; i < secs.length; i++) {
      var r = secs[i].getBoundingClientRect();
      if (r.top < window.innerHeight * 0.5) current = secs[i].dataset.sec;
      else break;
    }
    return current;
  }
  $$("[data-social]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var pageName = window.location.pathname.split("/").pop() || "index.html";
      var sec = currentSection();
      try {
        sessionStorage.setItem("stackly.back", pageName + (sec ? "#" + sec : ""));
        sessionStorage.setItem("stackly.backScroll", String(window.scrollY));
      } catch (err) {}
      window.location.href = "404.html";
    });
  });

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    if (href.indexOf("404.html") === -1) return;
    var pageName = window.location.pathname.split("/").pop() || "index.html";
    try {
      sessionStorage.setItem("stackly.back", pageName);
      sessionStorage.setItem("stackly.backScroll", String(window.scrollY));
    } catch (err) {}
  });

  document.addEventListener("submit", function (e) {
    var sub = e.target && e.target.getAttribute ? (e.target.getAttribute("onsubmit") || "") : "";
    if (sub.indexOf("404.html") === -1) return;
    var pageName = window.location.pathname.split("/").pop() || "index.html";
    try {
      sessionStorage.setItem("stackly.back", pageName);
      sessionStorage.setItem("stackly.backScroll", String(window.scrollY));
    } catch (err) {}
  });

  /* ---------- 404 go back ---------- */
  var goBack = $("#goBackBtn");
  if (goBack) {
    var back = "index.html";
    try { back = sessionStorage.getItem("stackly.back") || back; } catch (err) {}
    var label = $("#erBackMeta");
    var labelText = $("#erBackLabel");
    if (labelText) {
      var clean = back.split("#")[0].replace(/\.html?$/i, "").replace(/-/g, " ") || "homepage";
      var map = { "index": "the homepage", "about": "the About page", "classes": "the Classes page", "schedule": "the Schedule page", "gallery": "the Gallery page", "contact": "the Contact page", "login": "the sign in page", "dash-user": "your dashboard", "dash-admin": "the admin console" };
      clean = map[clean] || clean;
      var sec = back.split("#")[1];
      if (sec) clean += " (the section you were in)";
      labelText.textContent = "Returning to: " + clean;
    }
    goBack.addEventListener("click", function (e) {
      e.preventDefault();
      var backScroll = 0;
      try { backScroll = parseInt(sessionStorage.getItem("stackly.backScroll"), 10) || 0; } catch (err) {}
      try {
        sessionStorage.setItem("stackly.goto", back);
        if (backScroll > 0) sessionStorage.setItem("stackly.gotoScroll", String(backScroll));
      } catch (err) {}
      window.location.replace(back);
    });
  }
  var resume = null;
  try { resume = sessionStorage.getItem("stackly.goto"); } catch (err) {}
  if (resume) {
    try { sessionStorage.removeItem("stackly.goto"); } catch (err) {}
    var resumeScroll = 0;
    try { resumeScroll = parseInt(sessionStorage.getItem("stackly.gotoScroll"), 10) || 0; } catch (err) {}
    try { sessionStorage.removeItem("stackly.gotoScroll"); } catch (err) {}
    var hash = resume.split("#")[1];
    if (hash || resumeScroll > 0) {
      function jump() {
        setTimeout(function () {
          if (resumeScroll > 0) {
            window.scrollTo({ top: resumeScroll, behavior: "auto" });
            return;
          }
          var t = document.getElementById(hash);
          if (t) {
            var y = t.getBoundingClientRect().top + window.scrollY - 84;
            window.scrollTo({ top: Math.max(y, 0), behavior: "auto" });
          }
        }, 380);
      }
      if (document.readyState !== "complete") window.addEventListener("load", jump);
      else setTimeout(jump, 250);
    }
  }

  /* ---------- to top ---------- */
  var toTop = $(".to-top");
  if (toTop) {
    window.addEventListener("scroll", function () {
      toTop.classList.toggle("show", window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- video play overlay ---------- */
  $$(".video-show").forEach(function (vs) {
    var v = $("video", vs);
    var ov = $(".vs-overlay", vs);
    if (!v) return;
    $$("video", document).forEach(function (a) {
      a.muted = true;
      a.setAttribute("playsinline", "");
    });
    if (ov) {
      ov.addEventListener("click", function () {
        if (v.paused) {
          v.play();
          v.controls = true;
          ov.style.opacity = "0";
          ov.style.pointerEvents = "none";
        }
      });
    }
  });

  /* ---------- testimonial carousel ---------- */
  var track = $(".t-track");
  if (track) {
    var slides = $$(".t-slide", track);
    var index = 0;
    var dotsBox = $(".t-dots");
    slides.forEach(function (_, i) {
      var d = document.createElement("button");
      d.className = "t-dot" + (i === 0 ? " active" : "");
      d.setAttribute("aria-label", "Slide " + (i + 1));
      d.addEventListener("click", function () { go(i); });
      dotsBox.appendChild(d);
    });
    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      $$(".t-dot", dotsBox).forEach(function (d, k) { d.classList.toggle("active", k === index); });
    }
    var next = $("#tNext"), prev = $("#tPrev");
    if (next) next.addEventListener("click", function () { go(index + 1); });
    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    var tTimer = setInterval(function () { go(index + 1); }, 6000);
    track.parentElement.addEventListener("mouseenter", function () { clearInterval(tTimer); });
    track.parentElement.addEventListener("mouseleave", function () { tTimer = setInterval(function () { go(index + 1); }, 6000); });
  }

  /* ---------- gallery filter ---------- */
  var filButtons = $$(".gal-filter button");
  if (filButtons.length) {
    filButtons.forEach(function (b) {
      b.addEventListener("click", function () {
        filButtons.forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        var f = b.dataset.filter;
        $$(".gal-item").forEach(function (item) {
          item.style.transition = "opacity .5s, transform .5s";
          if (f === "all" || item.dataset.cat === f) {
            item.style.display = "";
            setTimeout(function () { item.style.opacity = "1"; item.style.transform = "scale(1)"; }, 30);
          } else {
            item.style.opacity = "0";
            item.style.transform = "scale(.85)";
            setTimeout(function () { item.style.display = "none"; }, 300);
          }
        });
      });
    });
  }

  /* ---------- gallery lightbox ---------- */
  var lb = $("#lightbox");
  if (lb) {
    var lbImg = $("#lb-img");
    var lbCap = $("#lb-cap");
    var lbItems = $$(".gal-item");
    var lbIndex = 0;

    function lbVisible() {
      return lbItems.filter(function (el) {
        return getComputedStyle(el).display !== "none";
      });
    }
    function lbRender(el) {
      var img = $("img", el);
      var cap = $(".gal-cap", el);
      lbImg.src = img ? img.src : "";
      lbImg.alt = img ? img.alt : "";
      lbCap.textContent = cap ? cap.textContent.replace(/\s+/g, " ").trim() : (img ? img.alt : "");
    }
    function lbOpen(el) {
      var list = lbVisible();
      if (!list.length) return;
      lbIndex = list.indexOf(el);
      if (lbIndex < 0) lbIndex = 0;
      lbRender(list[lbIndex]);
      lb.classList.add("show");
      document.body.classList.add("lb-open");
    }
    function lbClose() {
      lb.classList.remove("show");
      document.body.classList.remove("lb-open");
    }
    function lbStep(d) {
      var list = lbVisible();
      if (!list.length) return;
      lbIndex = (lbIndex + d + list.length) % list.length;
      lbRender(list[lbIndex]);
    }

    lbItems.forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        lbOpen(item);
      });
    });
    $(".lb-close", lb).addEventListener("click", lbClose);
    lb.addEventListener("click", function (e) {
      if (e.target === lb) lbClose();
    });
    $(".lb-prev", lb).addEventListener("click", function (e) { e.stopPropagation(); lbStep(-1); });
    $(".lb-next", lb).addEventListener("click", function (e) { e.stopPropagation(); lbStep(1); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("show")) return;
      if (e.key === "Escape") lbClose();
      else if (e.key === "ArrowLeft") lbStep(-1);
      else if (e.key === "ArrowRight") lbStep(1);
    });
  }

  /* ---------- FAQs ---------- */
  $$(".faq-item").forEach(function (item) {
    var head = $(".faq-q", item);
    if (head) head.addEventListener("click", function () {
      var open = item.classList.contains("open");
      $$(".faq-item.open").forEach(function (x) { x.classList.remove("open"); });
      if (!open) item.classList.add("open");
    });
  });

  /* ---------- footer year ---------- */
  $$(".auth-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- inner circle newsletter (gmail only) ---------- */
  var nlForm = $("#nl-form");
  if (nlForm) {
    var nlEmail = $("#nl-email");
    var nlErr = $("#nl-err");
    function nlValidate() {
      var email = (nlEmail.value || "").trim();
      var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && /@gmail\.com$/i.test(email);
      var msg = !email ? "Please enter your email address."
        : valid ? "" : "Only Gmail addresses are allowed.";
      nlForm.classList.toggle("invalid", !valid);
      if (nlErr) nlErr.textContent = msg;
      return valid;
    }
    nlEmail.addEventListener("input", nlValidate);
    nlForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!nlValidate()) {
        nlEmail.focus();
        return;
      }
      try {
        sessionStorage.setItem("stackly.back", (window.location.pathname.split("/").pop() || "index.html"));
        sessionStorage.setItem("stackly.backScroll", String(window.scrollY));
      } catch (err) {}
      window.location.href = "404.html";
    });
  }

  /* ---------- login logic ---------- */
  function initAuth() {
    var panels = $$(".auth-switch button");
    var panelWrap = $(".auth-panel");
    if (!panelWrap) return;

    var tabUser = $("#tabUser"), tabAdmin = $("#tabAdmin");
    var loginUser = $("#loginUser"), loginAdmin = $("#loginAdmin");
    var signForm = $("#signupForm");
    var authForms = $("#loginForm");
    var authTitle = $("#authTitle");
    var authSub = $("#authSub");
    var authNote = $("#authNote");
    var authNote2 = $("#authNote2");
    var signupLink = $("#goSignup");
    var backLogin = $("#backLogin");

    function gmailCheck(input, allowAdmin) {
      var field = input ? input.closest(".field") : null;
      var fn = function () {
        if (!input) return true;
        var email = (input.value || "").trim();
        var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
          (allowAdmin ? /@(gmail|thestackly)\.com$/i : /@gmail\.com$/i).test(email);
        if (field) field.classList.toggle("invalid", email.length > 0 && !valid);
        return valid;
      };
      if (input) {
        input.addEventListener("input", fn);
        input.addEventListener("blur", fn);
      }
      return fn;
    }
    var vUserEmail = gmailCheck($("#uEmail"));
    var vSignupEmail = gmailCheck($("#sEmail"));

    var nameField = $("#sName");
    var nameErr = $("#sNameErr");
    function vName() {
      if (!nameField) return true;
      var name = (nameField.value || "").trim();
      var valid = /^[A-Za-z\s]+$/.test(name);
      var field = nameField.closest(".field");
      if (field) field.classList.toggle("invalid", name.length > 0 && !valid);
      return name.length > 0 && valid;
    }
    if (nameField) {
      nameField.addEventListener("input", vName);
      nameField.addEventListener("blur", vName);
    }

    var passField = $("#sPass");
    var pass2Field = $("#sPass2");
    function vPass() {
      if (!passField) return true;
      var pass = passField.value || "";
      var valid = pass.length >= 8;
      var field = passField.closest(".field");
      if (field) field.classList.toggle("invalid", pass.length > 0 && !valid);
      return valid;
    }
    function vPass2() {
      if (!passField || !pass2Field) return true;
      var pass = passField.value || "";
      var pass2 = pass2Field.value || "";
      var valid = pass2.length > 0 && pass === pass2;
      var field = pass2Field.closest(".field");
      if (field) field.classList.toggle("invalid", pass2.length > 0 && !valid);
      return valid;
    }
    if (passField) {
      passField.addEventListener("input", function () { vPass(); vPass2(); });
      passField.addEventListener("blur", vPass);
    }
    if (pass2Field) {
      pass2Field.addEventListener("input", vPass2);
      pass2Field.addEventListener("blur", vPass2);
    }

    var termsBox = $("#sTerms");
    var termsField = termsBox ? termsBox.closest(".field") : null;
    function vTerms() {
      if (!termsBox) return true;
      var valid = termsBox.checked;
      if (termsField) termsField.classList.toggle("invalid", !valid);
      return valid;
    }
    if (termsBox) termsBox.addEventListener("change", vTerms);

    function switchTab(name) {
      panels.forEach(function (b) { b.classList.remove("active"); });
      (name === "user" ? tabUser : tabAdmin).classList.add("active");
      if (authForms) authForms.classList.add("active");
      if (signForm) signForm.classList.toggle("active", false);
      if (loginUser) loginUser.classList.toggle("active", name === "user");
      if (loginAdmin) loginAdmin.classList.toggle("active", name === "admin");
      if (authTitle) authTitle.textContent = name === "user" ? "Welcome back, yogi" : "Admin command center";
      if (authSub) authSub.textContent = name === "user" ? "Sign in to continue your journey of movement and breath." : "Sign in with your administrator credentials to manage the studio.";
      if (authNote) authNote.style.display = "";
      if (authNote2) authNote2.style.display = "";
    }

    if (tabUser && tabAdmin) {
      tabUser.addEventListener("click", function () { switchTab("user"); });
      tabAdmin.addEventListener("click", function () { switchTab("admin"); });
    }

    function showSignup() {
      if (authForms) authForms.classList.remove("active");
      if (signForm) signForm.classList.add("active");
      panels.forEach(function (b) { b.classList.remove("active"); });
      if (authTitle) authTitle.textContent = "Become a member";
      if (authSub) authSub.textContent = "Create your account and step onto the mat.";
      if (authNote) authNote.style.display = "none";
      if (authNote2) authNote2.style.display = "none";
    }
    if (signupLink) signupLink.addEventListener("click", showSignup);
    if (backLogin) backLogin.addEventListener("click", function () {
      if (tabUser) switchTab("user");
    });

    function nameFromEmail(email) {
      var local = String(email || "").trim().split("@")[0];
      local = local.replace(/[._-]+/g, " ");
      return local.trim().replace(/\b\w/g, function (m) { return m.toUpperCase(); }) || "Yogi";
    }

    if (loginUser) loginUser.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!vUserEmail()) { $("#uEmail").focus(); return; }
      try {
        sessionStorage.setItem("stackly.name", nameFromEmail($("#uEmail").value));
        sessionStorage.setItem("stackly.role", "Member");
      } catch (err) {}
      window.location.href = "dash-user.html";
    });
    if (loginAdmin) loginAdmin.addEventListener("submit", function (e) {
      e.preventDefault();
      try {
        sessionStorage.setItem("stackly.name", nameFromEmail($("#aEmail").value));
        sessionStorage.setItem("stackly.role", "Studio Admin");
      } catch (err) {}
      window.location.href = "dash-admin.html";
    });
    if (signForm) signForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!vName()) { if (nameField) nameField.focus(); return; }
      if (!vSignupEmail()) { $("#sEmail").focus(); return; }
      if (!vPass()) { if (passField) passField.focus(); return; }
      if (!vPass2()) { if (pass2Field) pass2Field.focus(); return; }
      if (!vTerms()) { if (termsField) termsField.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
      try {
        sessionStorage.setItem("stackly.back", "signup.html");
      } catch (err) {}
      window.location.href = "404.html";
    });

    /* eye toggle - cross browser safe */
    $$(".eye-toggle").forEach(function (btn) {
      var lock = 0;
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var now = Date.now();
        if (now - lock < 220) return;
        lock = now;
        var targetId = btn.dataset.target;
        var input = $(targetId) || btn.parentElement.querySelector("input");
        if (!input) return;
        var show = input.type === "password" ? "text" : "password";
        input.type = show;
        btn.innerHTML = show === "password"
          ? '<i class="fa-solid fa-eye" aria-hidden="true"></i>'
          : '<i class="fa-solid fa-eye-slash" aria-hidden="true"></i>';
        input.focus({ preventScroll: true });
      });
    });

    var yearU = new Date().getFullYear();
    $$(".auth-year").forEach(function (el) { el.textContent = yearU; });
  }
  initAuth();

  /* ---------- dashboard helpers ---------- */
var greetEl = $("#greetName");
    if (greetEl) {
      var h = new Date().getHours();
      var part = h < 12 ? "Good morning" : (h < 17 ? "Good afternoon" : "Good evening");
      $("#greetPart").textContent = part;
      var mPart = $("#mGreetPart");
      if (mPart) mPart.textContent = part;
    }
    var clockEl = $("#dashDate");
    if (clockEl) {
      var d = new Date();
      clockEl.textContent = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
      var mClock = $("#mDashDate");
      if (mClock) mClock.textContent = clockEl.textContent;
    }
  var storedName = sessionStorage.getItem("stackly.name");
  var storedRole = sessionStorage.getItem("stackly.role");
  var profileName = $("#profileName");
  if (profileName && storedName) profileName.textContent = storedName;
  var roleName = $("#roleName");
  if (roleName && storedRole) roleName.textContent = storedRole;
  if (storedName) {
    var firstName = storedName.split(" ")[0];
    var greetUser = $("#greetUser");
    if (greetUser) greetUser.textContent = firstName;
    var mGreetUser = $("#mGreetUser");
    if (mGreetUser) mGreetUser.textContent = firstName;
  }
})();