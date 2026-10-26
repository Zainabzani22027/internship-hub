import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  FaBars,
  FaBriefcase,
  FaCertificate,
  FaFileAlt,
  FaHome,
  FaSignOutAlt,
  FaTimes,
  FaUser,
  FaBookmark,
  FaSearch,
  FaBell,
} from "react-icons/fa";

import { apiGet, apiPut } from "../utils/api";

function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    loadNotificationCount();
  }, []);

  const loadNotificationCount = async () => {
    try {
      const data = await apiGet("/notifications");

      setUnreadCount(
        Number(data.unreadCount || 0)
      );
    } catch (error) {
      console.error(
        "Load notification count error:",
        error
      );
    }
  };

  const handleNotificationClick = async () => {
    try {
      if (unreadCount > 0) {
        await apiPut("/notifications/read-all");

        setUnreadCount(0);
      }
    } catch (error) {
      console.error(
        "Mark notifications as read error:",
        error
      );
    }

    navigate("/student/notifications");
  };

  const menuItems = [
    {
      name: "Overview",
      path: "/student",
      icon: <FaHome />,
      end: true,
    },
    {
      name: "Find Internships",
      path: "/student/internships",
      icon: <FaSearch />,
    },
    {
      name: "My Applications",
      path: "/student/applications",
      icon: <FaFileAlt />,
    },
    {
      name: "Saved Internships",
      path: "/student/saved",
      icon: <FaBookmark />,
    },
    {
      name: "Certificates",
      path: "/student/certificates",
      icon: <FaCertificate />,
    },
    {
      name: "My Profile",
      path: "/student/profile",
      icon: <FaUser />,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* ================= MOBILE OVERLAY ================= */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >

        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">

          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] text-lg text-white shadow-md">
              🎓
            </div>

            <div>
              <div className="font-extrabold text-[#0F172A]">
                InternShip
                <span className="text-[#2563EB]">
                  Hub
                </span>
              </div>

              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Student Portal
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            className="text-slate-500 lg:hidden"
          >
            <FaTimes />
          </button>

        </div>

        {/* Student Mini Profile */}

        <div className="px-5 py-5">

          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2563EB] font-bold text-white">
                S
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#0F172A]">
                  Student
                </p>

                <p className="truncate text-xs text-slate-500">
                  Student Account
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-1 overflow-y-auto px-4">

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Student Menu
          </p>

          {menuItems.map((item) => (

            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() =>
                setSidebarOpen(false)
              }
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-50 text-[#2563EB]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]"
                }`
              }
            >
              <span className="text-base">
                {item.icon}
              </span>

              {item.name}
            </NavLink>

          ))}

        </nav>

        {/* Logout */}

        <div className="border-t border-slate-100 p-4">

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
          >
            <FaSignOutAlt />

            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN AREA ================= */}

      <div className="lg:pl-72">

        {/* Topbar */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">

          <div className="flex items-center gap-4">

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className="rounded-lg border border-slate-200 p-2.5 text-slate-600 lg:hidden"
            >
              <FaBars />
            </button>

            <div>
              <h2 className="font-bold text-[#0F172A]">
                Student Portal
              </h2>

              <p className="hidden text-xs text-slate-400 sm:block">
                Find opportunities and manage your career journey.
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <Link
              to="/student/internships"
              className="hidden items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:flex"
            >
              <FaBriefcase />

              Find Internships
            </Link>

            {/* Notification Bell */}

            <button
              type="button"
              onClick={handleNotificationClick}
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-[#2563EB]"
            >
              <FaBell />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>

            <Link
              to="/student/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] font-bold text-white"
            >
              S
            </Link>

          </div>

        </header>

        {/* Page Content */}

        <main className="p-5 sm:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default StudentLayout;