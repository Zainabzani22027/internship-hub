import { Link } from "react-router-dom";
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

function StudentHome() {
  const statistics = [
    {
      title: "Applications",
      value: "0",
      description: "Total applications",
      icon: <FaFileAlt />,
      iconStyle: "bg-blue-50 text-[#2563EB]",
    },
    {
      title: "Under Review",
      value: "0",
      description: "Being reviewed",
      icon: <FaClock />,
      iconStyle: "bg-amber-50 text-amber-600",
    },
    {
      title: "Shortlisted",
      value: "0",
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

  const recommendedInternships = [
    {
      id: 1,
      title: "Software Engineering Intern",
      company: "TechNova Solutions",
      location: "Remote",
      mode: "Remote",
      duration: "3 Months",
      type: "Paid",
      icon: "💻",
    },
    {
      id: 2,
      title: "AI / Machine Learning Intern",
      company: "Future AI Labs",
      location: "Hybrid",
      mode: "Hybrid",
      duration: "4 Months",
      type: "Paid",
      icon: "🤖",
    },
    {
      id: 3,
      title: "Cyber Security Intern",
      company: "SecureNet Technologies",
      location: "Remote",
      mode: "Remote",
      duration: "3 Months",
      type: "Unpaid",
      icon: "🛡️",
    },
  ];

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

          {/* Recommended Internships */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex items-center justify-between gap-4">

              <div>
                <h2 className="text-xl font-extrabold text-[#0F172A]">
                  Recommended Internships
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Opportunities you may be interested in.
                </p>
              </div>

              <Link
                to="/student/internships"
                className="hidden items-center gap-2 text-sm font-bold text-[#2563EB] sm:flex"
              >
                View All
                <FaArrowRight />
              </Link>

            </div>

            <div className="mt-6 space-y-4">

              {recommendedInternships.map((internship) => (

                <div
                  key={internship.id}
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:shadow-md"
                >

                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">

                    <div className="flex gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl">
                        {internship.icon}
                      </div>

                      <div>

                        <Link
                          to={`/student/internships/${internship.id}`}
                          className="font-bold text-[#0F172A] transition hover:text-[#2563EB]"
                        >
                          {internship.title}
                        </Link>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {internship.company}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">

                          <span className="flex items-center gap-1">
                            <FaMapMarkerAlt />
                            {internship.location}
                          </span>

                          <span className="flex items-center gap-1">
                            <FaCalendarAlt />
                            {internship.duration}
                          </span>

                          <span className="flex items-center gap-1">
                            <FaBriefcase />
                            {internship.mode}
                          </span>

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center gap-2">

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          internship.type === "Paid"
                            ? "bg-green-50 text-green-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {internship.type}
                      </span>

                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-blue-200 hover:text-[#2563EB]"
                        aria-label="Save internship"
                      >
                        <FaBookmark />
                      </button>

                    </div>

                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">

                    <Link
                      to={`/student/internships/${internship.id}`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#2563EB]"
                    >
                      View Details
                      <FaArrowRight />
                    </Link>

                  </div>

                </div>

              ))}

            </div>

          </section>

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

            {/* Empty state because no real database yet */}

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