import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  GraduationCap,
  MapPin,
  BriefcaseBusiness,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  Clock3,
  AlertCircle,
} from "lucide-react";

import { apiGet } from "../../utils/api";

function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadApplication = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * We load the company applications list because
         * the currently confirmed backend provides that
         * endpoint.
         */

        const data = await apiGet(
          "/company/applications"
        );

        const applications =
          data.applications || [];

        const found =
          applications.find(
            (item) =>
              String(item.id) ===
              String(id)
          );

        if (!found) {
          throw new Error(
            "Application not found."
          );
        }

        setApplication(found);
      } catch (err) {
        console.error(
          "Load application details error:",
          err
        );

        setError(
          err.message ||
            "Unable to load application details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadApplication();
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

    return "Not provided";
  };

  const getApplicantName = () => {
    return getValue(
      application?.student_name,
      application?.studentName,
      application?.full_name,
      application?.fullName,
      application?.name
    );
  };

  const getUniversity = () => {
    return getValue(
      application?.university,
      application?.student_university
    );
  };

  const getLocation = () => {
    if (application?.location) {
      return application.location;
    }

    const city =
      application?.city ||
      application?.student_city ||
      "";

    const country =
      application?.country ||
      application?.student_country ||
      "";

    if (city && country) {
      return `${city}, ${country}`;
    }

    return (
      city ||
      country ||
      "Location not provided"
    );
  };

  const getStatus = () => {
    const value = String(
      application?.status ||
        "APPLIED"
    ).toUpperCase();

    const statusMap = {
      APPLIED: "Applied",
      UNDER_REVIEW: "Under Review",
      SHORTLISTED: "Shortlisted",
      INTERVIEW: "Interview",
      SELECTED: "Selected",
      REJECTED: "Rejected",
    };

    return (
      statusMap[value] ||
      value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
    );
  };

  const getStatusClasses = () => {
    const status = getStatus();

    if (status === "Selected") {
      return "bg-green-100 text-green-800 border-green-200";
    }

    if (status === "Rejected") {
      return "bg-red-50 text-red-700 border-red-200";
    }

    if (
      status === "Shortlisted" ||
      status === "Interview"
    ) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }

    if (status === "Under Review") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }

    return "bg-blue-50 text-blue-700 border-blue-200";
  };

  const getInitial = () => {
    return getApplicantName()
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-10">

        <div className="mx-auto max-w-5xl text-center">

          <Clock3
            size={42}
            className="mx-auto animate-pulse text-blue-500"
          />

          <p className="mt-4 text-sm text-slate-500">
            Loading application...
          </p>

        </div>

      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-10">

        <div className="mx-auto max-w-3xl">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/company/applications"
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Applications
          </button>

          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

            <AlertCircle
              size={42}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Unable to load application
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate(
              "/company/applications"
            )
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />
          Back to Applications
        </button>


        {/* Header */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white sm:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 text-3xl font-bold">
                {getInitial()}
              </div>

              <div>

                <p className="text-sm text-blue-100">
                  Student Application
                </p>

                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {getApplicantName()}
                </h1>

                <p className="mt-2 flex items-center gap-2 text-sm text-blue-100">
                  <BriefcaseBusiness
                    size={16}
                  />

                  {getValue(
                    application?.internship_title,
                    application?.internshipTitle,
                    application?.title
                  )}
                </p>

              </div>

            </div>

          </div>


          {/* Status */}
          <div className="border-b border-slate-200 p-5">

            <span
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClasses()}`}
            >
              <CheckCircle size={17} />
              {getStatus()}
            </span>

          </div>


          {/* Information */}
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">

            {/* University */}
            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <GraduationCap
                    size={21}
                  />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    University
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {getUniversity()}
                  </p>
                </div>

              </div>

            </div>


            {/* Location */}
            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <MapPin size={21} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {getLocation()}
                  </p>
                </div>

              </div>

            </div>


            {/* Email */}
            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <Mail size={21} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 break-all font-semibold text-slate-800">
                    {getValue(
                      application?.email,
                      application?.student_email
                    )}
                  </p>
                </div>

              </div>

            </div>


            {/* Phone */}
            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <Phone size={21} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {getValue(
                      application?.phone,
                      application?.student_phone
                    )}
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* Additional Details */}
          <div className="border-t border-slate-200 p-6 sm:p-8">

            <h2 className="text-xl font-bold text-slate-900">
              Application Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Application ID
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  #{application?.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Internship
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {getValue(
                    application?.internship_title,
                    application?.internshipTitle,
                    application?.title
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Applied On
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {getValue(
                    application?.applied_at,
                    application?.created_at,
                    application?.appliedAt
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Current Status
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {getStatus()}
                </p>
              </div>

            </div>

          </div>


          {/* CV */}
          <div className="border-t border-slate-200 p-6 sm:p-8">

            <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <FileText size={21} />
                </div>

                <div>

                  <h3 className="font-bold text-slate-900">
                    Student CV
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {application?.cv_url ||
                    application?.cvUrl
                      ? "CV is available."
                      : "CV information is not available in the application response."}
                  </p>

                </div>

              </div>

              {(application?.cv_url ||
                application?.cvUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    const cv =
                      application.cv_url ||
                      application.cvUrl;

                    if (
                      cv.startsWith("http")
                    ) {
                      window.open(
                        cv,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    } else {
                      window.open(
                        `http://localhost:5000${cv}`,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  <FileText size={17} />
                  View CV
                </button>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ApplicationDetails;