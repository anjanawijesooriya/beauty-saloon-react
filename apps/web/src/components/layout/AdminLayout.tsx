import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Scissors,
  Calendar,
  ShoppingBag,
  Package,
  Tag,
  Star,
  Trophy,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

const navItems = [
  { to: "/admin",              label: "Dashboard",    icon: LayoutDashboard },
  { to: "/admin/services",     label: "Services",     icon: Scissors },
  { to: "/admin/stylists",     label: "Stylists",     icon: Users },
  { to: "/admin/appointments", label: "Appointments", icon: Calendar },
  { to: "/admin/products",     label: "Products",     icon: ShoppingBag },
  { to: "/admin/orders",       label: "Orders",       icon: Package },
  { to: "/admin/promotions",   label: "Promotions",   icon: Tag },
  { to: "/admin/reviews",      label: "Reviews",      icon: Star },
  { to: "/admin/loyalty",      label: "Loyalty",      icon: Trophy },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950">
      <aside className="w-64 bg-brand-900 text-white flex flex-col">
        {/* Brand header */}
        <div className="h-16 flex items-center px-6 border-b border-brand-800">
          <span className="font-display text-xl italic text-brand-300">
            GlowHer Admin
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                (to === "/admin" ? pathname === to : pathname.startsWith(to))
                  ? "bg-brand-700 text-white"
                  : "text-brand-200 hover:bg-brand-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        {/* User profile + logout */}
        <div className="px-3 py-4 border-t border-brand-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-brand-400 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-brand-300 hover:bg-brand-800 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Admin Panel
          </h1>
          <span className="text-sm text-neutral-500 hidden sm:block">
            Logged in as{" "}
            <span className="font-medium text-neutral-700">{user?.name}</span>
          </span>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
