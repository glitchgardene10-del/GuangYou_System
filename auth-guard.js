/**
 * auth-guard.js (v2.3 完整行政權限版)
 * 用途：
 * 1. 確保使用者已登入。
 * 2. 嚴格區分「老闆 (Manager)」與「行政 (Admin)」。
 * 3. 居服員 (Caregiver) 若嘗試登入，直接阻擋。
 */

(function() {
    const permissions = window.KuangYouPermissions;
    const fallbackAdminAllowedPages = [
        'admin_portal.html',
  'employee.html',
        'leave.html',
        'attendance_admin.html',
        'salary.html',
        'salary_caregiver.html',
        'assessment.html',
        'assessment_legacy.html',
        'income_management.html',
        'expense_log.html',
        'bill_reminder.html'
    ];
    const fallbackGrantMap = {
  'employee.html': 'allowedEmployee',
        'leave.html': 'allowedLeave',
        'salary.html': 'allowedSalary',
        'salary_caregiver.html': 'allowedSalary',
        'assessment.html': 'allowedAssessment',
        'assessment_legacy.html': 'allowedAssessment',
        'income_management.html': 'allowedAccounting',
        'expense_log.html': 'allowedAccounting',
        'bill_reminder.html': 'allowedAccounting'
    };

    // 1. 取得目前頁面檔名
    const currentPage = permissions
        ? permissions.normalizePage(window.location.pathname)
        : (function() {
            const pathParts = window.location.pathname.split("/");
            let page = pathParts.pop();
            if (page === "" || page === "/") page = "index.html";
            return page;
        })();

    // 2. 定義公開頁面 (只有登入頁)
    const PUBLIC_PAGES = permissions ? permissions.PUBLIC_PAGES : ['index.html'];

    // 3. 檢查 Session
    const userSession = sessionStorage.getItem('kuangyou_user');

    // --- 情況 A: 未登入，且不在公開頁面 -> 踢回登入頁 ---
    if (!userSession && !PUBLIC_PAGES.includes(currentPage)) {
        // console.warn("⛔ 未登入，拒絕存取。");
        window.location.href = 'index.html';
        return;
    }

    // --- 情況 B: 已登入，進行權限檢查 ---
    if (userSession) {
        const user = JSON.parse(userSession);
        const role = user.role; // 'manager', 'super_admin', 'admin', 'caregiver'
        const grants = user.grants || {};
        const isBoss = permissions ? permissions.isBoss(role) : ['manager', 'super_admin'].includes(role);
        const isAdmin = permissions ? permissions.isAdmin(role) : (role === 'admin');
        const isCaregiver = permissions ? permissions.isCaregiver(role) : (role === 'caregiver');

        // ⛔ 特殊防呆：居服員不應使用此系統
        if (isCaregiver) {
            alert("⛔ 權限錯誤：居服員無需登入此管理系統。");
            sessionStorage.removeItem('kuangyou_user');
            window.location.href = 'index.html';
            return;
        }

        // 1. 如果在登入頁 (index.html) 且已登入，自動導向首頁
        if (PUBLIC_PAGES.includes(currentPage)) {
            window.location.href = permissions ? permissions.getDefaultHome(role) : (isBoss ? 'accounting_portal.html' : 'admin_portal.html');
            return;
        }

        // 2. 老闆權限：無敵 (Pass)
        if (isBoss) {
            return; 
        }

        // 3. 行政權限：嚴格檢查白名單
        if (isAdmin) {
            const allowed = permissions
                ? permissions.canAccessAdminSystemPageWithGrants(role, currentPage, grants)
                : (
                    (currentPage === 'accounting_portal.html')
                        ? false
                        : (fallbackGrantMap[currentPage]
                            ? Boolean(grants[fallbackGrantMap[currentPage]])
                            : fallbackAdminAllowedPages.includes(currentPage))
                );
            if (!allowed) {
                alert("⛔ 越權警告：行政人員無法存取財務或系統設定頁面！");
                window.location.href = 'admin_portal.html'; // 踢回行政入口
                return;
            }
        }
    }
})();
