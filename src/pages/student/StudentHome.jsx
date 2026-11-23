import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaArrowRight,
  FaBookmark,
  FaBriefcase,
  FaCalendarAlt,
  FaCertificate,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";
import { apiGet } from "../../utils/api";

function StudentHome() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const data = await apiGet("/applications/student");
        setApplications(data.applications || []);
      } catch (err) {
        console.log("Dashboard apps error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const totalApps = applications.length;
  const underReview = applications.filter(
    (a) => a.status === "UNDER_REVIEW" || a.status === "PENDING" || a.status === "APPLIED"
  ).length;
  const shortlisted = applications.filter(
    (a) => a.status === "SHORTLISTED"
  ).length;
  const recentApps = applications.slice(0, 3);

  const statistics = [
    {
      title: "Applications",
      value: loading ? "..." : totalApps,
      description: "Total applications",
      icon: <FaFileAlt />,
      iconStyle: "bg-blue-50 text-[#2563EB]",
    },
    {
      title: "Under Review",
      value: loading ? "..." : underReview,
      description: "Being reviewed",
      icon: <FaClock />,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "Shortlisted",
      value: loading ? "..." : shortlisted,
      description: "Great progress",
      icon: <FaCheckCircle />,
      iconStyle: "bg-green-50 text-green-600",
    },
    {
      title: "Certificates",
      value: "0",
      description: "Internships completed",
      icon: <FaCertificate />,
      iconStyle: "bg-purple-50 text-[#6D5DFB]",
    },
  ];

  const recommendedInternships = [];


  return (
    <div className="mx-auto max-w-7xl">

      {/* ================= WELCOME ================= */}

      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#2563EB] to-[#6D5DFB] p-6 text-white shadow-lg shadow-blue-100 sm:p-8">

        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

          <div>

            <p className="text-sm font-semibold text-blue-100">
              STUDENT DASHBOARD
            </p>

            <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
              Welcome to InternShip Hub 👋
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-blue-100">
              Discover verified internship opportunities, track your
              applications and build your professional career.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <Link
                to="/student/internships"
                className="rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-[#2563EB] transition hover:bg-blue-50"
              >
                Explore Internships
              </Link>

              <Link
                to="/student/profile"
                className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/20"
              >
                Complete Profile
              </Link>

            </div>

          </div>

          <div className="hidden h-40 w-40 shrink-0 items-center justify-center rounded-full bg-white/10 text-7xl lg:flex">
            🎓
          </div>

        </div>

      </section>

      {/* ================= STATISTICS ================= */}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {statistics.map((statistic) => (

          <div
            key={statistic.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  {statistic.title}
                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                  {statistic.value}
                </p>

              </div>

              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${statistic.iconStyle}`}
              >
                {statistic.icon}
              </div>

            </div>

            <p className="mt-4 text-xs text-slate-400">
              {statistic.description}
            </p>

          </div>

        ))}

      </section>

      {/* ================= MAIN GRID ================= */}

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_340px]">

        {/* LEFT */}

        <div className="space-y-8">

          {/* Applications */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-xl font-extrabold text-[#0F172A]">
                  Recent Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track your latest internship applications.
                </p>
              </div>

              <Link
                to="/student/applications"
                className="text-sm font-bold text-[#2563EB]"
              >
                View All
              </Link>

            </div>

            {loading ? (
              <p className="mt-6 text-center text-sm text-slate-500">Loading...</p>
            ) : recentApps.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-[#F8FAFC] px-6 py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-xl text-[#2563EB]">
                  <FaFileAlt />
                </div>
                <h3 className="mt-4 font-bold text-[#0F172A]">
                  No applications yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Once you apply for an internship, your application status
                  will appear here.
                </p>
                <Link
                  to="/student/internships"
                  className="mt-5 inline-block rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Find Internships
                </Link>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {recentApps.map((app) => (
                  <div
                    key={app._id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-4"
                  >
                    <div>
                      <p className="font-bold text-[#0F172A]">
                        {app.internship?.title || "Internship"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {app.internship?.company?.name || app.internship?.companyName || app.company?.name || ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-600">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

          </section>

        </div>

        {/* ================= RIGHT SIDEBAR ================= */}

        <div className="space-y-6">

          {/* Profile Completion */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-[#6D5DFB]">
                <FaUser />
              </div>

              <span className="text-lg font-extrabold text-[#2563EB]">
                25%
              </span>

            </div>

            <h2 className="mt-5 font-extrabold text-[#0F172A]">
              Complete Your Profile
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              A complete profile helps companies understand your skills and
              experience.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

              <div className="h-full w-1/4 rounded-full bg-gradient-to-r from-[#2563EB] to-[#6D5DFB]" />

            </div>

            <Link
              to="/student/profile"
              className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-[#2563EB]"
            >
              Complete Profile
              <FaArrowRight />
            </Link>

          </section>

          {/* Quick Actions */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="font-extrabold text-[#0F172A]">
              Quick Actions
            </h2>

            <div className="mt-4 space-y-2">

              <Link
                to="/student/internships"
                className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-[#2563EB]"
              >
                <FaBriefcase />
                Browse Internships
              </Link>

              <Link
                to="/student/applications"
                className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-[#2563EB]"
              >
                <FaFileAlt />
                My Applications
              </Link>

              <Link
                to="/student/saved"
                className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-[#2563EB]"
              >
                <FaBookmark />
                Saved Internships
              </Link>

              <Link
                to="/student/certificates"
                className="flex items-center gap-3 rounded-xl p-3 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-[#2563EB]"
              >
                <FaCertificate />
                Certificates
              </Link>

            </div>

          </section>

          {/* Tip */}

          <section className="rounded-2xl bg-[#0F172A] p-6 text-white">

            <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
              Career Tip
            </p>

            <h3 className="mt-3 font-bold">
              Keep your CV updated.
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Upload your latest CV and add relevant skills before applying
              for internships.
            </p>

          </section>

        </div>

      </div>

    </div>
  );
}

export default StudentHome;