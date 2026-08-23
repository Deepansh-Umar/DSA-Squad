// Core Javascript for DSA Tracker Single-Page Application

// Application State
let appState = {
  topics: [], // Static list of topics and questions
  progress: {}, // Active user progress from LocalStorage/Supabase
  allUsersProgress: {}, // All members' progress fetched on load
  selectedUser: 'Deepansh', // Current active page ('Deepansh', 'Bhumika', or 'Admin')
  sidebarCollapsed: false,
  theme: 'dark', // 'light' or 'dark'
  expandedTopics: new Set(), // Set of topic IDs currently expanded
  dailyTasks: {}, // Team daily tasks stored by date string
  filters: {
    search: '',
    difficulty: '',
    status: ''
  }
};

// SVG Icons
const SVG_ICONS = {
  crown: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path></svg>`,
  trophy: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>`,
  flame: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"></path></svg>`,
  zap: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  medal: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>`,
  target: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
  rocket: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-3.05 11a22.35 22.35 0 0 1-3.95 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>`,
  lock: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  unlock: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`,
  check: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--solved)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  clock: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--attempted)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  star: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--mastered)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  cross: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--not-started)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
  chart: `<svg class="icon-inline" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>`,
  externalLink: `<svg class="link-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin='round'><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`
};

// Supabase Configuration
const SUPABASE_URL = "https://frcdaaystyoqriobaufo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyY2RhYXlzdHlvcXJpb2JhdWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMjU3MzUsImV4cCI6MjEwMjkwMTczNX0.QFLYt6zNnKPFN_JR-CuXjhSRBnGCNdvPgEElU9_TRg4";

// Team Members List
const USERS = [
  'Deepansh',
  'Bhumika',
  'Nitish',
  'Aditya',
  'Aman',
  'Prashant',
  'Garima',
  'Vivek',
  'Vaibhav',
  'Renuka'
];

// Preconfigured SHA-256 password hashes (default: lowercase name + "123")
const USER_PASSWORD_HASHES = {
  'Deepansh': '009fa096988580b5e67bb933d287e2353bed7ca93fa97b405d57b9ec4b22045b',
  'Bhumika': '87f1049efc48ddfddab5c05a5dd1d87f5a53e9f2174804573cc7bd77da75f97f',
  'Nitish': '31ed8201a1eb920a75af66fcf2c47a8bd9c8ed9a0004b51ad12ce8e27de45ec2',
  'Aditya': '5a9dad9cb3c47bc5fb18642ab08948f438ea97e4ab839bed7819daba242ba74c',
  'Aman': '6190b76144de088a1dfffeb13fb916e0b8160ce5f5b5e11ea72a25dc5b0d0b85',
  'Prashant': '433c70b884e08aa71fbd9d083425904ebbccd528bdd378444fe87bc8b1ecc8a8',
  'Garima': '438569b625b26b5cdaad37377af8268702cebeac68d239c1dd58f622f82322a2',
  'Vivek': '6e7c74d1860b2d9d957306330e85592437a5e5848641c2d7b53794470c4fea06',
  'Vaibhav': '8448f3120b8e4ce66cd1330bb6afe0de74b7ac1716cdb31142fe9177c707621e',
  'Renuka': '3343a678860be16eb56c68d8c3a40061e92d0ee60d48bcb50dbe1bd999f690ba'
};

// Fetch helper with timeout safeguard
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 4000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initSidebarState();
  setupEventListeners();
  
  // Load local storage cache into state immediately for sub-10ms render
  const localAllProgress = localStorage.getItem('dsa_all_progress');
  if (localAllProgress) {
    try {
      appState.allUsersProgress = JSON.parse(localAllProgress);
    } catch (e) {}
  }

  await fetchQuestions(); // Load questions list first
  await loadAllUsersProgress(); // Load database records
  determineInitialUser(); // Navigate to requested user page
  renderDailyTasksWidget(); // Render the team daily tasks panel
});

// Setup Theme (Enforced Dark Mode)
function initTheme() {
  appState.theme = 'dark';
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('dsa_theme', 'dark');
}

// Toggle Theme (Dark mode default)
function toggleTheme() {
  appState.theme = 'dark';
  document.documentElement.setAttribute('data-theme', 'dark');
  localStorage.setItem('dsa_theme', 'dark');
}

// Sidebar Collapsed/Expanded Persistence
function initSidebarState() {
  const sidebar = document.getElementById('sidebar');
  const collapsed = localStorage.getItem('dsa_sidebar_collapsed') === 'true';
  appState.sidebarCollapsed = collapsed;
  if (sidebar) {
    if (collapsed) {
      sidebar.classList.add('collapsed');
    } else {
      sidebar.classList.remove('collapsed');
    }
  }
}

// Toggle Sidebar Width
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  appState.sidebarCollapsed = !appState.sidebarCollapsed;
  localStorage.setItem('dsa_sidebar_collapsed', appState.sidebarCollapsed);
  if (sidebar) {
    sidebar.classList.toggle('collapsed', appState.sidebarCollapsed);
  }
}

// Determine initial user based on query parameter, localstorage, or default
function determineInitialUser() {
  const urlParams = new URLSearchParams(window.location.search);
  const userParam = urlParams.get('user');
  
  if (userParam && (USERS.includes(userParam) || userParam === 'Admin')) {
    switchUser(userParam, false);
  } else {
    const savedUser = localStorage.getItem('dsa_selected_user');
    if (savedUser && (USERS.includes(savedUser) || savedUser === 'Admin')) {
      switchUser(savedUser, false);
    } else {
      switchUser('Deepansh', false);
    }
  }
}

// SHA-256 Hashing helper
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if current user page is authenticated for write access
function checkAuth(username) {
  if (username === 'Admin') return false; // Admin is always read-only
  return localStorage.getItem(`dsa_auth_${username}`) === 'true';
}

// Local Date helper (Timezone-locked to IST UTC+5.5)
function getLocalDateString(date = new Date()) {
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (3600000 * 5.5));
  
  const y = istTime.getFullYear();
  const m = String(istTime.getMonth() + 1).padStart(2, '0');
  const d = String(istTime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Load ALL users' progress from Supabase
async function loadAllUsersProgress() {
  const statusIndicator = document.getElementById('save-status-indicator');
  if (statusIndicator) {
    statusIndicator.className = 'save-status-indicator saving';
    statusIndicator.querySelector('.status-text').innerText = 'Syncing...';
  }

  try {
    const response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/progress`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      timeout: 4000
    });

    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.status}`);
    }

    const rows = await response.json();
    appState.allUsersProgress = {};
    rows.forEach(row => {
      appState.allUsersProgress[row.id] = row.data || {};
    });

    // Extract daily tasks
    appState.dailyTasks = appState.allUsersProgress['team_daily_tasks'] || {};

    // Rebuild topics list to append dynamic Assignments category
    rebuildTopicsList();

    // Check if we need to auto-assign tasks for today
    await checkAndAutoAssignTasks();

    // Save to local storage cache
    localStorage.setItem('dsa_all_progress', JSON.stringify(appState.allUsersProgress));

    // Run migration if Deepansh progress does not exist but user_progress does
    await runDeepanshMigration();

    if (statusIndicator) {
      statusIndicator.className = 'save-status-indicator saved';
      statusIndicator.querySelector('.status-text').innerText = 'Synced';
    }
  } catch (error) {
    console.warn("Could not fetch progress from Supabase, using local cache:", error);
    
    // Attempt local storage fallback
    const localAllProgress = localStorage.getItem('dsa_all_progress');
    if (localAllProgress) {
      try {
        appState.allUsersProgress = JSON.parse(localAllProgress);
      } catch (e) {}
    }
    
    if (statusIndicator) {
      statusIndicator.className = 'save-status-indicator error';
      statusIndicator.querySelector('.status-text').innerText = 'Offline';
    }
  }
}

// Migrate user_progress to progress_Deepansh if needed
async function runDeepanshMigration() {
  const targetId = 'progress_Deepansh';
  const legacyId = 'user_progress';
  
  if (!appState.allUsersProgress[targetId] && appState.allUsersProgress[legacyId]) {
    console.log("Migrating legacy 'user_progress' to 'progress_Deepansh'...");
    const data = appState.allUsersProgress[legacyId];
    appState.allUsersProgress[targetId] = data;

    try {
      await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/progress`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ id: targetId, data: data }),
        timeout: 4000
      });
      showToast("Migrated existing tracker data to Deepansh's page", "success");
    } catch (e) {
      console.error("Migration failed:", e);
    }
  }
}

// Save active user progress to Supabase and LocalStorage
async function saveProgress() {
  if (appState.selectedUser === 'Admin') return; // Cannot edit Admin page
  
  const targetId = `progress_${appState.selectedUser}`;
  appState.allUsersProgress[targetId] = appState.progress;
  
  // Persist offline local backup
  localStorage.setItem(`dsa_progress_${appState.selectedUser}`, JSON.stringify(appState.progress));
  localStorage.setItem('dsa_all_progress', JSON.stringify(appState.allUsersProgress));
  
  renderSidebar();
  updateStats();
  renderMilestones();
  renderDailyTasksWidget();

  const statusIndicator = document.getElementById('save-status-indicator');
  if (statusIndicator) {
    statusIndicator.className = 'save-status-indicator saving';
    statusIndicator.querySelector('.status-text').innerText = 'Syncing...';
  }

  try {
    const response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/progress`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: targetId,
        data: appState.progress
      }),
      timeout: 4000
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    if (statusIndicator) {
      statusIndicator.className = 'save-status-indicator saved';
      statusIndicator.querySelector('.status-text').innerText = 'Synced';
    }
  } catch (error) {
    console.error("Failed to sync progress to cloud:", error);
    showToast("Failed to sync changes with cloud.", "error");
    if (statusIndicator) {
      statusIndicator.className = 'save-status-indicator error';
      statusIndicator.querySelector('.status-text').innerText = 'Offline';
    }
  }
}

// Switch view between users or Admin
window.switchUser = function(username, updateUrl = true) {
  appState.selectedUser = username;
  localStorage.setItem('dsa_selected_user', username);
  
  if (updateUrl) {
    const url = new URL(window.location);
    url.searchParams.set('user', username);
    window.history.pushState({}, '', url);
  }

  // Update layout header info
  const titleEl = document.getElementById('header-user-title');
  const subtitleEl = document.getElementById('header-user-subtitle');
  
  // Close mobile sidebar if open
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay-mobile').classList.remove('active');

  if (username === 'Admin') {
    titleEl.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 8px;">${SVG_ICONS.crown} Admin Dashboard</span>`;
    subtitleEl.innerText = 'Track team progress, goals, solved questions, and topic heatmaps.';
    
    document.getElementById('user-workspace-view').style.display = 'none';
    document.getElementById('admin-workspace-view').style.display = 'block';
    
    renderAdminDashboard();
  } else {
    titleEl.innerText = `${username}'s DSA Tracker`;
    subtitleEl.innerText = `Master coding interview patterns. Progress is synced automatically for ${username}.`;
    
    document.getElementById('user-workspace-view').style.display = 'block';
    document.getElementById('admin-workspace-view').style.display = 'none';
    
    // Load this user's progress
    const targetId = `progress_${username}`;
    appState.progress = appState.allUsersProgress[targetId] || {};
    
    // Render user sheet
    renderDashboard();
    renderMilestones();
    renderDailyTasksWidget();
    
    // Trigger daily goal popup if logged in and no goal set for today
    if (checkAuth(username)) {
      setTimeout(checkAndPromptDailyGoal, 800);
    }
  }

  renderSidebar();
  renderAuthWidget();
};

// Render Auth Lock / Edit Status badge
function renderAuthWidget() {
  const container = document.getElementById('auth-status-container');
  if (!container) return;

  const user = appState.selectedUser;
  if (user === 'Admin') {
    container.innerHTML = `<span class="status-badge unlocked" style="color: var(--primary); border-color: rgba(249, 171, 54, 0.25); background: rgba(249, 171, 54, 0.05); display: flex; align-items: center; gap: 6px;">${SVG_ICONS.crown} Admin View Only</span>`;
    return;
  }

  const isAuth = checkAuth(user);
  if (isAuth) {
    container.innerHTML = `
      <div class="status-badge unlocked">
        <span style="display: flex; align-items: center; gap: 6px;">${SVG_ICONS.unlock} Editing: <strong>${user}</strong></span>
        <button class="unlock-action-btn" onclick="handleLogout()" style="background: transparent; color: var(--hard-text); border: 1px solid rgba(239, 68, 68, 0.25); padding: 4px 8px; border-radius: var(--radius-sm); margin-left: 8px;">Lock</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="status-badge locked">
        <span style="display: flex; align-items: center; gap: 6px;">${SVG_ICONS.lock} Read-only</span>
        <button class="unlock-action-btn" onclick="openLoginModal()">Login</button>
      </div>
    `;
  }
}

// Handle login password submitting
async function handleLoginSubmit() {
  const input = document.getElementById('login-password-input');
  const errorMsg = document.getElementById('login-error-msg');
  const password = input.value;
  const user = appState.selectedUser;

  if (!password) return;

  const isCorrect = await verifyPassword(user, password);
  if (isCorrect) {
    localStorage.setItem(`dsa_auth_${user}`, 'true');
    input.value = '';
    errorMsg.style.display = 'none';
    closeLoginModal();
    renderAuthWidget();
    renderTopicsList(); // Re-render to enable checkboxes
    showToast(`Page unlocked successfully for ${user}!`, 'success');
    
    // Trigger goal check after unlocking
    setTimeout(checkAndPromptDailyGoal, 600);
  } else {
    errorMsg.style.display = 'block';
    input.select();
  }
}

async function verifyPassword(username, enteredPassword) {
  const hash = await sha256(enteredPassword);
  return hash === USER_PASSWORD_HASHES[username];
}

window.handleLogout = function() {
  const user = appState.selectedUser;
  localStorage.removeItem(`dsa_auth_${user}`);
  renderAuthWidget();
  renderTopicsList(); // Re-render to disable checkboxes
  showToast(`Page locked. Read-only access restored for ${user}.`, 'success');
};

// Daily Goal popup logic
function checkAndPromptDailyGoal() {
  const user = appState.selectedUser;
  if (!checkAuth(user)) return; // Only prompt if authenticated

  const todayStr = getLocalDateString();
  if (!appState.progress.goals) {
    appState.progress.goals = {};
  }

  // If no goal configured for today, open the modal
  if (!appState.progress.goals[todayStr]) {
    openGoalModal();
  }
}

function openGoalModal() {
  const modal = document.getElementById('goal-modal-overlay');
  const select = document.getElementById('goal-topic-input');
  
  if (modal && select) {
    // Populate select with existing topics
    select.innerHTML = '<option value="">Any Topic / Mixed Patterns</option>';
    appState.topics.forEach(t => {
      const option = document.createElement('option');
      option.value = t.name;
      option.innerText = t.name;
      select.appendChild(option);
    });

    modal.classList.add('active');
  }
}

function closeGoalModal() {
  const modal = document.getElementById('goal-modal-overlay');
  if (modal) modal.classList.remove('active');
}

// Save Daily Goal
async function saveDailyGoal() {
  const targetCountInput = document.getElementById('goal-count-input');
  const topicSelect = document.getElementById('goal-topic-input');
  const todayStr = getLocalDateString();

  if (!appState.progress.goals) {
    appState.progress.goals = {};
  }

  appState.progress.goals[todayStr] = {
    target: parseInt(targetCountInput.value) || 3,
    topic: topicSelect.value || '',
    completedCount: 0 // Computed dynamically, but initialized for storage
  };

  closeGoalModal();
  await saveProgress();
  showToast("Goal configured for today! Go crack it!", "success");
}

// Fetch questions JSON data
async function fetchQuestions() {
  const loader = document.getElementById('global-loader');
  try {
    if (typeof QUESTIONS_DATA !== 'undefined') {
      appState.topics = QUESTIONS_DATA.filter(t => t.id !== 2); // Exclude static Array topic
    } else {
      const response = await fetch('./questions.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      appState.topics = data.filter(t => t.id !== 2); // Exclude static Array topic
    }
    
    // Rebuild initially to append cached dynamic assignments
    rebuildTopicsList();
    
    if (appState.topics.length > 0) {
      appState.expandedTopics.add(appState.topics[0].id);
    }
    
    if (loader) loader.style.display = 'none';
  } catch (error) {
    console.error("Could not fetch questions data:", error);
    showToast("Error loading question bank.", "error");
  }
}

// Render dynamic user list in sidebar
function renderSidebar() {
  const container = document.getElementById('sidebar-user-list');
  if (!container) return;

  let html = '';
  USERS.forEach(user => {
    const stats = getUserProgressStats(user);
    const activeClass = appState.selectedUser === user ? 'active' : '';
    const initial = user.charAt(0);
    
    html += `
      <li class="user-item ${activeClass}" onclick="switchUser('${user}')">
        <div class="user-item-meta">
          <span class="avatar-circle">${initial}</span>
          <span class="menu-text">${user}</span>
        </div>
        <div class="user-sidebar-stats">
          ${stats.streak > 0 ? `<span class="user-sidebar-streak" title="Streak">${SVG_ICONS.flame} ${stats.streak}</span>` : ''}
          <span class="user-sidebar-progress" title="Completion percentage">${stats.percentage}%</span>
        </div>
      </li>
    `;
  });
  container.innerHTML = html;

  // Set active class on Admin Dashboard button
  const adminBtn = document.getElementById('admin-page-btn');
  if (adminBtn) {
    adminBtn.className = `admin-item ${appState.selectedUser === 'Admin' ? 'active' : ''}`;
  }
}

// Helper to compute progress statistics for a user in memory
function getUserProgressStats(username) {
  const userProgress = appState.allUsersProgress[`progress_${username}`] || {};
  let totalProblems = 0;
  let solvedProblems = 0;

  appState.topics.forEach(topic => {
    topic.problems.forEach(prob => {
      totalProblems++;
      const userProg = userProgress[prob.id];
      const isCompleted = userProg && userProg.completed;
      const status = userProg ? userProg.status : 'NOT_STARTED';

      if (isCompleted || status === 'SOLVED' || status === 'MASTERED') {
        solvedProblems++;
      }
    });
  });

  const percentage = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;
  const streak = calculateStreak(userProgress);

  return {
    solved: solvedProblems,
    total: totalProblems,
    percentage: percentage,
    streak: streak
  };
}

// Render milestones grid based on active user progress
function renderMilestones() {
  const container = document.getElementById('milestones-grid');
  if (!container) return;

  const progress = appState.progress || {};
  const stats = getUserProgressStats(appState.selectedUser);
  const streak = stats.streak;
  
  // Count solved easy
  let easySolved = 0;
  appState.topics.forEach(t => {
    t.problems.forEach(p => {
      const prog = progress[p.id];
      if (p.difficulty.toLowerCase() === 'easy' && prog && (prog.completed || prog.status === 'SOLVED' || prog.status === 'MASTERED')) {
        easySolved++;
      }
    });
  });

  const goalsConfigured = progress.goals ? Object.keys(progress.goals).length : 0;

  // Define achievements
  const achievements = [
    {
      id: 'first_blood',
      title: 'First Blood',
      desc: 'Completed your first coding interview problem!',
      icon: SVG_ICONS.rocket,
      unlocked: stats.solved >= 1
    },
    {
      id: 'goal_getter',
      title: 'Goal Setter',
      desc: 'Configured your first daily question target.',
      icon: SVG_ICONS.target,
      unlocked: goalsConfigured >= 1
    },
    {
      id: 'topic_explorer',
      title: 'Pattern Explorer',
      desc: 'Solved at least 3 questions in a single pattern.',
      icon: SVG_ICONS.flame,
      unlocked: checkPatternSolvedCount(progress, 3)
    },
    {
      id: 'easy_master',
      title: 'Easy Master',
      desc: 'Solved 15 or more Easy questions.',
      icon: SVG_ICONS.trophy,
      unlocked: easySolved >= 15
    },
    {
      id: 'consistency',
      title: 'Dynamic Streak',
      desc: 'Earned an active streak of 3+ consecutive days.',
      icon: SVG_ICONS.zap,
      unlocked: streak >= 3
    },
    {
      id: 'dsa_veteran',
      title: 'DSA Scholar',
      desc: 'Completed 50+ interview questions.',
      icon: SVG_ICONS.medal,
      unlocked: stats.solved >= 50
    }
  ];

  let html = '';
  achievements.forEach(ach => {
    const cardClass = ach.unlocked ? 'unlocked' : 'locked';
    const lockIcon = ach.unlocked ? 
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--easy)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` :
      `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`;
    
    html += `
      <div class="milestone-card ${cardClass}">
        <div class="milestone-badge">
          ${ach.icon}
        </div>
        <div class="milestone-info">
          <div class="milestone-title">${ach.title}</div>
          <div class="milestone-desc">${ach.desc}</div>
        </div>
        <div class="milestone-lock-overlay">${lockIcon}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function checkPatternSolvedCount(progress, threshold) {
  let hasMet = false;
  appState.topics.forEach(t => {
    let count = 0;
    t.problems.forEach(p => {
      const prog = progress[p.id];
      if (prog && (prog.completed || prog.status === 'SOLVED' || prog.status === 'MASTERED')) {
        count++;
      }
    });
    if (count >= threshold) hasMet = true;
  });
  return hasMet;
}

// Streak tracking logic going backwards from today or yesterday
function calculateStreak(progress) {
  const dates = [];
  Object.keys(progress).forEach(key => {
    if (isNaN(key)) return;
    const item = progress[key];
    if (item && item.solvedAt && (item.completed || item.status === 'SOLVED' || item.status === 'MASTERED')) {
      const dateStr = item.solvedAt.split('T')[0];
      if (dateStr && !dates.includes(dateStr)) {
        dates.push(dateStr);
      }
    }
  });

  if (dates.length === 0) return 0;
  dates.sort((a, b) => b.localeCompare(a)); // Sort descending

  const todayStr = getLocalDateString(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  // If no activity today and no activity yesterday, streak is broken
  if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  let checkDate = dates.includes(todayStr) ? new Date() : yesterday;

  while (true) {
    const checkStr = getLocalDateString(checkDate);
    if (dates.includes(checkStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getTodaySolvedCount(progress) {
  const todayStr = getLocalDateString();
  let count = 0;
  Object.keys(progress).forEach(key => {
    if (isNaN(key)) return;
    const item = progress[key];
    if (item && item.solvedAt && (item.completed || item.status === 'SOLVED' || item.status === 'MASTERED')) {
      const dateStr = item.solvedAt.split('T')[0];
      if (dateStr === todayStr) count++;
    }
  });
  return count;
}

// Setup Global Event Listeners
function setupEventListeners() {
  // Sidebar expand/collapse button
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSidebar);
  }

  // Hamburger toggle on mobile
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const overlay = document.getElementById('sidebar-overlay-mobile');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.add('mobile-open');
      overlay.classList.add('active');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('mobile-open');
      overlay.classList.remove('active');
    });
  }

  // Theme Toggle Button
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Search Input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appState.filters.search = e.target.value.toLowerCase().trim();
      renderTopicsList();
    });
  }

  // Difficulty Filter
  const diffFilter = document.getElementById('difficulty-filter');
  if (diffFilter) {
    diffFilter.addEventListener('change', (e) => {
      appState.filters.difficulty = e.target.value;
      renderTopicsList();
    });
  }

  // Status Filter
  const statusFilter = document.getElementById('status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      appState.filters.status = e.target.value;
      renderTopicsList();
    });
  }

  // Toggle Expand/Collapse All Accordions
  const toggleAllBtn = document.getElementById('toggle-all-accordion-btn');
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener('click', () => {
      if (appState.expandedTopics.size === appState.topics.length) {
        appState.expandedTopics.clear();
        toggleAllBtn.innerText = 'Expand All';
      } else {
        appState.topics.forEach(t => appState.expandedTopics.add(t.id));
        toggleAllBtn.innerText = 'Collapse All';
      }
      renderTopicsList();
    });
  }

  // Clear Filters
  const clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (diffFilter) diffFilter.value = '';
      if (statusFilter) statusFilter.value = '';
      
      appState.filters.search = '';
      appState.filters.difficulty = '';
      appState.filters.status = '';
      
      renderTopicsList();
      showToast("Filters cleared", "success");
    });
  }

  // Modal event listeners (JSON sync)
  const importExportBtn = document.getElementById('import-export-btn');
  const modalOverlay = document.getElementById('modal-overlay');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelModalBtn = document.getElementById('cancel-modal-btn');
  const copyBtn = document.getElementById('copy-json-btn');
  const saveImportBtn = document.getElementById('save-import-btn');
  const resetBtn = document.getElementById('reset-progress-btn');

  if (importExportBtn) importExportBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const textarea = document.getElementById('json-textarea');
      if (textarea) {
        textarea.select();
        navigator.clipboard.writeText(textarea.value);
        showToast("JSON copied to clipboard!", "success");
      }
    });
  }

  if (saveImportBtn) {
    saveImportBtn.addEventListener('click', () => {
      const textarea = document.getElementById('json-textarea');
      if (textarea && textarea.value) {
        importProgress(textarea.value);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!checkAuth(appState.selectedUser)) {
        showToast("Error: Access locked. Please log in to reset progress.", "error");
        return;
      }
      if (confirm("Are you absolutely sure you want to reset all progress for this user? This cannot be undone.")) {
        appState.progress = {};
        saveProgress();
        renderDashboard();
        closeModal();
        showToast("Progress reset successfully", "success");
      }
    });
  }

  // Login Modal Event Listeners
  const closeLoginBtn = document.getElementById('close-login-modal-btn');
  const cancelLoginBtn = document.getElementById('cancel-login-modal-btn');
  const submitLoginBtn = document.getElementById('submit-login-btn');
  const loginPasswordInput = document.getElementById('login-password-input');

  if (closeLoginBtn) closeLoginBtn.addEventListener('click', closeLoginModal);
  if (cancelLoginBtn) cancelLoginBtn.addEventListener('click', closeLoginModal);
  if (submitLoginBtn) submitLoginBtn.addEventListener('click', handleLoginSubmit);
  if (loginPasswordInput) {
    loginPasswordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLoginSubmit();
    });
  }

  // Save Daily Goal Button & Modal Controls
  const saveGoalBtn = document.getElementById('save-goal-btn');
  const closeGoalBtn = document.getElementById('close-goal-modal-btn');
  const cancelGoalBtn = document.getElementById('cancel-goal-modal-btn');
  const goalModalOverlay = document.getElementById('goal-modal-overlay');

  if (saveGoalBtn) saveGoalBtn.addEventListener('click', saveDailyGoal);
  if (closeGoalBtn) closeGoalBtn.addEventListener('click', closeGoalModal);
  if (cancelGoalBtn) cancelGoalBtn.addEventListener('click', closeGoalModal);
  if (goalModalOverlay) {
    goalModalOverlay.addEventListener('click', (e) => {
      if (e.target === goalModalOverlay) closeGoalModal();
    });
  }

  // Login modal click-outside dismiss
  const loginModalOverlay = document.getElementById('login-modal-overlay');
  if (loginModalOverlay) {
    loginModalOverlay.addEventListener('click', (e) => {
      if (e.target === loginModalOverlay) closeLoginModal();
    });
  }

  // Global Escape Key to close any active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeLoginModal();
      closeGoalModal();
      closeAssignTasksModal();
    }
  });

  // Admin page button
  const adminBtn = document.getElementById('admin-page-btn');
  if (adminBtn) {
    adminBtn.addEventListener('click', () => switchUser('Admin'));
  }

  // Sticky header scroll behavior
  const toolbar = document.querySelector('.toolbar');
  if (toolbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 150) {
        toolbar.classList.add('scrolled');
      } else {
        toolbar.classList.remove('scrolled');
      }
    });
  }

  // Assign Tasks Modal listeners
  const closeAssignTasksBtn = document.getElementById('close-assign-tasks-btn');
  const cancelAssignTasksBtn = document.getElementById('cancel-assign-tasks-btn');
  const saveAssignTasksBtn = document.getElementById('save-assign-tasks-btn');
  const assignPatternSelect = document.getElementById('assign-pattern-select');
  const assignTasksModalOverlay = document.getElementById('assign-tasks-modal-overlay');

  // New tab and custom add button selectors
  const togglePickSheetBtn = document.getElementById('toggle-pick-sheet-btn');
  const toggleAddLeetcodeBtn = document.getElementById('toggle-add-leetcode-btn');
  const addCustomQuestionBtn = document.getElementById('add-custom-question-btn');

  if (closeAssignTasksBtn) closeAssignTasksBtn.addEventListener('click', closeAssignTasksModal);
  if (cancelAssignTasksBtn) cancelAssignTasksBtn.addEventListener('click', closeAssignTasksModal);
  if (saveAssignTasksBtn) saveAssignTasksBtn.addEventListener('click', saveAssignedTasks);
  if (assignPatternSelect) {
    assignPatternSelect.addEventListener('change', (e) => {
      populateAssignQuestions(e.target.value);
    });
  }
  if (assignTasksModalOverlay) {
    assignTasksModalOverlay.addEventListener('click', (e) => {
      if (e.target === assignTasksModalOverlay) closeAssignTasksModal();
    });
  }

  if (togglePickSheetBtn) togglePickSheetBtn.addEventListener('click', () => toggleModalTabs('sheet'));
  if (toggleAddLeetcodeBtn) toggleAddLeetcodeBtn.addEventListener('click', () => toggleModalTabs('leetcode'));
  if (addCustomQuestionBtn) addCustomQuestionBtn.addEventListener('click', handleAddCustomQuestion);
}

// Open Login Modal
window.openLoginModal = function() {
  const modal = document.getElementById('login-modal-overlay');
  const input = document.getElementById('login-password-input');
  const errorMsg = document.getElementById('login-error-msg');
  const title = document.getElementById('login-modal-title');
  const desc = document.getElementById('login-modal-desc');

  if (modal && input) {
    title.innerText = "Unlock " + appState.selectedUser + "'s Page";
    desc.innerText = "Enter the passcode for " + appState.selectedUser + " to grant write access.";
    errorMsg.style.display = 'none';
    input.value = '';
    modal.classList.add('active');
    setTimeout(() => input.focus(), 150);
  }
};

window.closeLoginModal = function() {
  const modal = document.getElementById('login-modal-overlay');
  if (modal) modal.classList.remove('active');
};

// Open Import/Export Modal
function openModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  const textarea = document.getElementById('json-textarea');
  if (modalOverlay && textarea) {
    textarea.value = JSON.stringify(appState.progress, null, 2);
    modalOverlay.classList.add('active');
  }
}

// Close Modal
function closeModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) {
    modalOverlay.classList.remove('active');
  }
}

// Import progress JSON
function importProgress(jsonString) {
  if (!checkAuth(appState.selectedUser)) {
    showToast("Error: Access locked. Please log in to import progress.", "error");
    return;
  }
  try {
    const data = JSON.parse(jsonString);
    if (typeof data !== 'object' || data === null) {
      throw new Error("Invalid format. Must be a JSON object.");
    }
    appState.progress = data;
    saveProgress();
    renderDashboard();
    closeModal();
    showToast("Progress imported successfully!", "success");
  } catch (error) {
    alert("Failed to import JSON: " + error.message);
    showToast("Import failed", "error");
  }
}

// Render overall components
function renderDashboard() {
  updateStats();
  renderTopicsList();
}

// Calculate Stats and Update UI
function updateStats() {
  let totalProblems = 0;
  let solvedProblems = 0;
  let masteredProblems = 0;
  let attemptedProblems = 0;

  let easyTotal = 0;
  let easySolved = 0;
  let mediumTotal = 0;
  let mediumSolved = 0;
  let hardTotal = 0;
  let hardSolved = 0;

  appState.topics.forEach(topic => {
    topic.problems.forEach(prob => {
      totalProblems++;
      const userProg = appState.progress[prob.id];
      const isCompleted = userProg && userProg.completed;
      const status = userProg ? userProg.status : 'NOT_STARTED';

      if (isCompleted || status === 'SOLVED' || status === 'MASTERED') {
        solvedProblems++;
      }
      if (status === 'MASTERED') {
        masteredProblems++;
      }
      if (status === 'ATTEMPTED') {
        attemptedProblems++;
      }

      const diff = prob.difficulty.toLowerCase();
      if (diff === 'easy') {
        easyTotal++;
        if (isCompleted || status === 'SOLVED' || status === 'MASTERED') easySolved++;
      } else if (diff === 'medium') {
        mediumTotal++;
        if (isCompleted || status === 'SOLVED' || status === 'MASTERED') mediumSolved++;
      } else if (diff === 'hard') {
        hardTotal++;
        if (isCompleted || status === 'SOLVED' || status === 'MASTERED') hardSolved++;
      }
    });
  });

  const percentage = totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0;

  // Update overall progress circle
  const circleFill = document.getElementById('progress-circle-fill');
  const percentageText = document.getElementById('progress-percentage-text');
  const totalSolvedText = document.getElementById('progress-total-solved');

  if (circleFill) {
    const strokeOffset = 182 - (182 * percentage) / 100;
    circleFill.style.strokeDashoffset = strokeOffset;
  }
  if (percentageText) percentageText.innerText = percentage + "%";
  if (totalSolvedText) totalSolvedText.innerText = solvedProblems + " / " + totalProblems + " Solved";

  // Update numerical stats counters
  updateStatCard('stat-easy', easySolved, easyTotal, '#10b981');
  updateStatCard('stat-medium', mediumSolved, mediumTotal, '#f59e0b');
  updateStatCard('stat-hard', hardSolved, hardTotal, '#ef4444');
}

// Update single statistics card
function updateStatCard(elementId, current, total, color) {
  const card = document.getElementById(elementId);
  if (!card) return;

  const valueEl = card.querySelector('.stat-value');
  const subtitleEl = card.querySelector('.stat-subtitle');
  const fillEl = card.querySelector('.stat-progress-fill');

  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  if (valueEl) valueEl.innerText = `${current} / ${total}`;
  if (subtitleEl) subtitleEl.innerText = `${percent}% Completed`;
  if (fillEl) {
    fillEl.style.width = `${percent}%`;
    fillEl.style.background = color;
  }
}

// Toggle expansion of a topic panel
window.toggleTopicExpand = function(topicId) {
  const panel = document.getElementById(`topic-panel-${topicId}`);
  const content = panel ? panel.querySelector('.topic-content') : null;
  
  if (appState.expandedTopics.has(topicId)) {
    appState.expandedTopics.delete(topicId);
    if (panel) panel.classList.remove('expanded');
    if (content) content.style.maxHeight = '0px';
  } else {
    appState.expandedTopics.add(topicId);
    if (panel) panel.classList.add('expanded');
    if (content) {
      content.style.maxHeight = `${content.scrollHeight}px`;
      setTimeout(() => {
        if (appState.expandedTopics.has(topicId)) {
          content.style.maxHeight = 'none';
        }
      }, 400);
    }
  }
};

// Check if a question matches active search & filters
function isProblemMatchingFilters(prob, topicId) {
  const userProg = appState.progress[prob.id];
  const status = userProg ? userProg.status : 'NOT_STARTED';

  if (appState.filters.search) {
    const q = appState.filters.search;
    const matchesTitle = prob.title.toLowerCase().includes(q);
    const matchesId = prob.id.toString().includes(q);
    if (!matchesTitle && !matchesId) return false;
  }

  if (appState.filters.difficulty && prob.difficulty.toUpperCase() !== appState.filters.difficulty.toUpperCase()) {
    return false;
  }

  if (appState.filters.status) {
    if (appState.filters.status === 'COMPLETED' && status !== 'SOLVED' && status !== 'MASTERED') {
      return false;
    }
    if (appState.filters.status === 'NOT_STARTED' && status !== 'NOT_STARTED') {
      return false;
    }
    if (appState.filters.status === 'ATTEMPTED' && status !== 'ATTEMPTED') {
      return false;
    }
    if (appState.filters.status === 'MASTERED' && status !== 'MASTERED') {
      return false;
    }
  }

  return true;
}

// Render the main hierarchical list of topics & questions
function renderTopicsList() {
  const container = document.getElementById('topics-list');
  if (!container) return;

  if (appState.topics.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No topics loaded.</p></div>';
    return;
  }

  const isLocked = !checkAuth(appState.selectedUser);
  let html = '';
  let visibleTopicsCount = 0;

  appState.topics.forEach(topic => {
    const visibleProblems = topic.problems.filter(prob => isProblemMatchingFilters(prob, topic.id));
    const isFilterActive = appState.filters.search || appState.filters.difficulty || appState.filters.status;
    if (isFilterActive && visibleProblems.length === 0) return;
    
    visibleTopicsCount++;

    // Calculate stats
    let totalProblemsInTopic = topic.problems.length;
    let totalSolvedInTopic = 0;
    topic.problems.forEach(p => {
      const prog = appState.progress[p.id];
      const status = prog ? prog.status : 'NOT_STARTED';
      if (prog && prog.completed || status === 'SOLVED' || status === 'MASTERED') {
        totalSolvedInTopic++;
      }
    });

    const topicPercent = totalProblemsInTopic > 0 ? Math.round((totalSolvedInTopic / totalProblemsInTopic) * 100) : 0;
    const isExpanded = appState.expandedTopics.has(topic.id);

    html += `
      <div class="topic-panel ${isExpanded ? 'expanded' : ''}" id="topic-panel-${topic.id}">
        <div class="topic-header" onclick="toggleTopicExpand(${topic.id})">
          <div class="topic-info">
            <div class="topic-badge-id">${topic.id}</div>
            <div class="topic-title">${escapeHTML(topic.name)}</div>
          </div>
          <div class="topic-stats">
            <span class="topic-percentage">${totalSolvedInTopic}/${totalProblemsInTopic}</span>
            <div class="topic-progress-mini">
              <div class="topic-progress-fill" style="width: ${topicPercent}%"></div>
            </div>
            <svg class="chevron-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
        <div class="topic-content" style="max-height: ${isExpanded ? 'none' : '0px'}">
          ${topic.isAssignmentsCategory ? 
            // Group problems by subtopic
            topic.subtopics.map(sub => {
              const subProblems = sub.problems.filter(prob => isProblemMatchingFilters(prob, topic.id));
              if (subProblems.length === 0) return '';
              
              return `
                <div class="assignment-subtopic-section" style="margin-bottom: 20px; padding: 0 16px;">
                  <div class="subtopic-header" style="font-weight: 800; font-size: 0.85rem; color: var(--primary); text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 10px; background: rgba(255, 255, 255, 0.02); border-left: 3px solid var(--primary); margin-bottom: 10px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0;">
                    ${escapeHTML(sub.name)}
                  </div>
                  <div class="questions-table" style="border: 1px solid rgba(255,255,255,0.03); border-radius: var(--radius-md); overflow: hidden;">
                    ${subProblems.map(prob => {
                      const prog = appState.progress[prob.id] || { completed: false, status: 'NOT_STARTED' };
                      const isChecked = prog.completed || prog.status === 'SOLVED' || prog.status === 'MASTERED';
                      const disabledAttr = isLocked ? 'disabled' : '';
                      
                      return `
                        <div class="q-row" id="q-row-${prob.id}">
                          <div class="q-check">
                            <label class="checkbox-container">
                              <input type="checkbox" ${isChecked ? 'checked' : ''} ${disabledAttr} onchange="handleCheckboxChange(${prob.id}, this.checked)">
                              <span class="custom-checkbox">
                                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              </span>
                            </label>
                          </div>
                          <div class="q-main">
                            <a href="${prob.url}" target="_blank" rel="noopener noreferrer" class="q-title">
                              <span class="q-id">#${prob.id}</span> &mdash; ${escapeHTML(prob.title)}
                              ${SVG_ICONS.externalLink}
                            </a>
                          </div>
                          ${prob.youtubeUrl ? `
                            <div class="q-youtube-wrapper">
                              <a href="${prob.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="q-youtube-btn" title="Watch Animated Solution by Code In Motion">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                              </a>
                            </div>
                          ` : ''}
                          <div class="q-meta-actions">
                            <span class="badge ${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
                          </div>
                          <div class="q-status">
                            <div class="status-select-wrapper">
                              <select class="status-select ${prog.status || 'NOT_STARTED'}" ${disabledAttr} onchange="handleStatusChange(${prob.id}, this.value)">
                                <option value="NOT_STARTED" ${prog.status === 'NOT_STARTED' ? 'selected' : ''}>Unsolved</option>
                                <option value="ATTEMPTED" ${prog.status === 'ATTEMPTED' ? 'selected' : ''}>Attempted</option>
                                <option value="SOLVED" ${prog.status === 'SOLVED' ? 'selected' : ''}>Solved</option>
                                <option value="MASTERED" ${prog.status === 'MASTERED' ? 'selected' : ''}>Mastered</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')
          : 
            // Regular flat rendering
            `
            <div class="questions-table">
              ${visibleProblems.map(prob => {
                const prog = appState.progress[prob.id] || { completed: false, status: 'NOT_STARTED' };
                const isChecked = prog.completed || prog.status === 'SOLVED' || prog.status === 'MASTERED';
                const disabledAttr = isLocked ? 'disabled' : '';
                
                return `
                  <div class="q-row" id="q-row-${prob.id}">
                    <div class="q-check">
                      <label class="checkbox-container">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} ${disabledAttr} onchange="handleCheckboxChange(${prob.id}, this.checked)">
                        <span class="custom-checkbox">
                          <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </span>
                      </label>
                    </div>
                    <div class="q-main">
                      <a href="${prob.url}" target="_blank" rel="noopener noreferrer" class="q-title">
                        <span class="q-id">#${prob.id}</span> &mdash; ${escapeHTML(prob.title)}
                        ${SVG_ICONS.externalLink}
                      </a>
                    </div>
                    ${prob.youtubeUrl ? `
                      <div class="q-youtube-wrapper">
                        <a href="${prob.youtubeUrl}" target="_blank" rel="noopener noreferrer" class="q-youtube-btn" title="Watch Animated Solution by Code In Motion">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                      </div>
                    ` : ''}
                    <div class="q-meta-actions">
                      <span class="badge ${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
                    </div>
                    <div class="q-status">
                      <div class="status-select-wrapper">
                        <select class="status-select ${prog.status || 'NOT_STARTED'}" ${disabledAttr} onchange="handleStatusChange(${prob.id}, this.value)">
                          <option value="NOT_STARTED" ${prog.status === 'NOT_STARTED' ? 'selected' : ''}>Unsolved</option>
                          <option value="ATTEMPTED" ${prog.status === 'ATTEMPTED' ? 'selected' : ''}>Attempted</option>
                          <option value="SOLVED" ${prog.status === 'SOLVED' ? 'selected' : ''}>Solved</option>
                          <option value="MASTERED" ${prog.status === 'MASTERED' ? 'selected' : ''}>Mastered</option>
                        </select>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            `
          }
        </div>
      </div>
    `;
  });

  if (visibleTopicsCount === 0) {
    container.innerHTML = `<div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <p style="margin-top: 12px; font-weight: 600;">No matching questions found</p>
    </div>`;
  } else {
    container.innerHTML = html;
  }
}

// Handle Checkbox Toggling
window.handleCheckboxChange = function(problemId, isChecked) {
  if (!checkAuth(appState.selectedUser)) {
    showToast("Access Locked: Log in to edit this page.", "error");
    renderTopicsList(); // Reset UI
    return;
  }

  if (!appState.progress[problemId]) {
    appState.progress[problemId] = { completed: false, status: 'NOT_STARTED', notes: '' };
  }
  
  appState.progress[problemId].completed = isChecked;
  
  // Set solved timestamp
  if (isChecked) {
    appState.progress[problemId].solvedAt = new Date().toISOString();
    if (appState.progress[problemId].status !== 'SOLVED' && appState.progress[problemId].status !== 'MASTERED') {
      appState.progress[problemId].status = 'SOLVED';
    }
  } else {
    delete appState.progress[problemId].solvedAt;
    if (appState.progress[problemId].status === 'SOLVED' || appState.progress[problemId].status === 'MASTERED') {
      appState.progress[problemId].status = 'NOT_STARTED';
    }
  }

  saveProgress();
  updateProblemRowUI(problemId);
};

// Handle Select Status Change
window.handleStatusChange = function(problemId, newStatus) {
  if (!checkAuth(appState.selectedUser)) {
    showToast("Access Locked: Log in to edit this page.", "error");
    renderTopicsList(); // Reset UI
    return;
  }

  if (!appState.progress[problemId]) {
    appState.progress[problemId] = { completed: false, status: 'NOT_STARTED', notes: '' };
  }

  appState.progress[problemId].status = newStatus;
  
  if (newStatus === 'SOLVED' || newStatus === 'MASTERED') {
    appState.progress[problemId].completed = true;
    appState.progress[problemId].solvedAt = new Date().toISOString();
  } else {
    appState.progress[problemId].completed = false;
    delete appState.progress[problemId].solvedAt;
  }

  saveProgress();
  updateProblemRowUI(problemId);
};

// Target row UI update instead of full render list
function updateProblemRowUI(problemId) {
  const row = document.getElementById(`q-row-${problemId}`);
  if (!row) return;

  const prog = appState.progress[problemId] || { completed: false, status: 'NOT_STARTED' };
  const isChecked = prog.completed || prog.status === 'SOLVED' || prog.status === 'MASTERED';

  const checkbox = row.querySelector('.checkbox-container input');
  if (checkbox) checkbox.checked = isChecked;

  const select = row.querySelector('.status-select');
  if (select) {
    select.className = `status-select ${prog.status || 'NOT_STARTED'}`;
    select.value = prog.status || 'NOT_STARTED';
  }

  let labelText = "Unsolved";
  if (prog.status === 'ATTEMPTED') labelText = "Attempted";
  if (prog.status === 'SOLVED') labelText = "Solved";
  if (prog.status === 'MASTERED') labelText = "Mastered";

  showToast(`Updated problem #${problemId} status to ${labelText}`, 'success');
  updateTopicStatsUI(problemId);
}

// Update the mini progress elements of the parent topic card without full refresh
function updateTopicStatsUI(problemId) {
  let parentTopic = null;
  for (const topic of appState.topics) {
    if (topic.problems.some(p => p.id === problemId)) {
      parentTopic = topic;
      break;
    }
  }

  if (!parentTopic) return;

  const panel = document.getElementById(`topic-panel-${parentTopic.id}`);
  if (!panel) return;

  let solved = 0;
  parentTopic.problems.forEach(p => {
    const prog = appState.progress[p.id];
    const status = prog ? prog.status : 'NOT_STARTED';
    if (prog && prog.completed || status === 'SOLVED' || status === 'MASTERED') {
      solved++;
    }
  });

  const percentage = parentTopic.problems.length > 0 ? Math.round((solved / parentTopic.problems.length) * 100) : 0;

  const percentageEl = panel.querySelector('.topic-percentage');
  const progressFillEl = panel.querySelector('.topic-progress-fill');

  if (percentageEl) percentageEl.innerText = `${solved}/${parentTopic.problems.length}`;
  if (progressFillEl) progressFillEl.style.width = `${percentage}%`;
}

// RENDER ADMIN DASHBOARD
function renderAdminDashboard() {
  const container = document.getElementById('admin-workspace-view');
  if (!container) return;

  // Process data for all users
  const userStats = USERS.map(user => {
    const stats = getUserProgressStats(user);
    const progress = appState.allUsersProgress[`progress_${user}`] || {};
    
    // Goals status
    const todayStr = getLocalDateString();
    let goalText = 'No goal set';
    let goalClass = 'none';
    let goalMet = false;
    
    if (progress.goals && progress.goals[todayStr]) {
      const g = progress.goals[todayStr];
      const todaySolved = getTodaySolvedCount(progress);
      goalMet = todaySolved >= g.target;
      goalText = `${todaySolved} / ${g.target} (${g.topic || 'Mixed'})`;
      goalClass = goalMet ? 'met' : 'pending';
    }

    return {
      username: user,
      solved: stats.solved,
      total: stats.total,
      percentage: stats.percentage,
      streak: stats.streak,
      goalText: goalText,
      goalClass: goalClass,
      goalMet: goalMet,
      rawProgress: progress
    };
  });

  // Sort by solved questions descending for leaderboard
  const leaderboardStats = [...userStats].sort((a, b) => b.solved - a.solved);

  // Compile solved questions timeline
  const activityEvents = [];
  USERS.forEach(user => {
    const progress = appState.allUsersProgress[`progress_${user}`] || {};
    Object.keys(progress).forEach(probId => {
      if (isNaN(probId)) return;
      const q = progress[probId];
      if (q && q.solvedAt && (q.completed || q.status === 'SOLVED' || q.status === 'MASTERED')) {
        // Find problem title
        let pTitle = `Problem #${probId}`;
        appState.topics.forEach(t => {
          const match = t.problems.find(p => p.id === parseInt(probId));
          if (match) pTitle = match.title;
        });

        activityEvents.push({
          username: user,
          problemId: probId,
          title: pTitle,
          solvedAt: new Date(q.solvedAt),
          dateStr: q.solvedAt.split('T')[0]
        });
      }
    });
  });

  // Sort activity feed by date (most recent first)
  activityEvents.sort((a, b) => b.solvedAt - a.solvedAt);

  // Compute Topic Completion Matrix
  const matrixHTML = renderMatrixTable(userStats);

  // Generate Admin Workspace HTML
  container.innerHTML = `
    <div class="admin-dashboard-layout">
      <!-- Row 1: Leaderboard + Recent Activities -->
      <div class="admin-grid-top">
        
        <!-- Left Section: Leaderboard -->
        <div class="admin-section">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">${SVG_ICONS.trophy} Global Leaderboard</h3>
          <div class="leaderboard-container">
            <table class="leaderboard-table">
              <thead>
                <tr>
                  <th style="width: 60px; text-align: center;">Rank</th>
                  <th>Member</th>
                  <th>Completed Questions</th>
                  <th>Today's Goal (Solved / Target)</th>
                  <th style="text-align: center;">Streak</th>
                </tr>
              </thead>
              <tbody>
                ${leaderboardStats.map((item, idx) => {
                  let rankClass = 'rank-other';
                  if (idx === 0) rankClass = 'rank-1';
                  else if (idx === 1) rankClass = 'rank-2';
                  else if (idx === 2) rankClass = 'rank-3';
                  
                  return `
                    <tr>
                      <td align="center">
                        <div class="rank-pill ${rankClass}">${idx + 1}</div>
                      </td>
                      <td>
                        <div class="leaderboard-user-cell" onclick="switchUser('${item.username}')" style="cursor: pointer;">
                          <span class="avatar-circle" style="width: 24px; height: 24px; font-size: 0.65rem;">${item.username.charAt(0)}</span>
                          <span>${item.username}</span>
                        </div>
                      </td>
                      <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                          <span style="font-weight: 800; width: 60px;">${item.solved} / ${item.total}</span>
                          <div class="topic-progress-mini" style="flex-grow: 1; max-width: 150px; height: 6px;">
                            <div class="topic-progress-fill" style="width: ${item.percentage}%; background: linear-gradient(90deg, var(--primary), var(--accent));"></div>
                          </div>
                          <span style="color: var(--text-muted); font-size: 0.8rem;">${item.percentage}%</span>
                        </div>
                      </td>
                      <td>
                        <span class="leaderboard-goal-tag ${item.goalClass}">${item.goalText}</span>
                      </td>
                      <td align="center">
                        <span style="font-weight: 800; color: var(--primary); display: inline-flex; align-items: center; gap: 4px;">${item.streak > 0 ? `${SVG_ICONS.flame} ${item.streak}` : '—'}</span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Right Section: Activity Timeline -->
        <div class="admin-section">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">${SVG_ICONS.zap} Recent Activity</h3>
          <div class="activity-timeline">
            <div class="activity-feed-list">
              ${activityEvents.length === 0 ? `
                <div style="padding: 40px; text-align: center; color: var(--text-muted); font-weight: 600;">
                  No solved questions tracked yet.
                </div>
              ` : activityEvents.slice(0, 15).map(evt => {
                const todayStr = getLocalDateString();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = getLocalDateString(yesterday);
                
                let timeText = evt.dateStr;
                if (evt.dateStr === todayStr) {
                  timeText = 'Today ' + evt.solvedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else if (evt.dateStr === yesterdayStr) {
                  timeText = 'Yesterday';
                }
                
                return `
                  <div class="activity-item">
                    <div class="activity-icon-container" style="color: var(--easy);">${SVG_ICONS.check}</div>
                    <div class="activity-info-box">
                      <span class="activity-user-name" onclick="switchUser('${evt.username}')" style="cursor: pointer; color: var(--primary);">${evt.username}</span>
                      <span>completed</span>
                      <span class="activity-question-title">#${evt.problemId} — ${escapeHTML(evt.title)}</span>
                      <div class="activity-date">${timeText}</div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

      </div>

      <!-- Row 2: Matrix Completion Heatmap -->
      <div class="matrix-grid-section">
        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">${SVG_ICONS.chart} Pattern Completion Heatmap</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Matrix shows percentage of questions solved by each member across patterns.</p>
        <div class="matrix-scroll-wrapper">
          ${matrixHTML}
        </div>
      </div>
    </div>
  `;
}

// Compute table rows for Matrix Heap map
function renderMatrixTable(userStats) {
  let html = `
    <table class="matrix-table">
      <thead>
        <tr>
          <th class="user-col" style="width: 150px;">Member</th>
          ${appState.topics.map(t => `<th title="${t.name}">${escapeHTML(t.name.split(' / ')[0])}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
  `;

  userStats.forEach(item => {
    html += `
      <tr>
        <td class="user-cell">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="avatar-circle" style="width: 22px; height: 22px; font-size: 0.6rem;">${item.username.charAt(0)}</span>
            <span>${item.username}</span>
          </div>
        </td>
    `;

    appState.topics.forEach(topic => {
      let total = topic.problems.length;
      let solved = 0;
      topic.problems.forEach(p => {
        const prog = item.rawProgress[p.id];
        if (prog && (prog.completed || prog.status === 'SOLVED' || prog.status === 'MASTERED')) {
          solved++;
        }
      });

      const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
      
      let level = 'lv-0';
      if (percentage === 100) level = 'lv-4';
      else if (percentage >= 50) level = 'lv-3';
      else if (percentage >= 25) level = 'lv-2';
      else if (percentage > 0) level = 'lv-1';

      html += `
        <td>
          <span class="matrix-cell-badge ${level}" title="${solved}/${total} Solved">${percentage}%</span>
        </td>
      `;
    });

    html += '</tr>';
  });

  html += `
      </tbody>
    </table>
  `;
  return html;
}

// Toast notification container trigger
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = '';
  if (type === 'success') {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else {
    icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  }

  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Escape HTML utility
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// DAILY TEAM TASKS SYSTEM
// ==========================================
// Helper to look up a question's static details by ID
function findProblemById(problemId) {
  problemId = parseInt(problemId);
  for (const topic of appState.topics) {
    const prob = topic.problems.find(p => p.id === problemId);
    if (prob) {
      return { ...prob, topicName: topic.name, topicId: topic.id };
    }
  }
  return null;
}

// Default dynamic assignments structure
const defaultAssignments = {
  subtopics: [
    {
      "name": "Arrays",
      "problems": [
        {
          "id": 56,
          "title": "Merge Intervals",
          "difficulty": "Medium",
          "url": "https://leetcode.com/problems/merge-intervals/"
        },
        {
          "id": 53,
          "title": "Maximum Subarray",
          "difficulty": "Medium",
          "url": "https://leetcode.com/problems/maximum-subarray/"
        },
        {
          "id": 88,
          "title": "Merge Sorted Array",
          "difficulty": "Easy",
          "url": "https://leetcode.com/problems/merge-sorted-array/"
        }
      ]
    }
  ]
};

// Rebuild appState.topics to append dynamic assignments category
function rebuildTopicsList() {
  const baseTopics = appState.topics.filter(t => t.id !== 2 && t.id !== 'assignments');
  const dynAssignments = appState.allUsersProgress['dynamic_assignments'] || { ...defaultAssignments };
  if (!dynAssignments.subtopics) {
    dynAssignments.subtopics = [];
  }

  const allProblems = [];
  dynAssignments.subtopics.forEach(sub => {
    sub.problems.forEach(p => {
      const baseProb = findProblemById(p.id);
      if (baseProb && baseProb.youtubeUrl) {
        p.youtubeUrl = baseProb.youtubeUrl;
      }
      if (!allProblems.some(existing => existing.id === p.id)) {
        allProblems.push({
          ...p,
          completed: false,
          status: 'NOT_STARTED'
        });
      }
    });
  });

  const assignmentsTopic = {
    id: 'assignments',
    name: 'Assignments',
    isAssignmentsCategory: true,
    subtopics: dynAssignments.subtopics,
    problems: allProblems
  };

  appState.topics = [...baseTopics, assignmentsTopic];
}

// Render the right-side sticky daily tasks panel
function renderDailyTasksWidget() {
  const container = document.getElementById('daily-tasks-widget-container');
  if (!container) return;

  if (appState.selectedUser === 'Admin') {
    container.innerHTML = '';
    return;
  }

  const todayStr = getLocalDateString();
  const todayTasks = appState.dailyTasks[todayStr];
  const isAuth = checkAuth(appState.selectedUser);
  const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Only Deepansh has assignment powers
  const isAssignee = appState.selectedUser === 'Deepansh';

  let html = `
    <div class="daily-tasks-widget">
      <div class="tasks-widget-header">
        <h3 class="tasks-widget-title">🎯 Daily Team Tasks</h3>
        <span class="tasks-widget-date">${dateFormatted}</span>
      </div>
  `;

  if (todayTasks && todayTasks.problems && todayTasks.problems.length > 0) {
    html += `
      <div class="tasks-meta-info" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;">
        <span>👥 Assigned by: <strong>${todayTasks.assignedBy}</strong></span>
      </div>
      <div class="tasks-list-stack">
    `;

    todayTasks.problems.forEach(probId => {
      const prob = findProblemById(probId);
      if (!prob) return;

      const userProg = appState.progress[probId];
      const isCompleted = userProg && userProg.completed;
      const status = userProg ? userProg.status : 'NOT_STARTED';

      let statusClass = 'unsolved';
      let statusLabel = '❌ Unsolved';
      if (isCompleted || status === 'SOLVED' || status === 'MASTERED') {
        statusClass = 'completed';
        statusLabel = '✅ Completed';
      } else if (status === 'ATTEMPTED') {
        statusClass = 'attempted';
        statusLabel = '⏳ Attempted';
      }

      html += `
        <div class="task-item-card ${isCompleted ? 'completed' : ''}" onclick="scrollToAndHighlightQuestion(${prob.id})">
          <div class="task-item-top">
            <span class="task-pattern-tag" title="${prob.topicName || 'Assignments'}">${prob.topicName || 'Assignments'}</span>
            <span class="task-status-tag ${statusClass}">${statusLabel}</span>
          </div>
          <div class="task-title-line">#${prob.id} ${prob.title}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
            <span class="task-difficulty-badge ${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
            ${isCompleted && isAuth ? `
              <div class="task-actions-row" onclick="event.stopPropagation();">
                <button class="task-try-again-btn" onclick="resetProblemStatus(${prob.id})">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                  Try Again
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    html += `</div>`;

    // Deepansh can edit the tasks even after assignment!
    if (isAssignee && isAuth) {
      html += `
        <button class="btn btn-secondary" onclick="openAssignTasksModal()" style="width: 100%; font-weight: 700; margin-top: 16px; border: 1px solid var(--primary); color: var(--primary);">
          ✏️ Edit Today's Tasks
        </button>
      `;
    }
  } else {
    // Empty state
    html += `
      <div class="assign-tasks-cta">
        <p class="assign-tasks-cta-text" style="margin-bottom: 8px;">No tasks assigned by Deepansh for today yet.</p>
    `;

    if (isAssignee && isAuth) {
      html += `
        <button class="btn btn-primary" onclick="openAssignTasksModal()" style="width: 100%; font-weight: 700;">
          ➕ Assign Today's Tasks
        </button>
      `;
    } else if (isAssignee && !isAuth) {
      html += `
        <p class="assign-tasks-cta-text" style="font-size: 0.75rem; opacity: 0.7; font-style: italic;">
          🔒 Unlock your page to assign today's tasks.
        </p>
      `;
    } else {
      html += `
        <p class="assign-tasks-cta-text" style="font-size: 0.75rem; opacity: 0.7; font-style: italic;">
          Waiting for Deepansh to assign tasks.<br>
          (Auto-assigns after 11:30 AM IST)
        </p>
      `;
    }

    html += `</div>`;
  }

  html += `</div>`;
  container.innerHTML = html;
}

// Scroll layout and trigger glowing borders on the requested question row
window.scrollToAndHighlightQuestion = function(problemId) {
  const prob = findProblemById(problemId);
  if (!prob) return;

  if (!appState.expandedTopics.has(prob.topicId)) {
    appState.expandedTopics.add(prob.topicId);
    renderTopicsList();
  }

  const el = document.getElementById(`problem-row-${problemId}`) || document.getElementById(`q-row-${problemId}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('highlight-pulse-glow');
    void el.offsetWidth; // force reflow
    el.classList.add('highlight-pulse-glow');
    setTimeout(() => {
      el.classList.remove('highlight-pulse-glow');
    }, 3000);
  }
};

// Reset a completed problem back to Unsolved for practicing again
window.resetProblemStatus = async function(problemId) {
  const prob = findProblemById(problemId);
  if (!prob) return;

  if (!confirm(`Are you sure you want to practice "${prob.title}" again? This will clear your completed status for this question.`)) {
    return;
  }

  appState.progress[problemId] = {
    status: 'NOT_STARTED',
    completed: false,
    notes: '',
    solvedAt: null
  };

  await saveProgress();
  showToast(`Progress reset for #${problemId} ${prob.title}. Happy coding! 🚀`, 'success');
};

// Selection Pool state in the modal
let assignmentModalPool = [];

// Assign Tasks Modal controls
window.openAssignTasksModal = function() {
  const modal = document.getElementById('assign-tasks-modal-overlay');
  if (!modal) return;

  const todayStr = getLocalDateString();
  const todayTasks = appState.dailyTasks[todayStr];

  assignmentModalPool = [];

  if (todayTasks && todayTasks.problems) {
    todayTasks.problems.forEach(probId => {
      const prob = findProblemById(probId);
      if (prob) {
        const dynAssignments = appState.allUsersProgress['dynamic_assignments'] || defaultAssignments;
        let subName = 'Arrays';
        const foundSub = dynAssignments.subtopics.find(s => s.problems.some(p => p.id === probId));
        if (foundSub) {
          subName = foundSub.name;
        }

        assignmentModalPool.push({
          id: prob.id,
          title: prob.title,
          difficulty: prob.difficulty,
          url: prob.url,
          subtopic: subName,
          isCustom: false
        });
      }
    });
  }

  populateAssignPatterns();
  renderSelectedAssignmentPool();
  toggleModalTabs('sheet');

  modal.classList.add('active');
};

window.closeAssignTasksModal = function() {
  const modal = document.getElementById('assign-tasks-modal-overlay');
  if (modal) modal.classList.remove('active');
};

window.toggleModalTabs = function(activeTab) {
  const pickSheetBtn = document.getElementById('toggle-pick-sheet-btn');
  const addLeetcodeBtn = document.getElementById('toggle-add-leetcode-btn');
  const sectionPick = document.getElementById('section-pick-sheet');
  const sectionAdd = document.getElementById('section-add-leetcode');

  if (activeTab === 'sheet') {
    if (sectionPick) sectionPick.style.display = 'block';
    if (sectionAdd) sectionAdd.style.display = 'none';
    if (pickSheetBtn) {
      pickSheetBtn.style.background = 'var(--border-color)';
      pickSheetBtn.style.border = '1px solid var(--primary)';
      pickSheetBtn.style.color = 'var(--text-primary)';
    }
    if (addLeetcodeBtn) {
      addLeetcodeBtn.style.background = 'transparent';
      addLeetcodeBtn.style.border = '1px solid var(--border-color)';
      addLeetcodeBtn.style.color = 'var(--text-secondary)';
    }
  } else {
    if (sectionPick) sectionPick.style.display = 'none';
    if (sectionAdd) sectionAdd.style.display = 'block';
    if (pickSheetBtn) {
      pickSheetBtn.style.background = 'transparent';
      pickSheetBtn.style.border = '1px solid var(--border-color)';
      pickSheetBtn.style.color = 'var(--text-secondary)';
    }
    if (addLeetcodeBtn) {
      addLeetcodeBtn.style.background = 'var(--border-color)';
      addLeetcodeBtn.style.border = '1px solid var(--primary)';
      addLeetcodeBtn.style.color = 'var(--text-primary)';
    }
  }
};

function populateAssignPatterns() {
  const select = document.getElementById('assign-pattern-select');
  if (!select) return;

  select.innerHTML = '<option value="">-- Select Pattern --</option>';
  appState.topics.forEach(topic => {
    // Exclude Assignments category from picking source
    if (topic.isAssignmentsCategory) return;
    const option = document.createElement('option');
    option.value = topic.id;
    option.innerText = topic.name;
    select.appendChild(option);
  });

  const questionsContainer = document.getElementById('assign-questions-list');
  if (questionsContainer) {
    questionsContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 10px 0;">Select a pattern first.</p>';
  }

  const warning = document.getElementById('assign-warning-msg');
  if (warning) warning.style.display = 'none';
}

function populateAssignQuestions(topicId) {
  const container = document.getElementById('assign-questions-list');
  if (!container) return;

  if (!topicId) {
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 10px 0;">Select a pattern first.</p>';
    return;
  }

  const topic = appState.topics.find(t => t.id === parseInt(topicId));
  if (!topic || !topic.problems || topic.problems.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 20px 0;">No questions in this topic.</p>';
    return;
  }

  // Find all previously assigned question IDs
  const alreadyAssignedIds = new Set();
  Object.values(appState.dailyTasks).forEach(dayObj => {
    if (dayObj && dayObj.problems) {
      dayObj.problems.forEach(id => alreadyAssignedIds.add(parseInt(id)));
    }
  });

  let html = '';
  let availableCount = 0;
  topic.problems.forEach(prob => {
    // If it is in history and NOT currently selected, skip it (remove from future task list)
    const isCurrentlySelected = assignmentModalPool.some(item => item.id === prob.id);
    if (alreadyAssignedIds.has(prob.id) && !isCurrentlySelected) {
      return;
    }
    availableCount++;
    html += `
      <label class="assign-question-checkbox-item">
        <input type="checkbox" name="assign-problem-checkbox" value="${prob.id}" ${isCurrentlySelected ? 'checked' : ''} onchange="handleModalCheckboxChange(this)">
        <span class="assign-question-text-label">
          <span>#${prob.id} ${prob.title}</span>
          <span class="task-difficulty-badge ${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
        </span>
      </label>
    `;
  });

  if (availableCount === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 20px 0;">🎉 All questions in this pattern have already been assigned as tasks!</p>';
  } else {
    container.innerHTML = html;
  }
}

window.handleModalCheckboxChange = function(checkbox) {
  const probId = parseInt(checkbox.value);
  const isChecked = checkbox.checked;

  if (isChecked) {
    const exists = assignmentModalPool.some(item => item.id === probId);
    if (!exists) {
      const prob = findProblemById(probId);
      if (prob) {
        const dynAssignments = appState.allUsersProgress['dynamic_assignments'] || defaultAssignments;
        const defaultSub = (dynAssignments.subtopics && dynAssignments.subtopics.length > 0) ? dynAssignments.subtopics[0].name : 'Arrays';

        assignmentModalPool.push({
          id: prob.id,
          title: prob.title,
          difficulty: prob.difficulty,
          url: prob.url,
          subtopic: defaultSub,
          isCustom: false,
          topicName: prob.topicName
        });
      }
    }
  } else {
    const idx = assignmentModalPool.findIndex(item => item.id === probId);
    if (idx !== -1) {
      assignmentModalPool.splice(idx, 1);
    }
  }
  renderSelectedAssignmentPool();
};

window.refreshModalCheckboxes = function() {
  const checkboxes = document.querySelectorAll('input[name="assign-problem-checkbox"]');
  checkboxes.forEach(cb => {
    const probId = parseInt(cb.value);
    cb.checked = assignmentModalPool.some(item => item.id === probId);
  });
};

window.handleAddCustomQuestion = function() {
  const idInput = document.getElementById('custom-leetcode-id');
  const titleInput = document.getElementById('custom-leetcode-title');
  const diffSelect = document.getElementById('custom-leetcode-difficulty');
  const errorDiv = document.getElementById('custom-leetcode-error');

  const id = parseInt(idInput.value);
  const title = titleInput.value.trim();
  const difficulty = diffSelect.value;

  if (isNaN(id) || id <= 0) {
    showCustomError("Please enter a valid LeetCode ID number.");
    return;
  }
  if (!title) {
    showCustomError("Please enter a LeetCode Question Title.");
    return;
  }

  if (assignmentModalPool.some(item => item.id === id)) {
    showCustomError(`Question #${id} is already in today's selection.`);
    return;
  }

  if (errorDiv) errorDiv.style.display = 'none';

  // Generate LeetCode slug
  const titleSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const url = `https://leetcode.com/problems/${titleSlug}/`;

  const dynAssignments = appState.allUsersProgress['dynamic_assignments'] || defaultAssignments;
  const defaultSub = (dynAssignments.subtopics && dynAssignments.subtopics.length > 0) ? dynAssignments.subtopics[0].name : 'Arrays';

  assignmentModalPool.push({
    id: id,
    title: title,
    difficulty: difficulty,
    url: url,
    subtopic: defaultSub,
    isCustom: true
  });

  idInput.value = '';
  titleInput.value = '';

  renderSelectedAssignmentPool();
  showToast("Custom LeetCode question added!", "success");
};

function showCustomError(msg) {
  const errorDiv = document.getElementById('custom-leetcode-error');
  if (errorDiv) {
    errorDiv.innerText = `⚠️ ${msg}`;
    errorDiv.style.display = 'block';
  }
}

window.renderSelectedAssignmentPool = function() {
  const container = document.getElementById('selected-assignment-pool');
  if (!container) return;

  if (assignmentModalPool.length === 0) {
    container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 10px 0;">No questions selected yet.</p>';
    return;
  }

  const dynAssignments = appState.allUsersProgress['dynamic_assignments'] || defaultAssignments;
  const existingSubtopics = dynAssignments.subtopics.map(s => s.name);
  if (!existingSubtopics.includes('Arrays')) {
    existingSubtopics.push('Arrays');
  }

  let html = '';
  assignmentModalPool.forEach((item, index) => {
    html += `
      <div class="selected-task-card" data-index="${index}">
        <div class="selected-task-header">
          <span class="selected-task-title">#${item.id} ${escapeHTML(item.title)}</span>
          <button class="selected-task-remove-btn" onclick="removeQuestionFromPool(${index})">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div class="selected-task-subtopic-row">
          <select class="subtopic-dropdown-select" onchange="handlePoolSubtopicChange(${index}, this.value)">
    `;

    existingSubtopics.forEach(subName => {
      const selectedAttr = item.subtopic === subName ? 'selected' : '';
      html += `<option value="${subName}" ${selectedAttr}>${escapeHTML(subName)}</option>`;
    });

    const isNewSelected = !existingSubtopics.includes(item.subtopic) && item.subtopic;
    html += `
            <option value="[NEW]" ${isNewSelected ? 'selected' : ''}>[Create New Subtopic...]</option>
          </select>
          <input type="text" class="new-subtopic-text-input" placeholder="New Subtopic Name" 
            style="display: ${isNewSelected ? 'block' : 'none'};" 
            value="${isNewSelected ? escapeHTML(item.subtopic) : ''}"
            oninput="handlePoolNewSubtopicInput(${index}, this.value)">
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
};

window.removeQuestionFromPool = function(index) {
  assignmentModalPool.splice(index, 1);
  renderSelectedAssignmentPool();
  refreshModalCheckboxes();
};

window.handlePoolSubtopicChange = function(index, value) {
  if (value === '[NEW]') {
    assignmentModalPool[index].subtopic = ''; 
    assignmentModalPool[index].isCreatingNewSubtopic = true;
  } else {
    assignmentModalPool[index].subtopic = value;
    assignmentModalPool[index].isCreatingNewSubtopic = false;
  }
  renderSelectedAssignmentPool();
};

window.handlePoolNewSubtopicInput = function(index, value) {
  assignmentModalPool[index].subtopic = value.trim();
};

async function saveAssignedTasks() {
  const warning = document.getElementById('assign-warning-msg');

  if (assignmentModalPool.length === 0 || assignmentModalPool.length > 3) {
    if (warning) warning.style.display = 'block';
    return;
  }

  if (warning) warning.style.display = 'none';

  const todayStr = getLocalDateString();
  const selectedIds = assignmentModalPool.map(item => item.id);

  // Update daily tasks for today
  appState.dailyTasks[todayStr] = {
    assignedBy: appState.selectedUser,
    problems: selectedIds
  };

  const dynAssignments = appState.allUsersProgress['dynamic_assignments'] || { ...defaultAssignments };
  if (!dynAssignments.subtopics) {
    dynAssignments.subtopics = [];
  }

  // Populate dynamic assignments category
  assignmentModalPool.forEach(item => {
    const targetSubtopicName = item.subtopic || 'Arrays';
    
    let sub = dynAssignments.subtopics.find(s => s.name === targetSubtopicName);
    if (!sub) {
      sub = { name: targetSubtopicName, problems: [] };
      dynAssignments.subtopics.push(sub);
    }

    const exists = sub.problems.some(p => p.id === item.id);
    if (!exists) {
      sub.problems.push({
        id: item.id,
        title: item.title,
        difficulty: item.difficulty,
        url: item.url
      });
    }
  });

  const statusIndicator = document.getElementById('save-status-indicator');
  if (statusIndicator) {
    statusIndicator.className = 'save-status-indicator saving';
    statusIndicator.querySelector('.status-text').innerText = 'Syncing...';
  }

  try {
    const resAssignments = await fetch(`${SUPABASE_URL}/rest/v1/progress`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: 'dynamic_assignments',
        data: dynAssignments
      })
    });

    if (!resAssignments.ok) {
      throw new Error(`Failed to save dynamic assignments: ${resAssignments.status}`);
    }

    const resTasks = await fetch(`${SUPABASE_URL}/rest/v1/progress`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        id: 'team_daily_tasks',
        data: appState.dailyTasks
      })
    });

    if (!resTasks.ok) {
      throw new Error(`Failed to save daily tasks: ${resTasks.status}`);
    }

    appState.allUsersProgress['dynamic_assignments'] = dynAssignments;
    appState.allUsersProgress['team_daily_tasks'] = appState.dailyTasks;

    rebuildTopicsList();

    closeAssignTasksModal();
    renderDailyTasksWidget();
    renderTopicsList();
    renderDashboard();
    showToast("Daily team tasks saved successfully! 🚀", "success");

    if (statusIndicator) {
      statusIndicator.className = 'save-status-indicator saved';
      statusIndicator.querySelector('.status-text').innerText = 'Synced';
    }
  } catch (error) {
    console.error("Failed to sync assignments:", error);
    showToast("Failed to sync assignments with cloud.", "error");
    if (statusIndicator) {
      statusIndicator.className = 'save-status-indicator error';
      statusIndicator.querySelector('.status-text').innerText = 'Offline';
    }
  }
}

// Get number of days between two date strings (immune to timezone differences)
function getDaysSinceBase(dateStr) {
  const base = new Date(2026, 7, 20); // August 20, 2026 (0-indexed month: 7 is August)
  const parts = dateStr.split('-');
  const curr = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const diffTime = curr - base;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

// Get assignee name for a given date (Keep this rotation logic solely for automatic deadline assignments fallback)
function getAssigneeForDate(dateStr) {
  const diffDays = getDaysSinceBase(dateStr);
  const roster = [
    'Aditya',
    'Aman',
    'Bhumika',
    'Deepansh',
    'Garima',
    'Nitish',
    'Prashant',
    'Renuka',
    'Vaibhav',
    'Vivek'
  ];
  
  const index = ((diffDays % roster.length) + roster.length) % roster.length;
  return roster[index];
}

// Check if current time has passed 11:30 AM IST
function hasPassedISTDeadline() {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utcTime + (3600000 * 5.5));
  
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  
  return hours > 11 || (hours === 11 && minutes >= 30);
}

// Get the first 3 unassigned problems across all topics
function getUnassignedProblems(count = 3) {
  const alreadyAssignedIds = new Set();
  Object.values(appState.dailyTasks).forEach(dayObj => {
    if (dayObj && dayObj.problems) {
      dayObj.problems.forEach(id => alreadyAssignedIds.add(parseInt(id)));
    }
  });

  const selected = [];
  for (const topic of appState.topics) {
    for (const prob of topic.problems) {
      if (!alreadyAssignedIds.has(prob.id)) {
        selected.push(prob.id);
        if (selected.length === count) {
          return selected;
        }
      }
    }
  }
  return selected;
}

// Automatically assign tasks if the deadline has passed
async function checkAndAutoAssignTasks() {
  const todayStr = getLocalDateString();
  
  if (appState.dailyTasks[todayStr]) {
    return;
  }
  
  if (hasPassedISTDeadline()) {
    console.log("Auto-assign deadline (11:30 AM IST) passed. Automatically assigning tasks...");
    const autoProblems = getUnassignedProblems(3);
    
    if (autoProblems.length > 0) {
      appState.dailyTasks[todayStr] = {
        assignedBy: "System (Auto)",
        problems: autoProblems
      };
      
      const dynAssignments = appState.allUsersProgress['dynamic_assignments'] || { ...defaultAssignments };
      if (!dynAssignments.subtopics) {
        dynAssignments.subtopics = [];
      }
      
      autoProblems.forEach(probId => {
        const prob = findProblemById(probId);
        if (prob) {
          const targetSubtopicName = prob.topicName || 'Arrays';
          let sub = dynAssignments.subtopics.find(s => s.name === targetSubtopicName);
          if (!sub) {
            sub = { name: targetSubtopicName, problems: [] };
            dynAssignments.subtopics.push(sub);
          }
          if (!sub.problems.some(p => p.id === prob.id)) {
            sub.problems.push({
              id: prob.id,
              title: prob.title,
              difficulty: prob.difficulty,
              url: prob.url
            });
          }
        }
      });

      try {
        await fetch(`${SUPABASE_URL}/rest/v1/progress`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: 'dynamic_assignments',
            data: dynAssignments
          })
        });

        await fetch(`${SUPABASE_URL}/rest/v1/progress`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: 'team_daily_tasks',
            data: appState.dailyTasks
          })
        });

        appState.allUsersProgress['dynamic_assignments'] = dynAssignments;
        appState.allUsersProgress['team_daily_tasks'] = appState.dailyTasks;
        
        rebuildTopicsList();
        console.log("Auto-assigned tasks successfully synced to Supabase.");
      } catch (error) {
        console.error("Auto-assignment sync failed:", error);
      }
    }
  }
}
