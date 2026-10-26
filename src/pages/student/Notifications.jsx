import { useEffect, useState } from "react";

import {
  FaBell,
  FaCheckCircle,
  FaClock,
  FaEnvelopeOpen,
  FaTrash,
} from "react-icons/fa";

import { apiGet, apiPut } from "../../utils/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet("/notifications");

      setNotifications(
        data.notifications || []
      );

      setUnreadCount(
        Number(data.unreadCount || 0)
      );
    } catch (err) {
      console.error(
        "Load notifications error:",
        err
      );

      setError(
        err.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiPut(
        `/notifications/${id}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );

      setUnreadCount((current) =>
        Math.max(current - 1, 0)
      );
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiPut(
        "/notifications/read-all"
      );

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error(
        "Mark all notifications as read error:",
        err
      );

      alert(
        err.message ||
          "Unable to mark notifications as read."
      );
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="mx-auto max-w-5xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <FaBell className="text-lg text-[#2563EB]" />

              <span className="text-sm font-semibold text-[#2563EB]">
                Student Notifications
              </span>

            </div>

            <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
              Notifications
            </h1>

            <p className="mt-1 text-sm leading-6 text-[#64748B]">
              Stay updated about your applications,
              internships and account activity.
            </p>

          </div>

          {!loading &&
            notifications.length > 0 &&
            unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] shadow-sm transition hover:bg-slate-50"
              >
                <FaEnvelopeOpen />

                Mark All as Read
              </button>
            )}

        </div>

        {/* ================= SUMMARY ================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <FaBell className="text-lg text-[#2563EB]" />
              </div>

              <div>

                <p className="text-sm text-[#64748B]">
                  Total
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0F172A]">
                  {notifications.length}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
                <FaClock className="text-lg text-orange-500" />
              </div>

              <div>

                <p className="text-sm text-[#64748B]">
                  Unread
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0F172A]">
                  {unreadCount}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                <FaCheckCircle className="text-lg text-green-600" />
              </div>

              <div>

                <p className="text-sm text-[#64748B]">
                  Read
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0F172A]">
                  {notifications.length -
                    unreadCount}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* ================= LOADING ================= */}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <FaBell className="animate-pulse text-xl text-[#2563EB]" />
            </div>

            <p className="mt-4 text-sm font-medium text-[#64748B]">
              Loading notifications...
            </p>

          </div>
        )}

        {/* ================= ERROR ================= */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={loadNotifications}
              className="mt-4 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>
        )}

        {/* ================= EMPTY ================= */}

        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <FaBell className="text-2xl text-[#2563EB]" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#0F172A]">
                No Notifications
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                You don't have any notifications yet.
                Updates about your applications and
                internships will appear here.
              </p>

            </div>
          )}

        {/* ================= NOTIFICATIONS ================= */}

        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div className="space-y-4">

              {notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                      notification.is_read
                        ? "border-slate-200"
                        : "border-blue-200 bg-blue-50/30"
                    }`}
                  >

                    <div className="flex gap-4">

                      {/* Icon */}

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          notification.is_read
                            ? "bg-slate-100 text-slate-500"
                            : "bg-blue-100 text-[#2563EB]"
                        }`}
                      >
                        {notification.is_read ? (
                          <FaEnvelopeOpen />
                        ) : (
                          <FaBell />
                        )}
                      </div>

                      {/* Content */}

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-col justify-between gap-2 sm:flex-row">

                          <div>

                            <div className="flex flex-wrap items-center gap-2">

                              <h2 className="font-bold text-[#0F172A]">
                                {notification.title}
                              </h2>

                              {!notification.is_read && (
                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#2563EB]">
                                  New
                                </span>
                              )}

                            </div>

                            <p className="mt-1 text-sm leading-6 text-[#64748B]">
                              {notification.message}
                            </p>

                          </div>

                          <p className="shrink-0 text-xs text-slate-400">
                            {formatDate(
                              notification.created_at
                            )}
                          </p>

                        </div>

                        {/* Action */}

                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(
                                notification.id
                              )
                            }
                            className="mt-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#2563EB] transition hover:bg-blue-50"
                          >
                            <FaCheckCircle />

                            Mark as Read
                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        {/* ================= INFORMATION ================= */}

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

          <div className="flex items-start gap-3">

            <FaBell className="mt-1 shrink-0 text-lg text-[#2563EB]" />

            <div>

              <h2 className="font-bold text-[#0F172A]">
                Stay Updated
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#64748B]">
                InternShip Hub notifications keep you informed
                about application updates, internship opportunities,
                selections and other important account activity.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Notifications;