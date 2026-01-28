/**
 * Walkey Backoffice Logic
 */

const admin = {
    currentSection: 'dashboard',

    init() {
        this.bindEvents();
        this.loadStats();
        this.loadSectionData(this.currentSection);
    },

    bindEvents() {
        // Sidebar Navigation
        document.querySelectorAll('.sidebar-nav li').forEach(li => {
            li.addEventListener('click', () => {
                const section = li.getAttribute('data-section');
                this.switchSection(section);
            });
        });

        // Form Submissions
        document.getElementById('theme-form').addEventListener('submit', (e) => this.handleThemeSubmit(e));
        document.getElementById('route-form').addEventListener('submit', (e) => this.handleRouteSubmit(e));
        document.getElementById('user-form').addEventListener('submit', (e) => this.handleUserSubmit(e));
    },

    async handleUserSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                alert('사용자가 추가되었습니다.');
                this.hideModal('user-modal');
                this.fetchUsers();
                e.target.reset();
            } else {
                alert(result.message || '추가 실패');
            }
        } catch (error) {
            alert('사용자 추가 중 오류가 발생했습니다.');
        }
    },

    switchSection(sectionId) {
        // Update UI state
        document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');

        this.currentSection = sectionId;
        this.loadSectionData(sectionId);
    },

    async loadStats() {
        try {
            const res = await fetch('/api/admin/stats');
            const result = await res.json();
            if (result.success) {
                const { users, routes, themes, sessions } = result.data;
                document.getElementById('stat-total-users').textContent = users;
                document.getElementById('stat-total-routes').textContent = routes;
                document.getElementById('stat-total-themes').textContent = themes;
                document.getElementById('stat-total-sessions').textContent = sessions;
            }
        } catch (error) {
            console.error('Stats loading failed:', error);
        }
    },

    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                this.loadStats();
                break;
            case 'themes':
                this.fetchThemes();
                break;
            case 'routes':
                this.fetchRoutes();
                this.populateThemeSelect();
                break;
            case 'users':
                this.fetchUsers();
                break;
        }
    },

    // --- Themes ---
    async fetchThemes() {
        const tbody = document.querySelector('#themes-table tbody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">로딩 중...</td></tr>';

        try {
            const res = await fetch('/api/themes');
            const result = await res.json();
            if (result.success) {
                tbody.innerHTML = '';
                result.data.forEach(theme => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${theme.id}</td>
                        <td><img src="${theme.icon_url || 'https://api.dicebear.com/7.x/icons/svg?seed=' + theme.title}" width="30"></td>
                        <td><strong>${theme.title}</strong></td>
                        <td><span style="background:${theme.color_code}; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${theme.color_code}</span></td>
                        <td style="color:var(--text-dim); font-size: 0.8rem;">${theme.description || '-'}</td>
                        <td>
                            <button class="btn btn-danger btn-icon-only" onclick="admin.deleteTheme(${theme.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Failed to fetch themes');
        }
    },

    async handleThemeSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/admin/themes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                alert('테마가 추가되었습니다.');
                this.hideModal('theme-modal');
                this.fetchThemes();
                e.target.reset();
            }
        } catch (error) {
            alert('테마 추가 중 오류가 발생했습니다.');
        }
    },

    async deleteTheme(id) {
        if (!confirm('정말 이 테마를 삭제하시겠습니까? 연결된 루트가 있으면 문제가 생길 수 있습니다.')) return;
        try {
            const res = await fetch(`/api/admin/themes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                this.fetchThemes();
            }
        } catch (error) {
            alert('삭제 실패');
        }
    },

    // --- Routes ---
    async fetchRoutes() {
        const tbody = document.querySelector('#routes-table tbody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">로딩 중...</td></tr>';

        try {
            const res = await fetch('/api/routes');
            const result = await res.json();
            if (result.success) {
                tbody.innerHTML = '';
                result.data.forEach(route => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${route.id}</td>
                        <td><img src="${route.thumbnail_url || 'https://api.dicebear.com/7.x/shapes/svg?seed=' + route.name}" width="50" style="border-radius:4px"></td>
                        <td>
                            <div><strong>${route.name}</strong></div>
                            <small style="color:var(--primary)">${route.theme_title}</small>
                        </td>
                        <td>${route.total_distance} km</td>
                        <td>${route.estimated_time}</td>
                        <td>
                            <button class="btn btn-danger btn-icon-only" onclick="admin.deleteRoute(${route.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Failed to fetch routes');
        }
    },

    async populateThemeSelect() {
        const select = document.getElementById('theme-select');
        try {
            const res = await fetch('/api/themes');
            const result = await res.json();
            if (result.success) {
                select.innerHTML = '<option value="">테마를 선택하세요</option>';
                result.data.forEach(theme => {
                    const opt = document.createElement('option');
                    opt.value = theme.id;
                    opt.textContent = theme.title;
                    select.appendChild(opt);
                });
            }
        } catch (error) { }
    },

    async handleRouteSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await fetch('/api/admin/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (result.success) {
                alert('루트가 추가되었습니다.');
                this.hideModal('route-modal');
                this.fetchRoutes();
                e.target.reset();
            }
        } catch (error) {
            alert('루트 추가 중 오류가 발생했습니다.');
        }
    },

    async deleteRoute(id) {
        if (!confirm('정말 이 루트를 삭제하시겠습니까?')) return;
        try {
            const res = await fetch(`/api/admin/routes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                this.fetchRoutes();
            }
        } catch (error) {
            alert('삭제 실패');
        }
    },

    // --- Users ---
    async fetchUsers() {
        const tbody = document.querySelector('#users-table tbody');
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">로딩 중...</td></tr>';

        try {
            const res = await fetch('/api/admin/users');
            const result = await res.json();
            if (result.success) {
                tbody.innerHTML = '';
                result.data.forEach(user => {
                    const tr = document.createElement('tr');
                    const date = new Date(user.created_at).toLocaleDateString();
                    tr.innerHTML = `
                        <td><img src="${user.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username}" width="35" style="border-radius:50%"></td>
                        <td><small style="color:var(--text-dim)">${user.id}</small></td>
                        <td><strong>${user.username}</strong><br><small>${user.email}</small></td>
                        <td>${date}</td>
                        <td>
                            <button class="btn btn-danger btn-icon-only" onclick="admin.deleteUser('${user.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        } catch (error) {
            console.error('Failed to fetch users');
        }
    },

    async deleteUser(id) {
        if (!confirm('정말 이 사용자를 삭제하시겠습니까? 데이터가 모두 삭제됩니다.')) return;
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                this.fetchUsers();
            }
        } catch (error) {
            alert('삭제 실패');
        }
    },

    // --- UI Helpers ---
    showModal(id) {
        document.getElementById(id).style.display = 'block';
    },

    hideModal(id) {
        document.getElementById(id).style.display = 'none';
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => admin.init());
