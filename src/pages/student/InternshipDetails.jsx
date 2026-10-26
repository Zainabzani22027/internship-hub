import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiBriefcase,
  FiCheckCircle,
} from "react-icons/fi";

import { apiGet, apiPost } from "../../utils/api";

function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadInternship = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet(
        `/internships/${id}`
      );

      setInternship(data.internship);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load internship details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternship();
  }, [id]);

  const handleApply = async () => {
    try {
      setApplying(true);
      setError("");
      setSuccess("");

      const data = await apiPost(
        `/applications/${id}`,
        {}
      );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to apply for internship."
        );
      }

      setSuccess(
        data.message ||
          "Application submitted successfully."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to submit application."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-slate-500">
            Loading internship details...
          </p>
        </div>
      </div>
    );
  }

  if (error && !internship) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/student/internships"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
          >
            <FiArrowLeft />
            Back to Internships
          </Link>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            Internship not found
          </h2>

          <Link
            to="/student/internships"
            className="mt-5 inline-block rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Back to Internships
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <Link
          to="/student/internships"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-purple-600"
        >
          <FiArrowLeft />
          Back to Internships
        </Link>

        {/* Main Card */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left */}
          <div className="lg:col-span-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

              <div className="mb-6">
                <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {internship.category_name ||
                    "Internship"}
                </span>

                <h1 className="mt-4 text-3xl font-bold text-slate-900">
                  {internship.title}
                </h1>

                <p className="mt-2 text-lg font-medium text-slate-600">
                  {internship.company_name}
                </p>
              </div>

              {/* Info */}
              <div className="mb-8 grid gap-4 sm:grid-cols-2">

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <FiMapPin className="text-blue-600" size={20} />

                  <div>
                    <p className="text-xs text-slate-400">
                      Location
                    </p>

                    <p className="font-medium text-slate-700">
                      {internship.city
                        ? `${internship.city}, `
                        : ""}
                      {internship.country ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <FiBriefcase
                    className="text-purple-600"
                    size={20}
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Work Mode
                    </p>

                    <p className="font-medium text-slate-700">
                      {internship.work_mode ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <FiClock
                    className="text-orange-500"
                    size={20}
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Duration
                    </p>

                    <p className="font-medium text-slate-700">
                      {internship.duration ||
                        "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <FiDollarSign
                    className="text-green-600"
                    size={20}
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Stipend
                    </p>

                    <p className="font-medium text-slate-700">
                      {internship.payment_type ===
                      "PAID"
                        ? `${internship.stipend || 0}`
                        : "Unpaid"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 sm:col-span-2">
                  <FiCalendar
                    className="text-red-600"
                    size={20}
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Application Deadline
                    </p>

                    <p className="font-medium text-slate-700">
                      {internship.deadline
                        ? new Date(
                            internship.deadline
                          ).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="mb-3 text-xl font-bold text-slate-900">
                  About This Internship
                </h2>

                <p className="whitespace-pre-line leading-7 text-slate-600">
                  {internship.description}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h2 className="mb-3 text-xl font-bold text-slate-900">
                  Required Skills
                </h2>

                <div className="flex flex-wrap gap-2">
                  {(internship.skills || []).map(
                    (skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-slate-900">
                Apply for this Internship
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Submit your application directly
                through InternShip Hub.
              </p>

              {success && (
                <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <div className="flex items-start gap-2">
                    <FiCheckCircle
                      className="mt-0.5 shrink-0"
                      size={18}
                    />

                    <span>{success}</span>
                  </div>
                </div>
              )}

              {error && internship && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleApply}
                disabled={applying || !!success}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3.5 font-semibold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {applying
                  ? "Applying..."
                  : success
                  ? "Application Submitted"
                  : "Apply Now"}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/student/internships"
                  )
                }
                className="mt-3 w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Browse More Internships
              </button>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-xs leading-5 text-slate-400">
                  By applying, you agree to share
                  your profile information with the
                  company for recruitment purposes.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default InternshipDetails;