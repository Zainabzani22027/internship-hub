import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  DollarSign,
  MapPin,
  Users,
  Laptop,
  CheckCircle2,
} from "lucide-react";

import { apiGet } from "../../utils/api";

function CompanyInternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadInternship();
  }, [id]);

  const loadInternship = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet(
        `/internships/${id}`
      );

      setInternship(
        data.internship || null
      );
    } catch (err) {
      console.error(
        "Load internship details error:",
        err
      );

      setError(
        err.message ||
          "Unable to load internship details."
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategory = () => {
    return (
      internship?.category_name ||
      internship?.category ||
      internship?.categoryName ||
      "Uncategorized"
    );
  };

  const getLocation = () => {
    if (internship?.location) {
      return internship.location;
    }

    const city =
      internship?.city || "";

    const country =
      internship?.country || "";

    if (city && country) {
      return `${city}, ${country}`;
    }

    return (
      city ||
      country ||
      "Not specified"
    );
  };

  const getStatus = () => {
    const status = String(
      internship?.status ||
        internship?.approval_status ||
        ""
    ).toUpperCase();

    const isLive =
      String(
        internship?.is_live ??
          internship?.live ??
          ""
      ).toLowerCase() === "true";

    if (
      status === "APPROVED" ||
      status === "LIVE" ||
      isLive
    ) {
      return "Live";
    }

    if (
      status === "REJECTED" ||
      status === "REJECT"
    ) {
      return "Rejected";
    }

    if (
      status === "CLOSED" ||
      status === "EXPIRED"
    ) {
      return "Closed";
    }

    return "Pending Approval";
  };

  const statusStyles = {
    Live:
      "bg-green-50 text-green-700 border-green-200",

    "Pending Approval":
      "bg-amber-50 text-amber-700 border-amber-200",

    Rejected:
      "bg-red-50 text-red-700 border-red-200",

    Closed:
      "bg-slate-100 text-slate-600 border-slate-200",
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not specified";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      undefined,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const getSkills = () => {
    if (
      Array.isArray(
        internship?.skills
      )
    ) {
      return internship.skills;
    }

    if (
      typeof internship?.skills ===
      "string"
    ) {
      return internship.skills
        .split(",")
        .map((skill) =>
          skill.trim()
        )
        .filter(Boolean);
    }

    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <BriefcaseBusiness
              size={44}
              className="mx-auto animate-pulse text-blue-400"
            />

            <h2 className="mt-4 font-semibold text-slate-900">
              Loading internship...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we load the internship details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !internship) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/company/internships"
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Internships
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <h2 className="font-bold text-red-700">
              Unable to load internship
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error ||
                "Internship not found."}
            </p>

            <button
              type="button"
              onClick={loadInternship}
              className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = getStatus();
  const skills = getSkills();

  const applicationCount =
    Number(
      internship.application_count ??
        internship.applications_count ??
        internship.applications ??
        0
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/company/internships"
            )
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Internships
        </button>

        {/* HEADER */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
                <BriefcaseBusiness
                  size={27}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-600">
                  {getCategory()}
                </p>

                <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {internship.title}
                </h1>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={16} />
                  {getLocation()}
                </div>
              </div>

            </div>

            <span
              className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold ${
                statusStyles[
                  status
                ] ||
                "border-slate-200 bg-slate-100 text-slate-600"
              }`}
            >
              {status}
            </span>

          </div>

          {/* DETAILS */}

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <InfoCard
              icon={<Clock3 size={20} />}
              label="Duration"
              value={
                internship.duration ||
                "Not specified"
              }
            />

            <InfoCard
              icon={<Laptop size={20} />}
              label="Work Mode"
              value={
                internship.work_mode ||
                internship.workMode ||
                "Not specified"
              }
            />

            <InfoCard
              icon={
                <DollarSign size={20} />
              }
              label="Stipend"
              value={
                Number(
                  internship.stipend ||
                    0
                ) > 0
                  ? internship.stipend
                  : internship.payment_type ===
                      "UNPAID"
                    ? "Unpaid"
                    : "Not specified"
              }
            />

            <InfoCard
              icon={<Users size={20} />}
              label="Applications"
              value={applicationCount}
            />

          </div>
        </div>

        {/* DESCRIPTION */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <h2 className="text-lg font-bold text-slate-900">
            Internship Description
          </h2>

          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600">
            {internship.description ||
              "No description provided."}
          </p>

        </section>

        {/* SKILLS */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <h2 className="text-lg font-bold text-slate-900">
            Required Skills
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">

            {skills.length > 0 ? (
              skills.map(
                (skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                  >
                    <CheckCircle2
                      size={15}
                    />

                    {skill}
                  </span>
                )
              )
            ) : (
              <p className="text-sm text-slate-500">
                No required skills specified.
              </p>
            )}

          </div>

        </section>

        {/* OTHER INFORMATION */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <h2 className="text-lg font-bold text-slate-900">
            Other Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">

            <div className="rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <CalendarDays
                  size={17}
                />
                Application Deadline
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {formatDate(
                  internship.deadline
                )}
              </p>

            </div>

            <div className="rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                <DollarSign
                  size={17}
                />
                Payment Type
              </div>

              <p className="mt-2 font-semibold text-slate-900">
                {internship.payment_type ||
                  internship.paymentType ||
                  "Not specified"}
              </p>

            </div>

          </div>

        </section>

        {/* ACTIONS */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={() =>
              navigate(
                `/company/internships/${id}/edit`
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6D5DFB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            <Edit3Icon />
            Edit Internship
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/company/applications"
              )
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Users size={18} />
            View Applications
          </button>

        </div>

      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-blue-600">
        {icon}

        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </div>

      <p className="mt-2 font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}

function Edit3Icon() {
  return <Edit3 size={18} />;
}

export default CompanyInternshipDetails;