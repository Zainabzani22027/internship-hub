import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  Plus,
  ArrowRight,
  CheckCircle,
  Clock3,
  MapPin,
} from "lucide-react";
import { apiGet } from "../../utils/api";

function CompanyHome() {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, internshipsResponse, applicationsResponse] =
        await Promise.all([
          apiGet("/company/profile"),
          apiGet("/internships/company"),
          apiGet("/company/applications"),
        ]);

      setCompany(
        profileResponse?.company ||
          profileResponse?.profile ||
          profileResponse?.data ||
          null
      );

      const internshipList =
        internshipsResponse?.internships ||
        internshipsResponse?.data ||
        [];

      const applicationList =
        applicationsResponse?.applications ||
        applicationsResponse?.data ||
        [];

      setInternships(Array.isArray(internshipList) ? internshipList : []);
      setApplications(Array.isArray(applicationList) ? applicationList : []);
    } catch (err) {
      console.error("Company dashboard error:", err);
      setError(
        err.message || "Unable to load company dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const getInternshipStatus = (internship) => {
    return String(
      internship?.status ||
        internship?.approval_status ||
        internship?.approvalStatus ||
        ""
    ).toUpperCase();
  };

  const getApplicationStatus = (application) => {
    return String(
      application?.status ||
        application?.application_status ||
        application?.applicationStatus ||
        "APPLIED"
    ).toUpperCase();
  };

  const getApplicationName = (application) => {
    return (
      application?.student_name ||
      application?.studentName ||
      application?.full_name ||
      application?.fullName ||
      application?.name ||
      application?.student?.full_name ||
      application?.student?.name ||
      "Student"
    );
  };

  const getInternshipTitle = (application) => {
    return (
      application?.internship_title ||
      application?.internshipTitle ||
      application?.title ||
      application?.internship?.title ||
      "Internship"
    );
  };

  const getLocation = (application) => {
    return (
      application?.city ||
      application?.location ||
      application?.student_city ||
      application?.studentCity ||
      application?.student?.city ||
      "Location not specified"
    );
  };

  const getCompanyName = () => {
    return (
      company?.company_name ||
      company?.companyName ||
      company?.name ||
      company?.business_name ||
      "Your Company"
    );
  };

  const getVerificationStatus = () => {
    return String(
      company?.verification_status ||
        company?.verificationStatus ||
        company?.status ||
        ""
    ).toUpperCase();
  };

  const activeInternships = internships.filter((internship) => {
    const status = getInternshipStatus(internship);

    return (
      status === "APPROVED" ||
      status === "LIVE" ||
      status === "ACTIVE"
    );
  }).length;

  const shortlistedApplications = applications.filter((application) => {
    return getApplicationStatus(application) === "SHORTLISTED";
  }).length;

  const pendingApplications = applications.filter((application) => {
    const status = getApplicationStatus(application);

    return (
      status === "APPLIED" ||
      status === "UNDER_REVIEW"
    );
  }).length;

  const stats = [
    {
      title: "Active Internships",
      value: activeInternships,
      icon: BriefcaseBusiness,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Applications",
      value: applications.length,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Shortlisted",
      value: shortlistedApplications,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Review",
      value: pendingApplications,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  const recentApplications = applications.slice(0, 4);

  const getDisplayStatus = (status) => {
    const statusMap = {
      APPLIED: "Applied",
      UNDER_REVIEW: "Under Review",
      SHORTLISTED: "Shortlisted",
      INTERVIEW: "Interview",
      SELECTED: "Selected",
      REJECTED: "Rejected",
    };

    return statusMap[status] || "Applied";
  };

  const statusStyles = {
    Applied: "bg-blue-50 text-blue-700",
    "Under Review": "bg-amber-50 text-amber-700",
    Shortlisted: "bg-purple-50 text-purple-700",
    Interview: "bg-green-50 text-green-700",
    Selected: "bg-green-50 text-green-700",
    Rejected: "bg-red-50 text-red-700",
  };

  const verificationStatus = getVerificationStatus();

  const isVerified =
    verificationStatus === "VERIFIED" ||
    verificationStatus === "APPROVED" ||
    company?.is_verified === true ||
    company?.isVerified === true;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                <Building2 size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  Company Dashboard
                </h1>

                <p className="text-sm text-slate-500">
                  {getCompanyName()} — Manage your internships and applicants
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/company/post-internship")}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
          >
            <Plus size={20} />
            Post Internship
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Verification Card */}
        <div
          className={`mb-8 rounded-2xl border p-5 ${
            isVerified
              ? "border-green-200 bg-green-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  isVerified
                    ? "bg-green-100 text-green-600"
                    : "bg-amber-100 text-amber-600"
                }`}
              >
                {isVerified ? (
                  <CheckCircle size={23} />
                ) : (
                  <Clock3 size={23} />
                )}
              </div>

              <div>
                <h2
                  className={`font-bold ${
                    isVerified
                      ? "text-green-900"
                      : "text-amber-900"
                  }`}
                >
                  {isVerified
                    ? "Company Verified"
                    : "Verification Pending"}
                </h2>

                <p
                  className={`mt-1 text-sm ${
                    isVerified
                      ? "text-green-700"
                      : "text-amber-700"
                  }`}
                >
                  {isVerified
                    ? "Your company has been successfully verified by InternShip Hub administration."
                    : "Your company verification is currently being reviewed by InternShip Hub administration."}
                </p>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
                isVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {isVerified ? "Verified" : "Pending"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <p className="mt-2 text-3xl font-bold text-slate-900">
                      {loading ? "..." : stat.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                  >
                    <Icon size={23} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Recent Applications */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest students who applied
                </p>
              </div>

              <button
                onClick={() => navigate("/company/applications")}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">

              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  Loading applications...
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="p-8 text-center">
                  <Users
                    size={36}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-semibold text-slate-700">
                    No applications yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Applications from students will appear here.
                  </p>
                </div>
              ) : (
                recentApplications.map((application) => {
                  const name = getApplicationName(application);
                  const rawStatus = getApplicationStatus(application);
                  const displayStatus =
                    getDisplayStatus(rawStatus);

                  return (
                    <div
                      key={
                        application.id ||
                        `${name}-${getInternshipTitle(application)}`
                      }
                      className="p-5 transition hover:bg-slate-50"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                            {name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                              {getInternshipTitle(application)}
                            </p>

                            <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                              <MapPin size={14} />
                              {getLocation(application)}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
                            statusStyles[displayStatus] ||
                            "bg-slate-50 text-slate-700"
                          }`}
                        >
                          {displayStatus}
                        </span>

                      </div>
                    </div>
                  );
                })
              )}

            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage your company activities
            </p>

            <div className="mt-5 space-y-3">

              <button
                onClick={() => navigate("/company/post-internship")}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Plus size={20} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Post Internship
                  </p>

                  <p className="text-xs text-slate-500">
                    Create a new opportunity
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/company/internships")}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-purple-300 hover:bg-purple-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Manage Internships
                  </p>

                  <p className="text-xs text-slate-500">
                    View and manage postings
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/company/applications")}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-green-300 hover:bg-green-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                  <Users size={20} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Applications
                  </p>

                  <p className="text-xs text-slate-500">
                    Review student applications
                  </p>
                </div>
              </button>

              <button
                onClick={() => navigate("/company/profile")}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <LayoutDashboard size={20} />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Company Profile
                  </p>

                  <p className="text-xs text-slate-500">
                    Update company information
                  </p>
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyHome;