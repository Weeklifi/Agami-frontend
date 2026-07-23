import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import MobileDrawer from "./MobileDrawer";

export default function AppShell({ title, children, sidebar = null }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [myBatches, setMyBatches] = useState([]);
  const [batchOpen, setBatchOpen] = useState(true);

  useEffect(() => {
    if (user?.role === "STUDENT") {
      client
        .get("/api/batches/my/")
        .then((res) => setMyBatches(res.data.results))
        .catch(() => {});
    }
  }, [user?.role]);

  const NAV = {
    TEACHER: [
      { to: "/teacher/batches", label: t("batches"), icon: "▣" },
      { to: "/teacher", label: t("dashboard"), icon: "▦" },
      { to: "/teacher/sms", label: "SMS", icon: "✉" },
      { to: "/teacher/subscription", label: t("subscription"), icon: "◈" },
      { to: "/teacher/profile", label: "Profile", icon: "◉" },
    ],
    STUDENT: [
      { to: "/student/batches", label: t("myBatches"), icon: "▣" },
      { to: "/student", label: t("dashboard"), icon: "▦" },
      { to: "/student/payments", label: t("payments"), icon: "৳" },
    ],
  };

  const items = NAV[user?.role] || [];
  // মোবাইলে সর্বোচ্চ ৪টা tab — বেশি হলে চাপাচাপি লাগে, বাকিটা drawer-এ
  const mobileItems = items.slice(0, 4);

  const isActive = (to) =>
    to === "/teacher" || to === "/student"
      ? pathname === to
      : pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  function NavLink({ item, active, mobile = false }) {
    if (mobile) {
      return (
        <Link
          to={item.to}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1
            min-h-[3.5rem] text-[11px] active:bg-page
            ${active ? "text-brand-600 font-semibold" : "text-ink-400"}`}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          <span className="truncate max-w-full px-1">{item.label}</span>
        </Link>
      );
    }
    return (
      <Link
        to={item.to}
        onClick={() => setDrawerOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm
          ${active
            ? "bg-brand-50 text-brand-700 font-medium"
            : "text-ink-600 hover:bg-page active:bg-page"
          }`}
      >
        <span className="w-4 text-center">{item.icon}</span>
        {item.label}
      </Link>
    );
  }

  function SidebarContent() {
    return (
      <>
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {sidebar ? (
            sidebar
          ) : user?.role === "STUDENT" ? (
            <>
              <div>
                <button
                  onClick={() => setBatchOpen(!batchOpen)}
                  className={`w-full flex items-center justify-between gap-3
                    rounded-lg px-3 py-2.5 text-sm
                    ${pathname.startsWith("/student/batches")
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-ink-600 hover:bg-page"
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-4 text-center">▣</span>
                    {t("myBatches")}
                  </span>
                  <span className="text-xs">{batchOpen ? "▾" : "▸"}</span>
                </button>

                {batchOpen && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-line pl-2">
                    {myBatches.length === 0 ? (
                      <p className="px-3 py-1.5 text-xs text-ink-400">
                        {t("noBatches")}
                      </p>
                    ) : (
                      myBatches.map((b) => (
                        <Link
                          key={b.id}
                          to={`/student/batches/${b.id}`}
                          onClick={() => setDrawerOpen(false)}
                          className={`block rounded-lg px-3 py-2 text-sm truncate
                            ${pathname === `/student/batches/${b.id}`
                              ? "bg-brand-50 text-brand-700 font-medium"
                              : "text-ink-600 hover:bg-page"
                            }`}
                        >
                          {b.name}
                        </Link>
                      ))
                    )}
                    <Link
                      to="/student/batches"
                      onClick={() => setDrawerOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm
                        text-brand-600 font-medium hover:bg-brand-50"
                    >
                      + Join Room
                    </Link>
                  </div>
                )}
              </div>

              <NavLink
                item={{ to: "/student", label: t("dashboard"), icon: "▦" }}
                active={pathname === "/student"}
              />
              <NavLink
                item={{ to: "/student/payments", label: t("payments"), icon: "৳" }}
                active={pathname.startsWith("/student/payments")}
              />
            </>
          ) : (
            items.map((item) => (
              <NavLink key={item.to} item={item} active={isActive(item.to)} />
            ))
          )}
        </nav>

        <div className="border-t border-line p-3 safe-bottom">
          <div className="px-3 py-1.5 text-xs text-ink-400 truncate">
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm
              text-ink-600 hover:bg-page active:bg-page"
          >
            ↩ {t("logout")}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-dvh md:flex bg-page">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col border-r border-line
        bg-surface md:sticky md:top-0 md:h-dvh">
        <div className="px-5 py-5 text-lg font-bold text-brand-600">Agami</div>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between
          gap-2 border-b border-line bg-surface px-3 h-14 md:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden -ml-1 p-2 rounded-lg text-ink-600 active:bg-page"
              aria-label="Menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <h1 className="text-base font-semibold truncate md:block">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 px-3 py-4 md:px-6 md:py-6 max-w-5xl w-full
          mx-auto min-w-0 pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))]
          md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 z-30 flex border-t border-line
        bg-surface md:hidden safe-bottom-nav">
        {mobileItems.map((item) => (
          <NavLink key={item.to} item={item} active={isActive(item.to)} mobile />
        ))}
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <SidebarContent />
      </MobileDrawer>
    </div>
  );
}