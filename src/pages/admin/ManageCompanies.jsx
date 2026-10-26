import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBan,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaGlobe,
  FaSearch,
  FaTrash,
} from "react-icons/fa";

import { apiGet, apiPut } from "../../utils/api";

function ManageCompanies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const [editingCompany, setEditingCompany] = useState(null);

  const [editForm, setEditForm] = useState({
    companyName: "",
    officialEmail: "",
    industry: "",
    country: "",
    city: "",
    website: "",
  });

  // ================================
  // LOAD COMPANIES
  // ================================

  const loadCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet(
        "/admin/company-verifications"
      );

      const verificationList =
        Array.isArray(data.verifications)
          ? data.verifications
          : [];

      const formattedCompanies =
        verificationList.map((company) => {
          const rawStatus =
            company.status ||
            company.verification_status ||
            "PENDING";

          let status = "Pending";

          if (rawStatus === "VERIFIED") {
            status = "Verified";
          } else if (rawStatus === "REJECTED") {
            status = "Rejected";
          }

          return {
            id:
              company.verification_id ||
              company.id,

            companyId:
              company.company_id,

            name:
              company.company_name ||
              company.full_name ||
              "Unnamed Company",

            email:
              company.official_email ||
              company.email ||
              "No email",

            industry:
              company.industry ||
              "Not specified",

            location: [
              company.city,
              company.country,
            ]
              .filter(Boolean)
              .join(", ") ||
              "Not specified",

            country:
              company.country || "",

            city:
              company.city || "",

            website:
              company.website || "",

            status,

            joined:
              company.submitted_at
                ? new Date(
                    company.submitted_at
                  ).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    }
                  )
                : "—",

            verificationType:
              company.verification_type || "",
          };
        });

      setCompanies(formattedCompanies);
    } catch (err) {
      console.error(
        "Load companies error:",
        err
      );

      setError(
        err.message ||
          "Unable to load companies."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // ================================
  // UPDATE VERIFICATION STATUS
  // ================================

  const updateStatus = async (
    verificationId,
    newStatus
  ) => {
    try {
      setActionLoading(verificationId);
      setError("");

      const adminNote =
        newStatus === "VERIFIED"
          ? "Company verification approved by admin."
          : "Company verification rejected by admin.";

      await apiPut(
        `/admin/company-verifications/${verificationId}`,
        {
          status: newStatus,
          adminNote,
        }
      );

      await loadCompanies();
    } catch (err) {
      console.error(
        "Update company verification error:",
        err
      );

      setError(
        err.message ||
          "Unable to update company verification."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ================================
  // OPEN EDIT FORM
  // ================================

  const openEditForm = (company) => {
    setEditingCompany(company);

    setEditForm({
      companyName:
        company.name === "Unnamed Company"
          ? ""
          : company.name,

      officialEmail:
        company.email === "No email"
          ? ""
          : company.email,

      industry:
        company.industry === "Not specified"
          ? ""
          : company.industry,

      country:
        company.country || "",

      city:
        company.city || "",

      website:
        company.website || "",
    });

    setError("");
  };

  // ================================
  // EDIT FORM CHANGE
  // ================================

  const handleEditChange = (event) => {
    const { name, value } =
      event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ================================
  // SAVE COMPANY
  // ================================

  const saveCompany = async (event) => {
    event.preventDefault();

    if (!editingCompany) {
      return;
    }

    if (!editForm.companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!editForm.officialEmail.trim()) {
      setError(
        "Official email is required."
      );
      return;
    }

    try {
      setActionLoading(
        `edit-${editingCompany.id}`
      );

      setError("");

      await apiPut(
        `/admin/companies/${editingCompany.companyId}`,
        {
          companyName:
            editForm.companyName.trim(),

          officialEmail:
            editForm.officialEmail.trim(),

          industry:
            editForm.industry.trim(),

          country:
            editForm.country.trim(),

          city:
            editForm.city.trim(),

          website:
            editForm.website.trim(),
        }
      );

      setEditingCompany(null);

      await loadCompanies();
    } catch (err) {
      console.error(
        "Update company error:",
        err
      );

      setError(
        err.message ||
          "Unable to update company."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ================================
  // DELETE
  // ================================

  const deleteCompany = () => {
    window.alert(
      "Company deletion is not connected yet because no confirmed delete endpoint exists in the backend."
    );
  };

  // ================================
  // FILTER
  // ================================

  const filteredCompanies =
    companies.filter((company) => {
      const search =
        searchTerm
          .toLowerCase()
          .trim();

      return (
        company.name
          .toLowerCase()
          .includes(search) ||
        company.email
          .toLowerCase()
          .includes(search) ||
        company.industry
          .toLowerCase()
          .includes(search) ||
        company.location
          .toLowerCase()
          .includes(search)
      );
    });

  // ================================
  // STATISTICS
  // ================================

  const verifiedCompanies =
    companies.filter(
      (company) =>
        company.status === "Verified"
    ).length;

  const pendingCompanies =
    companies.filter(
      (company) =>
        company.status === "Pending"
    ).length;

  const rejectedCompanies =
    companies.filter(
      (company) =>
        company.status === "Rejected"
    ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-5 sm:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <Link
              to="/admin"
              className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#2563EB] transition hover:text-blue-700"
            >
              <FaArrowLeft />
              Back to Dashboard
            </Link>

            <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
              ADMIN MANAGEMENT
            </p>

            <h1 className="mt-2 text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
              Manage Companies
            </h1>

            <p className="mt-2 text-slate-500">
              Review companies, manage verification and control company
              accounts.
            </p>

          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-2xl text-[#6D5DFB]">
            <FaBuilding />
          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* Statistics */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Companies
                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                  {loading
                    ? "..."
                    : companies.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl text-[#6D5DFB]">
                <FaBuilding />
              </div>

            </div>

          </div>

          {/* Verified */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Verified
                </p>

                <p className="mt-2 text-3xl font-extrabold text-green-600">
                  {loading
                    ? "..."
                    : verifiedCompanies}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-green-600">
                <FaCheckCircle />
              </div>

            </div>

          </div>

          {/* Pending */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-3xl font-extrabold text-amber-500">
                  {loading
                    ? "..."
                    : pendingCompanies}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-500">
                <FaClock />
              </div>

            </div>

          </div>

          {/* Rejected */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Rejected
                </p>

                <p className="mt-2 text-3xl font-extrabold text-red-600">
                  {loading
                    ? "..."
                    : rejectedCompanies}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                <FaBan />
              </div>

            </div>

          </div>

        </div>

        {/* Search */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="relative">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              placeholder="Search company by name, email, industry or location..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

          </div>

        </div>

        {/* Companies Table */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Registered Companies
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review company information and verification status.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px]">

              <thead className="bg-slate-50">

                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                  <th className="px-6 py-4">
                    Company
                  </th>

                  <th className="px-6 py-4">
                    Industry
                  </th>

                  <th className="px-6 py-4">
                    Location
                  </th>

                  <th className="px-6 py-4">
                    Joined
                  </th>

                  <th className="px-6 py-4">
                    Verification
                  </th>

                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {loading ? (
                  <tr>

                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center"
                    >

                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563EB]" />

                      <p className="mt-4 text-sm font-medium text-slate-500">
                        Loading companies...
                      </p>

                    </td>

                  </tr>
                ) : filteredCompanies.length > 0 ? (
                  filteredCompanies.map(
                    (company) => {

                      const isActionLoading =
                        actionLoading ===
                        company.id;

                      const isEditLoading =
                        actionLoading ===
                        `edit-${company.id}`;

                      return (
                        <tr
                          key={company.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* Company */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] font-bold text-white">
                                {company.name
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="font-bold text-[#0F172A]">
                                  {company.name}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {company.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Industry */}

                          <td className="px-6 py-5">

                            <span className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-bold text-[#6D5DFB]">
                              {company.industry}
                            </span>

                          </td>

                          {/* Location */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <FaGlobe className="text-slate-400" />
                              {company.location}
                            </div>

                          </td>

                          {/* Joined */}

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {company.joined}
                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                                company.status ===
                                "Verified"
                                  ? "bg-green-50 text-green-600"
                                  : company.status ===
                                    "Pending"
                                    ? "bg-amber-50 text-amber-600"
                                    : "bg-red-50 text-red-600"
                              }`}
                            >

                              <span
                                className={`h-2 w-2 rounded-full ${
                                  company.status ===
                                  "Verified"
                                    ? "bg-green-500"
                                    : company.status ===
                                      "Pending"
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                              />

                              {company.status}

                            </span>

                          </td>

                          {/* Actions */}

                          <td className="px-6 py-5">

                            <div className="flex justify-end gap-2">

                              {/* Pending */}

                              {company.status ===
                                "Pending" && (
                                <>
                                  <button
                                    type="button"
                                    disabled={
                                      isActionLoading
                                    }
                                    onClick={() =>
                                      updateStatus(
                                        company.id,
                                        "VERIFIED"
                                      )
                                    }
                                    title="Verify Company"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isActionLoading ? (
                                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                      <FaCheckCircle />
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    disabled={
                                      isActionLoading
                                    }
                                    onClick={() =>
                                      updateStatus(
                                        company.id,
                                        "REJECTED"
                                      )
                                    }
                                    title="Reject Company"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {isActionLoading ? (
                                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                      <FaBan />
                                    )}
                                  </button>
                                </>
                              )}

                              {/* Rejected */}

                              {company.status ===
                                "Rejected" && (
                                <button
                                  type="button"
                                  disabled={
                                    isActionLoading
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      company.id,
                                      "VERIFIED"
                                    )
                                  }
                                  title="Verify Company"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isActionLoading ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <FaCheckCircle />
                                  )}
                                </button>
                              )}

                              {/* Verified */}

                              {company.status ===
                                "Verified" && (
                                <button
                                  type="button"
                                  disabled={
                                    isActionLoading
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      company.id,
                                      "REJECTED"
                                    )
                                  }
                                  title="Reject Company"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {isActionLoading ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                  ) : (
                                    <FaBan />
                                  )}
                                </button>
                              )}

                              {/* Edit */}

                              <button
                                type="button"
                                title="Edit Company"
                                disabled={
                                  isEditLoading
                                }
                                onClick={() =>
                                  openEditForm(
                                    company
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isEditLoading ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : (
                                  <FaEdit />
                                )}
                              </button>

                              {/* Delete */}

                              <button
                                type="button"
                                title="Delete Company"
                                onClick={() =>
                                  deleteCompany(
                                    company.id
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                              >
                                <FaTrash />
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )
                ) : (
                  <tr>

                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center"
                    >

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                        <FaSearch />
                      </div>

                      <p className="mt-4 font-bold text-[#0F172A]">
                        No companies found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try searching with a different company, industry or
                        location.
                      </p>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* Verification Information */}

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#2563EB] shadow-sm">
              <FaCheckCircle />
            </div>

            <div>

              <h3 className="font-extrabold text-[#0F172A]">
                Company Verification Policy
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Every company must be reviewed by an administrator before it
                can publish internship opportunities on InternShip Hub.
                Verification helps keep internship opportunities trustworthy
                and professional.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">

                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                  Pending
                </span>

                <span className="text-slate-400">
                  →
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                  Verified
                </span>

                <span className="text-slate-400">
                  /
                </span>

                <span className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                  Rejected
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================
            EDIT COMPANY MODAL
        ====================================== */}

        {editingCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">

            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

              <div className="border-b border-slate-200 p-6">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
                      ADMIN EDIT
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold text-[#0F172A]">
                      Edit Company
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Update company information.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingCompany(null)
                    }
                    className="rounded-lg px-3 py-2 text-xl font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    ×
                  </button>

                </div>

              </div>

              <form
                onSubmit={saveCompany}
                className="p-6"
              >

                <div className="grid gap-5 sm:grid-cols-2">

                  {/* Company Name */}

                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Company Name
                    </label>

                    <input
                      type="text"
                      name="companyName"
                      value={
                        editForm.companyName
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="Company name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* Official Email */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Official Email
                    </label>

                    <input
                      type="email"
                      name="officialEmail"
                      value={
                        editForm.officialEmail
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="company@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* Industry */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Industry
                    </label>

                    <input
                      type="text"
                      name="industry"
                      value={
                        editForm.industry
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="Technology"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* Country */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Country
                    </label>

                    <input
                      type="text"
                      name="country"
                      value={
                        editForm.country
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="Pakistan"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* City */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={
                        editForm.city
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="Islamabad"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  {/* Website */}

                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Website
                    </label>

                    <input
                      type="url"
                      name="website"
                      value={
                        editForm.website
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="https://example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* Buttons */}

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={() =>
                      setEditingCompany(null)
                    }
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      actionLoading ===
                      `edit-${editingCompany.id}`
                    }
                    className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#6D5DFB] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ===
                    `edit-${editingCompany.id}`
                      ? "Saving..."
                      : "Save Changes"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default ManageCompanies;