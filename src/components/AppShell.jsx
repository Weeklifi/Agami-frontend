import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  Menu, LayoutDashboard, Users, MessageSquare, CreditCard, User,
  BookOpen, Wallet, LogOut, ChevronDown, ChevronRight, Plus,
} from "lucide-react";
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
      { to: "/teacher/batches", label: t("batches"), icon: Users },
      { to: "/teacher", label: t("dashboard"), icon: LayoutDashboard },
      { to: "/teacher/sms", label: "SMS", icon: MessageSquare },
      { to: "/teacher/subscription", label: t("subscription"), icon: CreditCard },
      { to: "/teacher/profile", label: "Profile", icon: User },
    ],
    STUDENT: [
      { to: "/student/batches", label: t("myBatches"), icon: BookOpen },
      { to: "/student", label: t("dashboard"), icon: LayoutDashboard },
      { to: "/student/payments", label: t("payments"), icon: Wallet },
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
    const Icon = item.icon;
    if (mobile) {
      return (
        <Link
          to={item.to}
          className={`flex flex-col items-center justify-center gap-1 flex-1
            min-h-[3.5rem] text-[11px] active:bg-page
            ${active ? "text-brand-600 font-semibold" : "text-ink-400"}`}
        >
          <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
          <span className="truncate max-w-full px-1">{item.label}</span>
        </Link>
      );
    }
    return (
      <Link
        to={item.to}
        onClick={() => setDrawerOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm
          ${active
            ? "bg-brand-50 text-brand-700 font-semibold"
            : "text-ink-600 hover:bg-page active:bg-page"
          }`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
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
                    rounded-xl px-3 py-2.5 text-sm
                    ${pathname.startsWith("/student/batches")
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-ink-600 hover:bg-page"
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <BookOpen className="h-[18px] w-[18px]" strokeWidth={2} />
                    {t("myBatches")}
                  </span>
                  {batchOpen
                    ? <ChevronDown className="h-4 w-4" />
                    : <ChevronRight className="h-4 w-4" />}
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
                      className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm
                        text-brand-600 font-medium hover:bg-brand-50"
                    >
                      <Plus className="h-4 w-4" /> Join Room
                    </Link>
                  </div>
                )}
              </div>

              <NavLink
                item={{ to: "/student", label: t("dashboard"), icon: LayoutDashboard }}
                active={pathname === "/student"}
              />
              <NavLink
                item={{ to: "/student/payments", label: t("payments"), icon: Wallet }}
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
            className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm
              text-ink-600 hover:bg-page active:bg-page"
          >
            <LogOut className="h-[18px] w-[18px]" /> {t("logout")}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="h-dvh flex flex-col md:flex-row bg-page overflow-hidden">
      {/* Desktop sidebar — fixed full-height, নিজে scroll করে না */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:h-dvh shrink-0
        border-r border-line bg-surface">
        <div className="flex items-center gap-2.5 px-5 py-5 shrink-0">
          <div className="grad-brand shadow-brand grid h-9 w-9 place-items-center
            rounded-xl text-lg font-extrabold text-white">অ</div>
          <span className="text-lg font-bold text-ink-900">Agami</span>
        </div>
        <SidebarContent />
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="shrink-0 z-10 flex items-center justify-between
          gap-2 border-b border-line bg-surface px-3 h-14 md:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden -ml-1 p-2 rounded-lg text-ink-600 active:bg-page"
              aria-label="Menu"
            >
              <Menu className="h-[22px] w-[22px]" />
            </button>
            <h1 className="text-base font-semibold truncate md:block">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <NotificationBell />
          </div>
        </header>

        {/* শুধু এই অংশটাই scroll হয় */}
        <main className="flex-1 overflow-y-auto min-h-0">
          <div className="mx-auto w-full max-w-5xl px-3 py-4 md:px-6 md:py-6
            pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-6">
            {children}
          </div>
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
