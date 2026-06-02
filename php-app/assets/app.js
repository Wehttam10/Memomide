// Notification Toggle
const notificationButton = document.querySelector('#notificationButton');
const notificationMenu = document.querySelector('#notificationMenu');

if (notificationButton && notificationMenu) {
  notificationButton.addEventListener('click', () => {
    notificationMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', (event) => {
    if (!notificationButton.contains(event.target) && !notificationMenu.contains(event.target)) {
      notificationMenu.classList.add('hidden');
    }
  });
}

// Sidebar Toggle (Mobile Drawer & Desktop Collapsing)
const sidebarToggle = document.querySelector('#sidebarToggle');
const sidebarClose = document.querySelector('#sidebarClose');
const sidebar = document.querySelector('#sidebar');
const sidebarBackdrop = document.querySelector('#sidebar-backdrop');

if (sidebarToggle && sidebar) {
  sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth < 1024) {
      sidebar.classList.toggle('sidebar-open');
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.toggle('hidden');
      }
    } else {
      sidebar.classList.toggle('sidebar-closed');
    }
  });
}

if (sidebarClose && sidebar) {
  sidebarClose.addEventListener('click', () => {
    if (window.innerWidth < 1024) {
      sidebar.classList.remove('sidebar-open');
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.add('hidden');
      }
    } else {
      sidebar.classList.toggle('sidebar-closed');
      // Save state to localStorage to persist across page reloads
      const isClosed = sidebar.classList.contains('sidebar-closed');
      localStorage.setItem('sidebar_state', isClosed ? 'closed' : 'open');
    }
  });
}

if (sidebarBackdrop && sidebar) {
  sidebarBackdrop.addEventListener('click', () => {
    sidebar.classList.remove('sidebar-open');
    sidebarBackdrop.classList.add('hidden');
  });
}
