import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaBriefcase,
  FaBuilding,
  FaChartBar,
  FaChevronRight,
  FaClipboardList,
  FaGraduationCap,
  FaSignOutAlt,
  FaTimes,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <FaChartBar />,
      end: true,
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: <FaUsers />,
    },
    {
      name: "Companies",
      path: "/admin/companies",
      icon: <FaBuilding />,
    },
    {
      name: "Internships",
      path: "/admin/internships",
      icon: <FaBriefcase />,
    },
    {
      name: "Certificates",
      path: "/admin/certificates",
      icon: <FaClipboardList />,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: <FaChartBar />,
    },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout from the Admin Panel?"
    );

    if (confirmLogout) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">

          <Link
            to="/admin"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] text-xl text-white shadow-md">
              <FaGraduationCap />
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-tight text-[#0F172A]">
                InternShip <span className="text-[#2563EB]">Hub</span>
              </p>

              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Admin Panel
              </p>
            </div>

          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0F172A] lg:hidden"
          >
            <FaTimes />
          </button>

        </div>

        {/* Admin Profile */}
        <div className="border-b border-slate-100 p-5">

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#2563EB]">
              <FaUserShield />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-[#0F172A]">
                System Admin
              </p>

              <p className="truncate text-xs font-medium text-slate-500">
                Administrator
              </p>
            </div>

          </div>

        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">

          <p className="mb-3 px-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
            Main Menu
          </p>

          <div className="space-y-1.5">

            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-blue-50 text-[#2563EB] shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#2563EB]"
                  }`
                }
              >

                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">

                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-base transition ${
                          isActive
                            ? "bg-[#2563EB] text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-[#2563EB]"
                        }`}
                      >
                        {item.icon}
                      </span>

                      <span>{item.name}</span>

                    </div>

                    <FaChevronRight
                      className={`text-xs transition ${
                        isActive
                          ? "text-[#2563EB]"
                          : "text-slate-300 group-hover:text-slate-400"
                      }`}
                    />

                  </>
                )}
              </NavLink>
            ))}

          </div>

          {/* Admin Information */}
          <div className="mt-8">

            <p className="mb-3 px-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
              Administration
            </p>

            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 p-4">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
                <FaUserShield />
              </div>

              <p className="text-sm font-extrabold text-[#0F172A]">
                Admin Control
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Manage students, companies, internships and certificates.
              </p>

            </div>

          </div>

        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-4">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
              <FaSignOutAlt />
            </span>

            Logout
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:ml-72">

        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">

          <div className="flex items-center gap-4">

            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 lg:hidden"
            >
              <FaBars />
            </button>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
                InternShip Hub
              </p>

              <h2 className="text-lg font-extrabold text-[#0F172A]">
                Admin Control Center
              </h2>
            </div>

          </div>

          <div className="flex items-center gap-3">

            {/* Notification */}
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[#2563EB]"
              title="Notifications"
            >
              <FaBell />

              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Admin Avatar */}
            <div className="hidden items-center gap-3 sm:flex">

              <div className="text-right">
                <p className="text-sm font-bold text-[#0F172A]">
                  System Admin
                </p>

                <p className="text-xs text-slate-500">
                  Administrator
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] text-white">
                <FaUserShield />
              </div>

            </div>

          </div>

        </header>

        {/* Page Content */}
        <main>
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default AdminLayout;