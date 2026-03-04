/**
 * auth-guard.js (v2.5 終極防呆大小寫免疫版)
 * 用途：
 * 1. 確保使用者已登入。
 * 2. 嚴格區分「老闆 (Manager)」與「行政 (Admin)」。
 * 3. 居服員 (Caregiver) 若嘗試登入，直接阻擋。
 */

(function() {
    // 1. 取得目前頁面檔名
    const pathParts = window.location.pathname.split("/");
    let currentPage = pathParts.pop();
    if (currentPage === "" || currentPage === "/") currentPage = "index.html";

    // 2. 定義公開頁面 (只有登入頁)
    const PUBLIC_PAGES = ['index.html'];

    // 3. 檢查 Session
    const userSession = sessionStorage.getItem('kuangyou_user');

    // --- 情況 A: 未登入，且不在公開頁面 -> 踢回登入頁 ---
    if (!userSession && !PUBLIC_PAGES.includes(currentPage.toLowerCase())) {
        window.location.href = 'index.html';
        return;
    }

    // --- 情況 B: 已登入，進行權限檢查 ---
    if (userSession) {
        const user = JSON.parse(userSession);
        const role = user.role; // 'manager', 'super_admin', 'admin', 'caregiver'

        // ⛔ 特殊防呆：居服員不應使用此系統
        if (role === 'caregiver') {
            alert("⛔ 權限錯誤：居服員無需登入此管理系統。");
            sessionStorage.removeItem('kuangyou_user');
            window.location.href = 'index.html';
            return;
        }

        // ★★★ 權限設定：行政人員的白名單 ★★★
        // 這裡全部寫小寫即可，下方檢查時會自動把網址轉成小寫來比對
        const ADMIN_ALLOWED_PAGES = [
            'admin_portal.html',       // 行政入口
            'employee.html',           // 人事資料
            'leave.html',              // 特休管理
            'attendance_admin.html',   // 考勤管理
            'salary.html',             // 行政薪資
            'salary_caregiver.html',   // 居服薪資
            'assessment.html',         // 考核系統
            'income_management.html',  // 應收帳款管理
            'expense_log.html',        // 零用金管理
            'bill_reminder.html'       // 帳單提醒
        ];

        // 判斷角色權限
        const isBoss = ['manager', 'super_admin'].includes(role);
        const isAdmin = (role === 'admin');

        // 1. 如果在登入頁 (index.html) 且已登入，自動導向首頁
        if (PUBLIC_PAGES.includes(currentPage.toLowerCase())) {
            if (isBoss) window.location.href = 'accounting_portal.html'; // 老闆去財務中心
            else window.location.href = 'admin_portal.html';             // 行政去行政中心
            return;
        }

        // 2. 老闆權限：無敵 (Pass)
        if (isBoss) {
            return; 
        }

        // 3. 行政權限：嚴格檢查白名單 (自動忽略大小寫差異)
        if (isAdmin) {
            const isAllowed = ADMIN_ALLOWED_PAGES.includes(currentPage.toLowerCase());
            
            if (!isAllowed) {
                alert("⛔ 越權警告：權限不足，已將您強制登出並返回首頁！");
                sessionStorage.removeItem('kuangyou_user'); // 強制登出
                window.location.href = 'index.html';        // 踢回登入頁
                return;
            }
        }
    }
})();
