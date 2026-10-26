import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Pencil,
  Users,
  Clock3,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";

import { apiGet } from "../../utils/api";

function CompanyInternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInternship = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await apiGet(`/internships/${id}`);

        if (!data?.success) {
          throw new Error(
            data?.message || "Unable to load internship."
          );
        }

        setInternship(
          data.internship ||
            data.data ||
            data.result ||
            null
        );
      } catch (err) {
        console.error(
          "Company internship details error:",
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

    if (id) {
      loadInternship();
    }
  }, [id]);

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        return value;
      }
    }

    return "—";
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return String(status)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getStatusClasses = (status) => {
    const normalized =
      String(status || "").toUpperCase();

    if (
      normalized === "APPROVED" ||
      normalized === "LIVE"
    ) {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (
      normalized === "REJECTED"
    ) {
      return "bg-red-50 text-red-700 border-red-200";
    }

    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  };

  const getSkills = () => {
    if (Array.isArray(internship?.skills)) {
      return internship.skills;
    }

    if (
      typeof internship?.skills === "string"
    ) {
      return internship.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">

          <div className="mb-6 h-10 w-40 animate-pulse rounded-lg bg-slate-200" />

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-4 h-5 w-1/3 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-slate-100"
                  />
                )
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          <button
            type="button"
            onClick={() =>
              navigate("/company/internships")
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Internships
          </button>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

            <AlertCircle
              size={42}
              className="mx-auto mb-4 text-red-500"
            />

            <h2 className="text-xl font-bold text-slate-900">
              Unable to load internship
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>

          </div>

        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          <button
            type="button"
            onClick={() =>
              navigate("/company/internships")
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Internships
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <BriefcaseBusiness
              size={46}
              className="mx-auto mb-4 text-slate-400"
            />

            <h2 className="text-xl font-bold text-slate-900">
              Internship not found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              The requested internship could not be found.
            </p>

          </div>

        </div>
      </div>
    );
  }

  const title = getValue(
    internship.title,
    internship.internship_title
  );

  const category = getValue(
    internship.category_name,
    internship.category,
    internship.categoryName
  );

  const description = getValue(
    internship.description
  );

  const duration = getValue(
    internship.duration
  );

  const location = getValue(
    internship.location
  );

  const workMode = getValue(
    internship.work_mode,
    internship.workMode
  );

  const stipend = getValue(
    internship.stipend,
    internship.salary
  );

  const paymentType = getValue(
    internship.payment_type,
    internship.paymentType
  );

  const applications = getValue(
    internship.application_count,
    internship.applications_count,
    internship.total_applications,
    internship.applications
  );

  const status = getValue(
    internship.status,
    internship.internship_status
  );

  const deadline = getValue(
    internship.deadline
  );

  const skills = getSkills();

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <button
          type="button"
          onClick={() =>
            navigate("/company/internships")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Internships
        </button>


        {/* Header */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white sm:p-8">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <BriefcaseBusiness size={28} />
                </div>

                <div>

                  <p className="mb-1 text-sm font-medium text-blue-100">
                    Internship Details
                  </p>

                  <h1 className="text-2xl font-bold sm:text-3xl">
                    {title}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-blue-50">

                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={16} />
                      {category}
                    </span>

                    <span className="hidden sm:block">
                      •
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={16} />
                      {location}
                    </span>

                  </div>

                </div>

              </div>


              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClasses(
                  status
                )}`}
              >
                <CheckCircle2 size={16} />
                {formatStatus(status)}
              </div>

            </div>

          </div>


          {/* Action Bar */}
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="text-sm text-slate-500">
              Internship ID:
              <span className="ml-1 font-semibold text-slate-700">
                #{id}
              </span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/company/internships/${id}/edit`
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              >
                <Pencil size={17} />
                Edit Internship
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/company/applications")
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Users size={17} />
                View Applications
              </button>

            </div>

          </div>

        </div>


        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Clock3 size={21} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Duration
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {duration}
                </p>
              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Wallet size={21} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Stipend
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {stipend === "—"
                    ? "—"
                    : `PKR ${stipend}`}
                </p>
              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Users size={21} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Applications
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {applications}
                </p>
              </div>

            </div>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CalendarDays size={21} />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Deadline
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {formatDate(deadline)}
                </p>
              </div>

            </div>

          </div>

        </div>


        {/* Main Content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Description */}
          <div className="lg:col-span-2">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <h2 className="text-xl font-bold text-slate-900">
                Internship Description
              </h2>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                {description}
              </div>

            </div>


            {/* Skills */}
            <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <h2 className="text-xl font-bold text-slate-900">
                Required Skills
              </h2>

              {skills.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">

                  {skills.map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No skills specified.
                </p>
              )}

            </div>

          </div>


          {/* Sidebar */}
          <div className="space-y-6">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-lg font-bold text-slate-900">
                Internship Information
              </h2>

              <div className="mt-5 space-y-5">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Work Mode
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatStatus(workMode)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Payment Type
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatStatus(paymentType)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {location}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Application Deadline
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(deadline)}
                  </p>
                </div>

              </div>

            </div>


            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 text-white shadow-sm">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                <BriefcaseBusiness size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Manage Your Internship
              </h3>

              <p className="mt-2 text-sm leading-6 text-blue-50">
                Review applications and manage candidates
                for this internship from your company panel.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/company/applications")
                }
                className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Manage Applications
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default CompanyInternshipDetails;