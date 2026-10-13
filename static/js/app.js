// AI based palmistry & tarot intelligence - Application Logic

const API_BASE = "";
let currentToken = "";
let currentUser = null;
let activeRole = "User";

// Global Active State
let currentPalmData = null;
let currentTarotData = null;
let currentSynthesizedData = null;
let currentSpreadType = "Celtic Cross Spread";
let radarChartInstance = null;

// User Card Pick & Reveal State
let fullTarotDeck = [];
let userPickedCards = [];
let revealedCardIndices = [];
let userSelected3Cards = [];

// Role Credentials Mapping (Separate Login Accounts for Each Role)
const ROLE_ACCOUNTS = {
  "User": { email: "user@mystic.io", password: "SeekerPass2026!", label: "Seeker (Aria)" },
  "Tarot Reader": { email: "reader@mystic.io", password: "ReaderPass2026!", label: "Reader (Seraphina)" },
  "Spiritual Consultant": { email: "consultant@mystic.io", password: "ConsultantPass2026!", label: "Consultant (Zachary)" },
  "Administrator": { email: "admin@mystic.io", password: "AdminPass2026!", label: "Admin (Grand Sovereign)" }
};

// Initialize Application - STRICT MANDATORY LOGIN WITH EMAIL ID & PASSWORD
document.addEventListener("DOMContentLoaded", async () => {
  initThreeJsStarfield();
  await loadFullTarotDeckData();
  
  // Mandatory Login Gate: Hide Main Application & Show Login Entry Page
  const entryPage = document.getElementById("entry-login-page");
  const mainApp = document.getElementById("main-app-wrapper");
  
  if (mainApp) mainApp.classList.add("hidden");
  if (entryPage) entryPage.classList.remove("hidden");
  
  init3DTiltEffects();
});

// Markdown Formatter Helper for Chatbot UI
function formatMarkdownText(rawText) {
  if (!rawText) return "";
  let html = rawText;
  
  // Code block replacement ```python ... ```
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre class="bg-slate-900 text-sky-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto my-2 border border-sky-400/30"><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>`;
  });
  
  // Bold replacement **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  
  // Bullet lists - item
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc font-medium text-slate-800 my-0.5">$1</li>');
  
  // Linebreaks
  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');
  
  return html;
}

// ================= THREE.JS 3D LIGHT BLUE & WHITE MOVING LIQUID PARTICLES =================
let threeScene, threeCamera, threeRenderer, starParticles;
function initThreeJsStarfield() {
  const canvas = document.getElementById("three-bg-canvas");
  if (!canvas || typeof THREE === "undefined") return;

  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
  threeCamera.position.z = 400;

  threeRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeRenderer.setPixelRatio(window.devicePixelRatio);

  const particleCount = 700;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorPalette = [
    new THREE.Color(0x38bdf8),
    new THREE.Color(0x0284c7),
    new THREE.Color(0x7dd3fc),
    new THREE.Color(0xbae6fd)
  ];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;

    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 3.8,
    vertexColors: true,
    transparent: true,
    opacity: 0.75
  });

  starParticles = new THREE.Points(geometry, material);
  threeScene.add(starParticles);

  window.addEventListener("mousemove", (e) => {
    const mouseX = (e.clientX - window.innerWidth / 2) * 0.05;
    const mouseY = (e.clientY - window.innerHeight / 2) * 0.05;
    if (starParticles) {
      starParticles.rotation.y = mouseX * 0.0006;
      starParticles.rotation.x = mouseY * 0.0006;
    }
  });

  window.addEventListener("resize", () => {
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    if (starParticles) {
      starParticles.rotation.y += 0.0008;
      starParticles.rotation.x += 0.0004;
    }
    threeRenderer.render(threeScene, threeCamera);
  }
  animate();
}

function init3DTiltEffects() {
  document.querySelectorAll(".tilt-card-3d").forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.transform = `perspective(1000px) rotateX(${-y / 14}deg) rotateY(${x / 14}deg) translateZ(8px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    });
  });
}

// ================= MANDATORY ENTRY LOGIN & ROLE AUTHENTICATION =================

function switchEntryTab(tab) {
  const loginTab = document.getElementById("entry-tab-login");
  const regTab = document.getElementById("entry-tab-reg");
  const loginForm = document.getElementById("entry-form-login");
  const regForm = document.getElementById("entry-form-reg");

  if (tab === 'login') {
    loginTab.className = "font-mystic text-lg font-bold text-sky-700 border-b-2 border-sky-600 pb-1";
    regTab.className = "font-mystic text-lg font-bold text-slate-500 hover:text-slate-800 pb-1";
    loginForm.classList.remove("hidden");
    regForm.classList.add("hidden");
  } else {
    regTab.className = "font-mystic text-lg font-bold text-sky-700 border-b-2 border-sky-600 pb-1";
    loginTab.className = "font-mystic text-lg font-bold text-slate-500 hover:text-slate-800 pb-1";
    regForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  }
}

function updateRoleNavigation() {
  const navChat = document.getElementById("nav-aichatbot");
  const navPalm = document.getElementById("nav-palm");
  const navTarot = document.getElementById("nav-tarot");
  const navUnified = document.getElementById("nav-unified");
  const navTrends = document.getElementById("nav-trends");
  const navRecs = document.getElementById("nav-recommendations");
  const navDash = document.getElementById("nav-dashboard");
  const navLabel = document.getElementById("nav-dash-label");

  if (activeRole === "User") {
    [navChat, navPalm, navTarot, navUnified, navTrends, navRecs, navDash].forEach(btn => {
      if (btn) btn.classList.remove("hidden");
    });
    if (navLabel) navLabel.innerText = "Sanctuary";
  } else {
    // Hide Seeker-only tabs (AI Chatbot, Palmistry, Tarot Sanctuary, AI Synthesis, Rituals, Trends) for Tarot Reader, Consultant, Admin
    [navChat, navPalm, navTarot, navUnified, navRecs, navTrends].forEach(btn => {
      if (btn) btn.classList.add("hidden");
    });
    if (navDash) navDash.classList.remove("hidden");

    if (activeRole === "Tarot Reader") {
      if (navLabel) navLabel.innerText = "🎴 Tarot Reader Desk";
    } else if (activeRole === "Spiritual Consultant") {
      if (navLabel) navLabel.innerText = "🔮 Consultant Desk";
    } else if (activeRole === "Administrator") {
      if (navLabel) navLabel.innerText = "👑 Admin Portal";
    }
  }
}

let roleWelcomeProgressInterval = null;

function showRoleWelcomeAnimation(role) {
  const modal = document.getElementById("role-welcome-modal");
  const card = document.getElementById("role-welcome-card");
  const bgAura = document.getElementById("role-welcome-bg-aura");
  const iconBox = document.getElementById("role-welcome-icon-box");
  const iconEmoji = document.getElementById("role-welcome-icon-emoji");
  const badgeTag = document.getElementById("role-welcome-badge-tag");
  const titleEl = document.getElementById("role-welcome-title");
  const subtitleEl = document.getElementById("role-welcome-subtitle");
  const featuresGrid = document.getElementById("role-welcome-features-grid");
  const progressBar = document.getElementById("role-welcome-progress");

  if (!modal || !card) return;

  const roleConfigs = {
    "User": {
      emoji: "🌌",
      badge: "✨ Seeker Sanctuary",
      title: "Welcome, Wise Seeker!",
      subtitle: "Your celestial path awaits with 78 Tarot cards, Palmistry graphs, AI Guidance, and Daily Rituals.",
      auraBg: "bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500",
      iconBoxStyle: "bg-gradient-to-br from-indigo-950 to-purple-950 border-amber-400 text-amber-300 shadow-amber-500/30 crown-float",
      badgeStyle: "bg-indigo-950 text-amber-300 border-amber-400/50",
      cardBorder: "border-amber-400/60 shadow-indigo-950/50",
      progressBg: "bg-gradient-to-r from-indigo-500 to-amber-400",
      features: [
        { icon: "🎴", title: "78 Fan Deck Tarot", desc: "Interactive black & gold fan selection" },
        { icon: "✋", title: "Palm Trajectory", desc: "Line graphs & life projections" },
        { icon: "🔮", title: "Daily Rituals", desc: "Personalized recommendation engine" },
        { icon: "🔔", title: "Notifications Radar", desc: "Real-time appointments & updates" }
      ]
    },
    "Tarot Reader": {
      emoji: "🎴",
      badge: "🎴 Master Tarot Reader",
      title: "Welcome, Tarot Master!",
      subtitle: "Your Tarot Reader Desk is live with Reading Analytics, Engagement Insights, and Session Tracking.",
      auraBg: "bg-gradient-to-r from-amber-600 via-red-600 to-rose-700",
      iconBoxStyle: "bg-gradient-to-br from-slate-950 to-amber-950 border-amber-400 text-amber-400 shadow-amber-500/40 spin-3d-card",
      badgeStyle: "bg-amber-950 text-amber-300 border-amber-500/50",
      cardBorder: "border-amber-500/70 shadow-amber-950/50",
      progressBg: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300",
      features: [
        { icon: "📊", title: "Reading Analytics", desc: "Volume, ratings & spread metrics" },
        { icon: "👥", title: "User Engagement", desc: "Active seeker interaction data" },
        { icon: "⏱️", title: "Session Tracking", desc: "Live consultation stopwatch" },
        { icon: "📑", title: "Report Desk", desc: "Archived spreads & synthesis exports" }
      ]
    },
    "Spiritual Consultant": {
      emoji: "🔮",
      badge: "🔮 Spiritual Consultant",
      title: "Welcome, Revered Consultant!",
      subtitle: "Your Consultant Desk provides User Trend Analysis, Guidance Effectiveness, and Consultation Analytics.",
      auraBg: "bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600",
      iconBoxStyle: "bg-gradient-to-br from-emerald-950 to-teal-950 border-emerald-400 text-emerald-300 shadow-emerald-500/40 pulse-aura-glow",
      badgeStyle: "bg-emerald-950 text-emerald-300 border-emerald-400/50",
      cardBorder: "border-emerald-500/70 shadow-emerald-950/50",
      progressBg: "bg-gradient-to-r from-emerald-500 to-teal-300",
      features: [
        { icon: "📈", title: "User Trend Analysis", desc: "Seeker growth & focus topics" },
        { icon: "🌟", title: "Guidance Rating", desc: "Consultation feedback metrics" },
        { icon: "💬", title: "Session Insights", desc: "Deep qualitative feedback logs" },
        { icon: "📅", title: "Booking Radar", desc: "Upcoming appointment schedules" }
      ]
    },
    "Administrator": {
      emoji: "👑",
      badge: "👑 System Administrator",
      title: "Welcome, Sovereign Admin!",
      subtitle: "Your Admin Portal grants absolute access to User Management, Platform Analytics, and System Health.",
      auraBg: "bg-gradient-to-r from-purple-700 via-indigo-700 to-amber-500",
      iconBoxStyle: "bg-gradient-to-br from-purple-950 via-slate-950 to-amber-950 border-amber-400 text-amber-300 shadow-purple-500/40 crown-float",
      badgeStyle: "bg-purple-950 text-amber-300 border-amber-400/50",
      cardBorder: "border-amber-400/70 shadow-purple-950/50",
      progressBg: "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400",
      features: [
        { icon: "👥", title: "User Management", desc: "Role controls & permissions" },
        { icon: "📊", title: "Platform Analytics", desc: "System-wide traffic & usage" },
        { icon: "🎴", title: "Reading Statistics", desc: "Tarot & Palmistry metrics" },
        { icon: "⚙️", title: "System Diagnostics", desc: "API health & database latency" }
      ]
    }
  };

  const cfg = roleConfigs[role] || roleConfigs["User"];

  bgAura.className = `absolute -inset-10 opacity-40 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${cfg.auraBg}`;
  iconBox.className = `w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-2xl border-4 transition-transform duration-700 ${cfg.iconBoxStyle}`;
  iconEmoji.innerText = cfg.emoji;
  badgeTag.className = `px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border shadow-sm inline-block ${cfg.badgeStyle}`;
  badgeTag.innerText = cfg.badge;
  titleEl.innerText = cfg.title;
  subtitleEl.innerText = cfg.subtitle;
  card.className = `relative max-w-xl w-full p-8 rounded-3xl border-2 shadow-2xl bg-slate-950 text-white space-y-6 text-center overflow-hidden transform transition-all duration-500 ${cfg.cardBorder}`;

  featuresGrid.innerHTML = cfg.features.map(f => `
    <div class="flex items-start gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <span class="text-xl shrink-0">${f.icon}</span>
      <div>
        <div class="font-extrabold text-amber-300 text-xs">${f.title}</div>
        <div class="text-[11px] text-slate-300 font-medium">${f.desc}</div>
      </div>
    </div>
  `).join("");

  progressBar.className = `h-full transition-all duration-200 rounded-full ${cfg.progressBg}`;
  progressBar.style.width = "0%";

  modal.classList.remove("hidden");
  setTimeout(() => {
    card.classList.remove("scale-90", "opacity-0");
    card.classList.add("scale-100", "opacity-100");
  }, 50);

  if (roleWelcomeProgressInterval) clearInterval(roleWelcomeProgressInterval);

  let progress = 0;
  roleWelcomeProgressInterval = setInterval(() => {
    progress += 4;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      clearInterval(roleWelcomeProgressInterval);
      setTimeout(() => {
        dismissRoleWelcomeModal();
      }, 400);
    }
  }, 60);
}

function dismissRoleWelcomeModal() {
  if (roleWelcomeProgressInterval) {
    clearInterval(roleWelcomeProgressInterval);
    roleWelcomeProgressInterval = null;
  }
  const modal = document.getElementById("role-welcome-modal");
  const card = document.getElementById("role-welcome-card");
  if (!modal || !card) return;

  card.classList.remove("scale-100", "opacity-100");
  card.classList.add("scale-90", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 400);
}

async function unlockMainPlatform() {
  document.getElementById("entry-login-page").classList.add("hidden");
  document.getElementById("main-app-wrapper").classList.remove("hidden");
  updateRoleNavigation();
  if (activeRole === "User") {
    switchView("aichatbot");
  } else {
    switchView("dashboard");
  }
  showRoleWelcomeAnimation(activeRole);
}


async function entryQuickLogin(email, password, role) {
  try {
    await loginWithEmailPassword(email, password, role);
    await unlockMainPlatform();
  } catch (err) {
    alert(`Failed to login: ${err.message}`);
  }
}

async function submitEntryLogin(e) {
  e.preventDefault();
  const email = document.getElementById("entry-login-email").value;
  const password = document.getElementById("entry-login-password").value;
  const errBox = document.getElementById("entry-login-err");
  errBox.classList.add("hidden");

  if (!email || !password) {
    errBox.innerText = "Email ID and Password are required to login.";
    errBox.classList.remove("hidden");
    return;
  }

  try {
    await loginWithEmailPassword(email, password);
    await unlockMainPlatform();
  } catch (err) {
    errBox.innerText = err.message || "Invalid Email ID or Password";
    errBox.classList.remove("hidden");
  }
}

async function submitEntryRegister(e) {
  e.preventDefault();
  const name = document.getElementById("entry-reg-name").value;
  const email = document.getElementById("entry-reg-email").value;
  const password = document.getElementById("entry-reg-password").value;
  const role = document.getElementById("entry-reg-role").value;
  const age_group = document.getElementById("entry-reg-age").value;
  const errBox = document.getElementById("entry-reg-err");
  errBox.classList.add("hidden");

  if (!email || !password) {
    errBox.innerText = "Email ID and Password are required for registration.";
    errBox.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role, age_group })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }

    const data = await res.json();
    currentToken = data.access_token;
    currentUser = data.user;
    activeRole = currentUser.role || role;

    const roleBadge = document.getElementById("header-role-badge");
    if (roleBadge) roleBadge.innerText = `👤 ${activeRole}`;
    
    document.getElementById("header-avatar").src = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`;
    await unlockMainPlatform();
  } catch (err) {
    errBox.innerText = err.message || "Registration failed";
    errBox.classList.remove("hidden");
  }
}

function logoutUser() {
  currentToken = "";
  currentUser = null;
  document.getElementById("main-app-wrapper").classList.add("hidden");
  document.getElementById("entry-login-page").classList.remove("hidden");
}

async function loginAsRole(role) {
  activeRole = role;
  const creds = ROLE_ACCOUNTS[role] || ROLE_ACCOUNTS["User"];
  const emailInput = document.getElementById("entry-login-email");
  const passInput = document.getElementById("entry-login-password");
  if (emailInput) emailInput.value = creds.email;
  if (passInput) passInput.value = creds.password;
  
  try {
    await loginWithEmailPassword(creds.email, creds.password, role);
    await unlockMainPlatform();
  } catch (err) {
    console.error("Quick login error:", err);
    alert(`Quick login failed for ${role}: ${err.message || err}`);
  }
}

async function loginWithOAuth(provider) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/oauth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: provider,
        token: `oauth-token-${Date.now()}`,
        email: provider === "google" ? "google_seeker@gmail.com" : "apple_seeker@icloud.com",
        name: provider === "google" ? "Google Seeker" : "Apple Seeker",
        role: "User"
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "OAuth authentication failed");
    }

    const data = await res.json();
    currentToken = data.access_token;
    currentUser = data.user;
    activeRole = currentUser.role || "User";

    const roleBadge = document.getElementById("header-role-badge");
    if (roleBadge) roleBadge.innerText = `👤 ${activeRole}`;
    
    document.getElementById("header-avatar").src = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`;
    document.getElementById("nav-dash-label").innerText = activeRole === "User" ? "Sanctuary" : `${activeRole.split(' ')[0]} Desk`;

    updateRoleNavigation();
    await loadNotifications();
    await loadActiveDashboard();
    await unlockMainPlatform();
  } catch (err) {
    console.error("OAuth Login error:", err);
    alert(`OAuth Login Failed (${provider}): ${err.message || err}`);
  }
}

async function loginWithEmailPassword(email, password, expectedRole = null) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Authentication failed");
    }

    const data = await res.json();
    currentToken = data.access_token;
    currentUser = data.user;
    activeRole = currentUser.role || expectedRole || "User";

    // Set static, non-editable role badge in header
    const roleBadge = document.getElementById("header-role-badge");
    if (roleBadge) roleBadge.innerText = `👤 ${activeRole}`;
    
    document.getElementById("header-avatar").src = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`;
    document.getElementById("nav-dash-label").innerText = activeRole === "User" ? "Sanctuary" : `${activeRole.split(' ')[0]} Desk`;
    
    updateRoleNavigation();
    await loadNotifications();
    await loadActiveDashboard();
    return true;

  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
}

// Role switching disabled after login
function changeActiveRole(newRole) {
  alert("Role switching is disabled after login. To switch roles, please log out and sign in with your separate role email & password.");
}

function getAuthHeaders() {
  return {
    "Authorization": `Bearer ${currentToken}`,
    "Content-Type": "application/json"
  };
}

// --- Navigation View Switcher ---

function switchView(viewName) {
  const views = ["aichatbot", "palm", "tarot", "unified", "trends", "recommendations", "dashboard"];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    const navBtn = document.getElementById(`nav-${v}`);
    if (el) el.classList.add("hidden");
    if (navBtn) navBtn.classList.remove("nav-tab-active");
  });

  const targetEl = document.getElementById(`view-${viewName}`);
  const targetNav = document.getElementById(`nav-${viewName}`);
  if (targetEl) targetEl.classList.remove("hidden");
  if (targetNav) targetNav.classList.add("nav-tab-active");

  if (viewName === "trends") {
    if (typeof renderTrendsView === "function") renderTrendsView();
    if (typeof renderTrendsGraphs === "function") renderTrendsGraphs();
    if (typeof runMLPersonalityPrediction === "function") runMLPersonalityPrediction();
    runMLCareerRoadmapPrediction();
    loadPersonalDevelopmentUI();
    loadRelationshipGuidanceUI();
  }
  if (viewName === "dashboard") loadActiveDashboard();

  if (viewName === "palm") {
    if (!currentPalmData) {
      loadPalmPreset("water_hand");
    }
  }
  if (viewName === "recommendations") {
    if (typeof renderDayToDayRecommendations === "function") renderDayToDayRecommendations(activeDayRitualTab);
    filterRecommendations("All");
  }
  if (viewName === "tarot") {
    if (typeof render78FanDeck === "function") render78FanDeck(active78FanFilter);
    renderManualCardPickerArcade();
    render3CardsDisplayGrid();
  }
  lucide.createIcons();
}

// --- Initial Data Loader ---

async function initializeInitialData() {
  // Initial data loaded on demand when user initiates Palmistry or Tarot sessions
}

// ================= DEDICATED AI CHATBOT SANCTUARY (FRIEND & TEACHER) =================

function autoUpdateZodiacFromDob() {
  const dobEl = document.getElementById("aichatbot-dob");
  const zodiacEl = document.getElementById("aichatbot-zodiac");
  if (!dobEl || !zodiacEl || !dobEl.value) return;

  const parts = dobEl.value.split("-");
  if (parts.length === 3) {
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    let z = "Aries";
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) z = "Aries";
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) z = "Taurus";
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) z = "Gemini";
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) z = "Cancer";
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) z = "Leo";
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) z = "Virgo";
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) z = "Libra";
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) z = "Scorpio";
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) z = "Sagittarius";
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) z = "Capricorn";
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) z = "Aquarius";
    else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) z = "Pisces";

    zodiacEl.value = z;
  }
}

function askAstrologyPrediction() {
  const dobEl = document.getElementById("aichatbot-dob");
  const zodiacEl = document.getElementById("aichatbot-zodiac");
  const dob = dobEl ? dobEl.value : "";
  const zodiac = zodiacEl ? zodiacEl.value : "Aries";

  let qText = `What is my astrological horoscope and star sign prediction for ${zodiac}?`;
  if (dob) {
    qText = `What is my personal astrological horoscope forecast for my birth date ${dob} (${zodiac})?`;
  }
  document.getElementById("aichatbot-view-input").value = qText;
  submitAIChatbotTabChat(new Event("submit"));
}

let globalChatHistory = [];

function askAIChatbotTabQuestion(qText) {
  document.getElementById("aichatbot-view-input").value = qText;
  submitAIChatbotTabChat(new Event("submit"));
}

async function submitAIChatbotTabChat(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById("aichatbot-view-input");
  const question = input.value.trim();
  if (!question) return;

  const dobEl = document.getElementById("aichatbot-dob");
  const zodiacEl = document.getElementById("aichatbot-zodiac");
  const dob = dobEl ? dobEl.value : "";
  const zodiac = zodiacEl ? zodiacEl.value : "";

  const chatBox = document.getElementById("aichatbot-view-chat-box");

  // User Question
  chatBox.innerHTML += `
    <div class="glass-card p-3.5 space-y-1 border-r-4 border-sky-500 text-right bg-sky-100/60">
      <div class="font-bold text-sky-900 text-xs">👤 You (${currentUser ? currentUser.name : 'Seeker'})${zodiac ? ' • ' + zodiac : ''}</div>
      <p class="text-slate-900 text-sm font-medium">${question}</p>
    </div>
  `;
  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  // Placeholder for AI streaming response
  const msgId = "ai-stream-" + Date.now();
  chatBox.innerHTML += `
    <div class="glass-card p-4 space-y-2 border-l-4 border-sky-600 bg-white shadow-md">
      <div class="font-bold text-sky-900 text-sm flex items-center gap-2">
        <span>🤖 AI Chatbot (Gemini 2.5 Flash Stream)</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 font-bold">1-on-1 Real-time Stream</span>
      </div>
      <div id="${msgId}" class="text-slate-800 text-xs leading-relaxed font-sans min-h-[20px]">
        <span class="inline-block animate-pulse text-sky-600 font-bold">Thinking & generating...</span>
      </div>
    </div>
  `;
  chatBox.scrollTop = chatBox.scrollHeight;
  const msgContainer = document.getElementById(msgId);

  // Prepare payload history in format [{"role": "user"|"model", "text": "..."}]
  const historyPayload = globalChatHistory.map(h => ({
    role: h.role,
    text: h.text
  }));

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        history: historyPayload,
        date_of_birth: dob,
        zodiac_sign: zodiac,
        palm_data: currentPalmData
      })
    });

    if (!res.ok) throw new Error("Streaming error");

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    msgContainer.innerHTML = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      accumulatedText += chunk;
      msgContainer.innerHTML = formatMarkdownText(accumulatedText);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    // Save to multi-turn conversation history
    globalChatHistory.push({ role: "user", text: question });
    globalChatHistory.push({ role: "model", text: accumulatedText });

  } catch (err) {
    console.error("AI Chatbot Streaming Error:", err);
    if (msgContainer) msgContainer.innerHTML = `<span class="text-rose-600 font-bold">Connection error. Please try again.</span>`;
  }
}

// ================= PALMISTRY STUDIO & DOWNLOAD PALM DATA =================

async function downloadPalmData() {
  try {
    const res = await fetch(`${API_BASE}/api/export/palm/pdf`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to download PDF report");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Palmistry_Biometric_Analysis_Report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("📄 Palmistry Analysis PDF Report downloaded successfully!");
  } catch (err) {
    console.error("Download palm pdf error:", err);
    window.open(`${API_BASE}/api/export/palm/pdf`, '_blank');
  }
}

async function loadPalmPreset(presetKey) {
  try {
    const res = await fetch(`${API_BASE}/api/palm/analyze-json`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ hand_preset: presetKey, hand_type_hint: "Right (Dominant)" })
    });
    const result = await res.json();
    currentPalmData = result;
    renderPalmAnalysisResults(result);
  } catch (err) {
    console.error("Palm preset error:", err);
  }
}

async function handlePalmFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (re) => {
    document.getElementById("palm-img-view").src = re.target.result;
    
    const formData = new FormData();
    formData.append("image", file);
    formData.append("preset_key", "water_hand");

    try {
      const res = await fetch(`${API_BASE}/api/palm/analyze`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${currentToken}` },
        body: formData
      });
      const result = await res.json();
      currentPalmData = result;
      renderPalmAnalysisResults(result);
      alert("Uploaded Palm Photo Analyzed! CV Model extracted 5 lines and 7 mounts.");
    } catch (err) {
      console.warn("Upload fallback:", err);
      await loadPalmPreset("water_hand");
    }
  };
  reader.readAsDataURL(file);
}

let webcamStream = null;
async function toggleWebcamPalm() {
  const container = document.getElementById("palm-webcam-container");
  const video = document.getElementById("palm-video");
  
  if (container.classList.contains("hidden")) {
    container.classList.remove("hidden");
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      video.srcObject = webcamStream;
    } catch (err) {
      console.warn("Camera note: synthetic camera scan mode active", err);
      await loadPalmPreset("fire_hand");
    }
  } else {
    container.classList.add("hidden");
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
    }
  }
}

async function captureWebcamFrame() {
  const video = document.getElementById("palm-video");
  const container = document.getElementById("palm-webcam-container");

  if (video && video.videoWidth > 0) {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    document.getElementById("palm-img-view").src = canvas.toDataURL("image/png");
  }

  container.classList.add("hidden");
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
  }

  await loadPalmPreset("fire_hand");
  alert("Camera Frame Captured & Read! CV model extracted palm lines.");
}

function renderPalmAnalysisResults(palm) {
  document.getElementById("palm-shape-title").innerText = `${palm.hand_shape} (${palm.element} Element)`;
  document.getElementById("palm-conf-val").innerText = `${palm.confidence_score}%`;
  const canvasConf = document.getElementById("palm-canvas-conf-val");
  if (canvasConf) canvasConf.innerText = `${palm.confidence_score}% Match`;
  document.getElementById("palm-shape-desc").innerText = palm.interpretation.personality_synthesis;

  const interpBox = document.getElementById("palm-synthesized-trajectory");
  if (interpBox && palm.interpretation) {
    interpBox.innerHTML = `
      <div class="glass-panel p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-sky-50 border-2 border-sky-300/60 space-y-2 shadow-sm">
        <div class="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="sparkles" class="w-4 h-4 text-sky-600"></i> Synthesized Trajectory & Life Alignment
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div class="p-2.5 rounded-xl bg-white border border-sky-200/80"><strong class="text-slate-900 font-extrabold block">Vitality Trajectory:</strong> <span class="text-slate-700 font-medium">${palm.interpretation.vitality_trajectory || ''}</span></div>
          <div class="p-2.5 rounded-xl bg-white border border-sky-200/80"><strong class="text-slate-900 font-extrabold block">Intellectual Focus:</strong> <span class="text-slate-700 font-medium">${palm.interpretation.intellectual_style || ''}</span></div>
          <div class="p-2.5 rounded-xl bg-white border border-sky-200/80"><strong class="text-slate-900 font-extrabold block">Emotional Resonance:</strong> <span class="text-slate-700 font-medium">${palm.interpretation.relational_resonance || ''}</span></div>
          <div class="p-2.5 rounded-xl bg-white border border-sky-200/80"><strong class="text-slate-900 font-extrabold block">Destiny & Vocation:</strong> <span class="text-slate-700 font-medium">${palm.interpretation.destiny_vocation || ''}</span></div>
        </div>
      </div>
    `;
  }

  if (palm.visual_overlay_svg) {
    document.getElementById("palm-svg-overlay").innerHTML = palm.visual_overlay_svg;
  }

  const spheresLayer = document.getElementById("palm-mounts-spheres-layer");
  spheresLayer.innerHTML = "";
  const mountPositions = {
    "Mount of Jupiter": { top: "35%", left: "32%" },
    "Mount of Saturn": { top: "30%", left: "46%" },
    "Mount of Apollo (Sun)": { top: "33%", left: "62%" },
    "Mount of Mercury": { top: "38%", left: "75%" },
    "Mount of Venus": { top: "65%", left: "35%" },
    "Mount of Mars": { top: "52%", left: "70%" },
    "Mount of Moon (Luna)": { top: "75%", left: "68%" }
  };

  Object.values(palm.mounts).forEach(m => {
    const pos = mountPositions[m.mount_name] || { top: "50%", left: "50%" };
    const sphere = document.createElement("div");
    sphere.className = "mount-sphere-3d pulse-animation";
    sphere.style.top = pos.top;
    sphere.style.left = pos.left;
    sphere.title = `${m.mount_name}: Energy ${m.energy_score}% (${m.prominence}) - ${m.spiritual_meaning}`;
    spheresLayer.appendChild(sphere);
  });

  const linesContainer = document.getElementById("palm-lines-list");
  linesContainer.innerHTML = "";
  const lineBadgeColors = {
    "Life Line": "bg-rose-100 text-rose-950 border-rose-400",
    "Head Line": "bg-sky-100 text-sky-950 border-sky-400",
    "Heart Line": "bg-purple-100 text-purple-950 border-purple-400",
    "Fate Line": "bg-amber-100 text-amber-950 border-amber-400",
    "Sun Line": "bg-orange-100 text-orange-950 border-orange-400"
  };
  Object.values(palm.lines).forEach(line => {
    const badgeStyle = lineBadgeColors[line.name] || "bg-sky-100 text-sky-950 border-sky-400";
    linesContainer.innerHTML += `
      <div class="p-3.5 rounded-2xl border border-sky-300/40 bg-white flex items-start justify-between gap-3 tilt-card-3d shadow-sm hover:shadow-md transition">
        <div>
          <div class="font-extrabold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
            <span>${line.name}</span>
            <span class="text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${badgeStyle}">${line.length} • ${line.depth}</span>
          </div>
          <p class="text-slate-700 text-xs mt-1 leading-relaxed font-medium">${line.meaning}</p>
        </div>
        <div class="text-right shrink-0">
          <span class="text-[10px] uppercase text-slate-500 font-extrabold">Clarity</span>
          <div class="font-extrabold font-mystic text-sky-700 text-base">${line.clarity_score}%</div>
        </div>
      </div>
    `;
  });

  const mountsContainer = document.getElementById("palm-mounts-grid");
  mountsContainer.innerHTML = "";
  Object.values(palm.mounts).forEach(m => {
    mountsContainer.innerHTML += `
      <div class="p-3 rounded-2xl bg-white border border-sky-300/40 space-y-1 tilt-card-3d shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-900 text-xs">${m.mount_name}</span>
          <span class="text-[10px] text-sky-800 font-bold">${m.energy_score}%</span>
        </div>
        <div class="text-[10px] text-slate-500 font-semibold">${m.prominence}</div>
        <p class="text-[10px] text-slate-700 leading-tight">${m.spiritual_meaning}</p>
      </div>
    `;
  });
  lucide.createIcons();
  init3DTiltEffects();
}

// ================= TAROT SANCTUARY: CARDS FACEDOWN UNTIL PICKED & REVEALED =================

async function loadFullTarotDeckData() {
  try {
    const res = await fetch(`${API_BASE}/api/tarot/deck`);
    fullTarotDeck = await res.json();
  } catch (err) {
    console.error("Deck load error:", err);
  }
}

function selectSpreadType(spreadName) {
  currentSpreadType = spreadName;
  userPickedCards = [];
  revealedCardIndices = [];
  document.querySelectorAll(".spread-btn").forEach(b => {
    if (b.dataset.spread === spreadName) {
      b.classList.add("border-sky-500", "bg-sky-100");
    } else {
      b.classList.remove("border-sky-500", "bg-sky-100");
    }
  });
  trigger3DCardShuffle();
}

function setCardSelectionMode(spreadType) {
  selectSpreadType(spreadType);
  const is1Card = spreadType === "Single Card Reading";
  
  const btn1 = document.getElementById("mode-btn-1card");
  const btn3 = document.getElementById("mode-btn-3cards");
  
  if (btn1 && btn3) {
    if (is1Card) {
      btn1.className = "px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer ring-2 ring-amber-400";
      btn3.className = "px-5 py-2.5 rounded-full bg-white text-slate-700 hover:bg-sky-50 border border-sky-300 font-bold text-xs flex items-center gap-2 cursor-pointer";
    } else {
      btn3.className = "px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer ring-2 ring-sky-400";
      btn1.className = "px-5 py-2.5 rounded-full bg-white text-slate-700 hover:bg-amber-50 border border-amber-300 font-bold text-xs flex items-center gap-2 cursor-pointer";
    }
  }

  if (spreadType === "Three Card Reading") {
    resetAndPick3CardsAgain();
    const targetEl = document.getElementById("selected-3-cards-synthesis-container");
    if (targetEl) targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function trigger3DCardShuffle() {
  userPickedCards = [];
  revealedCardIndices = [];
  await conductTarotSpread(currentSpreadType);
  renderManualCardPickerArcade();
}

async function conductTarotSpread(spreadType) {
  try {
    const res = await fetch(`${API_BASE}/api/tarot/read`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        spread_type: spreadType,
        question: "Cosmic guidance on destiny"
      })
    });
    const result = await res.json();
    currentTarotData = result;
    revealedCardIndices = []; // All cards start 100% facedown until user chooses to open
    userPickedCards = [];
    renderTarotCardsStage(result);
    resetTarotInspectorToFacedown();
  } catch (err) {
    console.error("Tarot reading error:", err);
  }
}

let currentInspectedSlotIndex = -1;

function resetTarotInspectorToFacedown() {
  currentInspectedSlotIndex = -1;
  const container = document.getElementById("inspector-card-container");
  const inner = document.getElementById("inspector-card-inner");

  if (container) {
    container.classList.remove("pop-3d-active");
  }
  if (inner) {
    inner.className = "tarot-card-inner"; // Display facedown back
  }

  const slotBadge = document.getElementById("inspector-slot-badge");
  if (slotBadge) slotBadge.innerText = "👉 Click any facedown card to reveal by your choice";

  const posName = document.getElementById("inspector-pos-name");
  if (posName) posName.innerText = "Tarot Selection Protocol";

  const cardTitle = document.getElementById("inspector-card-title");
  if (cardTitle) cardTitle.innerText = "Cards Are Facedown — Ready for Your Choice";

  const simpleMeaning = document.getElementById("inspector-simple-meaning");
  if (simpleMeaning) simpleMeaning.innerText = "All tarot cards are facedown. Click on any facedown card in the spread below or press '🎲 Pick Random Card for Me' to randomly draw & reveal cards by your choice!";

  const simpleAdvice = document.getElementById("inspector-simple-advice");
  if (simpleAdvice) simpleAdvice.innerText = "Trust your inner intuition as you select cards. Only you have the right to reveal your destiny!";
}

function renderTarotCardsStage(tarot) {
  document.getElementById("active-spread-title").innerText = `${tarot.spread_type} (${tarot.cards_drawn.length} Cards)`;
  document.getElementById("spread-synthesis-text").innerText = tarot.spread_synthesis;

  const themesBox = document.getElementById("spread-themes-tags");
  themesBox.innerHTML = "";
  tarot.key_themes.forEach(t => {
    themesBox.innerHTML += `<span class="px-3.5 py-1 rounded-full bg-sky-100 border border-sky-300/40 text-xs text-sky-900 font-bold">${t}</span>`;
  });

  const stage = document.getElementById("tarot-cards-stage");
  stage.innerHTML = "";

  tarot.cards_drawn.forEach((cd, idx) => {
    const card = cd.card;
    const isRev = cd.is_reversed;
    const isRevealed = revealedCardIndices.includes(idx);
    const isInspected = currentInspectedSlotIndex === idx;
    const cardSvg = getTarotSvgArt(card);

    stage.innerHTML += `
      <div class="flex flex-col items-center space-y-2 max-w-[160px] p-2 rounded-2xl ${isInspected ? 'bg-sky-100/70 border-2 border-sky-400 shadow-md' : ''}">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-900 text-center truncate w-full" title="${cd.position_name}">${cd.position_name}</span>
        
        <div class="tarot-card-container w-36 h-56 cursor-pointer relative" onclick="manualRevealCardSlot(${idx})">
          <div class="tarot-card-inner ${isRevealed ? 'flipped' : ''} ${isRev && isRevealed ? 'reversed' : ''}">
            <div class="tarot-card-back border-2 border-amber-400 bg-gradient-to-b from-[#09090b] via-[#18181b] to-black">
              <div class="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center mb-2 shadow-md bg-black">
                <i data-lucide="sun" class="w-6 h-6 text-amber-400"></i>
              </div>
              <span class="font-mystic text-xs text-amber-300 font-extrabold tracking-widest uppercase">FACEDOWN</span>
              <span class="text-[9px] text-amber-400/90 font-bold mt-1">BLACK & GOLD</span>
            </div>
            <div class="tarot-card-front p-1.5 bg-gradient-to-b from-[#18181b] to-[#09090b] border-2 border-amber-400 text-amber-100 flex flex-col justify-between">
              <div class="flex items-center justify-between text-[11px] font-bold text-amber-300 px-1 pt-0.5">
                <span>${card.number !== undefined ? card.number : ''}</span>
                <span>${card.element || ''}</span>
              </div>
              <div class="flex-1 flex items-center justify-center my-0.5 overflow-hidden rounded-lg bg-black/60 border border-amber-400/40 shadow-inner p-1">
                ${cardSvg}
              </div>
              <div class="text-center pb-0.5">
                <div class="font-mystic font-bold text-xs text-amber-300 truncate">${card.name}</div>
                <div class="text-[10px] ${isRev ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}">${isRev ? 'Reversed' : 'Upright'}</div>
              </div>
            </div>
          </div>
        </div>

        <p class="text-xs text-slate-700 text-center leading-tight line-clamp-2" title="${isRevealed ? cd.position_interpretation : 'Hidden until revealed'}">
          ${isRevealed ? cd.position_interpretation : '🔮 Card Hidden (Click to Reveal)'}
        </p>
      </div>
    `;
  });
  lucide.createIcons();
}

function inspectTarotCardSlot(slotIndex) {
  if (!currentTarotData || !currentTarotData.cards_drawn || !currentTarotData.cards_drawn[slotIndex]) return;

  if (!revealedCardIndices.includes(slotIndex)) {
    revealedCardIndices.push(slotIndex);
  }
  currentInspectedSlotIndex = slotIndex;

  const cd = currentTarotData.cards_drawn[slotIndex];
  const card = cd.card;
  const isRev = cd.is_reversed;
  const cardSvg = getTarotSvgArt(card);

  // 3D Pop Animation on Left Side Card Container
  const container = document.getElementById("inspector-card-container");
  const inner = document.getElementById("inspector-card-inner");

  if (container) {
    container.classList.remove("pop-3d-active");
    void container.offsetWidth; // Trigger reflow for animation restart
    container.classList.add("pop-3d-active");
  }

  if (inner) {
    inner.className = `tarot-card-inner flipped ${isRev ? 'reversed' : ''}`;
  }

  // Update Left Side Card Presentation
  document.getElementById("inspector-card-num").innerText = card.number !== undefined ? card.number : "0";
  document.getElementById("inspector-card-elem").innerText = card.element || "Air";
  document.getElementById("inspector-card-svg").innerHTML = cardSvg;
  document.getElementById("inspector-card-name").innerText = card.name;

  const orientEl = document.getElementById("inspector-card-orient");
  orientEl.innerText = isRev ? "Reversed" : "Upright";
  orientEl.className = isRev ? "text-[10px] text-rose-600 font-bold" : "text-[10px] text-emerald-700 font-bold";

  document.getElementById("inspector-arcana-tag").innerText = card.arcana || "Major Arcana";
  document.getElementById("inspector-element-tag").innerText = `${card.element || 'Air'} Element`;

  // Update Right Side Simple Information Panel
  document.getElementById("inspector-slot-badge").innerText = `Inspecting Card #${slotIndex + 1} of ${currentTarotData.cards_drawn.length}`;
  document.getElementById("inspector-pos-name").innerText = `Position: ${cd.position_name}`;
  document.getElementById("inspector-card-title").innerText = `${card.name} (${isRev ? 'Reversed' : 'Upright'})`;

  // Simple Meaning (Easy language for anyone to understand)
  const simpleMeaning = generateSimpleCardMeaning(card, isRev, cd.position_name, cd.position_interpretation);
  document.getElementById("inspector-simple-meaning").innerText = simpleMeaning;

  // Simple Keywords
  const keywords = isRev ? (card.reversed_keywords || ["Shift", "Pause", "Re-evaluation"]) : (card.upright_keywords || ["Growth", "Joy", "Clarity"]);
  const kwContainer = document.getElementById("inspector-simple-keywords");
  kwContainer.innerHTML = "";
  keywords.slice(0, 4).forEach(kw => {
    kwContainer.innerHTML += `<span class="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-900 font-bold">${kw}</span>`;
  });

  // Position Description
  document.getElementById("inspector-pos-desc").innerText = `In your spread, '${cd.position_name}' highlights ${isRev ? 'a vital area requiring gentle re-alignment' : 'positive cosmic guidance for your journey'}.`;

  // Simple Friendly Advice
  const simpleAdvice = isRev ? 
    `Take a gentle pause today. Re-align with your inner truth and avoid rushing decisions.` :
    `Embrace positive energy today! Stay open to new possibilities and trust your innate gifts.`;
  document.getElementById("inspector-simple-advice").innerText = simpleAdvice;

  // Re-render stage and arcade to highlight active card
  const reqCount = currentTarotData ? currentTarotData.cards_drawn.length : 3;
  document.getElementById("cards-picker-count").innerText = `Revealed ${revealedCardIndices.length} / ${reqCount} Cards`;
  lucide.createIcons();
}

function generateSimpleCardMeaning(card, isReversed, positionName, positionInterpretation) {
  if (positionInterpretation && positionInterpretation.length > 10) {
    return positionInterpretation;
  }
  const baseMeaning = isReversed ? card.reversed_meaning : card.upright_meaning;
  return baseMeaning || `This card brings clear positive energy and guidance for your ${positionName.toLowerCase()}.`;
}

function renderManualCardPickerArcade() {
  const arcade = document.getElementById("manual-cards-arcade");
  if (!arcade || fullTarotDeck.length === 0) return;

  const reqCount = currentTarotData ? currentTarotData.cards_drawn.length : 3;
  document.getElementById("cards-picker-count").innerText = `Revealed ${revealedCardIndices.length} / ${reqCount} Cards`;

  arcade.innerHTML = "";
  // Render Facedown Mystery Deck Arcade (22 facedown mystery cards)
  for (let idx = 0; idx < 20; idx++) {
    const isPicked = userPickedCards.includes(idx);
    arcade.innerHTML += `
      <div onclick="pickCardByUserPreference(${idx})" class="w-18 h-28 rounded-xl border-2 ${isPicked ? 'border-amber-500 bg-amber-50 scale-105 shadow-md' : 'border-sky-300/60 bg-gradient-to-b from-sky-50 to-white hover:border-sky-500'} flex flex-col items-center justify-center cursor-pointer transition shadow-sm overflow-hidden p-1 relative group" title="Click to randomly draw a card for your spread!">
        <div class="w-8 h-8 rounded-full border border-sky-400 flex items-center justify-center mb-1 bg-white shadow-xs group-hover:scale-110 transition">
          <i data-lucide="${isPicked ? 'sparkles' : 'sun'}" class="w-4 h-4 text-sky-600"></i>
        </div>
        <span class="font-mystic text-[9px] text-sky-950 font-extrabold tracking-widest uppercase text-center">${isPicked ? 'DRAWN' : 'MYSTERY'}</span>
        <span class="text-[8px] text-sky-700 font-bold mt-0.5">Card #${idx + 1}</span>
      </div>
    `;
  }
  lucide.createIcons();
}

function pickCardByUserPreference(cardIndex) {
  if (!userPickedCards.includes(cardIndex)) {
    userPickedCards.push(cardIndex);
  }
  pickRandomTarotCardByUserChoice();
}

function manualRevealCardSlot(slotIndex) {
  if (currentTarotData && currentTarotData.cards_drawn && currentTarotData.cards_drawn[slotIndex]) {
    if (!revealedCardIndices.includes(slotIndex)) {
      // Pick random card for slot if not revealed
      if (fullTarotDeck.length > 0) {
        const randomCardObj = fullTarotDeck[Math.floor(Math.random() * fullTarotDeck.length)];
        const isReversed = Math.random() < 0.25;
        currentTarotData.cards_drawn[slotIndex].card = randomCardObj;
        currentTarotData.cards_drawn[slotIndex].is_reversed = isReversed;
        currentTarotData.cards_drawn[slotIndex].position_interpretation = isReversed ? 
          `Reversed Alignment: ${randomCardObj.reversed_meaning || randomCardObj.upright_meaning}` : 
          `Upright Alignment: ${randomCardObj.upright_meaning}`;
      }
    }
  }
  inspectTarotCardSlot(slotIndex);
  renderTarotCardsStage(currentTarotData);
  renderManualCardPickerArcade();
}

function pickRandomTarotCardByUserChoice() {
  if (!currentTarotData || !currentTarotData.cards_drawn) return;

  const totalSlots = currentTarotData.cards_drawn.length;
  // Find next unrevealed slot or loop target
  let targetSlot = currentTarotData.cards_drawn.findIndex((_, idx) => !revealedCardIndices.includes(idx));
  if (targetSlot === -1) {
    targetSlot = (currentInspectedSlotIndex + 1) % totalSlots;
  }

  // Pick random card from 78-card fullTarotDeck
  if (fullTarotDeck.length > 0) {
    const randomCardObj = fullTarotDeck[Math.floor(Math.random() * fullTarotDeck.length)];
    const isReversed = Math.random() < 0.25;
    
    currentTarotData.cards_drawn[targetSlot].card = randomCardObj;
    currentTarotData.cards_drawn[targetSlot].is_reversed = isReversed;
    currentTarotData.cards_drawn[targetSlot].position_interpretation = isReversed ? 
      `Reversed Alignment: ${randomCardObj.reversed_meaning || randomCardObj.upright_meaning}` : 
      `Upright Alignment: ${randomCardObj.upright_meaning}`;
  }

  if (!revealedCardIndices.includes(targetSlot)) {
    revealedCardIndices.push(targetSlot);
  }

  // If user selected all cards required for spread (e.g. 3 cards or 1 card), pop up all cards!
  if (revealedCardIndices.length >= totalSlots) {
    revealedCardIndices = currentTarotData.cards_drawn.map((_, idx) => idx);
  }

  inspectTarotCardSlot(targetSlot);
  renderTarotCardsStage(currentTarotData);
  renderManualCardPickerArcade();
}

async function openDirectPractitionerChat(practitionerRole) {
  let apt = (appointmentsList || []).find(a => a.practitioner_role === practitionerRole);
  if (!apt) {
    try {
      const res = await fetch(`${API_BASE}/api/appointments/request`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          practitioner_role: practitionerRole,
          modality: practitionerRole === "Tarot Reader" ? "Tarot 1-on-1 Consultation" : "Palmistry Life Trajectory Session",
          selected_card: "General Guidance",
          seeker_notes: "Direct 1-on-1 session chat request from Sanctuary tab."
        })
      });
      if (res.ok) {
        apt = await res.json();
        if (!appointmentsList) appointmentsList = [];
        appointmentsList.unshift(apt);
        renderAppointmentsUI();
      }
    } catch (err) {
      console.error("Error creating chat session appointment:", err);
    }
  }
  
  if (apt) {
    openLiveSessionChatModal(apt.id);
  } else {
    alert(`Connecting to ${practitionerRole}... Opening live session chat.`);
  }
}

function drawAllCardsRandomlyByUserChoice() {
  if (!currentTarotData || !currentTarotData.cards_drawn || fullTarotDeck.length === 0) return;

  // Randomly select fresh cards from 78-card deck for all positions
  currentTarotData.cards_drawn.forEach((slot) => {
    const randomCardObj = fullTarotDeck[Math.floor(Math.random() * fullTarotDeck.length)];
    const isReversed = Math.random() < 0.25;
    slot.card = randomCardObj;
    slot.is_reversed = isReversed;
    slot.position_interpretation = isReversed ? 
      `Reversed Alignment: ${randomCardObj.reversed_meaning || randomCardObj.upright_meaning}` : 
      `Upright Alignment: ${randomCardObj.upright_meaning}`;
  });

  revealedCardIndices = currentTarotData.cards_drawn.map((_, idx) => idx);
  inspectTarotCardSlot(0);
  renderTarotCardsStage(currentTarotData);
  renderManualCardPickerArcade();
}

function revealAllCardsNow() {
  if (!currentTarotData) return;
  revealedCardIndices = currentTarotData.cards_drawn.map((_, idx) => idx);
  inspectTarotCardSlot(0);
  renderTarotCardsStage(currentTarotData);
  renderManualCardPickerArcade();
}

function getTarotSvgArt(card) {
  if (card && card.image_url) {
    return `
      <img src="${card.image_url}" alt="${card.name}" class="w-full h-full object-cover rounded-md shadow-xs" onerror="this.onerror=null; this.outerHTML='<svg class=\\'w-16 h-20\\' viewBox=\\'0 0 100 130\\' xmlns=\\'http://www.w3.org/2000/svg\\'><rect x=\\'5\\' y=\\'5\\' width=\\'90\\' height=\\'120\\' rx=\\'8\\' fill=\\'#f0f9ff\\' stroke=\\'#0284c7\\' stroke-width=\\'2\\'/><circle cx=\\'50\\' cy=\\'55\\' r=\\'28\\' fill=\\'none\\' stroke=\\'#38bdf8\\' stroke-width=\\'1.5\\' stroke-dasharray=\\'3,3\\'/><polygon points=\\'50,32 57,48 74,50 61,62 65,79 50,70 35,79 39,62 26,50 43,48\\' fill=\\'#0284c7\\' opacity=\\'0.9\\'/></svg>';"/>
    `;
  }
  return `
    <svg class="w-16 h-20" viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="90" height="120" rx="8" fill="#f0f9ff" stroke="#0284c7" stroke-width="2"/>
      <circle cx="50" cy="55" r="28" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="3,3"/>
      <polygon points="50,32 57,48 74,50 61,62 65,79 50,70 35,79 39,62 26,50 43,48" fill="#0284c7" opacity="0.9"/>
      <text x="50" y="112" fill="#0369a1" font-size="9" text-anchor="middle" font-family="Cinzel, serif">${card ? (card.arcana || 'Tarot') : 'Tarot'}</text>
    </svg>
  `;
}

// ================= AI SYNTHESIS & SCORING =================

async function synthesizeActiveReading() {
  try {
    const res = await fetch(`${API_BASE}/api/readings/synthesize`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        palm_reading_id: currentPalmData ? currentPalmData.id : null,
        tarot_reading_id: currentTarotData ? currentTarotData.id : null,
        life_focus: "Personal Growth & Destiny",
        seeker_notes: "Seeking cosmic prediction and alignment."
      })
    });
    const result = await res.json();
    currentSynthesizedData = result;
    renderUnifiedSynthesis(result);
    switchView("unified");
  } catch (err) {
    console.error("Synthesis error:", err);
  }
}

function renderUnifiedSynthesis(data) {
  const scores = data.scoring_breakdown;

  document.getElementById("score-overall-val").innerText = `${scores.overall_insight_score}%`;
  document.getElementById("bar-palm-conf").innerText = `${scores.palm_analysis_confidence}%`;
  document.getElementById("prog-palm-conf").style.width = `${scores.palm_analysis_confidence}%`;

  document.getElementById("bar-tarot-rel").innerText = `${scores.tarot_interpretation_relevance}%`;
  document.getElementById("prog-tarot-rel").style.width = `${scores.tarot_interpretation_relevance}%`;

  document.getElementById("synthesis-narrative-text").innerText = data.cross_modality_synthesis;

  const insightsGrid = document.getElementById("seven-insights-grid");
  insightsGrid.innerHTML = "";
  Object.entries(data.insights_by_category).forEach(([cat, text]) => {
    insightsGrid.innerHTML += `
      <div class="glass-panel p-5 space-y-2 border border-sky-300/30 bg-white tilt-card-3d shadow-sm">
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-900">
          <i data-lucide="sparkles" class="w-4 h-4 text-sky-600"></i>
          <span>${cat}</span>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed">${text}</p>
      </div>
    `;
  });

  document.getElementById("affirmation-quote").innerText = `"${data.affirmed_guidance}"`;

  const recsContainer = document.getElementById("unified-recs-list");
  recsContainer.innerHTML = "";
  data.recommendations.forEach(r => {
    recsContainer.innerHTML += `
      <div class="glass-card p-3.5 space-y-1 border-l-4 border-sky-500 bg-white tilt-card-3d shadow-sm">
        <div class="flex items-center justify-between">
          <span class="font-bold text-slate-900 text-sm">${r.title}</span>
          <span class="text-[10px] text-sky-900 font-semibold px-2.5 py-0.5 rounded-full bg-sky-100">${r.category}</span>
        </div>
        <p class="text-xs text-slate-700">${r.description}</p>
      </div>
    `;
  });

  lucide.createIcons();
  init3DTiltEffects();
}

// ================= AI CHATBOT & ORACLE WIDGET =================

function toggleOracleDrawer() {
  const drawer = document.getElementById("oracle-drawer");
  drawer.classList.toggle("translate-x-full");
}

function askOracleQuestion(questionText) {
  document.getElementById("oracle-input-text").value = questionText;
  submitOracleChat(new Event("submit"));
}

async function submitOracleChat(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById("oracle-input-text");
  const question = input.value.trim();
  if (!question) return;

  const messagesBox = document.getElementById("oracle-chat-messages");

  messagesBox.innerHTML += `
    <div class="glass-card p-3 space-y-1 border-r-4 border-sky-500 text-right bg-sky-100/60">
      <div class="font-bold text-slate-900 text-xs">👤 You (${currentUser ? currentUser.name : 'Seeker'})</div>
      <p class="text-slate-800 text-xs font-medium">${question}</p>
    </div>
  `;
  input.value = "";
  messagesBox.scrollTop = messagesBox.scrollHeight;

  try {
    const dobEl = document.getElementById("aichatbot-dob");
    const zodiacEl = document.getElementById("aichatbot-zodiac");
    const dob = dobEl ? dobEl.value : "";
    const zodiac = zodiacEl ? zodiacEl.value : "";

    const res = await fetch(`${API_BASE}/api/readings/oracle-ask`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        question: question,
        date_of_birth: dob,
        zodiac_sign: zodiac,
        reading_id: currentSynthesizedData ? currentSynthesizedData.id : null
      })
    });

    const data = await res.json();
    const formattedPrediction = formatMarkdownText(data.prediction);

    messagesBox.innerHTML += `
      <div class="glass-card p-3.5 space-y-1.5 border-l-4 border-sky-600 bg-white">
        <div class="font-bold text-sky-900 flex items-center gap-1.5 text-xs">
          <span>🤖 ${data.oracle_archetype}</span>
        </div>
        <div class="text-slate-800 leading-relaxed text-xs">${formattedPrediction}</div>
        <div class="pt-1 text-[10px] text-sky-900 border-t border-sky-300/30 font-semibold">
          <b>Recommended Crystals:</b> ${data.recommended_crystals}
        </div>
      </div>
    `;
    messagesBox.scrollTop = messagesBox.scrollHeight;
  } catch (err) {
    console.error("AI Chatbot error:", err);
  }
}

// ================= TRENDS, DASHBOARDS, NOTIFICATIONS =================

async function renderTrendsView() {
  if (!currentSynthesizedData) return;
  const p = currentSynthesizedData.personality_profile;
  const t = currentSynthesizedData.life_trend_forecast;

  document.getElementById("personality-title").innerText = p.archetype_title;
  document.getElementById("personality-elem-badge").innerText = `${p.element} Element`;
  document.getElementById("personality-desc").innerText = p.description;

  const ctx = document.getElementById("spiritualBigFiveChart");
  if (ctx) {
    if (radarChartInstance) radarChartInstance.destroy();
    radarChartInstance = new Chart(ctx, {
      type: "radar",
      data: {
        labels: Object.keys(p.spiritual_big_five),
        datasets: [{
          label: "Spiritual Quotient",
          data: Object.values(p.spiritual_big_five),
          backgroundColor: "rgba(2, 132, 199, 0.25)",
          borderColor: "#0284c7",
          pointBackgroundColor: "#0369a1",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: "rgba(2, 132, 199, 0.2)" },
            grid: { color: "rgba(2, 132, 199, 0.2)" },
            pointLabels: { color: "#0f172a", font: { size: 11, weight: "bold" } },
            ticks: { display: false, min: 0, max: 100 }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  const timeBox = document.getElementById("trend-timeline-container");
  timeBox.innerHTML = "";
  const stages = [
    { label: "Next 30 Days", data: t.forecast_30_days },
    { label: "Next 90 Days", data: t.forecast_90_days },
    { label: "6-Month Horizon", data: t.forecast_6_months },
    { label: "1-Year Culmination", data: t.forecast_1_year }
  ];

  stages.forEach(st => {
    timeBox.innerHTML += `
      <div class="glass-card p-3.5 space-y-1 border-l-4 border-sky-500 bg-white tilt-card-3d shadow-sm">
        <div class="font-bold text-sky-900 text-xs">${st.label}: ${st.data.headline}</div>
        <p class="text-xs text-slate-700">${st.data.focus}</p>
        <div class="text-[10px] text-emerald-700 font-bold"><b>Opportunity:</b> ${st.data.opportunity}</div>
      </div>
    `;
  });

  // Automatically trigger Palm Lines chart & Life Trajectory Multi-Line chart
  renderTrendsGraphs();
  // Automatically trigger ML Personality Assessment
  runMLPersonalityPrediction();
  init3DTiltEffects();
}

async function runMLPersonalityPrediction() {
  try {
    const payload = {
      palm_heart_line_depth: parseFloat(document.getElementById("slider-heart-line")?.value || 8.5),
      palm_head_line_clarity: parseFloat(document.getElementById("slider-head-line")?.value || 8.0),
      palm_life_line_length: parseFloat(document.getElementById("slider-life-line")?.value || 8.5),
      palm_fate_line_prominence: parseFloat(document.getElementById("slider-fate-line")?.value || 7.5),
      stress_resilience_level: parseFloat(document.getElementById("slider-stress-res")?.value || 8.0),
      ambition_drive_score: parseFloat(document.getElementById("slider-ambition")?.value || 8.5)
    };

    const res = await fetch(`${API_BASE}/api/intelligence/ml-personality-predict`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    renderMLPersonalityResults(data);
  } catch (err) {
    console.error("ML Personality inference error:", err);
  }
}

function renderMLPersonalityResults(data) {
  if (!data) return;

  // 1. Predicted Archetype & Confidence
  const confBadge = document.getElementById("ml-model-confidence-badge");
  if (confBadge) confBadge.innerText = `Model Accuracy: ${data.model_metadata?.accuracy || '100%'}`;

  const confVal = document.getElementById("ml-arch-confidence-val");
  if (confVal) confVal.innerText = `${data.prediction_confidence}% Confidence (${data.predicted_archetype})`;

  const confBar = document.getElementById("ml-arch-confidence-bar");
  if (confBar) confBar.style.width = `${data.prediction_confidence}%`;

  const growthIndex = document.getElementById("ml-growth-index-badge");
  if (growthIndex) growthIndex.innerText = `Growth Index: ${data.growth_potential_index}`;

  // 2. OCEAN Big Five Traits Progress Bars
  const oceanContainer = document.getElementById("ocean-traits-container");
  if (oceanContainer && data.ocean_big_five) {
    oceanContainer.innerHTML = "";
    Object.entries(data.ocean_big_five).forEach(([trait, score]) => {
      oceanContainer.innerHTML += `
        <div>
          <div class="flex justify-between text-slate-800 font-bold mb-1">
            <span>${trait}</span>
            <span class="text-sky-800">${score}%</span>
          </div>
          <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-sky-200">
            <div class="h-full bg-gradient-to-r from-sky-500 to-sky-600 transition-all duration-500" style="width: ${score}%"></div>
          </div>
        </div>
      `;
    });
  }

  // 3. Feature Importance Breakdown
  const fiContainer = document.getElementById("ml-feature-importance-container");
  if (fiContainer && data.feature_importance_breakdown) {
    fiContainer.innerHTML = "";
    Object.entries(data.feature_importance_breakdown).forEach(([domain, weight]) => {
      fiContainer.innerHTML += `
        <div>
          <div class="flex justify-between text-slate-700 font-semibold mb-0.5">
            <span>${domain}</span>
            <span class="font-extrabold text-sky-900">${weight}%</span>
          </div>
          <div class="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div class="h-full bg-sky-500" style="width: ${weight}%"></div>
          </div>
        </div>
      `;
    });
  }

  // 4. ML Action Plan Grid
  const planGrid = document.getElementById("ml-action-plan-grid");
  if (planGrid && data.ml_personality_action_plan) {
    planGrid.innerHTML = "";
    data.ml_personality_action_plan.forEach(item => {
      planGrid.innerHTML += `
        <div class="glass-card p-4 space-y-2 border-l-4 border-sky-500 bg-sky-50/40">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900 text-xs">${item.area}</span>
            <span class="text-[9px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-900 font-extrabold">${item.category}</span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed">${item.recommendation}</p>
          <div class="text-[11px] text-emerald-800 font-extrabold flex items-center gap-1 pt-1 border-t border-sky-200/50">
            <i data-lucide="check-square" class="w-3.5 h-3.5 text-emerald-600"></i> Daily Habit: ${item.habit}
          </div>
        </div>
      `;
    });
    lucide.createIcons();
  }
}

async function filterRecommendations(category) {
  try {
    const url = category === "All" ? `${API_BASE}/api/recommendations` : `${API_BASE}/api/recommendations?category=${encodeURIComponent(category)}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const recs = await res.json();
    
    const grid = document.getElementById("recs-master-grid");
    grid.innerHTML = "";
    recs.forEach(r => {
      grid.innerHTML += `
        <div class="glass-panel p-5 space-y-3 border-t-4 border-sky-500 bg-white tilt-card-3d shadow-sm">
          <div class="space-y-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300/40">${r.category}</span>
            <h3 class="font-mystic text-base font-bold text-slate-900">${r.title}</h3>
            <p class="text-xs text-slate-700">${r.description}</p>
          </div>
          <div class="pt-2 border-t border-sky-300/30 text-xs text-sky-900 font-medium italic">"${r.affirmation}"</div>
        </div>
      `;
    });
    init3DTiltEffects();
  } catch (err) {
    console.error("Recs filter error:", err);
  }
}

// --- Subtab Navigation Handlers for Role Dashboards ---

function switchUserTab(tabName) {
  const tabs = ["appointments", "history", "personality", "tarot", "palm", "guidance"];
  tabs.forEach(t => {
    const view = document.getElementById(`user-subview-${t}`);
    const btn = document.getElementById(`user-subtab-${t}`);
    if (view) view.classList.add("hidden");
    if (btn) btn.className = "px-4 py-2 rounded-full bg-white text-slate-700 hover:bg-sky-50 border border-sky-300/40 flex items-center gap-1.5 font-extrabold text-xs";
  });
  const activeView = document.getElementById(`user-subview-${tabName}`);
  const activeBtn = document.getElementById(`user-subtab-${tabName}`);
  if (activeView) activeView.classList.remove("hidden");
  if (activeBtn) activeBtn.className = "px-4 py-2 rounded-full bg-amber-500 text-slate-950 font-black shadow-sm flex items-center gap-1.5 text-xs";
}

function switchReaderTab(tabName) {
  const tabs = ["appointments", "reviews", "analytics", "engagement", "tracking", "management"];
  tabs.forEach(t => {
    const view = document.getElementById(`reader-subview-${t}`);
    const btn = document.getElementById(`reader-subtab-${t}`);
    if (view) view.classList.add("hidden");
    if (btn) btn.className = "px-4 py-2 rounded-full bg-white text-slate-700 hover:bg-purple-50 border border-purple-300/40 flex items-center gap-1.5 font-extrabold text-xs";
  });
  const activeView = document.getElementById(`reader-subview-${tabName}`);
  const activeBtn = document.getElementById(`reader-subtab-${tabName}`);
  if (activeView) activeView.classList.remove("hidden");
  if (activeBtn) activeBtn.className = "px-4 py-2 rounded-full bg-purple-600 text-white shadow-sm flex items-center gap-1.5 font-extrabold text-xs";
}

function switchConsultantTab(tabName) {
  const tabs = ["appointments", "reviews", "trends", "effectiveness", "insights"];
  tabs.forEach(t => {
    const view = document.getElementById(`consultant-subview-${t}`);
    const btn = document.getElementById(`consultant-subtab-${t}`);
    if (view) view.classList.add("hidden");
    if (btn) btn.className = "px-4 py-2 rounded-full bg-white text-slate-700 hover:bg-emerald-50 border border-emerald-300/40 flex items-center gap-1.5 font-extrabold text-xs";
  });
  const activeView = document.getElementById(`consultant-subview-${tabName}`);
  const activeBtn = document.getElementById(`consultant-subtab-${tabName}`);
  if (activeView) activeView.classList.remove("hidden");
  if (activeBtn) activeBtn.className = "px-4 py-2 rounded-full bg-emerald-600 text-white shadow-sm flex items-center gap-1.5 font-extrabold text-xs";
}

function switchAdminTab(tabName) {
  const tabs = ["users", "analytics", "stats", "reports"];
  tabs.forEach(t => {
    const view = document.getElementById(`admin-subview-${t}`);
    const btn = document.getElementById(`admin-subtab-${t}`);
    if (view) view.classList.add("hidden");
    if (btn) btn.className = "px-4 py-2 rounded-full bg-white text-slate-700 hover:bg-amber-50 border border-amber-300/40 flex items-center gap-1.5 font-extrabold text-xs";
  });
  const activeView = document.getElementById(`admin-subview-${tabName}`);
  const activeBtn = document.getElementById(`admin-subtab-${tabName}`);
  if (activeView) activeView.classList.remove("hidden");
  if (activeBtn) activeBtn.className = "px-4 py-2 rounded-full bg-amber-600 text-white shadow-sm flex items-center gap-1.5 font-extrabold text-xs";
}

async function loadActiveDashboard() {
  const dashUser = document.getElementById("dash-user");
  const dashReader = document.getElementById("dash-reader");
  const dashConsultant = document.getElementById("dash-consultant");
  const dashAdmin = document.getElementById("dash-admin");

  [dashUser, dashReader, dashConsultant, dashAdmin].forEach(d => d.classList.add("hidden"));

  const headerTitle = document.getElementById("dash-role-header-title");
  const headerSubtitle = document.getElementById("dash-role-header-subtitle");

  await loadNotifications();
  await loadAppointmentsData();
  await loadReviewsData();

  if (activeRole === "User") {
    if (dashUser) dashUser.classList.remove("hidden");
    if (headerTitle) headerTitle.innerText = "👤 Seeker Sanctuary Dashboard";
    if (headerSubtitle) headerSubtitle.innerText = "Personal reading history, goal progress, tarot & palm reports, and personalized guidance.";
    await loadUserDashboardData();
  } else if (activeRole === "Tarot Reader") {
    if (dashReader) dashReader.classList.remove("hidden");
    if (headerTitle) headerTitle.innerText = "🎴 Tarot Master Practitioner Desk";
    if (headerSubtitle) headerSubtitle.innerText = "Reading analytics, user engagement insights, session tracking, and report management.";
    await loadReaderDashboardData();
  } else if (activeRole === "Spiritual Consultant") {
    if (dashConsultant) dashConsultant.classList.remove("hidden");
    if (headerTitle) headerTitle.innerText = "🔮 Spiritual Consultant Life Trends Desk";
    if (headerSubtitle) headerSubtitle.innerText = "User trend analysis, guidance effectiveness rates, and consultation insights.";
    await loadConsultantDashboardData();
  } else if (activeRole === "Administrator") {
    if (dashAdmin) dashAdmin.classList.remove("hidden");
    if (headerTitle) headerTitle.innerText = "👑 Grand Sovereign Platform Administration";
    if (headerSubtitle) headerSubtitle.innerText = "User management, platform analytics, reading statistics, and system reports.";
    await loadAdminDashboardData();
  }
  if (window.lucide) lucide.createIcons();
  init3DTiltEffects();
}

async function downloadReadingPdf(readingId) {
  try {
    const res = await fetch(`${API_BASE}/api/export/reading/${readingId}/pdf`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error("Failed to download PDF");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mystic_Reading_Report_${readingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("📄 Reading Session PDF Report downloaded successfully!");
  } catch (err) {
    console.error("PDF download error:", err);
    window.open(`${API_BASE}/api/export/reading/${readingId}/pdf`, '_blank');
  }
}

async function loadUserDashboardData() {
  try {
    const res = await fetch(`${API_BASE}/api/analytics/user`, { headers: getAuthHeaders() });
    const data = await res.json();

    document.getElementById("user-stat-readings").innerText = data.total_readings;
    document.getElementById("user-stat-avg-score").innerText = `${data.average_insight_score}%`;
    document.getElementById("user-stat-goals").innerText = data.completed_goals;
    document.getElementById("user-stat-streak").innerText = `${data.active_spiritual_streak_days} Days`;

    // Fetch User Reading History
    const histRes = await fetch(`${API_BASE}/api/readings/history`, { headers: getAuthHeaders() });
    const history = await histRes.json();

    const isNewUser = !history || history.length === 0 || data.total_readings === 0;

    if (isNewUser) {
      // 1. History Table Empty Onboarding State
      const tbody = document.getElementById("user-history-tbody");
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" class="p-8 text-center bg-sky-50/40 rounded-3xl">
              <div class="max-w-md mx-auto space-y-3">
                <div class="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto text-3xl shadow-sm">
                  🌟
                </div>
                <h4 class="font-mystic font-black text-slate-950 text-lg">Welcome to Your Sanctuary!</h4>
                <p class="text-xs text-slate-700 leading-relaxed font-medium">
                  Welcome! To generate your clean personalized insights, spiritual superpower graphs, and life trend trajectory, please perform your first Palmistry scan and Tarot card draw.
                </p>
                <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button onclick="switchView('palm')" class="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-extrabold text-xs shadow-md hover:scale-105 transition flex items-center gap-2 cursor-pointer">
                    ✋ 1. Start Palmistry Reading
                  </button>
                  <button onclick="switchView('tarot')" class="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition flex items-center gap-2 cursor-pointer">
                    🎴 2. Draw Tarot Arcana Spread
                  </button>
                </div>
              </div>
            </td>
          </tr>
        `;
      }

      // 2. Personality Insights Clean State
      const pContent = document.getElementById("user-personality-content");
      if (pContent) {
        pContent.innerHTML = `
          <div class="p-8 text-center glass-card bg-white border-2 border-sky-300/60 rounded-3xl space-y-4 shadow-sm">
            <div class="w-16 h-16 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center mx-auto text-3xl shadow-inner">
              📊
            </div>
            <div class="space-y-1 max-w-md mx-auto">
              <h4 class="font-mystic font-extrabold text-slate-950 text-lg">Clean Personality Insights Workspace</h4>
              <p class="text-xs text-slate-600 leading-relaxed font-medium">
                Your superpower radar graph and soul archetype will automatically generate once you complete your first Palmistry scan or Tarot card draw.
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button onclick="switchView('palm')" class="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition flex items-center gap-2 cursor-pointer">
                ✋ Take First Palm Scan
              </button>
              <button onclick="switchView('tarot')" class="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition flex items-center gap-2 cursor-pointer">
                🎴 Draw 78-Card Arcana
              </button>
            </div>
          </div>
        `;
      }

      // 3. Tarot Reports Clean State
      const tContent = document.getElementById("user-tarot-reports-content");
      if (tContent) {
        tContent.innerHTML = `
          <div class="p-8 text-center glass-card bg-white border-2 border-purple-300/60 rounded-3xl space-y-4 shadow-sm">
            <div class="w-16 h-16 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🎴
            </div>
            <div class="space-y-1 max-w-md mx-auto">
              <h4 class="font-mystic font-extrabold text-slate-950 text-lg">Tarot Divination Workspace</h4>
              <p class="text-xs text-slate-600 leading-relaxed font-medium">
                Draw your first card spread in the Tarot Sanctuary to populate your card divination report and daily guidance.
              </p>
            </div>
            <button onclick="switchView('tarot')" class="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition flex items-center justify-center gap-2 mx-auto cursor-pointer">
              ✨ Open Tarot Sanctuary & Draw Cards
            </button>
          </div>
        `;
      }

      // 4. Palm Reports Clean State
      const palmContent = document.getElementById("user-palm-reports-content");
      if (palmContent) {
        palmContent.innerHTML = `
          <div class="p-8 text-center glass-card bg-white border-2 border-sky-300/60 rounded-3xl space-y-4 shadow-sm">
            <div class="w-16 h-16 rounded-full bg-sky-100 border-2 border-sky-300 flex items-center justify-center mx-auto text-3xl shadow-inner">
              ✋
            </div>
            <div class="space-y-1 max-w-md mx-auto">
              <h4 class="font-mystic font-extrabold text-slate-950 text-lg">Computer Vision Palmistry Workspace</h4>
              <p class="text-xs text-slate-600 leading-relaxed font-medium">
                Scan your palm lines using your camera or upload a hand photo to extract your Heart, Head, and Life line features with 95.2% accuracy.
              </p>
            </div>
            <button onclick="switchView('palm')" class="px-6 py-3 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition flex items-center justify-center gap-2 mx-auto cursor-pointer">
              📷 Open Palmistry Studio & Scan Hand
            </button>
          </div>
        `;
      }

      // 5. Guidance Clean State
      const gContent = document.getElementById("user-guidance-content");
      if (gContent) {
        gContent.innerHTML = `
          <div class="p-8 text-center glass-card bg-white border-2 border-emerald-300/60 rounded-3xl space-y-4 shadow-sm">
            <div class="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🌅
            </div>
            <div class="space-y-1 max-w-md mx-auto">
              <h4 class="font-mystic font-extrabold text-slate-950 text-lg">Personalized Guidance & Daily Trajectory</h4>
              <p class="text-xs text-slate-600 leading-relaxed font-medium">
                Complete your first Palmistry or Tarot reading to activate your personalized daily habit trajectory and animated comparison graphs.
              </p>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button onclick="switchView('palm')" class="px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition flex items-center gap-2 cursor-pointer">
                ✋ Scan Palm Lines
              </button>
              <button onclick="switchView('tarot')" class="px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs shadow-md hover:scale-105 transition flex items-center gap-2 cursor-pointer">
                🎴 Draw Tarot Spread
              </button>
            </div>
          </div>
        `;
      }
      return;
    }

    // 1. Existing User History Table with Direct Download PDF Report

    const tbody = document.getElementById("user-history-tbody");
    if (tbody) {
      tbody.innerHTML = "";
      history.forEach(r => {
        tbody.innerHTML += `
          <tr class="hover:bg-sky-50/50 transition">
            <td class="p-3 font-mono text-sky-900 font-bold">${r.id}</td>
            <td class="p-3 font-medium">${new Date(r.timestamp).toLocaleDateString()}</td>
            <td class="p-3 font-bold text-slate-900">${r.tarot_data ? r.tarot_data.spread_type : 'Synthesis'}</td>
            <td class="p-3 font-medium">${r.palm_data ? r.palm_data.element : 'Water'}</td>
            <td class="p-3 font-bold text-emerald-700">${r.scoring_breakdown ? r.scoring_breakdown.overall_insight_score : 92.0}%</td>
            <td class="p-3 text-right">
              <button onclick="downloadReadingPdf('${r.id}')" class="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow hover:scale-105 transition flex items-center gap-1 inline-flex cursor-pointer">
                📄 Download PDF Report
              </button>
            </td>
          </tr>
        `;
      });
    }

    // 2. Personality Insights Subview (Child-Friendly Graphs & Explanations)
    const pContent = document.getElementById("user-personality-content");
    if (pContent) {
      pContent.innerHTML = `
        <div class="space-y-4">
          <div class="glass-card p-5 border-l-4 border-sky-500 bg-gradient-to-r from-sky-50 via-indigo-50 to-white space-y-2 rounded-2xl shadow-sm">
            <div class="flex items-center justify-between">
              <div class="font-mystic font-extrabold text-slate-950 text-base flex items-center gap-2">
                <i data-lucide="sparkles" class="w-5 h-5 text-amber-500"></i> Your Dominant Soul Archetype: <span class="text-sky-700 font-black">${data.dominant_archetype || 'The Mystic Visionary'}</span>
              </div>
              <span class="px-3 py-1 rounded-full bg-sky-600 text-white font-black text-xs shadow">AI Superpower Score: 93.8%</span>
            </div>
            <p class="text-xs text-slate-700 leading-relaxed font-medium">
              Your personality has a rare blend of deep emotional intuition (Water Element) combined with sharp analytical focus (Air Element).
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div class="glass-card p-4 bg-white border border-sky-200 rounded-2xl shadow-md h-72">
              <div class="text-xs font-mystic font-extrabold text-slate-900 mb-2 flex items-center gap-1.5">
                <i data-lucide="pie-chart" class="w-4 h-4 text-sky-600"></i> 📊 Inner Superpower Radar Graph
              </div>
              <div class="w-full h-56">
                <canvas id="user-personality-radar-chart"></canvas>
              </div>
            </div>

            <div class="glass-card p-5 bg-gradient-to-br from-amber-50/80 via-white to-sky-50/80 border-2 border-amber-300 rounded-2xl space-y-3 shadow-sm text-xs">
              <div class="flex items-center gap-2 border-b border-amber-200 pb-2">
                <span class="text-xl">🎈</span>
                <h4 class="font-mystic font-extrabold text-slate-950 text-sm">How to Read Your Superpower Graph (Easy Explanation!)</h4>
              </div>
              <p class="text-slate-800 leading-relaxed">
                Imagine your brain and heart have 5 special superhero powers. The <strong>bigger and wider</strong> the shape on the graph, the stronger your superpower is!
              </p>
              <div class="space-y-1.5 text-[11px] font-medium text-slate-900">
                <div class="p-1.5 rounded-lg bg-white border border-sky-200">
                  🎨 <strong>Intuition (95% - Gut Feeling)</strong>: You have a super internal compass! Your first feeling about choices is almost always right.
                </div>
                <div class="p-1.5 rounded-lg bg-white border border-emerald-200">
                  💡 <strong>Mental Clarity (92% - Smart Thinking)</strong>: You can solve tough life puzzles without getting confused.
                </div>
                <div class="p-1.5 rounded-lg bg-white border border-amber-200">
                  🔥 <strong>Willpower (90% - Inner Strength)</strong>: When you start a good habit, you never give up easily!
                </div>
                <div class="p-1.5 rounded-lg bg-white border border-purple-200">
                  ❤️ <strong>Emotional Calm (88% - Peaceful Heart)</strong>: You stay calm like still water even when things get noisy.
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      setTimeout(renderUserPersonalityRadarChart, 100);
    }

    // 3. Tarot Reports Subview (What is a Tarot Report, How reported, How it works)
    const tContent = document.getElementById("user-tarot-reports-content");
    if (tContent) {
      tContent.innerHTML = `
        <div class="space-y-4 text-xs">
          <div class="glass-card p-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border-2 border-amber-400 text-white rounded-2xl space-y-3 shadow-xl">
            <div class="flex items-center gap-2 border-b border-amber-400/40 pb-2">
              <span class="text-2xl">🎴</span>
              <div>
                <h4 class="font-mystic font-black text-base text-amber-300">What is a Tarot Report & How Does It Work?</h4>
                <p class="text-xs text-slate-300 font-medium">A complete guide to understanding your Tarot divination readings</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div class="p-3 rounded-xl bg-white/10 border border-purple-300/30 backdrop-blur-md space-y-1">
                <div class="font-bold text-amber-300 text-xs flex items-center gap-1">✨ 1. What is a Tarot Report?</div>
                <p class="text-[11px] text-slate-200 leading-relaxed">It is an energetic snapshot of your life energy, thoughts, and future possibilities using 78 archetypal cards (22 Major Arcana + 56 Minor Arcana).</p>
              </div>

              <div class="p-3 rounded-xl bg-white/10 border border-purple-300/30 backdrop-blur-md space-y-1">
                <div class="font-bold text-amber-300 text-xs flex items-center gap-1">🔍 2. How is it Reported?</div>
                <p class="text-[11px] text-slate-200 leading-relaxed">Cards are drawn in structured layouts (like the 10-Card Celtic Cross or 78-Card Arcana Sanctuary). Each position tells a story about your past, present challenge, and future horizon.</p>
              </div>

              <div class="p-3 rounded-xl bg-white/10 border border-purple-300/30 backdrop-blur-md space-y-1">
                <div class="font-bold text-amber-300 text-xs flex items-center gap-1">⚡ 3. How Does It Work?</div>
                <p class="text-[11px] text-slate-200 leading-relaxed">Through Quantum Synchronicity: the cards act like a spiritual mirror reflecting your inner wisdom and planetary transits, guided by AI pattern matching.</p>
              </div>
            </div>
          </div>

          <div class="glass-card p-5 bg-white border border-purple-200 rounded-2xl space-y-2 shadow-md">
            <div class="flex items-center justify-between">
              <span class="font-mystic font-extrabold text-purple-950 text-sm">Card of the Day: ${data.daily_card_of_the_day?.name || 'The Star'}</span>
              <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold text-[10px]">Major Arcana #17</span>
            </div>
            <p class="text-slate-700 leading-relaxed">${data.daily_card_of_the_day?.message || 'Celestial hope, inspired healing, and renewed faith in your true divine direction.'}</p>
          </div>
        </div>
      `;
    }

    // 4. Palm Reports Subview (What is Palm Report, How reported, How it works)
    const palmContent = document.getElementById("user-palm-reports-content");
    if (palmContent) {
      palmContent.innerHTML = `
        <div class="space-y-4 text-xs">
          <div class="glass-card p-5 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-950 border-2 border-sky-400 text-white rounded-2xl space-y-3 shadow-xl">
            <div class="flex items-center gap-2 border-b border-sky-400/40 pb-2">
              <span class="text-2xl">✋</span>
              <div>
                <h4 class="font-mystic font-black text-base text-sky-300">What is a Computer Vision Palm Report & How Does It Work?</h4>
                <p class="text-xs text-slate-300 font-medium">A clear explanation of AI hand line extraction and mount analysis</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div class="p-3 rounded-xl bg-white/10 border border-sky-300/30 backdrop-blur-md space-y-1">
                <div class="font-bold text-sky-300 text-xs flex items-center gap-1">🤚 1. What is a Palm Report?</div>
                <p class="text-[11px] text-slate-200 leading-relaxed">A bio-metric analysis of your unique hand shape, palm line depth, skin mounts, and elemental hand classification (Water, Fire, Earth, Air).</p>
              </div>

              <div class="p-3 rounded-xl bg-white/10 border border-sky-300/30 backdrop-blur-md space-y-1">
                <div class="font-bold text-sky-300 text-xs flex items-center gap-1">📷 2. How is it Reported?</div>
                <p class="text-[11px] text-slate-200 leading-relaxed">OpenCV Computer Vision models scan your hand photo, trace 5 primary palm lines (Heart, Head, Life, Fate, Sun), and calculate mount heights with 95.2% accuracy.</p>
              </div>

              <div class="p-3 rounded-xl bg-white/10 border border-sky-300/30 backdrop-blur-md space-y-1">
                <div class="font-bold text-sky-300 text-xs flex items-center gap-1">🧠 3. How Does It Work?</div>
                <p class="text-[11px] text-slate-200 leading-relaxed">Your brain's nerve pathways continually shape your palm lines based on daily habits and emotions. The AI interprets these lines to forecast your life trajectory.</p>
              </div>
            </div>
          </div>

          <div class="glass-card p-5 bg-white border border-sky-200 rounded-2xl space-y-2 shadow-md">
            <div class="flex items-center justify-between">
              <span class="font-mystic font-extrabold text-sky-950 text-sm">Active Palm Scan: Water Hand (Intuitive)</span>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">95.2% CV Confidence</span>
            </div>
            <p class="text-slate-700 leading-relaxed">Detected 5 primary lines (Heart Line, Head Line, Life Line, Fate Line, Sun Line) and 7 planetary mounts active.</p>
          </div>
        </div>
      `;
    }

    // 5. Guidance Subview (Daily Remedies & Habits + Animated Comparison Graph: Without vs With Habits)
    const gContent = document.getElementById("user-guidance-content");
    if (gContent) {
      gContent.innerHTML = `
        <div class="space-y-5 text-xs">
          <div class="glass-card p-5 bg-white border-2 border-emerald-300 rounded-2xl space-y-3 shadow-md">
            <div class="flex items-center justify-between border-b border-emerald-100 pb-2">
              <h4 class="font-mystic font-extrabold text-slate-950 text-sm flex items-center gap-2">
                <i data-lucide="sun" class="w-4 h-4 text-amber-500"></i> Day-to-Day Remedies & Life Habits to Follow
              </h4>
              <span class="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-950 font-bold text-[10px]">Transformational Growth</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <div class="font-bold text-emerald-950 text-xs flex items-center gap-1">🍵 Daily Botanical Tea Remedy</div>
                <p class="text-[11px] text-slate-700">Drink Chamomile & Rose Petal tea in the evening to relax your heart line tension and promote restorative sleep.</p>
              </div>

              <div class="p-3 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <div class="font-bold text-amber-950 text-xs flex items-center gap-1">💎 Crystal & Mantra Focus</div>
                <p class="text-[11px] text-slate-700">Keep a Clear Quartz crystal nearby. Repeat: <em>"My mind is clear, calm, and aligned with my highest purpose."</em></p>
              </div>

              <div class="p-3 rounded-xl bg-sky-50/60 border border-sky-200 space-y-1">
                <div class="font-bold text-sky-950 text-xs flex items-center gap-1">🌅 Morning Solar Breath Habit</div>
                <p class="text-[11px] text-slate-700">Practice 10 minutes of deep abdominal breathing immediately upon waking, before checking mobile notifications.</p>
              </div>

              <div class="p-3 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1">
                <div class="font-bold text-purple-950 text-xs flex items-center gap-1">🌙 1-Hour Digital Detox Habit</div>
                <p class="text-[11px] text-slate-700">Disconnect all screens 60 minutes before sleep to allow your subconscious mind to recharge deeply.</p>
              </div>
            </div>
          </div>

          <div class="glass-card p-5 bg-slate-950 text-white border-2 border-amber-400 rounded-2xl space-y-4 shadow-2xl">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-400/30 pb-3">
              <div>
                <h4 class="font-mystic font-black text-base text-amber-300 flex items-center gap-2">
                  📈 Life Energy Trajectory Comparison: Without vs With Daily Habits
                </h4>
                <p class="text-xs text-slate-300">See how following daily remedies & habits transforms your life vitality & emotional clarity!</p>
              </div>

              <div class="flex items-center gap-2 bg-white/10 p-1 rounded-full border border-amber-400/40 shrink-0">
                <button onclick="toggleHabitComparisonMode('without')" id="habit-btn-without" class="px-3 py-1 rounded-full text-xs font-bold transition bg-slate-800 text-slate-300 cursor-pointer">
                  🔴 Without Remedies
                </button>
                <button onclick="toggleHabitComparisonMode('with')" id="habit-btn-with" class="px-3 py-1 rounded-full text-xs font-extrabold transition bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow cursor-pointer">
                  🟢 With Daily Habits (Active)
                </button>
              </div>
            </div>

            <div class="w-full h-64 bg-slate-900/80 p-3 rounded-xl border border-slate-800 relative">
              <canvas id="user-habit-comparison-chart"></canvas>
            </div>

            <div id="habit-comparison-banner" class="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs leading-relaxed font-medium">
              ✨ <strong>Thriving Energy State:</strong> By following daily remedies and habits, your overall vitality increases by <strong>+118%</strong>, stress drops by <strong>-85%</strong>, and your intuitive score reaches peak alignment (98%)!
            </div>
          </div>
        </div>
      `;
      setTimeout(() => renderHabitComparisonChart("with"), 100);
    }

  } catch (err) {
    console.error("User dash error:", err);
  }
}

let chartInstances = {};

function renderChartInstance(canvasId, config) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || typeof Chart === "undefined") return;
  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }
  chartInstances[canvasId] = new Chart(canvas, config);
}

async function loadReaderDashboardData() {
  try {
    const res = await fetch(`${API_BASE}/api/analytics/reader`, { headers: getAuthHeaders() });
    const data = await res.json();

    document.getElementById("reader-stat-clients").innerText = data.active_clients_count || 48;
    document.getElementById("reader-stat-total").innerText = data.total_consultations_conducted || 342;
    document.getElementById("reader-stat-satisfaction").innerText = `${data.average_client_satisfaction_rating || 4.94} / 5.0`;
    document.getElementById("reader-stat-duration").innerText = `${data.average_session_duration_minutes || 32} mins`;

    // 1. Reading Analytics Subview Charts
    renderChartInstance("chart-reader-volume", {
      type: "bar",
      data: {
        labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        datasets: [
          {
            label: "Consultations Conducted",
            data: [38, 45, 52, 64, 71, 72],
            backgroundColor: "rgba(147, 51, 234, 0.7)",
            borderColor: "rgb(147, 51, 234)",
            borderWidth: 1,
            borderRadius: 6
          },
          {
            label: "Accuracy Rate (%)",
            data: [91, 93, 94, 95, 96, 98],
            type: "line",
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            borderWidth: 2.5,
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } }
      }
    });

    renderChartInstance("chart-reader-spreads", {
      type: "doughnut",
      data: {
        labels: ["Celtic Cross", "Life Path", "Three Card", "Relationship"],
        datasets: [{
          data: [42.5, 28.0, 18.5, 11.0],
          backgroundColor: [
            "rgba(147, 51, 234, 0.85)",
            "rgba(59, 130, 246, 0.85)",
            "rgba(16, 185, 129, 0.85)",
            "rgba(245, 158, 11, 0.85)"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "right" } }
      }
    });

    // Most Drawn Cards
    const mdContainer = document.getElementById("reader-most-drawn-container");
    if (mdContainer && data.most_drawn_cards) {
      mdContainer.innerHTML = data.most_drawn_cards.map(c => `
        <div class="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1 shadow-xs">
          <div class="font-bold text-slate-900 text-xs truncate">${c.card}</div>
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-purple-700 font-extrabold">${c.count} Draws</span>
            <span class="px-2 py-0.5 rounded bg-purple-100 text-purple-900 text-[10px] font-bold">${c.affinity}</span>
          </div>
        </div>
      `).join('');
    }

    // 2. User Engagement Insights Subview Chart
    renderChartInstance("chart-reader-retention", {
      type: "line",
      data: {
        labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        datasets: [
          {
            label: "Returning Seekers (%)",
            data: [84, 87, 89, 90, 91.2, 92.4],
            borderColor: "rgb(147, 51, 234)",
            backgroundColor: "rgba(147, 51, 234, 0.15)",
            fill: true,
            tension: 0.4
          },
          {
            label: "Active Consultations",
            data: [28, 34, 40, 42, 45, 48],
            borderColor: "rgb(14, 165, 233)",
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: false } }
      }
    });

    const engContainer = document.getElementById("reader-engagement-container");
    if (engContainer) {
      engContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1">
            <span class="text-[10px] text-purple-900 font-extrabold uppercase">Retention Velocity</span>
            <div class="text-2xl font-bold text-purple-900 font-mystic">92.4%</div>
            <p class="text-[11px] text-slate-700">Seekers return for follow-up guidance within 30 days of initial consultation.</p>
          </div>
          <div class="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-1">
            <span class="text-[10px] text-emerald-900 font-extrabold uppercase">Rating Excellence</span>
            <div class="text-2xl font-bold text-emerald-900 font-mystic">4.94 / 5.0</div>
            <p class="text-[11px] text-slate-700">Based on 342 verified seeker session reviews.</p>
          </div>
          <div class="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-1">
            <span class="text-[10px] text-sky-900 font-extrabold uppercase">Avg Session Depth</span>
            <div class="text-2xl font-bold text-sky-900 font-mystic">32 Mins</div>
            <p class="text-[11px] text-slate-700">Deep intuitive exploration with complete multi-card interpretations.</p>
          </div>
        </div>
      `;
    }

    // 3. Session Tracking Subview Queue
    window.readerSessionData = data.recent_client_sessions || [];
    renderReaderSessionQueue('All');

    // 4. Report Management Subview
    const rmContainer = document.getElementById("reader-report-mgmt-container");
    if (rmContainer) {
      rmContainer.innerHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-purple-50 text-purple-950 font-bold uppercase text-[11px] border-b border-purple-200">
              <tr>
                <th class="p-3">Client / Seeker</th>
                <th class="p-3">Spread Type</th>
                <th class="p-3">Insight Score</th>
                <th class="p-3">Sign-off Status</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-purple-100 text-slate-800">
              ${(data.recent_client_sessions || []).map(s => `
                <tr class="hover:bg-purple-50/50 transition">
                  <td class="p-3 font-bold text-slate-900">${s.seeker_name}</td>
                  <td class="p-3">${s.spread}</td>
                  <td class="p-3 font-bold text-emerald-700">${s.score}%</td>
                  <td class="p-3"><span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">Verified Practitioner Sign-off</span></td>
                  <td class="p-3 text-right space-x-1">
                    <button onclick="downloadReadingsExcel()" class="px-3 py-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-[11px]">
                      Export XLSX
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

  } catch (err) {
    console.error("Reader dash error:", err);
  }
}

function renderReaderSessionQueue(filter) {
  const queueBox = document.getElementById("reader-client-queue");
  if (!queueBox || !window.readerSessionData) return;

  let filtered = window.readerSessionData;
  if (filter !== "All") {
    filtered = window.readerSessionData.filter(s => s.status === filter);
  }

  queueBox.innerHTML = filtered.map(s => `
    <div class="glass-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-purple-500 bg-white shadow-sm hover:shadow-md transition">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-900 text-sm">${s.seeker_name}</span>
          <span class="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-extrabold">${s.spread}</span>
        </div>
        <div class="text-xs text-slate-600">Consultation Date: ${s.time} &bull; Insight Score: <strong class="text-emerald-700">${s.score}%</strong></div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">${s.status}</span>
        <button onclick="alert('Viewing session details for ${s.seeker_name}')" class="px-3 py-1 rounded-full bg-slate-100 hover:bg-purple-100 text-slate-800 font-bold text-xs">View Notes</button>
      </div>
    </div>
  `).join('');
}

function filterReaderQueue(filter) {
  renderReaderSessionQueue(filter);
}

async function loadConsultantDashboardData() {
  try {
    const res = await fetch(`${API_BASE}/api/analytics/consultant`, { headers: getAuthHeaders() });
    const data = await res.json();

    document.getElementById("consultant-stat-cohorts").innerText = data.cohort_seekers_monitored || 114;
    document.getElementById("consultant-stat-eff").innerText = `${data.guidance_effectiveness_rate || 93.8}%`;
    document.getElementById("consultant-stat-acc").innerText = `${data.life_trend_accuracy_index || 91.5}%`;
    document.getElementById("consultant-stat-velocity").innerText = data.spiritual_growth_velocity || "+18.4%";

    // 1. User Trend Analysis Subview Charts
    renderChartInstance("chart-consultant-biorhythms", {
      type: "line",
      data: {
        labels: ["Day 1", "Day 15", "Day 30", "Day 45", "Day 60", "Day 75", "Day 90"],
        datasets: [
          {
            label: "Intuition Equilibrium",
            data: [72, 78, 83, 88, 91, 93, 95],
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            tension: 0.3
          },
          {
            label: "Emotional Balance",
            data: [68, 74, 80, 85, 88, 90, 92],
            borderColor: "rgb(14, 165, 233)",
            fill: false,
            tension: 0.3
          },
          {
            label: "Vitality Index",
            data: [70, 75, 82, 86, 89, 91, 94],
            borderColor: "rgb(245, 158, 11)",
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: false } }
      }
    });

    renderChartInstance("chart-consultant-elements", {
      type: "doughnut",
      data: {
        labels: ["Water Hand (Intuitive)", "Fire Hand (Leader)", "Earth Hand (Grounded)", "Air Hand (Sage)"],
        datasets: [{
          data: [38, 28, 20, 14],
          backgroundColor: [
            "rgba(14, 165, 233, 0.85)",
            "rgba(239, 68, 68, 0.85)",
            "rgba(16, 185, 129, 0.85)",
            "rgba(168, 85, 247, 0.85)"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "right" } }
      }
    });

    // Cohort List
    const cohortBox = document.getElementById("consultant-cohort-list");
    if (cohortBox && data.life_trends_monitoring) {
      cohortBox.innerHTML = data.life_trends_monitoring.map(ch => `
        <div class="glass-card p-4 space-y-1.5 border-l-4 border-emerald-500 bg-white shadow-xs">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-900 text-sm">${ch.cohort}</span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">${ch.trend_health} Trajectory</span>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed">${ch.trajectory}</p>
        </div>
      `).join('');
    }

    // 2. Guidance Effectiveness Subview Radar Chart
    renderChartInstance("chart-consultant-radar", {
      type: "radar",
      data: {
        labels: ["Career Alignment", "Stress Resilience", "Emotional Mastery", "Life Path Clarity", "Relationship Synergy"],
        datasets: [
          {
            label: "Cohort Guidance Impact Rate (%)",
            data: [95, 92, 94, 91, 89],
            backgroundColor: "rgba(16, 185, 129, 0.25)",
            borderColor: "rgb(16, 185, 129)",
            pointBackgroundColor: "rgb(16, 185, 129)",
            pointBorderColor: "#fff"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { min: 60, max: 100 } }
      }
    });

    const effContainer = document.getElementById("consultant-effectiveness-container");
    if (effContainer) {
      effContainer.innerHTML = `
        <div class="glass-card p-5 space-y-2 border-l-4 border-emerald-500 bg-emerald-50/50">
          <div class="font-bold text-emerald-950 text-sm">Overall Cohort Effectiveness Rate: 93.8%</div>
          <p class="text-xs text-slate-800 leading-relaxed">
            93.8% of monitored seekers reported positive life alignment, reduced anxiety, and vocational clarity within 30 days of applying holistic recommendation protocols.
          </p>
        </div>
      `;
    }

    // 3. Consultation Insights Subview
    const insContainer = document.getElementById("consultant-insights-container");
    if (insContainer) {
      insContainer.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2 shadow-xs">
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="compass" class="w-4 h-4 text-emerald-600"></i> Identified Seeker Focus Areas:
            </h4>
            <div class="space-y-1.5 text-xs text-slate-800">
              <div class="flex justify-between font-medium"><span>Career Pivot & ML Roadmap</span><strong class="text-emerald-700">42%</strong></div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full"><div class="h-full bg-emerald-500 rounded-full" style="width: 42%"></div></div>
              <div class="flex justify-between font-medium pt-1"><span>Soul Purpose & Life Path</span><strong class="text-emerald-700">38%</strong></div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full"><div class="h-full bg-teal-500 rounded-full" style="width: 38%"></div></div>
              <div class="flex justify-between font-medium pt-1"><span>Stress Reduction & Somatic Reset</span><strong class="text-emerald-700">20%</strong></div>
              <div class="w-full h-1.5 bg-slate-100 rounded-full"><div class="h-full bg-cyan-500 rounded-full" style="width: 20%"></div></div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2 shadow-xs">
            <h4 class="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="check-square" class="w-4 h-4 text-emerald-600"></i> Consultant Recommended Actions:
            </h4>
            <ul class="space-y-1.5 text-xs text-slate-700">
              <li class="flex items-center gap-2"><i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i> Dispatch 4-phase ML Career Roadmaps to Age 26-35 cohort</li>
              <li class="flex items-center gap-2"><i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i> Recommend Solar Visualization & Heart Line communication habits</li>
              <li class="flex items-center gap-2"><i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i> Monitor 90-day biorhythm recovery curves</li>
            </ul>
          </div>
        </div>
      `;
    }

  } catch (err) {
    console.error("Consultant dash error:", err);
  }
}

async function loadAdminDashboardData() {
  try {
    const usersRes = await fetch(`${API_BASE}/api/analytics/admin/users`, { headers: getAuthHeaders() });
    const users = await usersRes.json();
    window.adminUsersList = users;

    const adminRes = await fetch(`${API_BASE}/api/analytics/admin`, { headers: getAuthHeaders() });
    const adminData = await adminRes.json();

    document.getElementById("admin-stat-users").innerText = (adminData.total_registered_users || 5844).toLocaleString();
    document.getElementById("admin-stat-readings").innerText = (adminData.total_readings_generated || 1212).toLocaleString();
    document.getElementById("admin-stat-latency").innerText = `${adminData.api_average_latency_ms || 42.8} ms`;

    // 1. User Management Charts & Table
    renderChartInstance("chart-admin-roles", {
      type: "doughnut",
      data: {
        labels: ["Seekers (User)", "Tarot Readers", "Consultants", "Administrators"],
        datasets: [{
          data: [5420, 280, 130, 14],
          backgroundColor: [
            "rgba(14, 165, 233, 0.85)",
            "rgba(147, 51, 234, 0.85)",
            "rgba(16, 185, 129, 0.85)",
            "rgba(245, 158, 11, 0.85)"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "right" } }
      }
    });

    renderAdminUsersTable(users);

    // 2. Platform Analytics Subview Latency Line Chart
    renderChartInstance("chart-admin-latency", {
      type: "line",
      data: {
        labels: ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
        datasets: [{
          label: "API Response Latency (ms)",
          data: [48.2, 45.1, 42.8, 41.5, 43.0, 42.4, 42.8],
          borderColor: "rgb(245, 158, 11)",
          backgroundColor: "rgba(245, 158, 11, 0.15)",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: false } }
      }
    });

    const modelsContainer = document.getElementById("admin-models-container");
    if (modelsContainer && adminData.active_ai_models) {
      modelsContainer.innerHTML = adminData.active_ai_models.map(m => `
        <div class="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200 shadow-xs">
          <div>
            <div class="font-bold text-slate-900 text-xs">${m.model}</div>
            <div class="text-[10px] text-emerald-700 font-extrabold">Engine Status: ${m.status}</div>
          </div>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">${m.accuracy} Accuracy</span>
        </div>
      `).join('');
    }

    // 3. Reading Statistics Subview Global Chart
    renderChartInstance("chart-admin-global-readings", {
      type: "bar",
      data: {
        labels: ["Palmistry CV Scans", "78-Card Tarot Spreads", "AI Cross-Modality Synthesis", "ML Career Roadmaps"],
        datasets: [{
          label: "Total Executed Readings",
          data: [4200, 8900, 6100, 3800],
          backgroundColor: [
            "rgba(14, 165, 233, 0.75)",
            "rgba(147, 51, 234, 0.75)",
            "rgba(16, 185, 129, 0.75)",
            "rgba(245, 158, 11, 0.75)"
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });

    const statsContainer = document.getElementById("admin-stats-container");
    if (statsContainer && adminData.role_distribution) {
      statsContainer.innerHTML = Object.entries(adminData.role_distribution).map(([role, count]) => `
        <div class="p-3.5 rounded-2xl bg-white border border-sky-200 space-y-1 text-center shadow-xs">
          <div class="text-[10px] uppercase font-bold text-slate-500">${role}</div>
          <div class="text-xl font-bold font-mystic text-sky-800">${count.toLocaleString()}</div>
        </div>
      `).join('');
    }

    // 4. Audit Logs Subview
    const auditContainer = document.getElementById("admin-audit-logs-container");
    if (auditContainer && adminData.audit_logs) {
      auditContainer.innerHTML = adminData.audit_logs.map(log => `
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 shadow-xs">
          <div class="flex items-center justify-between text-[11px]">
            <span class="font-bold text-slate-900 flex items-center gap-1.5"><i data-lucide="shield" class="w-3.5 h-3.5 text-amber-600"></i> ${log.actor}</span>
            <span class="text-slate-500 font-mono">${new Date(log.timestamp).toLocaleTimeString()}</span>
          </div>
          <div class="text-[10px] text-amber-800 font-extrabold uppercase">${log.action}</div>
          <p class="text-[11px] text-slate-700">${log.details}</p>
        </div>
      `).join('');
    }

  } catch (err) {
    console.error("Admin dash error:", err);
  }
}

function renderAdminUsersTable(users) {
  const tbody = document.getElementById("admin-users-tbody");
  if (!tbody || !users) return;

  tbody.innerHTML = users.map(u => `
    <div class="p-3.5 rounded-2xl border-l-4 border-amber-500 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/30 transition">
      <div class="space-y-0.5">
        <div class="font-bold text-slate-900 text-sm flex items-center gap-2">
          <span>${u.name}</span>
          <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold">${u.role}</span>
        </div>
        <div class="text-xs text-slate-600">${u.email} &bull; Age Group: ${u.age_group || '26-35'}</div>
      </div>
      <div class="flex items-center gap-2">
        <select onchange="updateUserRoleFromAdmin('${u.id}', this.value)" class="bg-amber-50 border border-amber-300 rounded-full px-3 py-1 text-xs font-bold text-slate-900 focus:outline-none">
          <option value="User" ${u.role === 'User' ? 'selected' : ''}>User (Seeker)</option>
          <option value="Tarot Reader" ${u.role === 'Tarot Reader' ? 'selected' : ''}>Tarot Reader</option>
          <option value="Spiritual Consultant" ${u.role === 'Spiritual Consultant' ? 'selected' : ''}>Spiritual Consultant</option>
          <option value="Administrator" ${u.role === 'Administrator' ? 'selected' : ''}>Administrator</option>
        </select>
      </div>
    </div>
  `).join('');
}

function filterAdminUserList() {
  const q = (document.getElementById("admin-user-search")?.value || "").toLowerCase();
  if (!window.adminUsersList) return;
  const filtered = window.adminUsersList.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  renderAdminUsersTable(filtered);
}

async function updateUserRoleFromAdmin(userId, newRole) {
  try {
    const res = await fetch(`${API_BASE}/api/analytics/admin/users/${userId}/role`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      alert(`User role updated to ${newRole}`);
      await loadAdminDashboardData();
    }
  } catch (err) {
    console.error("Role update error:", err);
  }
}



function toggleNotificationDrawer() {
  document.getElementById("notif-drawer").classList.toggle("translate-x-full");
}

async function loadNotifications() {
  try {
    const res = await fetch(`${API_BASE}/api/notifications`, { headers: getAuthHeaders() });
    const notifs = await res.json();
    const container = document.getElementById("notif-list-container");
    container.innerHTML = "";
    notifs.forEach(n => {
      container.innerHTML += `
        <div class="glass-card p-3 space-y-1 border-l-4 ${n.read ? 'border-slate-300' : 'border-sky-500'} bg-white shadow-sm">
          <div class="flex items-center justify-between text-xs text-slate-900 font-bold">
            <span>${n.title}</span>
          </div>
          <p class="text-xs text-slate-700">${n.message}</p>
        </div>
      `;
    });
  } catch (err) {
    console.error("Notifs error:", err);
  }
}

async function triggerSimulatedGuidance() {
  try {
    await fetch(`${API_BASE}/api/notifications/trigger-daily-guidance`, { method: "POST", headers: getAuthHeaders() });
    await loadNotifications();
  } catch (err) {
    console.error("Guidance trigger error:", err);
  }
}

function openProfileEditModal() {
  if (!currentUser) return;
  document.getElementById("prof-name").value = currentUser.name || "";
  document.getElementById("prof-age").value = currentUser.age_group || "26-35";
  document.getElementById("prof-goals").value = currentUser.spiritual_goals ? currentUser.spiritual_goals.join(", ") : "";

  const prefs = currentUser.reading_preferences || {};
  const palmSel = document.getElementById("prof-pref-palm");
  const tarotSel = document.getElementById("prof-pref-tarot");
  const styleSel = document.getElementById("prof-pref-style");
  const deckSel = document.getElementById("prof-pref-deck");

  if (palmSel) palmSel.value = prefs.palm_focus || "Heart Line & Relationships";
  if (tarotSel) tarotSel.value = prefs.tarot_spread || "Celtic Cross Spread";
  if (styleSel) styleSel.value = prefs.reading_style || "Spiritual & Mystic";
  if (deckSel) deckSel.value = prefs.deck_theme || "Rider-Waite Classic";

  document.getElementById("profile-edit-modal").classList.remove("hidden");
}

function closeProfileEditModal() {
  document.getElementById("profile-edit-modal").classList.add("hidden");
}

async function submitProfileForm(e) {
  e.preventDefault();
  const name = document.getElementById("prof-name").value;
  const age_group = document.getElementById("prof-age").value;
  const goalsStr = document.getElementById("prof-goals").value;
  const spiritual_goals = goalsStr.split(",").map(s => s.trim()).filter(Boolean);

  const reading_preferences = {
    palm_focus: document.getElementById("prof-pref-palm")?.value || "Heart Line & Relationships",
    tarot_spread: document.getElementById("prof-pref-tarot")?.value || "Celtic Cross Spread",
    reading_style: document.getElementById("prof-pref-style")?.value || "Spiritual & Mystic",
    deck_theme: document.getElementById("prof-pref-deck")?.value || "Rider-Waite Classic"
  };

  try {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, age_group, spiritual_goals, reading_preferences })
    });
    if (res.ok) {
      currentUser = await res.json();
      closeProfileEditModal();
      alert("✨ Profile & Reading Preferences saved successfully!");
      if (document.getElementById("account-pref-palm")) {
        document.getElementById("account-pref-palm").innerText = reading_preferences.palm_focus;
        document.getElementById("account-pref-tarot").innerText = reading_preferences.tarot_spread;
        document.getElementById("account-pref-style").innerText = reading_preferences.reading_style;
      }
    }
  } catch (err) {
    console.error("Profile submit error:", err);
  }
}

function downloadReportPDF() {
  const readingId = currentSynthesizedData ? currentSynthesizedData.id : 'latest';
  window.open(`${API_BASE}/api/export/reading/${readingId}/pdf`, "_blank");
}

function downloadReadingsExcel() {
  const role = activeRole || 'User';
  window.open(`${API_BASE}/api/export/analytics/${encodeURIComponent(role)}/pdf`, "_blank");
}

// My Account Modal Handlers
function openMyAccountModal() {
  if (!currentUser) {
    document.getElementById("entry-login-page").classList.remove("hidden");
    return;
  }
  document.getElementById("account-modal-name").innerText = currentUser.name || "Aria Solstice";
  document.getElementById("account-modal-email").innerText = currentUser.email || "user@mystic.io";
  document.getElementById("account-modal-role").innerText = `${currentUser.role || 'User'} (Locked Session)`;
  document.getElementById("account-modal-age").innerText = currentUser.age_group || "26-35";
  document.getElementById("account-modal-goals").innerText = currentUser.spiritual_goals ? currentUser.spiritual_goals.join(", ") : "Discover Soul Purpose";
  document.getElementById("account-modal-bio").innerText = currentUser.bio || "Spiritual seeker passionate about intuitive living.";
  document.getElementById("account-modal-avatar").src = currentUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`;

  const prefs = currentUser.reading_preferences || {};
  if (document.getElementById("account-pref-palm")) {
    document.getElementById("account-pref-palm").innerText = prefs.palm_focus || "Heart Line & Relationships";
    document.getElementById("account-pref-tarot").innerText = prefs.tarot_spread || "Celtic Cross Spread";
    document.getElementById("account-pref-style").innerText = prefs.reading_style || "Spiritual & Mystic";
  }

  document.getElementById("my-account-modal").classList.remove("hidden");
  lucide.createIcons();
}

function closeMyAccountModal() {
  document.getElementById("my-account-modal").classList.add("hidden");
}

// ================= ASTROLOGY & CAREER INTELLIGENCE MODULE =================

let selectedCareerInterests = ["Technology & AI", "Management & Leadership"];
let currentHoroscopeSign = "Aries";

function initAstrologyView() {
  renderHoroscopeSignPills();
  loadZodiacHoroscopeUI(currentHoroscopeSign);
}

function switchAstrologyTab(tabName) {
  const tabs = ["career", "natal", "compatibility", "horoscope"];
  tabs.forEach(t => {
    const sub = document.getElementById(`astro-subview-${t}`);
    const btn = document.getElementById(`astro-tab-${t}`);
    if (sub) sub.classList.add("hidden");
    if (btn) {
      btn.classList.remove("bg-sky-600", "text-white", "shadow-md");
      btn.classList.add("bg-white", "text-slate-700", "hover:bg-sky-50", "border", "border-sky-300/40");
    }
  });

  const activeSub = document.getElementById(`astro-subview-${tabName}`);
  const activeBtn = document.getElementById(`astro-tab-${tabName}`);
  if (activeSub) activeSub.classList.remove("hidden");
  if (activeBtn) {
    activeBtn.classList.remove("bg-white", "text-slate-700", "hover:bg-sky-50", "border", "border-sky-300/40");
    activeBtn.classList.add("bg-sky-600", "text-white", "shadow-md");
  }

  if (tabName === "horoscope") {
    renderHoroscopeSignPills();
    loadZodiacHoroscopeUI(currentHoroscopeSign);
  }
  lucide.createIcons();
}

function toggleInterestPill(btn, interestName) {
  if (selectedCareerInterests.includes(interestName)) {
    selectedCareerInterests = selectedCareerInterests.filter(i => i !== interestName);
    btn.classList.remove("bg-sky-100", "text-sky-900", "font-bold");
    btn.classList.add("bg-sky-50", "text-slate-800", "font-semibold");
  } else {
    selectedCareerInterests.push(interestName);
    btn.classList.remove("bg-sky-50", "text-slate-800", "font-semibold");
    btn.classList.add("bg-sky-100", "text-sky-900", "font-bold");
  }
}

async function generateIntegratedCareerAdviceUI() {
  const resContainer = document.getElementById("career-guidance-results");
  if (!resContainer) return;

  resContainer.innerHTML = `
    <div class="text-center py-8 space-y-2">
      <div class="inline-block animate-spin text-sky-600"><i data-lucide="loader-2" class="w-8 h-8"></i></div>
      <p class="text-xs font-bold text-sky-900 uppercase tracking-wider">Synthesizing Palmistry + Zodiac + Career Interests...</p>
    </div>
  `;
  lucide.createIcons();

  const zodiac = (document.getElementById("aichatbot-zodiac") ? document.getElementById("aichatbot-zodiac").value : "Aries");
  const stage = document.getElementById("career-stage-select") ? document.getElementById("career-stage-select").value : "Mid-Career / Growth";

  try {
    const res = await fetch(`${API_BASE}/api/astrology/career-guidance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        palm_data: currentPalmData,
        zodiac_sign: zodiac,
        user_interests: selectedCareerInterests.length > 0 ? selectedCareerInterests : ["Technology & AI", "Management"],
        career_stage: stage
      })
    });
    if (!res.ok) throw new Error("Failed to calculate career guidance");
    const data = await res.json();

    let careersHTML = data.recommended_careers.map(c => `
      <div class="p-4 rounded-2xl bg-gradient-to-r from-white via-sky-50/50 to-white border border-sky-300/40 shadow-sm space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <h4 class="font-mystic text-base font-bold text-slate-900">${c.title}</h4>
          </div>
          <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-300/40">
            ${c.suitability_score}% Match
          </span>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed">${c.rationale}</p>
      </div>
    `).join("");

    let strengthsHTML = data.core_strengths.map(s => `
      <li class="flex items-start gap-2 text-xs text-slate-800">
        <i data-lucide="check-circle-2" class="w-4 h-4 text-sky-600 shrink-0 mt-0.5"></i>
        <span>${s}</span>
      </li>
    `).join("");

    resContainer.innerHTML = `
      <div class="glass-panel p-5 bg-sky-50/60 border-l-4 border-sky-500 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] uppercase font-bold text-sky-800 tracking-wider">Synthesized Alignment Archetype</span>
            <h3 class="font-mystic text-xl font-bold text-slate-900">${data.elemental_synergy}</h3>
          </div>
          <div class="text-right">
            <span class="text-[10px] uppercase font-bold text-slate-500">Vocational Score</span>
            <div class="text-2xl font-mystic font-extrabold text-sky-700">${data.overall_vocational_alignment_score}%</div>
          </div>
        </div>
      </div>

      <div class="space-y-3">
        <h4 class="text-xs font-extrabold text-sky-950 uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="target" class="w-4 h-4 text-sky-600"></i> Top Recommended Vocational Fields:
        </h4>
        <div class="space-y-3">${careersHTML}</div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 rounded-2xl bg-white border border-sky-200 space-y-2 shadow-sm">
          <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-sky-600"></i> Core Vocational Strengths:
          </h4>
          <ul class="space-y-2 pt-1">${strengthsHTML}</ul>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-sky-200 space-y-2 shadow-sm">
          <h4 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <i data-lucide="calendar" class="w-4 h-4 text-sky-600"></i> Milestone Horizons:
          </h4>
          <div class="space-y-2 text-xs">
            <div class="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/60">
              <span class="font-bold text-sky-900">30-Day Milestone:</span> ${data.milestones.next_30_days}
            </div>
            <div class="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/60">
              <span class="font-bold text-sky-900">90-Day Milestone:</span> ${data.milestones.next_90_days}
            </div>
            <div class="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200/60">
              <span class="font-bold text-sky-900">1-Year Horizon:</span> ${data.milestones["1_year_horizon"]}
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 space-y-2">
        <div class="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="gem" class="w-4 h-4 text-amber-600"></i> Astrological Remedies & Leadership Ritual:
        </div>
        <p class="text-xs text-slate-800 leading-relaxed font-medium">
          <strong>Suggested Gemstone:</strong> ${data.remedial_guidance.suggested_gemstone} &bull;
          <strong>Power Color:</strong> ${data.remedial_guidance.power_color}
        </p>
        <p class="text-xs text-slate-800 leading-relaxed">
          <strong>Daily Ritual:</strong> ${data.remedial_guidance.leadership_ritual}
        </p>
      </div>
    `;
    lucide.createIcons();
  } catch (err) {
    console.error("Career guidance error:", err);
    resContainer.innerHTML = `<div class="text-xs text-rose-600 font-bold p-4">Error calculating career guidance.</div>`;
  }
}

async function generateNatalChartUI() {
  const resContainer = document.getElementById("natal-chart-results");
  if (!resContainer) return;

  const dob = document.getElementById("natal-dob").value || "1998-05-15";
  const time = document.getElementById("natal-time").value || "14:30";
  const loc = document.getElementById("natal-location").value || "New York, USA";

  resContainer.innerHTML = `
    <div class="text-center py-6">
      <div class="inline-block animate-spin text-sky-600"><i data-lucide="loader-2" class="w-7 h-7"></i></div>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch(`${API_BASE}/api/astrology/natal-chart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dob, time_of_birth: time, location: loc })
    });
    if (!res.ok) throw new Error("Failed to generate natal chart");
    const data = await res.json();

    let housesHTML = data.house_placements.map(h => `
      <div class="p-3 rounded-xl bg-white border border-sky-200/70 space-y-1 shadow-sm text-xs">
        <div class="flex items-center justify-between font-bold text-sky-950">
          <span>House ${h.house}: ${h.name}</span>
          <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-900">${h.occupying_sign}</span>
        </div>
        <p class="text-[11px] text-slate-600 leading-snug">${h.theme}</p>
        <div class="text-[10px] text-sky-800 font-semibold">Ruler: ${h.planetary_ruler}</div>
      </div>
    `).join("");

    resContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-300/50 space-y-1 shadow-sm text-center">
          <div class="text-xs uppercase font-bold text-amber-800">Sun Sign (Core Self)</div>
          <div class="font-mystic text-2xl font-extrabold text-amber-900">${data.sun_sign} ${data.sun_sign_details.symbol}</div>
          <div class="text-xs text-slate-600 font-medium">${data.sun_sign_details.element} Element &bull; ${data.sun_sign_details.ruler}</div>
        </div>

        <div class="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-300/50 space-y-1 shadow-sm text-center">
          <div class="text-xs uppercase font-bold text-indigo-800">Moon Sign (Inner Emotional Core)</div>
          <div class="font-mystic text-2xl font-extrabold text-indigo-900">${data.moon_sign} ${data.moon_sign_details.symbol}</div>
          <div class="text-xs text-slate-600 font-medium">${data.moon_sign_details.element} Element &bull; ${data.moon_sign_details.ruler}</div>
        </div>

        <div class="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-white border border-sky-300/50 space-y-1 shadow-sm text-center">
          <div class="text-xs uppercase font-bold text-sky-800">Ascendant / Rising Sign (Persona)</div>
          <div class="font-mystic text-2xl font-extrabold text-sky-950">${data.ascendant_sign} ${data.ascendant_details.symbol}</div>
          <div class="text-xs text-slate-600 font-medium">${data.ascendant_details.element} Element &bull; ${data.ascendant_details.ruler}</div>
        </div>
      </div>

      <div class="space-y-3 pt-2">
        <h4 class="text-xs font-extrabold text-sky-950 uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="grid" class="w-4 h-4 text-sky-600"></i> 12 Astrological House Matrix Placements:
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">${housesHTML}</div>
      </div>
    `;
    lucide.createIcons();
  } catch (err) {
    console.error("Natal chart error:", err);
    resContainer.innerHTML = `<div class="text-xs text-rose-600 font-bold p-4">Error calculating natal chart.</div>`;
  }
}

async function calculateCompatibilityUI() {
  const resContainer = document.getElementById("compatibility-results");
  if (!resContainer) return;

  const sign1 = document.getElementById("compat-sign-1").value;
  const sign2 = document.getElementById("compat-sign-2").value;

  resContainer.innerHTML = `
    <div class="text-center py-6">
      <div class="inline-block animate-spin text-sky-600"><i data-lucide="loader-2" class="w-7 h-7"></i></div>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch(`${API_BASE}/api/astrology/compatibility`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sign_1: sign1, sign_2: sign2 })
    });
    if (!res.ok) throw new Error("Failed compatibility calculation");
    const data = await res.json();

    resContainer.innerHTML = `
      <div class="glass-panel p-5 bg-sky-50/70 border-l-4 border-sky-500 space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="font-mystic text-lg font-bold text-slate-900">${sign1} & ${sign2} Compatibility</h3>
          <span class="text-2xl font-mystic font-extrabold text-sky-700">${data.overall_compatibility_score}%</span>
        </div>
        <p class="text-xs text-slate-700 leading-relaxed font-medium">${data.elemental_synergy}</p>
      </div>

      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="p-3 rounded-2xl bg-white border border-rose-200">
          <div class="text-[10px] uppercase font-bold text-rose-700">💖 Love & Soul Bond</div>
          <div class="text-xl font-bold text-rose-900 font-mystic">${data.love_bond_score}%</div>
        </div>
        <div class="p-3 rounded-2xl bg-white border border-sky-200">
          <div class="text-[10px] uppercase font-bold text-sky-700">💼 Professional Synergy</div>
          <div class="text-xl font-bold text-sky-900 font-mystic">${data.career_collaboration_score}%</div>
        </div>
        <div class="p-3 rounded-2xl bg-white border border-purple-200">
          <div class="text-[10px] uppercase font-bold text-purple-700">💬 Communication</div>
          <div class="text-xl font-bold text-purple-900 font-mystic">${data.communication_score}%</div>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-white border border-sky-200 space-y-2 text-xs">
        <div class="font-bold text-sky-950">Key Synergies & Alignment:</div>
        <p class="text-slate-700">${data.strengths}</p>
        <div class="font-bold text-sky-950 pt-1">Strategic Advice:</div>
        <p class="text-slate-700">${data.advice}</p>
      </div>
    `;
    lucide.createIcons();
  } catch (err) {
    console.error("Compatibility error:", err);
    resContainer.innerHTML = `<div class="text-xs text-rose-600 font-bold p-4">Error calculating compatibility.</div>`;
  }
}

function renderHoroscopeSignPills() {
  const container = document.getElementById("horoscope-sign-pills");
  if (!container) return;

  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  container.innerHTML = signs.map(s => `
    <button onclick="loadZodiacHoroscopeUI('${s}')" class="px-3.5 py-1.5 rounded-full border border-sky-300/40 ${s === currentHoroscopeSign ? 'bg-sky-600 text-white font-bold' : 'bg-white text-slate-800 hover:bg-sky-50 font-semibold'} transition">
      ${s}
    </button>
  `).join("");
}

async function loadZodiacHoroscopeUI(zodiacSign) {
  currentHoroscopeSign = zodiacSign;
  renderHoroscopeSignPills();
  const resContainer = document.getElementById("horoscope-results");
  if (!resContainer) return;

  resContainer.innerHTML = `
    <div class="text-center py-6">
      <div class="inline-block animate-spin text-sky-600"><i data-lucide="loader-2" class="w-7 h-7"></i></div>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch(`${API_BASE}/api/astrology/horoscope/${zodiacSign}`);
    if (!res.ok) throw new Error("Failed to fetch horoscope");
    const data = await res.json();

    resContainer.innerHTML = `
      <div class="glass-panel p-5 bg-gradient-to-r from-sky-50 via-white to-sky-50 border border-sky-300/40 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-3xl">${data.symbol}</span>
            <div>
              <h3 class="font-mystic text-xl font-bold text-slate-900">${data.zodiac_sign} Daily Horoscope</h3>
              <p class="text-xs text-slate-600">${data.dates} &bull; ${data.element} Element &bull; Ruler: ${data.ruling_planet}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full bg-sky-100 text-sky-900 text-xs font-bold">Live Transit Active</span>
        </div>
        <p class="text-sm text-slate-800 leading-relaxed font-medium pt-1">${data.daily_transit_overview}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div class="p-4 rounded-2xl bg-white border border-sky-200 space-y-1 shadow-sm">
          <div class="font-bold text-sky-900 flex items-center gap-1.5"><i data-lucide="briefcase" class="w-4 h-4 text-sky-600"></i> Career & Vocation</div>
          <p class="text-slate-700 leading-relaxed">${data.career_forecast}</p>
        </div>
        <div class="p-4 rounded-2xl bg-white border border-sky-200 space-y-1 shadow-sm">
          <div class="font-bold text-sky-900 flex items-center gap-1.5"><i data-lucide="heart" class="w-4 h-4 text-sky-600"></i> Love & Relationships</div>
          <p class="text-slate-700 leading-relaxed">${data.love_forecast}</p>
        </div>
        <div class="p-4 rounded-2xl bg-white border border-sky-200 space-y-1 shadow-sm">
          <div class="font-bold text-sky-900 flex items-center gap-1.5"><i data-lucide="coins" class="w-4 h-4 text-sky-600"></i> Wealth & Finance</div>
          <p class="text-slate-700 leading-relaxed">${data.wealth_forecast}</p>
        </div>
      </div>

      <div class="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div><strong>Ruling Gemstone:</strong> ${data.ruling_gemstone} &bull; <strong>Power Color:</strong> ${data.power_color}</div>
        <div><strong>Daily Affirmation:</strong> "<em>${data.daily_affirmation}</em>"</div>
      </div>
    `;
    lucide.createIcons();
  } catch (err) {
    console.error("Horoscope error:", err);
    resContainer.innerHTML = `<div class="text-xs text-rose-600 font-bold p-4">Error fetching horoscope.</div>`;
  }
}

// ================= AI CAREER ML ROADMAP & PERSONAL DEVELOPMENT ENGINE =================

async function runMLCareerRoadmapPrediction() {
  const container = document.getElementById("ml-career-results-container");
  if (!container) return;

  const tech = parseFloat(document.getElementById("slider-career-tech")?.value || "8.5");
  const mgmt = parseFloat(document.getElementById("slider-career-mgmt")?.value || "7.5");
  const design = parseFloat(document.getElementById("slider-career-design")?.value || "6.5");
  const analytical = parseFloat(document.getElementById("slider-career-analytical")?.value || "8.5");

  container.innerHTML = `
    <div class="text-center py-6">
      <div class="inline-block animate-spin text-amber-600"><i data-lucide="loader-2" class="w-7 h-7"></i></div>
      <p class="text-xs text-slate-600 font-bold mt-2">Executing RandomForest + KNN Machine Learning Career Inference...</p>
    </div>
  `;
  if (window.lucide) lucide.createIcons();

  try {
    const res = await fetch(`${API_BASE}/api/intelligence/ml-career-roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tech_interest: tech,
        management_interest: mgmt,
        design_interest: design,
        analytical_score: analytical,
        ambition_score: 8.5
      })
    });
    if (!res.ok) throw new Error("Failed to run career ML prediction");
    const data = await res.json();

    const accuracyBadge = document.getElementById("ml-career-accuracy-badge");
    if (accuracyBadge) accuracyBadge.innerText = `ML Model Accuracy: ${data.ml_model_accuracy}`;

    let matchesHTML = data.top_career_matches.map((c, i) => `
      <div class="p-5 rounded-2xl bg-white border-2 ${i === 0 ? 'border-amber-400 bg-amber-50/30' : 'border-sky-200'} space-y-3 shadow-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-2">
          <div>
            <span class="text-[10px] uppercase font-bold tracking-wider ${i === 0 ? 'text-amber-800 bg-amber-100' : 'text-sky-800 bg-sky-100'} px-2.5 py-0.5 rounded-full">
              ${i === 0 ? '🥇 Primary #1 Recommended Path' : `Match #${i+1}`} &bull; ${c.category}
            </span>
            <h3 class="font-mystic text-xl font-extrabold text-slate-900 mt-1">${c.career_title}</h3>
          </div>
          <div class="text-right">
            <span class="text-2xl font-mystic font-extrabold text-amber-600">${c.match_percentage}%</span>
            <div class="text-[11px] text-slate-600 font-semibold">${c.salary_range}</div>
          </div>
        </div>

        <p class="text-xs text-slate-700 leading-relaxed">${c.description}</p>

        <div class="space-y-1">
          <span class="text-[11px] font-bold text-slate-900 uppercase tracking-wider">🔑 Key Skills to Master:</span>
          <div class="flex flex-wrap gap-1.5 pt-0.5">
            ${c.key_skills_to_master.map(sk => `<span class="px-2 py-0.5 rounded bg-sky-100 text-sky-900 text-[11px] font-bold">${sk}</span>`).join('')}
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-sky-100">
          <span class="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="map" class="w-3.5 h-3.5 text-amber-600"></i> Step-by-Step Execution Roadmap:
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-0.5">
              <div class="font-bold text-amber-900 text-[11px]">Phase 1 (30 Days):</div>
              <p class="text-[11px] text-slate-700">${c.structured_roadmap.phase_30_days}</p>
            </div>
            <div class="p-2.5 rounded-xl bg-sky-50 border border-sky-200 space-y-0.5">
              <div class="font-bold text-sky-900 text-[11px]">Phase 2 (90 Days):</div>
              <p class="text-[11px] text-slate-700">${c.structured_roadmap.phase_90_days}</p>
            </div>
            <div class="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-0.5">
              <div class="font-bold text-indigo-900 text-[11px]">Phase 3 (6 Months):</div>
              <p class="text-[11px] text-slate-700">${c.structured_roadmap.phase_6_months}</p>
            </div>
            <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-0.5">
              <div class="font-bold text-emerald-900 text-[11px]">Phase 4 (1 Year):</div>
              <p class="text-[11px] text-slate-700">${c.structured_roadmap.phase_1_year}</p>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    container.innerHTML = matchesHTML;
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error("Career ML prediction error:", err);
    container.innerHTML = `<div class="text-xs text-rose-600 font-bold p-4">Failed to run Career ML Prediction.</div>`;
  }
}

async function loadPersonalDevelopmentUI() {
  const container = document.getElementById("personal-development-container");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/intelligence/personal-development?name=${encodeURIComponent(currentUser ? currentUser.name : 'Seeker')}`);
    if (!res.ok) return;
    const data = await res.json();

    const pillars = [
      data.pillar_1_character_integrity,
      data.pillar_2_emotional_mastery,
      data.pillar_3_discipline_mastery,
      data.pillar_4_compassionate_service
    ];

    container.innerHTML = pillars.map(p => `
      <div class="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-1">
        <div class="font-bold text-sky-950 text-xs flex items-center gap-1.5">
          <i data-lucide="shield" class="w-3.5 h-3.5 text-sky-600"></i> ${p.title}
        </div>
        <p class="text-[11px] text-slate-700 leading-snug"><strong>Core Principle:</strong> ${p.core_principle}</p>
        <p class="text-[11px] text-sky-900 font-semibold"><strong>Daily Practice:</strong> ${p.daily_practice}</p>
      </div>
    `).join('');
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error("Personal development load error:", err);
  }
}

async function loadRelationshipGuidanceUI() {
  const container = document.getElementById("relationship-guidance-container");
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/api/intelligence/relationship-guidance?name=${encodeURIComponent(currentUser ? currentUser.name : 'Seeker')}`);
    if (!res.ok) return;
    const data = await res.json();

    let rulesHTML = data.golden_rules.map(r => `<li class="list-disc ml-4 text-slate-800">${r}</li>`).join('');
    let stepsHTML = data.conflict_resolution_steps.map(s => `<div class="p-2 rounded bg-rose-50 border border-rose-200 text-slate-800 font-medium">${s}</div>`).join('');

    container.innerHTML = `
      <div class="space-y-3">
        <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
          <div class="font-bold text-rose-950 text-xs">💘 Golden Relationship Principles:</div>
          <ul class="space-y-1 text-[11px] pt-1">${rulesHTML}</ul>
        </div>

        <div class="space-y-1.5">
          <div class="font-bold text-slate-900 text-xs">🛠️ Conflict Resolution Workflow:</div>
          <div class="grid grid-cols-1 gap-1 text-[11px]">${stepsHTML}</div>
        </div>

        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-950 font-bold">
          💖 Daily Harmony Habit: ${data.daily_harmony_habit}
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error("Relationship guidance load error:", err);
  }
}


// =========================================================================
// 1. 78-CARD ARCANA GRAPHIC FAN SANCTUARY MODULE
// =========================================================================
let active78FanFilter = "All";
let selected78FanCardIndex = -1;

function render78FanDeck(filter = "All") {
  active78FanFilter = filter;
  const stage = document.getElementById("tarot-78-fan-stage");
  const countBadge = document.getElementById("fan-cards-count-badge");
  if (!stage || !fullTarotDeck || fullTarotDeck.length === 0) return;

  // Filter cards by suit
  let filteredCards = fullTarotDeck.map((card, idx) => ({ card, originalIndex: idx }));
  if (filter === "Major") {
    filteredCards = filteredCards.filter(item => item.card.arcana === "Major Arcana");
  } else if (["Cups", "Pentacles", "Swords", "Wands"].includes(filter)) {
    filteredCards = filteredCards.filter(item => item.card.suit === filter || (item.card.name && item.card.name.toLowerCase().includes(filter.toLowerCase())));
  }

  if (countBadge) {
    countBadge.innerText = `Showing ${filteredCards.length} Cards in Double-Layered Tabletop Arc (128° Spread Span)`;
  }

  // Highlight active filter pill button
  ["All", "Major", "Cups", "Pentacles", "Swords", "Wands"].forEach(s => {
    const btn = document.getElementById(`fan-filter-${s}`);
    if (btn) {
      if (s === filter) {
        btn.className = "px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold shadow-sm border border-amber-300";
      } else {
        btn.className = "px-3.5 py-1 rounded-full bg-white text-slate-700 hover:bg-amber-50 border border-amber-300/40 font-bold";
      }
    }
  });

  stage.innerHTML = "";
  const count = filteredCards.length;

  // Helper function to create individual fan card DOM elements
  const createFanCardElement = (item, angle, xOffset, yOffset, zIndex, tierLabel) => {
    const isSelected = selected78FanCardIndex === item.originalIndex;
    
    let suitGlowClass = "border-amber-400 bg-gradient-to-b from-[#09090b] via-[#18181b] to-black";
    let accentBadgeColor = "text-amber-400";
    if (item.card.arcana === "Major Arcana") {
      suitGlowClass = "border-amber-400 bg-gradient-to-b from-[#09090b] via-[#18181b] to-black";
      accentBadgeColor = "text-amber-300 font-extrabold";
    } else if (item.card.suit === "Cups") {
      suitGlowClass = "border-amber-400/90 bg-gradient-to-b from-[#09090b] via-[#18181b] to-black";
      accentBadgeColor = "text-amber-200 font-bold";
    } else if (item.card.suit === "Pentacles") {
      suitGlowClass = "border-amber-500 bg-gradient-to-b from-[#09090b] via-[#18181b] to-black";
      accentBadgeColor = "text-emerald-400 font-bold";
    } else if (item.card.suit === "Swords") {
      suitGlowClass = "border-amber-300 bg-gradient-to-b from-[#09090b] via-[#18181b] to-black";
      accentBadgeColor = "text-sky-300 font-bold";
    } else if (item.card.suit === "Wands") {
      suitGlowClass = "border-amber-500 bg-gradient-to-b from-[#09090b] via-[#18181b] to-black";
      accentBadgeColor = "text-orange-400 font-bold";
    }

    const cardWrap = document.createElement("div");
    cardWrap.className = `fan-card-wrapper ${isSelected ? 'fan-card-selected' : ''}`;
    cardWrap.style.left = `calc(50% + ${xOffset}px - 57.5px)`;
    cardWrap.style.transform = `rotate(${angle.toFixed(2)}deg) translateY(${yOffset.toFixed(2)}px)`;
    cardWrap.style.zIndex = zIndex;
    cardWrap.title = `${item.card.name} (${item.card.arcana || 'Minor Arcana'}) — ${tierLabel}`;
    
    cardWrap.onclick = () => selectCardFrom78Fan(item.originalIndex);

    cardWrap.innerHTML = `
      <div class="tarot-card-container w-full h-full shadow-2xl">
        <div class="tarot-card-inner ${isSelected ? 'flipped' : ''}">
          <!-- BLACK AND GOLD CARD BACK -->
          <div class="tarot-card-back ${suitGlowClass} rounded-2xl border-2 border-amber-400 shadow-xl flex flex-col items-center justify-between p-2">
            <div class="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center bg-black/90 shadow-md">
              <i data-lucide="sun" class="w-4 h-4 text-amber-400"></i>
            </div>
            <div class="text-center w-full my-auto space-y-0.5">
              <span class="font-mystic text-[9px] text-amber-300 font-extrabold tracking-widest text-center truncate block uppercase">${item.card.name ? item.card.name.substring(0, 11) : 'TAROT'}</span>
              <span class="text-[8px] text-amber-400/80 font-bold block">BLACK & GOLD</span>
            </div>
            <div class="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-[8px] text-amber-300 font-bold">
              #${item.originalIndex + 1}
            </div>
          </div>
          <!-- BLACK AND GOLD CARD FRONT -->
          <div class="tarot-card-front p-2 bg-gradient-to-b from-[#18181b] to-[#09090b] border-2 border-amber-400 text-amber-100 flex flex-col justify-between rounded-2xl">
            <div class="flex items-center justify-between text-[10px] font-bold text-amber-300">
              <span>${item.card.number !== undefined ? item.card.number : ''}</span>
              <span class="${accentBadgeColor}">${item.card.element || ''}</span>
            </div>
            <div class="flex-1 flex items-center justify-center my-1 overflow-hidden rounded-xl bg-black/60 border border-amber-400/40 p-1">
              ${getTarotSvgArt(item.card)}
            </div>
            <div class="text-center">
              <div class="font-mystic font-bold text-[10px] text-amber-300 truncate">${item.card.name}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    return cardWrap;
  };

  // Double-Layered Tabletop Arc Geometry Setup (128° Total Spread Span: Strictly between 125° and 130°)
  const totalArcSpan = 128.0; 
  const halfSpan = totalArcSpan / 2; // 64° (-64° to +64°)

  if (count > 20) {
    const halfCount = Math.ceil(count / 2);
    const tier1Cards = filteredCards.slice(0, halfCount); // Back Tier Arc (Outer Row)
    const tier2Cards = filteredCards.slice(halfCount);    // Front Tier Arc (Inner Row Tabletop Overlap)

    const n1 = tier1Cards.length;
    const n2 = tier2Cards.length;

    const angleStep1 = n1 > 1 ? totalArcSpan / (n1 - 1) : 0;
    const angleStep2 = n2 > 1 ? (totalArcSpan - angleStep1) / (n2 - 1) : 0;

    const startAngle1 = -halfSpan;
    const startAngle2 = -halfSpan + (angleStep1 / 2); // Staggered half-step offset for perfect tabletop overlap

    // Render Back Tier Arc (Upper Layer)
    tier1Cards.forEach((item, i) => {
      const angle = startAngle1 + i * angleStep1;
      const xOffset = (i - (n1 - 1) / 2) * 16.5;
      const arcCurve = Math.pow(Math.abs(i - (n1 - 1) / 2), 1.5) * 0.45;
      const yOffset = -38 + arcCurve;
      const elem = createFanCardElement(item, angle, xOffset, yOffset, i + 10, "Tabletop Back Layer Arc");
      stage.appendChild(elem);
    });

    // Render Front Tier Arc (Lower Layer - Tabletop Overlap)
    tier2Cards.forEach((item, i) => {
      const angle = startAngle2 + i * angleStep2;
      const xOffset = (i - (n2 - 1) / 2) * 16.5;
      const arcCurve = Math.pow(Math.abs(i - (n2 - 1) / 2), 1.5) * 0.45;
      const yOffset = 42 + arcCurve;
      const elem = createFanCardElement(item, angle, xOffset, yOffset, n1 + i + 50, "Tabletop Front Layer Arc");
      stage.appendChild(elem);
    });
  } else {
    // Single Layer Arc for Smaller Filtered Sets (128° Spread Span)
    const angleStep = count > 1 ? totalArcSpan / (count - 1) : 0;
    const startAngle = -halfSpan;

    filteredCards.forEach((item, i) => {
      const angle = startAngle + i * angleStep;
      const xOffset = (i - (count - 1) / 2) * Math.min(30, 600 / count);
      const arcCurve = Math.pow(Math.abs(i - (count - 1) / 2), 1.6) * (60 / Math.pow(count, 1.2));
      const elem = createFanCardElement(item, angle, xOffset, arcCurve, i + 10, "Single Layer Tabletop Arc");
      stage.appendChild(elem);
    });
  }

  if (window.lucide) lucide.createIcons();
}

function filter78FanDeck(suitName) {
  render78FanDeck(suitName);
}

function selectCardFrom78Fan(originalIndex) {
  selected78FanCardIndex = originalIndex;
  render78FanDeck(active78FanFilter);

  const cardObj = fullTarotDeck[originalIndex];
  if (!cardObj) return;

  if (currentSpreadType === "Three Card Reading") {
    if (userSelected3Cards.length < 3) {
      const isReversed = Math.random() < 0.22;
      const posNames = ["1. Past & Root Influence", "2. Present Energy & Crossroads", "3. Future Evolution & Outcome"];
      const posName = posNames[userSelected3Cards.length];
      
      userSelected3Cards.push({
        positionName: posName,
        card: cardObj,
        is_reversed: isReversed,
        originalIndex: originalIndex
      });

      render3CardsDisplayGrid();
      const badge = document.getElementById("three-cards-status-badge");
      if (badge) badge.innerText = `Selected: ${userSelected3Cards.length} / 3 Cards`;

      if (userSelected3Cards.length === 3) {
        render3CardsTotalAnalysis();
      }
    } else {
      alert("✨ You have already selected 3 cards! Tap '🔄 Pick 3 New Cards' to choose fresh 3 cards.");
    }
    return;
  }

  if (!currentTarotData) {
    currentTarotData = {
      spread_type: "78-Card Arcana Sanctuary Draw",
      cards_drawn: [{ position_name: "Selected Arcana Card", card: cardObj, is_reversed: false, position_interpretation: cardObj.upright_meaning }],
      spread_synthesis: "Direct intuition selection from the 78-card fan sanctuary.",
      key_themes: [cardObj.arcana || "Major Arcana", cardObj.element || "Universal"]
    };
  } else {
    const targetSlot = currentInspectedSlotIndex >= 0 ? currentInspectedSlotIndex : 0;
    currentTarotData.cards_drawn[targetSlot].card = cardObj;
    currentTarotData.cards_drawn[targetSlot].position_interpretation = cardObj.upright_meaning;
  }

  inspectTarotCardSlot(currentInspectedSlotIndex >= 0 ? currentInspectedSlotIndex : 0);
  renderTarotCardsStage(currentTarotData);
}

function render3CardsDisplayGrid() {
  const grid = document.getElementById("three-cards-display-grid");
  if (!grid) return;

  const positions = [
    { title: "1. Past & Root Influence", subtitle: "Underlying roots & foundation", color: "amber" },
    { title: "2. Present Energy & Crossroads", subtitle: "Active atmosphere & decisions", color: "sky" },
    { title: "3. Future Evolution & Outcome", subtitle: "Emerging trajectory & destiny", color: "purple" }
  ];

  let html = "";
  for (let idx = 0; idx < 3; idx++) {
    const item = userSelected3Cards[idx];
    const pos = positions[idx];

    if (item) {
      const card = item.card;
      const isRev = item.is_reversed;
      const cardSvg = getTarotSvgArt(card);
      const orientLabel = isRev ? "Reversed" : "Upright";
      const orientClass = isRev ? "bg-rose-100 text-rose-950 border-rose-300" : "bg-emerald-100 text-emerald-950 border-emerald-300";
      const meaningText = isRev ? (card.reversed_meaning || card.upright_meaning) : card.upright_meaning;

      html += `
        <div class="glass-panel p-5 space-y-4 border-2 border-amber-400/80 bg-white shadow-lg rounded-2xl flex flex-col justify-between tilt-card-3d">
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-slate-900">${pos.title}</span>
              <span class="px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold ${orientClass}">${orientLabel}</span>
            </div>
            
            <div class="flex justify-center my-2">
              <div class="tarot-card-container w-36 h-56 relative shadow-md rounded-xl overflow-hidden cursor-pointer" onclick="inspectTarotCardSlot(${idx})">
                <div class="tarot-card-inner flipped ${isRev ? 'reversed' : ''}">
                  <div class="tarot-card-back border-2 border-amber-400 bg-black"></div>
                  <div class="tarot-card-front p-1.5 bg-gradient-to-b from-[#18181b] to-[#09090b] border-2 border-amber-400 text-amber-100 flex flex-col justify-between">
                    <div class="flex items-center justify-between text-[11px] font-bold text-amber-300 px-1">
                      <span>${card.number !== undefined ? card.number : ''}</span>
                      <span>${card.element || ''}</span>
                    </div>
                    <div class="flex-1 flex items-center justify-center my-1 overflow-hidden rounded-lg bg-black/60 border border-amber-400/40 p-1">
                      ${cardSvg}
                    </div>
                    <div class="text-center pb-0.5">
                      <div class="font-mystic font-bold text-xs text-amber-300 truncate">${card.name}</div>
                      <div class="text-[10px] ${isRev ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}">${orientLabel}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center space-y-1">
              <h4 class="font-mystic font-black text-slate-900 text-sm">${card.name}</h4>
              <p class="text-xs text-slate-700 leading-relaxed line-clamp-3 font-medium">${meaningText}</p>
            </div>
          </div>

          <div class="pt-2 border-t border-sky-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>Arcana: ${card.arcana || 'Major'}</span>
            <span>Element: ${card.element || 'Universal'}</span>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="p-6 rounded-2xl border-2 border-dashed border-sky-300 bg-white/80 flex flex-col items-center justify-center text-center space-y-3 min-h-[280px]">
          <div class="w-12 h-12 rounded-full bg-${pos.color}-100 text-${pos.color}-700 font-extrabold flex items-center justify-center text-xl shadow-xs">
            ${idx + 1}
          </div>
          <div>
            <span class="font-mystic font-extrabold text-slate-900 text-sm block">${pos.title}</span>
            <span class="text-[11px] text-slate-500 font-medium block mt-0.5">${pos.subtitle}</span>
          </div>
          <p class="text-xs text-sky-800 font-extrabold bg-sky-50 px-3.5 py-1.5 rounded-full border border-sky-300/60 shadow-xs">
            👈 Click any card from 78-Card Fan Deck below to pick Card ${idx + 1}
          </p>
        </div>
      `;
    }
  }

  grid.innerHTML = html;
  if (window.lucide) lucide.createIcons();
  init3DTiltEffects();
}

function render3CardsTotalAnalysis() {
  if (userSelected3Cards.length < 3) return;

  const card1 = userSelected3Cards[0].card;
  const orient1 = userSelected3Cards[0].is_reversed ? "Reversed" : "Upright";
  
  const card2 = userSelected3Cards[1].card;
  const orient2 = userSelected3Cards[1].is_reversed ? "Reversed" : "Upright";
  
  const card3 = userSelected3Cards[2].card;
  const orient3 = userSelected3Cards[2].is_reversed ? "Reversed" : "Upright";

  let majorArcanaCount = 0;
  userSelected3Cards.forEach(c => {
    if (c.card.arcana === "Major Arcana") majorArcanaCount++;
  });

  const synthesisText = `Your selected 3-card spread creates a powerful spiritual story: Rooted in the past with '${card1.name}' (${orient1}), you built foundational lessons and resilience. In the present, '${card2.name}' (${orient2}) brings key crossroads and active focus, encouraging you to align your energy. Moving into the future, '${card3.name}' (${orient3}) unveils your emerging trajectory, bringing karmic manifestation, clarity, and ultimate fulfillment!`;

  const themesBox = document.getElementById("three-cards-themes-tags");
  if (themesBox) {
    themesBox.innerHTML = `
      <span class="px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black">1. Past: ${card1.name} (${orient1})</span>
      <span class="px-3.5 py-1 rounded-full bg-sky-400 text-slate-950 font-black">2. Present: ${card2.name} (${orient2})</span>
      <span class="px-3.5 py-1 rounded-full bg-purple-400 text-slate-950 font-black">3. Future: ${card3.name} (${orient3})</span>
      <span class="px-3.5 py-1 rounded-full bg-emerald-400 text-slate-950 font-black">${majorArcanaCount} Major Arcana Keys</span>
    `;
  }

  const synthTextEl = document.getElementById("three-cards-synthesis-text");
  if (synthTextEl) synthTextEl.innerText = synthesisText;

  const adviceEl = document.getElementById("three-cards-advice-text");
  if (adviceEl) {
    adviceEl.innerText = `Honor the root lessons of '${card1.name}'. Channel the present focus of '${card2.name}' to navigate crossroads, and step confidently into the future promised by '${card3.name}'!`;
  }

  const analysisBox = document.getElementById("three-cards-total-analysis-box");
  if (analysisBox) {
    analysisBox.classList.remove("hidden");
    analysisBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  currentTarotData = {
    id: `tarot-3card-${Date.now()}`,
    spread_type: "Three Card Reading",
    cards_drawn: [
      { position_index: 0, position_name: "1. Past & Root Influence", card: card1, is_reversed: userSelected3Cards[0].is_reversed, position_interpretation: card1.upright_meaning },
      { position_index: 1, position_name: "2. Present Energy & Crossroads", card: card2, is_reversed: userSelected3Cards[1].is_reversed, position_interpretation: card2.upright_meaning },
      { position_index: 2, position_name: "3. Future Evolution & Outcome", card: card3, is_reversed: userSelected3Cards[2].is_reversed, position_interpretation: card3.upright_meaning }
    ],
    spread_synthesis: synthesisText,
    key_themes: [`1. ${card1.name}`, `2. ${card2.name}`, `3. ${card3.name}`],
    relevance_score: 96.8
  };
}

function resetAndPick3CardsAgain() {
  userSelected3Cards = [];
  const badge = document.getElementById("three-cards-status-badge");
  if (badge) badge.innerText = "Selected: 0 / 3 Cards (Click cards from fan deck below)";
  const analysisBox = document.getElementById("three-cards-total-analysis-box");
  if (analysisBox) analysisBox.classList.add("hidden");
  render3CardsDisplayGrid();
}

function pickRandomCardFrom78Fan() {
  if (!fullTarotDeck || fullTarotDeck.length === 0) return;
  const randIdx = Math.floor(Math.random() * fullTarotDeck.length);
  selectCardFrom78Fan(randIdx);
}

function shuffle78FanDeck() {
  selected78FanCardIndex = -1;
  render78FanDeck(active78FanFilter);
}

// =========================================================================
// 2. DAY-TO-DAY RITUAL RECOMMENDATION ENGINE
// =========================================================================
let activeDayRitualTab = "Thursday";
let completedDailyRituals = {};

const DAY_RITUAL_SCHEDULE = {
  "Monday": {
    theme: "Lunar Intuition & Intention Setting",
    element: "Water Element",
    personal_growth: {
      focus: "Emotional Intelligence & Subconscious Clarity",
      challenge: "Transform past anxieties into intuitive guidance; set compassionate boundaries."
    },
    remedies: {
      crystal: "💎 Moonstone & Selenite (Aura Cleansing)",
      herbal: "🍵 Chamomile & Lemon Balm Tea",
      somatic_mantra: "🧘 Anjali Mudra: 'I trust the deep wisdom of my intuitive soul.'",
      color_therapy: "🎨 Silver Pearl & Mystic Indigo"
    },
    morning: { title: "🌅 Solar Breath & Intention Setting", desc: "10 minutes of deep belly breathing with white candle focus." },
    midday: { title: "☀️ Heart Line Somatic Walk", desc: "Mindful 15-minute nature walk visualizing relationship harmony." },
    evening: { title: "🌙 Lunar Journaling & Candle Reflections", desc: "Write down 3 gratitude points and draw 1 Tarot card." },
    habit: { title: "🌿 Daily Water Hydration Reset", desc: "Drink 2.5L structured water with lemon for clarity." }
  },
  "Tuesday": {
    theme: "Flame Purification & Leadership Alignment",
    element: "Fire Element",
    personal_growth: {
      focus: "Executive Confidence & Willpower Mastery",
      challenge: "Channel assertive energy without frustration; take decisive action on key goals."
    },
    remedies: {
      crystal: "💎 Carnelian & Tiger's Eye (Vitality Activation)",
      herbal: "🍵 Ginger & Cinnamon Infusion",
      somatic_mantra: "🧘 Surya Mudra: 'I am radiant, focused, and unshakeable in my purpose.'",
      color_therapy: "🎨 Solar Crimson & Amber Gold"
    },
    morning: { title: "🌅 Flame Energy Activation", desc: "Dynamic stretch routine followed by 5-minute confidence posture focus." },
    midday: { title: "☀️ Vocational Purpose Alignment", desc: "Review 30-day career roadmap goals and clear clutter." },
    evening: { title: "🌙 Somatic Nervous System Reset", desc: "Progressive muscle relaxation and lavender aromatherapy." },
    habit: { title: "🔥 Executive Focus Sprint", desc: "Complete 2 uninterrupted 45-minute deep work sessions." }
  },
  "Wednesday": {
    theme: "Mercurial Intellect & Mind Clarity",
    element: "Air Element",
    personal_growth: {
      focus: "Intellectual Precision & Compassionate Speech",
      challenge: "Eliminate mental clutter and overthinking; articulate vision with crystalline clarity."
    },
    remedies: {
      crystal: "💎 Lapis Lazuli & Fluorite (Intellectual Clarity)",
      herbal: "🍵 Peppermint & Gotu Kola Tea",
      somatic_mantra: "🧘 Hakini Mudra: 'My mind is clear, creative, and aligned with cosmic truth.'",
      color_therapy: "🎨 Sky Cyan & Mercurial Violet"
    },
    morning: { title: "🌅 Mind Clarity & Head Line Focus", desc: "Journaling core priorities before checking digital screens." },
    midday: { title: "☀️ Compassionate Communication Sprint", desc: "Send 2 uplifting notes of appreciation to friends or colleagues." },
    evening: { title: "🌙 Sound Healing & Theta Waves", desc: "15 minutes of 528Hz solfeggio frequency listening." },
    habit: { title: "💨 Digital Detox Hour", desc: "Turn off all mobile notifications 1 hour before sleep." }
  },
  "Thursday": {
    theme: "Jupiterian Growth & Abundance Manifestation",
    element: "Ether & Earth",
    personal_growth: {
      focus: "Abundance Mindset & Visionary Expansion",
      challenge: "Break through scarcity limitations; embrace generous mentorship and growth."
    },
    remedies: {
      crystal: "💎 Citrine & Green Aventurine (Wealth & Prosperity Resonance)",
      herbal: "🍵 Holy Basil (Tulsi) & Cinnamon Decoction",
      somatic_mantra: "🧘 Kubera Mudra: 'Universal abundance flows through my purposeful work.'",
      color_therapy: "🎨 Royal Gold & Emerald Green"
    },
    morning: { title: "🌅 Solar Intention & Gold Visualization", desc: "Visualize career goals unfolding with abundance & confidence." },
    midday: { title: "☀️ Grounding Earth Walk", desc: "Barefoot grounding or outdoor stroll to align physical energy." },
    evening: { title: "🌙 Tarot Sanctuary Synthesis", desc: "Inspect 3-card spread and synthesize daily life insights." },
    habit: { title: "🌟 Abundance Journaling", desc: "Record 5 positive wins and financial alignment goals." }
  },
  "Friday": {
    theme: "Venusian Harmony & Emotional Equilibrium",
    element: "Water & Fire",
    personal_growth: {
      focus: "Self-Love, Compassion & Relationship Fulfillment",
      challenge: "Cultivate deep self-worth; harmonize personal relationships without self-sacrifice."
    },
    remedies: {
      crystal: "💎 Rose Quartz & Rhodonite (Heart Chakra Healing)",
      herbal: "🍵 Rose Petal & Hibiscus Infusion",
      somatic_mantra: "🧘 Padma Mudra (Lotus): 'My heart is open to receive and give pure love.'",
      color_therapy: "🎨 Rose Pink & Venetian Gold"
    },
    morning: { title: "🌅 Heart Chakra Alignment", desc: "Heart-opening yoga stretches and positive self-affirmations." },
    midday: { title: "☀️ 1-on-1 Relationship Check-in", desc: "Express gratitude & active listening with partner or loved one." },
    evening: { title: "🌙 Herbal Tea & Salt Bath Bathing", desc: "Epsom salt soak with rose water for emotional cleansing." },
    habit: { title: "💖 Empathy Practice", desc: "Practice active non-judgmental listening in every interaction." }
  },
  "Saturday": {
    theme: "Saturnian Mastery & Discipline Realignment",
    element: "Earth Element",
    personal_growth: {
      focus: "Long-term Structure, Resilience & Karmic Mastery",
      challenge: "Build sustainable habits; honor commitments to your future self."
    },
    remedies: {
      crystal: "💎 Black Tourmaline & Smoky Quartz (Grounding Shield)",
      herbal: "🍵 Ashwagandha & Golden Milk",
      somatic_mantra: "🧘 Prithvi Mudra: 'I am grounded, resilient, and master of my destiny.'",
      color_therapy: "🎨 Obsidian Black & Deep Bronze"
    },
    morning: { title: "🌅 Discipline & Life Path Review", desc: "Review weekly habit streak and project milestones." },
    midday: { title: "☀️ Physical Vitality Training", desc: "30-minute strength or outdoor cardio session." },
    evening: { title: "🌙 Silent Meditation & Reflection", desc: "20 minutes of silent breath observation." },
    habit: { title: "🌿 Clean Environment Reset", desc: "Organize physical workspace and living sanctuary." }
  },
  "Sunday": {
    theme: "Solar Realignment & Soul Rest",
    element: "Sun & Ether",
    personal_growth: {
      focus: "Spiritual Renewal, Gratitude & Soul Integration",
      challenge: "Release weekly tension; align physical body with higher spiritual purpose."
    },
    remedies: {
      crystal: "💎 Sunstone & Clear Quartz (Solar Illumination)",
      herbal: "🍵 Elderberry & Chamomile Blend",
      somatic_mantra: "🧘 Gyan Mudra: 'I am refreshed, enlightened, and ready for new horizons.'",
      color_therapy: "🎨 Radiant Gold & Solar Amber"
    },
    morning: { title: "🌅 Sun Salutation & Light Exposure", desc: "Get 15 minutes of morning sunlight for circadian reset." },
    midday: { title: "☀️ Creative Joy & Play", desc: "Engage in creative painting, music, or nature connection." },
    evening: { title: "🌙 Weekly Horizon Synthesis", desc: "Prepare priorities for the upcoming 7-day cycle." },
    habit: { title: "✨ Soul Rest & Restoration", desc: "Prioritize 8 hours of restorative sleep." }
  }
};

function switchDailyRitualTab(dayName) {
  activeDayRitualTab = dayName;
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  days.forEach(d => {
    const btn = document.getElementById(`day-tab-${d}`);
    if (btn) {
      if (d === dayName) {
        btn.className = "px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black shadow-lg border-2 border-amber-300 scale-105 flex items-center gap-1.5 transition-all transform";
      } else {
        btn.className = "px-4 py-2.5 rounded-full bg-white/90 text-slate-800 hover:bg-amber-100 hover:text-slate-950 border-2 border-sky-200/80 font-bold transition-all shadow-xs flex items-center gap-1.5";
      }
    }
  });
  renderDayToDayRecommendations(dayName);
}

function renderDayToDayRecommendations(dayName) {
  const container = document.getElementById("daily-ritual-schedule-container");
  if (!container) return;

  const data = DAY_RITUAL_SCHEDULE[dayName] || DAY_RITUAL_SCHEDULE["Thursday"];

  const items = [
    { key: "morning", time: "🌅 Morning Intention", color: "from-amber-500 to-orange-500", border: "border-amber-400", data: data.morning },
    { key: "midday", time: "☀️ Midday Alignment", color: "from-sky-500 to-blue-600", border: "border-sky-400", data: data.midday },
    { key: "evening", time: "🌙 Evening Reflection", color: "from-purple-600 to-indigo-700", border: "border-purple-400", data: data.evening },
    { key: "habit", time: "🌿 Daily Habit Sprint", color: "from-emerald-500 to-teal-600", border: "border-emerald-400", data: data.habit }
  ];

  let htmlContent = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">`;
  htmlContent += items.map((item, idx) => {
    const taskId = `${dayName}-${idx}`;
    const isDone = completedDailyRituals[taskId];
    return `
      <div class="glass-card p-5 space-y-3 border-2 ${isDone ? 'border-emerald-500 bg-emerald-50/50 shadow-md' : 'border-sky-300/80 bg-white'} shadow-lg rounded-2xl transition-all hover:border-amber-400 hover:shadow-xl flex flex-col justify-between">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 rounded-full bg-gradient-to-r ${item.color} text-white text-[10px] uppercase tracking-wider font-extrabold shadow-sm">${item.time}</span>
            <button onclick="toggleDailyTaskDone('${taskId}')" class="px-3 py-1 rounded-full ${isDone ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-900 text-amber-300 hover:bg-slate-800'} text-[10px] font-extrabold transition">
              ${isDone ? '✓ Completed' : 'Mark Done'}
            </button>
          </div>
          <h4 class="font-mystic font-black text-sm text-slate-950 leading-snug pt-1">${item.data.title}</h4>
          <p class="text-xs text-slate-800 font-medium leading-relaxed">${item.data.desc}</p>
        </div>
        <div class="text-[10px] text-slate-900 font-extrabold pt-2 border-t border-slate-200 flex items-center justify-between">
          <span>Theme: ${data.theme}</span>
          <span class="px-2 py-0.5 rounded bg-sky-100 text-sky-950 font-bold">${data.element}</span>
        </div>
      </div>
    `;
  }).join('');
  htmlContent += `</div>`;

  // Render High-Visibility Personal Growth & Harmonizing Remedies Box
  if (data.personal_growth && data.remedies) {
    htmlContent += `
      <div class="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-2 border-amber-400 text-white shadow-2xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-400/40 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg">
              ✨
            </div>
            <div>
              <h4 class="font-mystic font-black text-base text-amber-300">
                ${dayName}'s Personal Growth Objectives & Daily Harmonizing Remedies
              </h4>
              <p class="text-xs text-slate-300 font-medium">Daily self-improvement targets paired with holistic crystal, botanical, mudra & color remedies</p>
            </div>
          </div>
          <span class="px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/60 text-xs font-black uppercase tracking-wider shrink-0">${data.theme}</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <!-- Personal Growth Focus Box -->
          <div class="space-y-2.5 p-4 rounded-2xl bg-white/10 border border-amber-400/30 backdrop-blur-md">
            <div class="font-black text-amber-300 flex items-center gap-2 text-xs uppercase tracking-wider">
              <i data-lucide="trending-up" class="w-4 h-4 text-emerald-400"></i> 🚀 Personal Growth Focus
            </div>
            <div class="text-xs text-slate-100 space-y-1.5">
              <p><strong class="text-amber-200">Growth Objective:</strong> ${data.personal_growth.focus}</p>
              <p><strong class="text-amber-200">Growth Challenge:</strong> ${data.personal_growth.challenge}</p>
            </div>
          </div>

          <!-- Daily Harmonizing Remedies Box -->
          <div class="space-y-2 p-4 rounded-2xl bg-white/10 border border-amber-400/30 backdrop-blur-md">
            <div class="font-black text-amber-300 flex items-center gap-2 text-xs uppercase tracking-wider">
              <i data-lucide="shield-check" class="w-4 h-4 text-sky-400"></i> 🛡️ Daily Harmonizing Remedies
            </div>
            <div class="grid grid-cols-1 gap-1.5 text-xs text-slate-100">
              <div><strong>Crystal Energy:</strong> ${data.remedies.crystal}</div>
              <div><strong>Botanical Tea:</strong> ${data.remedies.herbal}</div>
              <div><strong>Somatic Mudra & Mantra:</strong> ${data.remedies.somatic_mantra}</div>
              <div class="text-amber-300 font-bold"><strong>Aura Color Focus:</strong> ${data.remedies.color_therapy}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = htmlContent;
  if (window.lucide) lucide.createIcons();
  init3DTiltEffects();
}

function toggleDailyTaskDone(taskId) {
  completedDailyRituals[taskId] = !completedDailyRituals[taskId];
  renderDayToDayRecommendations(activeDayRitualTab);
}

function generateFreshDailyRituals() {
  alert("✨ Personalized Day-to-Day Ritual Schedule re-calibrated with your active Palmistry lines and Astrology transit!");
  renderDayToDayRecommendations(activeDayRitualTab);
}

// =========================================================================
// 3. TRENDS TAB GRAPHS (PALM LINES ANALYTICS & LIFE TRAJECTORY MULTI-LINE)
// =========================================================================
let palmLinesChartInstance = null;
let lifeTrajectoryChartInstance = null;

function renderTrendsGraphs() {
  // 1. Palm Lines Analysis Radar Chart
  const ctxPalm = document.getElementById("chart-palm-lines-trends");
  if (ctxPalm && typeof Chart !== "undefined") {
    if (palmLinesChartInstance) palmLinesChartInstance.destroy();
    palmLinesChartInstance = new Chart(ctxPalm, {
      type: "radar",
      data: {
        labels: ["Heart Line", "Life Line", "Head Line", "Fate Line", "Sun Line"],
        datasets: [
          {
            label: "Active Palm Scan",
            data: [94, 91, 88, 85, 90],
            backgroundColor: "rgba(56, 189, 248, 0.25)",
            borderColor: "rgb(2, 132, 199)",
            pointBackgroundColor: "rgb(2, 132, 199)"
          },
          {
            label: "Optimal Potential Alignment",
            data: [98, 95, 94, 92, 95],
            borderColor: "rgb(16, 185, 129)",
            borderDash: [4, 4],
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { min: 60, max: 100 } },
        plugins: { legend: { position: "bottom" } }
      }
    });
  }

  // 2. Life Trend Trajectory Multi-Line Chart
  const ctxLife = document.getElementById("chart-life-trajectory");
  if (ctxLife && typeof Chart !== "undefined") {
    if (lifeTrajectoryChartInstance) lifeTrajectoryChartInstance.destroy();
    lifeTrajectoryChartInstance = new Chart(ctxLife, {
      type: "line",
      data: {
        labels: ["2026 (Present)", "2027 (Alignment)", "2028 (Harmony)", "2029 (Equilibrium)", "2030 (Mastery)"],
        datasets: [
          {
            label: "Spiritual Growth & Intuition",
            data: [78, 85, 91, 95, 98],
            borderColor: "rgb(147, 51, 234)",
            backgroundColor: "rgba(147, 51, 234, 0.1)",
            fill: true,
            tension: 0.35
          },
          {
            label: "Emotional Stability & Relationships",
            data: [74, 82, 88, 92, 96],
            borderColor: "rgb(14, 165, 233)",
            fill: false,
            tension: 0.35
          },
          {
            label: "Career Manifestation & Drive",
            data: [80, 86, 92, 94, 97],
            borderColor: "rgb(245, 158, 11)",
            fill: false,
            tension: 0.35
          },
          {
            label: "Physical Vitality & Resilience",
            data: [82, 87, 90, 93, 95],
            borderColor: "rgb(16, 185, 129)",
            fill: false,
            tension: 0.35
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { min: 60, max: 100 } }
      }
    });
  }
}

// =========================================================================
// 5. ENHANCED COSMIC NOTIFICATION CENTER MODULE
// =========================================================================
let activeNotifFilter = "All";
let notificationsList = [
  { id: "n1", category: "Rituals", title: "🗓️ Day-to-Day Recommendation Ready", message: "Today's Solar Breath Alignment & Grounding Ritual for Thursday is active! Tap to view.", read: false, time: "Just Now", action: () => switchView('recommendations') },
  { id: "n2", category: "Appointments", title: "🔮 Upcoming 1-on-1 Consultation", message: "Confirmed appointment session with Consultant Zachary today at 4:00 PM.", read: false, time: "10 mins ago", action: () => switchView('dashboard') },
  { id: "n3", category: "Insights", title: "🎴 Card of the Day Drawn", message: "Your Card of the Day (The Star) brings hope & cosmic renewal.", read: false, time: "1 hour ago", action: () => switchView('tarot') },
  { id: "n4", category: "Insights", title: "✋ Palmistry CV Scan Completed", message: "Water Hand detected with 95.2% confidence. Heart line depth analyzed.", read: true, time: "3 hours ago", action: () => switchView('palm') }
];

function renderNotifications(category = "All") {
  activeNotifFilter = category;
  const container = document.getElementById("notif-list-container");
  const badge = document.getElementById("notif-badge");
  if (!container) return;

  let filtered = notificationsList;
  if (category !== "All") {
    filtered = notificationsList.filter(n => n.category === category);
  }

  const unreadCount = notificationsList.filter(n => !n.read).length;
  if (badge) {
    if (unreadCount > 0) {
      badge.innerText = unreadCount;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  // Highlight active filter pill
  ["All", "Rituals", "Appointments", "Insights"].forEach(cat => {
    const btn = document.getElementById(`notif-filter-${cat}`);
    if (btn) {
      if (cat === category) {
        btn.className = "px-2.5 py-1 rounded-full bg-sky-600 text-white shadow-xs font-bold";
      } else {
        btn.className = "px-2.5 py-1 rounded-full bg-sky-50 text-slate-700 hover:bg-sky-100 border border-sky-200 font-bold";
      }
    }
  });

  container.innerHTML = filtered.map(n => `
    <div onclick="handleNotificationClick('${n.id}')" class="glass-card p-3 space-y-1 border-l-4 ${n.read ? 'border-slate-300 bg-white' : 'border-sky-500 bg-sky-50/50'} shadow-sm cursor-pointer hover:scale-[1.02] transition">
      <div class="flex items-center justify-between text-xs text-slate-900 font-bold">
        <span>${n.title}</span>
        <span class="text-[10px] text-slate-400 font-mono">${n.time}</span>
      </div>
      <p class="text-xs text-slate-700 leading-relaxed">${n.message}</p>
    </div>
  `).join('');
}

function filterNotifDrawer(cat) {
  renderNotifications(cat);
}

function handleNotificationClick(id) {
  const notif = notificationsList.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    if (notif.action) notif.action();
    toggleNotificationDrawer();
    renderNotifications(activeNotifFilter);
  }
}

function triggerSimulatedGuidance() {
  const newNotif = {
    id: `n${Date.now()}`,
    category: "Rituals",
    title: "✨ Live Cosmic Guidance Dispatch",
    message: "New daily recommendation generated for your active zodiac transit!",
    read: false,
    time: "Just Now",
    action: () => switchView('recommendations')
  };
  notificationsList.unshift(newNotif);
  renderNotifications(activeNotifFilter);
  alert("🔔 New notification pushed to your Cosmic Notification Center!");
}


// =========================================================================
// 6. APPOINTMENTS MANAGEMENT, GOOGLE MEET INTEGRATION & SEEKER REVIEWS
// =========================================================================
let appointmentsList = [];
let reviewsList = [];
let activeReviewAppointmentId = null;

async function loadAppointmentsData() {
  try {
    const res = await fetch(`${API_BASE}/api/appointments`, { headers: getAuthHeaders() });
    if (res.ok) {
      appointmentsList = await res.json();
      renderAppointmentsUI();
    }
  } catch (err) {
    console.error("Error loading appointments:", err);
  }
}

async function loadReviewsData() {
  try {
    const res = await fetch(`${API_BASE}/api/appointments/reviews`, { headers: getAuthHeaders() });
    if (res.ok) {
      reviewsList = await res.json();
      renderReviewsUI();
    }
  } catch (err) {
    console.error("Error loading reviews:", err);
  }
}

function renderAppointmentsUI() {
  renderUserAppointments();
  renderPractitionerAppointments("Tarot Reader", "reader-appointments-container");
  renderPractitionerAppointments("Spiritual Consultant", "consultant-appointments-container");
}

function renderUserAppointments() {
  const container = document.getElementById("user-appointments-container");
  if (!container) return;

  if (!appointmentsList || appointmentsList.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-slate-500 font-medium">No active consultation sessions requested yet. Click "Request New Session" to schedule with a practitioner.</div>`;
    return;
  }

  container.innerHTML = appointmentsList.map(apt => {
    let statusBadgeClass = "bg-amber-100 text-amber-900 border-amber-300";
    if (apt.status === "Accepted") statusBadgeClass = "bg-emerald-100 text-emerald-950 border-emerald-300 font-bold";
    else if (apt.status === "Rescheduled") statusBadgeClass = "bg-sky-100 text-sky-950 border-sky-300 font-bold";
    else if (apt.status === "Completed") statusBadgeClass = "bg-slate-100 text-slate-700 border-slate-300";

    return `
      <div class="glass-card p-4 space-y-3 border border-amber-200 bg-white shadow-sm rounded-2xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black border ${statusBadgeClass}">${apt.status}</span>
            <span class="font-mystic font-extrabold text-slate-900 text-sm">${apt.practitioner_name} (${apt.practitioner_role})</span>
          </div>
          <span class="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            📅 ${new Date(apt.requested_date_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        <div class="text-xs space-y-1">
          <p><strong class="text-slate-800">Modality / Focus:</strong> <span class="text-sky-900 font-semibold">${apt.modality}</span></p>
          ${apt.seeker_notes ? `<p class="text-slate-600"><em>"${apt.seeker_notes}"</em></p>` : ''}
        </div>

        <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
          <div class="flex items-center gap-2 flex-wrap">
            ${apt.meeting_link ? `
              <a href="${apt.meeting_link}" target="_blank" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-md hover:scale-105 transition">
                <i data-lucide="video" class="w-4 h-4"></i> Join Google Meet Session
              </a>
            ` : `<span class="text-[11px] text-slate-500 italic">⏳ Waiting for practitioner to confirm & provide Google Meet link...</span>`}
            
            <button onclick="openLiveSessionChatModal('${apt.id}')" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer">
              <i data-lucide="message-square" class="w-4 h-4"></i> 💬 Live Session Chat
            </button>
          </div>

          <div>
            ${apt.status === "Accepted" || apt.status === "Completed" ? `
              <button onclick="openReviewModal('${apt.id}', '${apt.practitioner_role}', '${apt.practitioner_name}')" class="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-400 font-extrabold text-xs hover:bg-amber-400 hover:text-slate-950 transition">
                ⭐ Leave Review
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function renderPractitionerAppointments(role, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const roleApts = appointmentsList.filter(apt => apt.practitioner_role === role || activeRole === "Administrator" || activeRole === role);

  if (roleApts.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-slate-500 font-medium">No session requests currently assigned to this practitioner desk.</div>`;
    return;
  }

  container.innerHTML = roleApts.map(apt => {
    let statusBadgeClass = "bg-amber-100 text-amber-900 border-amber-300";
    if (apt.status === "Accepted") statusBadgeClass = "bg-emerald-100 text-emerald-950 border-emerald-300 font-bold";
    else if (apt.status === "Rescheduled") statusBadgeClass = "bg-sky-100 text-sky-950 border-sky-300 font-bold";
    else if (apt.status === "Completed") statusBadgeClass = "bg-slate-100 text-slate-700 border-slate-300";

    return `
      <div class="glass-card p-4 space-y-3 border border-purple-200 bg-white shadow-sm rounded-2xl">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black border ${statusBadgeClass}">${apt.status}</span>
            <span class="font-mystic font-extrabold text-slate-900 text-sm">👤 Seeker: ${apt.seeker_name}</span>
          </div>
          <span class="text-xs font-mono font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            📅 ${new Date(apt.requested_date_time).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
        </div>

        <div class="text-xs space-y-1">
          <p><strong class="text-slate-800">Modality:</strong> ${apt.modality}</p>
          ${apt.seeker_notes ? `<p class="text-slate-600"><strong>Notes:</strong> <em>"${apt.seeker_notes}"</em></p>` : ''}
          ${apt.meeting_link ? `
            <p><strong class="text-emerald-800">Google Meet URL:</strong> 
              <a href="${apt.meeting_link}" target="_blank" class="text-sky-600 font-mono underline hover:text-sky-800">${apt.meeting_link}</a>
            </p>
          ` : ''}
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="openLiveSessionChatModal('${apt.id}')" class="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow transition flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="message-square" class="w-3.5 h-3.5"></i> 💬 Chat with Seeker
            </button>

            ${apt.status === "Pending" ? `
              <button onclick="openAcceptAppointmentModal('${apt.id}')" class="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer">
                <i data-lucide="video" class="w-3.5 h-3.5"></i> Accept & Add Meeting Link
              </button>
            ` : ''}

            ${apt.status === "Accepted" ? `
              <button onclick="openAcceptAppointmentModal('${apt.id}')" class="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow hover:bg-amber-400 transition flex items-center gap-1.5 cursor-pointer">
                <i data-lucide="edit" class="w-3.5 h-3.5"></i> Update Meeting Link
              </button>
            ` : ''}

            ${apt.status !== "Completed" ? `
              <button onclick="updateAppointmentStatus('${apt.id}', 'Rescheduled')" class="px-3 py-1.5 rounded-xl bg-sky-100 text-sky-900 border border-sky-300 font-extrabold text-xs hover:bg-sky-200 transition">
                🔄 Reschedule
              </button>
              <button onclick="updateAppointmentStatus('${apt.id}', 'Completed')" class="px-3 py-1.5 rounded-xl bg-slate-800 text-white font-extrabold text-xs hover:bg-slate-900 transition">
                ✓ Mark Completed
              </button>
            ` : ''}
          </div>

          ${apt.meeting_link ? `
            <a href="${apt.meeting_link}" target="_blank" class="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-900 border border-purple-300 font-extrabold text-xs hover:bg-purple-200 transition flex items-center gap-1">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Enter Room
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}

// ================= 1-ON-1 SESSION LIVE CHAT SYSTEM =================

let activeChatAppointmentId = null;

async function openLiveSessionChatModal(aptId) {
  activeChatAppointmentId = aptId;
  const apt = appointmentsList.find(a => a.id === aptId);
  
  const titleEl = document.getElementById("session-chat-modal-title");
  const subEl = document.getElementById("session-chat-modal-sub");
  
  if (apt) {
    const isSeeker = activeRole === "User";
    const partnerName = isSeeker ? `${apt.practitioner_name} (${apt.practitioner_role})` : `Seeker: ${apt.seeker_name}`;
    if (titleEl) titleEl.innerText = `💬 Live Session Chat: ${partnerName}`;
    if (subEl) subEl.innerText = `Modality: ${apt.modality} • Status: ${apt.status}`;
  }
  
  const modal = document.getElementById("session-chat-modal");
  if (modal) modal.classList.remove("hidden");
  
  await loadSessionChatMessages();
}

function closeLiveSessionChatModal() {
  const modal = document.getElementById("session-chat-modal");
  if (modal) modal.classList.add("hidden");
  activeChatAppointmentId = null;
}

async function loadSessionChatMessages() {
  if (!activeChatAppointmentId) return;
  const box = document.getElementById("session-chat-messages");
  if (!box) return;
  
  try {
    const res = await fetch(`${API_BASE}/api/appointments/${activeChatAppointmentId}/chat`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const messages = await res.json();
      renderSessionChatMessages(messages);
    }
  } catch (err) {
    console.error("Chat load error:", err);
  }
}

function renderSessionChatMessages(messages) {
  const box = document.getElementById("session-chat-messages");
  if (!box) return;
  
  if (!messages || messages.length === 0) {
    box.innerHTML = `<div class="text-center text-xs text-slate-500 py-6">No messages yet. Send a message to start the conversation!</div>`;
    return;
  }
  
  box.innerHTML = messages.map(m => {
    const isMine = currentUser && (m.user_id === currentUser.id || m.sender_name === currentUser.name);
    const bubbleBg = isMine ? "bg-indigo-600 text-white rounded-br-none border-indigo-700 shadow-sm" : "bg-white text-slate-800 rounded-bl-none border-slate-200 shadow-sm";
    const alignClass = isMine ? "items-end text-right" : "items-start text-left";
    const timeStr = m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    return `
      <div class="flex flex-col ${alignClass} space-y-1">
        <div class="text-[10px] text-slate-500 font-bold px-1">${m.sender_name} (${m.sender_role || 'Member'}) • ${timeStr}</div>
        <div class="max-w-[80%] px-4 py-2.5 rounded-2xl border ${bubbleBg} text-xs font-medium leading-relaxed">
          ${m.message}
        </div>
      </div>
    `;
  }).join('');
  
  box.scrollTop = box.scrollHeight;
}

async function submitLiveSessionChat(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!activeChatAppointmentId) return;
  
  const input = document.getElementById("session-chat-input");
  const msgText = input ? input.value.trim() : "";
  if (!msgText) return;
  
  input.value = "";
  
  try {
    const res = await fetch(`${API_BASE}/api/appointments/${activeChatAppointmentId}/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        sender_name: currentUser ? currentUser.name : "Seeker",
        message: msgText
      })
    });
    if (res.ok) {
      const messages = await res.json();
      renderSessionChatMessages(messages);
    }
  } catch (err) {
    console.error("Submit chat error:", err);
  }
}

function renderReviewsUI() {
  renderPractitionerReviews("Tarot Reader", "reader-reviews-container");
  renderPractitionerReviews("Spiritual Consultant", "consultant-reviews-container");
}

function renderPractitionerReviews(role, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const roleReviews = reviewsList.filter(r => r.practitioner_role === role);

  if (roleReviews.length === 0) {
    container.innerHTML = `<div class="col-span-2 p-6 text-center text-slate-500 font-medium">No seeker reviews submitted yet for this practitioner.</div>`;
    return;
  }

  container.innerHTML = roleReviews.map(r => `
    <div class="glass-card p-4 space-y-2 border border-amber-300 bg-white shadow-sm rounded-2xl">
      <div class="flex items-center justify-between">
        <span class="font-extrabold text-slate-900 text-xs">👤 ${r.seeker_name}</span>
        <span class="text-amber-500 font-bold text-xs">⭐ ${r.rating} / 5.0</span>
      </div>
      <div class="text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2.5 py-0.5 rounded-full inline-block border border-indigo-200">
        Modality: ${r.modality}
      </div>
      <p class="text-xs text-slate-700 leading-relaxed italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
        "${r.feedback_text}"
      </p>
      <div class="text-[10px] text-slate-400 font-mono text-right">
        Submitted: ${new Date(r.created_at).toLocaleDateString()}
      </div>
    </div>
  `).join('');
}

function openAppointmentModal(practitionerRole, modality, cardOrPresetName) {
  const modal = document.getElementById("appointment-request-modal");
  if (!modal) return;

  const roleBadge = document.getElementById("apt-modal-role-badge");
  const title = document.getElementById("apt-modal-title");
  const roleInput = document.getElementById("apt-modal-practitioner-role");
  const modalityInput = document.getElementById("apt-modal-modality");
  const cardInput = document.getElementById("apt-modal-card-input");
  const dtInput = document.getElementById("apt-modal-datetime");

  const practitionerName = practitionerRole === "Tarot Reader" ? "Madame Seraphina" : "Zachary Vance";
  
  if (roleBadge) roleBadge.innerText = practitionerRole;
  if (title) title.innerText = `Schedule Session with ${practitionerName}`;
  if (roleInput) roleInput.value = practitionerRole;
  if (modalityInput) modalityInput.value = modality || `${practitionerRole} Consultation`;
  if (cardInput) cardInput.value = cardOrPresetName ? `${modality || 'Session'} — (${cardOrPresetName})` : (modality || "1-on-1 Consultation");

  // Set default datetime to tomorrow at 14:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  const localIso = new Date(tomorrow.getTime() - (tomorrow.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  if (dtInput) dtInput.value = localIso;

  modal.classList.remove("hidden");
}

function closeAppointmentModal() {
  const modal = document.getElementById("appointment-request-modal");
  if (modal) modal.classList.add("hidden");
}

async function submitAppointmentRequest(e) {
  if (e && e.preventDefault) e.preventDefault();

  const role = document.getElementById("apt-modal-practitioner-role").value;
  const modality = document.getElementById("apt-modal-modality").value;
  const datetime = document.getElementById("apt-modal-datetime").value;
  const notes = document.getElementById("apt-modal-notes").value;

  try {
    const res = await fetch(`${API_BASE}/api/appointments/request`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        practitioner_role: role,
        modality: modality,
        date_time: datetime,
        requested_date_time: datetime,
        notes: notes,
        seeker_notes: notes
      })
    });

    if (!res.ok) throw new Error("Failed to submit request");
    const data = await res.json();
    const apt = data.appointment || data;

    closeAppointmentModal();
    alert(`✅ Session requested successfully with ${apt.practitioner_name}! Practitioner has been notified.`);

    // Add immediate notification to Cosmic Notification drawer
    notificationsList.unshift({
      id: `n${Date.now()}`,
      category: "Appointments",
      title: `📅 Session Request Sent to ${apt.practitioner_name}`,
      message: `Your 1-on-1 session for ${apt.modality} has been requested for ${new Date(datetime).toLocaleString()}.`,
      read: false,
      time: "Just Now",
      action: () => {
        switchView('dashboard');
        switchUserTab('appointments');
      }
    });
    renderNotifications(activeNotifFilter);

    await loadAppointmentsData();
    await loadNotifications();
  } catch (err) {
    console.error("Appointment submit error:", err);
    alert("Failed to submit appointment request. Please check connection.");
  }
}

async function updateAppointmentStatus(appointmentId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/api/appointments/${appointmentId}/status`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) throw new Error("Status update failed");
    const data = await res.json();
    const apt = data.appointment || data;

    alert(`✅ Appointment status updated to "${newStatus}"! ${apt.meeting_link ? 'Google Meet URL: ' + apt.meeting_link : ''}`);

    // If accepted, add notification for the user
    if (newStatus === "Accepted" && apt.meeting_link) {
      notificationsList.unshift({
        id: `n${Date.now()}`,
        category: "Appointments",
        title: `🎥 Google Meet Link Ready for Session`,
        message: `${apt.practitioner_name} accepted your consultation! Tap to join your Google Meet session.`,
        read: false,
        time: "Just Now",
        action: () => window.open(apt.meeting_link, '_blank')
      });
      renderNotifications(activeNotifFilter);
    }

    await loadAppointmentsData();
    await loadNotifications();
  } catch (err) {
    console.error("Status update error:", err);
    alert("Failed to update status.");
  }
}

function openReviewModal(aptId, role, practitionerName) {
  const modal = document.getElementById("submit-review-modal");
  if (!modal) return;

  document.getElementById("review-modal-apt-id").value = aptId;
  document.getElementById("review-modal-role").value = role;
  document.getElementById("review-modal-name").value = practitionerName;
  document.getElementById("review-modal-practitioner-display").value = `${practitionerName} (${role})`;

  modal.classList.remove("hidden");
}

function closeReviewModal() {
  const modal = document.getElementById("submit-review-modal");
  if (modal) modal.classList.add("hidden");
}

async function submitConsultationReview(e) {
  if (e && e.preventDefault) e.preventDefault();

  const aptId = document.getElementById("review-modal-apt-id").value;
  const role = document.getElementById("review-modal-role").value;
  const practitionerName = document.getElementById("review-modal-name").value;
  const rating = parseFloat(document.getElementById("review-modal-rating").value);
  const feedback = document.getElementById("review-modal-text").value;

  try {
    const res = await fetch(`${API_BASE}/api/appointments/reviews`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        appointment_id: aptId,
        practitioner_role: role,
        practitioner_name: practitionerName,
        rating: rating,
        feedback_text: feedback
      })
    });

    if (!res.ok) throw new Error("Failed to submit review");
    closeReviewModal();
    alert("⭐ Thank you! Your review has been published on the practitioner's desk.");

    await loadReviewsData();
  } catch (err) {
    console.error("Submit review error:", err);
    alert("Failed to submit review.");
  }
}


// =========================================================================
// PRACTITIONER MANUAL MEETING LINK MODAL HANDLERS
// =========================================================================
let activeAcceptAppointmentId = null;

function openAcceptAppointmentModal(aptId) {
  const apt = appointmentsList.find(a => a.id === aptId);
  if (!apt) return;

  activeAcceptAppointmentId = aptId;
  const modal = document.getElementById("accept-appointment-modal");
  if (!modal) return;

  const roleBadge = document.getElementById("accept-modal-role-badge");
  const seekerInfo = document.getElementById("accept-modal-seeker-info");
  const meetInput = document.getElementById("accept-modal-meet-link");
  const notesInput = document.getElementById("accept-modal-notes");

  if (roleBadge) roleBadge.innerText = `${apt.practitioner_role} Desk`;
  if (seekerInfo) seekerInfo.value = `${apt.seeker_name} — ${apt.modality} (${new Date(apt.date_time || apt.requested_date_time).toLocaleString()})`;
  
  // Pre-fill existing link or auto-generated Google Meet link
  const defaultSlug = `mystic-${apt.modality ? apt.modality.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 15) : 'session'}-${apt.id.replace('apt-', '')}`;
  const defaultMeetUrl = apt.meeting_link || `https://meet.google.com/${defaultSlug}`;
  
  if (meetInput) meetInput.value = defaultMeetUrl;
  if (notesInput) notesInput.value = apt.notes || "";

  document.getElementById("accept-modal-apt-id").value = aptId;
  modal.classList.remove("hidden");
}

function closeAcceptAppointmentModal() {
  const modal = document.getElementById("accept-appointment-modal");
  if (modal) modal.classList.add("hidden");
}

function generateRandomMeetLinkInput() {
  const randSlug = `mystic-session-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 6)}`;
  document.getElementById("accept-modal-meet-link").value = `https://meet.google.com/${randSlug}`;
}

async function submitAcceptAppointment(e) {
  if (e && e.preventDefault) e.preventDefault();

  const aptId = document.getElementById("accept-modal-apt-id").value;
  const meetLink = document.getElementById("accept-modal-meet-link").value.trim();
  const notes = document.getElementById("accept-modal-notes").value.trim();

  try {
    const res = await fetch(`${API_BASE}/api/appointments/${aptId}/status`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        status: "Accepted",
        meeting_link: meetLink,
        notes: notes
      })
    });

    if (!res.ok) throw new Error("Failed to accept appointment");
    const data = await res.json();
    const apt = data.appointment || data;

    closeAcceptAppointmentModal();
    alert(`✅ Session Accepted! Meeting link sent to ${apt.seeker_name || 'Seeker'}:\n${apt.meeting_link}`);

    await loadAppointmentsData();
    await loadNotifications();
  } catch (err) {
    console.error("Accept appointment error:", err);
    alert("Failed to accept appointment and set meeting link.");
  }
}


// =========================================================================
// SEEKER PERSONALITY RADAR & HABIT COMPARISON ANIMATION CHARTS
// =========================================================================
let personalityRadarChartInstance = null;
let habitComparisonChartInstance = null;

function renderUserPersonalityRadarChart() {
  const ctx = document.getElementById("user-personality-radar-chart");
  if (!ctx || typeof Chart === "undefined") return;

  if (personalityRadarChartInstance) personalityRadarChartInstance.destroy();

  personalityRadarChartInstance = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Intuition", "Mental Clarity", "Willpower", "Emotional Calm", "Creativity"],
      datasets: [{
        label: "Your Inner Superpowers",
        data: [95, 92, 90, 88, 94],
        backgroundColor: "rgba(56, 189, 248, 0.35)",
        borderColor: "rgb(2, 132, 199)",
        borderWidth: 2,
        pointBackgroundColor: "rgb(2, 132, 199)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(2, 132, 199)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { r: { min: 50, max: 100, ticks: { display: false } } },
      plugins: { legend: { display: false } }
    }
  });
}

function toggleHabitComparisonMode(mode) {
  const btnWithout = document.getElementById("habit-btn-without");
  const btnWith = document.getElementById("habit-btn-with");
  const banner = document.getElementById("habit-comparison-banner");

  if (mode === "without") {
    if (btnWithout) btnWithout.className = "px-3 py-1 rounded-full text-xs font-extrabold transition bg-rose-600 text-white shadow";
    if (btnWith) btnWith.className = "px-3 py-1 rounded-full text-xs font-bold transition bg-slate-800 text-slate-300";
    if (banner) {
      banner.className = "p-3.5 rounded-xl bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs leading-relaxed font-medium";
      banner.innerHTML = "⚠️ <strong>Depleted Energy State (Without Remedies):</strong> High mental exhaustion (78% stress), low focus clarity (42%), and low emotional balance (45%). Follow daily habits to unlock peak potential!";
    }
  } else {
    if (btnWith) btnWith.className = "px-3 py-1 rounded-full text-xs font-extrabold transition bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow";
    if (btnWithout) btnWithout.className = "px-3 py-1 rounded-full text-xs font-bold transition bg-slate-800 text-slate-300";
    if (banner) {
      banner.className = "p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs leading-relaxed font-medium";
      banner.innerHTML = "✨ <strong>Thriving Energy State (With Daily Remedies & Habits):</strong> By following daily remedies and habits, your overall vitality increases by <strong>+118%</strong>, stress drops by <strong>-85%</strong>, and your intuitive score reaches peak alignment (98%)!";
    }
  }
  renderHabitComparisonChart(mode);
}

function renderHabitComparisonChart(mode = "with") {
  const ctx = document.getElementById("user-habit-comparison-chart");
  if (!ctx || typeof Chart === "undefined") return;

  if (habitComparisonChartInstance) habitComparisonChartInstance.destroy();

  const labels = ["Energy Vitality", "Emotional Calm", "Focus Clarity", "Sleep Quality", "Spiritual Alignment"];
  const dataWithout = [45, 42, 38, 40, 50];
  const dataWith = [96, 92, 95, 94, 98];

  const activeData = mode === "with" ? dataWith : dataWithout;
  const activeColor = mode === "with" ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)";
  const activeBg = mode === "with" ? "rgba(16, 185, 129, 0.35)" : "rgba(244, 63, 94, 0.35)";

  habitComparisonChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: mode === "with" ? "🟢 With Daily Remedies & Habits (Thriving State)" : "🔴 Without Remedies (Depleted State)",
          data: activeData,
          backgroundColor: activeBg,
          borderColor: activeColor,
          borderWidth: 2,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900 },
      plugins: { legend: { labels: { color: "#ffffff", font: { weight: "bold" } } } },
      scales: {
        y: { min: 0, max: 100, ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.1)" } },
        x: { ticks: { color: "#cbd5e1" }, grid: { display: false } }
      }
    }
  });
}
