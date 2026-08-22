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
  filters: {
    search: '',
    difficulty: '',
    status: ''
  }
};

// SVG Icons
const ICONS = {
  externalLink: `<svg class="link-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin='round'><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>`
};

// Supabase Configuration
const SUPABASE_URL = "https://frcdaaystyoqriobaufo.supabase.co";
const SUPABASE_KEY = "sb_publishable_Vx4k_fX4DG65tg4SaJ5fFQ_6R9iIqlv";

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
  'Vaibhav'
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
  'Vaibhav': '8448f3120b8e4ce66cd1330bb6afe0de74b7ac1716cdb31142fe9177c707621e'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  initSidebarState();
  setupEventListeners();
  await fetchQuestions(); // Load questions list first
  await loadAllUsersProgress(); // Load database records
  determineInitialUser(); // Navigate to requested user page
});

// Setup Theme
function initTheme() {
  const savedTheme = localStorage.getItem('dsa_theme');
  if (savedTheme) {
    appState.theme = savedTheme;
  } else {
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    appState.theme = prefersLight ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', appState.theme);
}

// Toggle Theme
function toggleTheme() {
  appState.theme = appState.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', appState.theme);
  localStorage.setItem('dsa_theme', appState.theme);
  showToast(`Switched to ${appState.theme} mode`, 'success');
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

// Local Date helper
function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/progress`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Supabase query failed: ${response.status}`);
    }

    const rows = await response.json();
    appState.allUsersProgress = {};
    rows.forEach(row => {
      appState.allUsersProgress[row.id] = row.data || {};
    });

    // Run migration if Deepansh progress does not exist but user_progress does
    await runDeepanshMigration();

    if (statusIndicator) {
      statusIndicator.className = 'save-status-indicator saved';
      statusIndicator.querySelector('.status-text').innerText = 'Synced';
    }
  } catch (error) {
    console.error("Failed to load progress from Supabase:", error);
    showToast("Cloud sync failed. Using offline cached data.", "error");
    
    // Attempt local storage fallback
    const localAllProgress = localStorage.getItem('dsa_all_progress');
    if (localAllProgress) {
      appState.allUsersProgress = JSON.parse(localAllProgress);
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
      await fetch(`${SUPABASE_URL}/rest/v1/progress`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ id: targetId, data: data })
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

  const statusIndicator = document.getElementById('save-status-indicator');
  if (statusIndicator) {
    statusIndicator.className = 'save-status-indicator saving';
    statusIndicator.querySelector('.status-text').innerText = 'Syncing...';
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/progress`, {
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
      })
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
    titleEl.innerText = '👑 Admin Dashboard';
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
    container.innerHTML = `<span class="status-badge unlocked" style="color: var(--primary); border-color: rgba(99, 102, 241, 0.25); background: rgba(99, 102, 241, 0.05);">👑 Admin View Only</span>`;
    return;
  }

  const isAuth = checkAuth(user);
  if (isAuth) {
    container.innerHTML = `
      <div class="status-badge unlocked">
        <span>🔓 Editing: <strong>${user}</strong></span>
        <button class="unlock-action-btn" onclick="handleLogout()" style="background: transparent; color: var(--hard-text); border: 1px solid rgba(239, 68, 68, 0.25); padding: 4px 8px; border-radius: var(--radius-sm); margin-left: 8px;">Lock</button>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="status-badge locked">
        <span>🔒 Read-only</span>
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
  showToast("Goal configured for today! Go crack it! 🚀", "success");
}

// Fetch questions JSON data
async function fetchQuestions() {
  const loader = document.getElementById('global-loader');
  try {
    if (typeof QUESTIONS_DATA !== 'undefined') {
      appState.topics = QUESTIONS_DATA;
    } else {
      const response = await fetch('./questions.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      appState.topics = await response.json();
    }
    
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
          ${stats.streak > 0 ? `<span class="user-sidebar-streak" title="Streak">🔥 ${stats.streak}</span>` : ''}
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

  // Check if completed any full topic
  let completedAnyTopic = false;
  let completedAllPatterns = false;
  appState.topics.forEach(topic => {
    let topicTotal = topic.problems.length;
    let topicSolved = 0;
    topic.problems.forEach(p => {
      const prog = progress[p.id];
      if (prog && (prog.completed || prog.status === 'SOLVED' || prog.status === 'MASTERED')) {
        topicSolved++;
      }
    });
    if (topicTotal > 0 && topicSolved >= topicTotal) {
      completedAnyTopic = true;
    }
  });

  const goalsConfigured = progress.goals ? Object.keys(progress.goals).length : 0;

  // Define achievements
  const achievements = [
    {
      id: 'first_blood',
      title: '🚀 First Blood',
      desc: 'Completed your first coding interview problem!',
      unlocked: stats.solved >= 1
    },
    {
      id: 'goal_getter',
      title: '🎯 Goal Setter',
      desc: 'Configured your first daily question target.',
      unlocked: goalsConfigured >= 1
    },
    {
      id: 'topic_explorer',
      title: '🔥 Pattern Explorer',
      desc: 'Solved at least 3 questions in a single pattern.',
      unlocked: checkPatternSolvedCount(progress, 3)
    },
    {
      id: 'easy_master',
      title: '🏆 Easy Master',
      desc: 'Solved 15 or more Easy questions.',
      unlocked: easySolved >= 15
    },
    {
      id: 'consistency',
      title: '⚡ Dynamic Streak',
      desc: 'Earned an active streak of 3+ consecutive days.',
      unlocked: streak >= 3
    },
    {
      id: 'dsa_veteran',
      title: '🥇 DSA Scholar',
      desc: 'Completed 50+ interview questions.',
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
          ${ach.title.split(' ')[0]}
        </div>
        <div class="milestone-info">
          <div class="milestone-title">${ach.title.substring(ach.title.indexOf(' ') + 1)}</div>
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

  // Save Daily Goal Button
  const saveGoalBtn = document.getElementById('save-goal-btn');
  if (saveGoalBtn) {
    saveGoalBtn.addEventListener('click', saveDailyGoal);
  }

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
}

// Open Login Modal
window.openLoginModal = function() {
  const modal = document.getElementById('login-modal-overlay');
  const input = document.getElementById('login-password-input');
  const errorMsg = document.getElementById('login-error-msg');
  const title = document.getElementById('login-modal-title');
  const desc = document.getElementById('login-modal-desc');

  if (modal && input) {
    title.innerText = `Unlock ${appState.selectedUser}'s Page`;
    desc.innerText = `Enter the passcode for ${appState.selectedUser} to grant write access.`;
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
  if (percentageText) percentageText.innerText = `${percentage}%`;
  if (totalSolvedText) totalSolvedText.innerText = `${solvedProblems} / ${totalProblems} Solved`;

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
                      <span class="q-id">#${prob.id}</span> — ${escapeHTML(prob.title)}
                      ${ICONS.externalLink}
                    </a>
                  </div>
                  <div class="q-meta-actions">
                    <span class="badge ${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
                  </div>
                  <div class="q-status">
                    <div class="status-select-wrapper">
                      <select class="status-select ${prog.status || 'NOT_STARTED'}" ${disabledAttr} onchange="handleStatusChange(${prob.id}, this.value)">
                        <option value="NOT_STARTED" ${prog.status === 'NOT_STARTED' ? 'selected' : ''}>❌ Unsolved</option>
                        <option value="ATTEMPTED" ${prog.status === 'ATTEMPTED' ? 'selected' : ''}>⏳ Attempted</option>
                        <option value="SOLVED" ${prog.status === 'SOLVED' ? 'selected' : ''}>✅ Solved</option>
                        <option value="MASTERED" ${prog.status === 'MASTERED' ? 'selected' : ''}>⭐ Mastered</option>
                      </select>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
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
  if (prog.status === 'ATTEMPTED') labelText = "Attempted ⏳";
  if (prog.status === 'SOLVED') labelText = "Solved ✅";
  if (prog.status === 'MASTERED') labelText = "Mastered ⭐";

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
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">🏆 Global Leaderboard</h3>
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
                        <span style="font-weight: 800; color: var(--medium-text);">${item.streak > 0 ? `🔥 ${item.streak}` : '—'}</span>
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
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">⚡ Recent Activity</h3>
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
                    <div class="activity-icon-container">✅</div>
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
        <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">📊 Pattern Completion Heatmap</h3>
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
