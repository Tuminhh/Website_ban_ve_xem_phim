// js/main.js

// Hàm này chạy ngay khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    const authLinks = document.getElementById('auth-links');
    const userMenu = document.getElementById('user-menu');

    if (token && userJson) {
        // --- Người dùng đã đăng nhập ---
        const user = JSON.parse(userJson);

        // 1. Ẩn "Đăng Nhập", Hiển thị menu user
        if (authLinks) authLinks.style.display = 'none';
        if (userMenu) userMenu.style.display = 'flex'; // Dùng 'flex' hoặc 'block'

        // 2. Cập nhật tên và avatar
        const userNameDisplay = document.getElementById('user-name-display');
        const userAvatar = document.getElementById('user-avatar');
        
        if (userNameDisplay) userNameDisplay.textContent = user.username;
        
        // (Nâng cao: Nếu model User của bạn có trường avatarUrl, bạn có thể dùng nó)
        // if (user.avatarUrl) userAvatar.src = user.avatarUrl;

    } else {
        // --- Người dùng CHƯA đăng nhập ---
        // 1. Hiển thị "Đăng Nhập", Ẩn menu user
        if (authLinks) authLinks.style.display = 'block';
        if (userMenu) userMenu.style.display = 'none';
    }

    // 3. Xử lý nút Đăng xuất (nếu tồn tại)
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Xóa thông tin khỏi localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Tải lại trang chủ
            window.location.href = 'index.html';
        });
    }
});
/* Thêm vào cuối file (hoặc chèn vào vị trí thích hợp) */
(function () {
  function parseJwt(token) {
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(payload).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function getStoredToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('token') || null;
  }

  function logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // nếu bạn lưu thông tin user
    // redirect về trang chủ hoặc reload
    window.location.href = 'index.html';
  }

  function ensureAuthStyles() {
    if (document.getElementById('auth-ui-styles')) return;
    const style = document.createElement('style');
    style.id = 'auth-ui-styles';
    style.textContent = `
      .auth-wrap { display:flex; gap:8px; align-items:center; }
      .avatar-btn {
        width:40px; height:40px; border-radius:50%;
        display:inline-flex; align-items:center; justify-content:center;
        background:var(--primary); color:#fff; border:none; font-weight:600;
        cursor:pointer;
      }
      .avatar-initials { font-size:14px; }
      .auth-action { padding:8px 12px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:transparent; color:var(--light); cursor:pointer; }
      .auth-action:hover { background: rgba(255,255,255,0.04); }
      @media (max-width:480px) { .avatar-btn { width:36px; height:36px; } }
    `;
    document.head.appendChild(style);
  }

  function buildAuthUIFromToken(token) {
    ensureAuthStyles();
    const payload = parseJwt(token) || {};
    const name = payload.username || payload.name || payload.email || '';
    const initials = (name || '').split(' ').filter(Boolean).map(s => s[0]).join('').slice(0,2).toUpperCase() ||
                     (payload.email ? payload.email[0].toUpperCase() : 'U');

    const wrap = document.createElement('div');
    wrap.className = 'auth-wrap';

    const avatarBtn = document.createElement('button');
    avatarBtn.className = 'avatar-btn';
    avatarBtn.title = name || 'Tài khoản';
    avatarBtn.innerHTML = `<span class="avatar-initials">${initials}</span>`;
    avatarBtn.addEventListener('click', () => {
      // mở trang thông tin cá nhân
      window.location.href = 'ThongTinCaNhan.html';
    });

    const profileLink = document.createElement('a');
    profileLink.className = 'auth-action';
    profileLink.href = 'ThongTinCaNhan.html';
    profileLink.textContent = 'Hồ sơ';

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'auth-action';
    logoutBtn.textContent = 'Đăng xuất';
    logoutBtn.addEventListener('click', logout);

    wrap.appendChild(avatarBtn);
    wrap.appendChild(profileLink);
    wrap.appendChild(logoutBtn);

    return wrap;
  }

  function updateAuthUI() {
    const token = getStoredToken();
    const userActions = document.querySelectorAll('.user-actions');
    if (!userActions || userActions.length === 0) return;

    userActions.forEach(container => {
      // Nếu đã có auth-wrap thì bỏ qua
      if (token) {
        // thay thế nội dung login/register bằng avatar + logout
        container.innerHTML = '';
        const authUI = buildAuthUIFromToken(token);
        container.appendChild(authUI);
      } else {
        
      }
    });
  }

  document.addEventListener('DOMContentLoaded', updateAuthUI);
  // cũng cập nhật khi localStorage thay đổi (ví dụ 1 tab khác đăng nhập)
  window.addEventListener('storage', (e) => {
    if (e.key === 'adminToken' || e.key === 'token') updateAuthUI();
  });
})();