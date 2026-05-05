(function() {
    const PUBLIC_PAGES = ['index.html'];
    const ADMIN_ALLOWED_PAGES = [
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
    const ADMIN_ACCOUNTING_PAGES = [
        'income_management.html',
        'expense_log.html',
        'bill_reminder.html'
    ];
    const PAGE_GRANT_MAP = {
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
    const BOSS_ROLES = ['manager', 'super_admin'];

    function normalizePage(pathname) {
        const pathParts = pathname.split("/");
        let currentPage = pathParts.pop();
        if (currentPage === "" || currentPage === "/") currentPage = "index.html";
        return currentPage;
    }

    function isBoss(role) {
        return BOSS_ROLES.includes(role);
    }

    function isAdmin(role) {
        return role === 'admin';
    }

    function isCaregiver(role) {
        return role === 'caregiver';
    }

    function getDefaultHome(role) {
        return isBoss(role) ? 'accounting_portal.html' : 'admin_portal.html';
    }

    function canAccessAdminSystemPage(role, page) {
        return canAccessAdminSystemPageWithGrants(role, page, {});
    }

    function canAccessAdminSystemPageWithGrants(role, page, grants) {
        if (isBoss(role)) return true;
        if (!isAdmin(role)) return PUBLIC_PAGES.includes(page);
        if (page === 'accounting_portal.html') return false;

        const requiredGrant = PAGE_GRANT_MAP[page];
        if (requiredGrant) return Boolean(grants?.[requiredGrant]);

        if (isAdmin(role)) return ADMIN_ALLOWED_PAGES.includes(page);
        return PUBLIC_PAGES.includes(page);
    }

    function canAccessEntryTarget(role, uid, url, systemSettings) {
        if (isBoss(role)) return true;
        if (!isAdmin(role)) return false;

        if (url === 'admin_portal.html') return true;
        if (url === 'attendance_admin.html') return true;
        if (url === 'accounting_portal.html') return Boolean(systemSettings?.allowedAccounting?.includes(uid));

        return false;
    }

    function buildPermissionGrants(systemSettings, uid) {
        return {
            allowedAccounting: Boolean(systemSettings?.allowedAccounting?.includes(uid)),
            allowedAdmin: Boolean(systemSettings?.allowedAdmin?.includes(uid)),
            allowedAssessment: Boolean(systemSettings?.allowedAssessment?.includes(uid)),
            allowedEmployee: Boolean(systemSettings?.allowedEmployee?.includes(uid)),
            allowedLeave: Boolean(systemSettings?.allowedLeave?.includes(uid)),
            allowedProxies: Boolean(systemSettings?.allowedProxies?.includes(uid)),
            allowedSalary: Boolean(systemSettings?.allowedSalary?.includes(uid))
        };
    }

    function buildSessionUser(user, systemSettings) {
        const uid = user.id || user.uid;
        return {
            ...user,
            grants: buildPermissionGrants(systemSettings, uid)
        };
    }

    window.KuangYouPermissions = {
        PUBLIC_PAGES,
        ADMIN_ALLOWED_PAGES,
        ADMIN_ACCOUNTING_PAGES,
        PAGE_GRANT_MAP,
        BOSS_ROLES,
        normalizePage,
        isBoss,
        isAdmin,
        isCaregiver,
        getDefaultHome,
        canAccessAdminSystemPage,
        canAccessAdminSystemPageWithGrants,
        canAccessEntryTarget,
        buildPermissionGrants,
        buildSessionUser
    };
})();
