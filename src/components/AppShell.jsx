import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import MobileDrawer from "./MobileDrawer";

export default function AppShell({ title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Student-এর batch গুলো dropdown-এর জন্য
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
      { to: "/teacher/sms/recharge", label: "SMS Recharge", icon: "✉" },
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
          className={`flex flex-col items-center gap-0.5 py-2 flex-1 text-[11px]
            ${active ? "text-brand-600 font-medium" : "text-ink-400"}`}
        >
          <span className="text-base leading-none">{item.icon}</span>
          {item.label}
        </Link>
      );
    }
    return (
      <Link
        to={item.to}
        onClick={() => setDrawerOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm
          ${active
            ? "bg-brand-50 text-brand-700 font-medium"
            : "text-ink-600 hover:bg-page"
          }`}
      >
        <span className="w-4 text-center">{item.icon}</span>
        {item.label}
      </Link>
    );
  }

  // Sidebar-এর ভেতরের content — desktop <aside> আর mobile drawer
  // দুটোতেই reuse হবে, কোড duplicate করছি না
  function SidebarContent() {
    return (
      <>
        <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
          {user?.role === "STUDENT" ? (
            <>
              {/* আমার Batch — dropdown */}
              <div>
                <button
                  onClick={() => setBatchOpen(!batchOpen)}
                  className={`w-full flex items-center justify-between gap-3
                    rounded-lg px-3 py-2 text-sm
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
                          className={`block rounded-lg px-3 py-1.5 text-sm truncate
                            ${pathname === `/student/batches/${b.id}`
                              ? "bg-brand-50 text-brand-700 font-medium"
                              : "text-ink-600 hover:bg-page"
                            }`}
                        >
                          {b.name}
                        </Link>
                      ))
                    )}

                    {/* নতুন batch-এ join — সবসময় দেখা যাবে */}
                    <Link
                      to="/student/batches"
                      onClick={() => setDrawerOpen(false)}
                      className="block rounded-lg px-3 py-1.5 text-sm
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

        <div className="border-t border-line p-3">
          <div className="px-3 py-1.5 text-xs text-ink-400 truncate">
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-600 hover:bg-page"
          >
            ↩ {t("logout")}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex md:w-56 md:flex-col border-r border-line
        bg-surface md:sticky md:top-0 md:h-screen">
        <div className="px-5 py-5 text-lg font-bold text-brand-600">Agami</div>
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col pb-14 md:pb-0">
        <header className="sticky top-0 z-10 flex items-center justify-between
          border-b border-line bg-surface px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden rounded-lg p-1.5 text-ink-600 hover:bg-page"
              aria-label="Menu"
            >
              ☰
            </button>
            <span className="md:hidden text-base font-bold text-brand-600">
              Agami
            </span>
            <h1 className="hidden md:block text-base font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="md:hidden rounded-lg p-2 text-ink-600 hover:bg-page"
              aria-label={t("logout")}
            >
              ↩
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 md:px-6 md:py-6 max-w-5xl w-full mx-auto min-w-0">
          <h1 className="md:hidden text-lg font-semibold mb-4">{title}</h1>
          {children}
        </main>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="fixed bottom-0 inset-x-0 z-10 flex border-t border-line
        bg-surface md:hidden">
        {items.map((item) => (
          <NavLink key={item.to} item={item} active={isActive(item.to)} mobile />
        ))}
      </nav>

      {/* Mobile drawer — hamburger চাপলে খোলে */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <SidebarContent />
      </MobileDrawer>
    </div>
  );
}