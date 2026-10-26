import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBuilding,
  FaCertificate,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaSearch,
  FaTrash,
  FaUndo,
  FaUserGraduate,
  FaTimesCircle,
} from "react-icons/fa";

import { apiGet, apiPut } from "../../utils/api";

function ManageCertificates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD CERTIFICATES
  |--------------------------------------------------------------------------
  */

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet("/admin/certificates");

      const certificateList = Array.isArray(data.certificates)
        ? data.certificates
        : [];

      const normalizedCertificates = certificateList.map(
        (certificate) => ({
          id: certificate.id,

          certificateId:
            certificate.certificate_id ||
            certificate.certificateId ||
            `CERT-${certificate.id}`,

          student:
            certificate.student_name ||
            certificate.student ||
            "Unknown Student",

          company:
            certificate.company_name ||
            certificate.company ||
            "Unknown Company",

          internship:
            certificate.internship_title ||
            certificate.internship ||
            "Internship",

          issueDate: certificate.issued_at
            ? new Date(
                certificate.issued_at
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Pending",

          status:
            String(
              certificate.status || "ISSUED"
            ).toUpperCase() === "REVOKED"
              ? "Revoked"
              : "Issued",

          certificateUrl:
            certificate.certificate_url || "",

          qrCodeUrl:
            certificate.qr_code_url || "",
        })
      );

      setCertificates(normalizedCertificates);
    } catch (err) {
      console.error(
        "Load admin certificates error:",
        err
      );

      setError(
        err.message ||
          "Unable to load certificates."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | UPDATE CERTIFICATE STATUS
  |--------------------------------------------------------------------------
  */

  const updateStatus = async (
    id,
    newStatus
  ) => {
    try {
      setActionLoading(id);
      setError("");

      const backendStatus =
        newStatus === "Revoked"
          ? "REVOKED"
          : "ISSUED";

      const data = await apiPut(
        `/admin/certificates/${id}/status`,
        {
          status: backendStatus,
        }
      );

      const updatedCertificate =
        data.certificate;

      setCertificates(
        (currentCertificates) =>
          currentCertificates.map(
            (certificate) =>
              certificate.id === id
                ? {
                    ...certificate,
                    status:
                      String(
                        updatedCertificate?.status ||
                          backendStatus
                      ).toUpperCase() ===
                      "REVOKED"
                        ? "Revoked"
                        : "Issued",
                  }
                : certificate
          )
      );
    } catch (err) {
      console.error(
        "Update certificate status error:",
        err
      );

      setError(
        err.message ||
          "Unable to update certificate status."
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VIEW CERTIFICATE
  |--------------------------------------------------------------------------
  */

  const viewCertificate = (
    certificate
  ) => {
    if (certificate.certificateUrl) {
      window.open(
        certificate.certificateUrl,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    alert(
      `Certificate ID: ${certificate.certificateId}\n\nStudent: ${certificate.student}\nCompany: ${certificate.company}\nInternship: ${certificate.internship}`
    );
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  | Backend delete endpoint is not available yet.
  |--------------------------------------------------------------------------
  */

  const deleteCertificate = () => {
    alert(
      "Certificate deletion is not available yet because the backend delete endpoint has not been added."
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SEARCH
  |--------------------------------------------------------------------------
  */

  const filteredCertificates =
    certificates.filter(
      (certificate) => {
        const search =
          searchTerm.toLowerCase();

        return (
          certificate.certificateId
            .toLowerCase()
            .includes(search) ||
          certificate.student
            .toLowerCase()
            .includes(search) ||
          certificate.company
            .toLowerCase()
            .includes(search) ||
          certificate.internship
            .toLowerCase()
            .includes(search)
        );
      }
    );

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const issuedCount =
    certificates.filter(
      (certificate) =>
        certificate.status === "Issued"
    ).length;

  const pendingCount =
    certificates.filter(
      (certificate) =>
        certificate.status === "Pending"
    ).length;

  const revokedCount =
    certificates.filter(
      (certificate) =>
        certificate.status === "Revoked"
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
              Manage Certificates
            </h1>

            <p className="mt-2 text-slate-500">
              Monitor, verify and manage internship completion certificates.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-500">
            <FaCertificate />
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
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
                  Total Certificates
                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                  {loading
                    ? "..."
                    : certificates.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#2563EB]">
                <FaCertificate />
              </div>

            </div>
          </div>

          {/* Issued */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Issued
                </p>

                <p className="mt-2 text-3xl font-extrabold text-green-600">
                  {loading
                    ? "..."
                    : issuedCount}
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
                    : pendingCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-500">
                <FaClock />
              </div>

            </div>
          </div>

          {/* Revoked */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Revoked
                </p>

                <p className="mt-2 text-3xl font-extrabold text-red-600">
                  {loading
                    ? "..."
                    : revokedCount}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                <FaTimesCircle />
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
              placeholder="Search by certificate ID, student, company or internship..."
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

        {/* Certificates Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Internship Certificates
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Monitor certificates issued to students after successful
              internship completion.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px]">

              <thead className="bg-slate-50">

                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                  <th className="px-6 py-4">
                    Certificate
                  </th>

                  <th className="px-6 py-4">
                    Student
                  </th>

                  <th className="px-6 py-4">
                    Company
                  </th>

                  <th className="px-6 py-4">
                    Internship
                  </th>

                  <th className="px-6 py-4">
                    Issue Date
                  </th>

                  <th className="px-6 py-4">
                    Status
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
                      colSpan="7"
                      className="px-6 py-12 text-center"
                    >
                      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#2563EB]" />

                      <p className="mt-4 font-bold text-[#0F172A]">
                        Loading certificates...
                      </p>
                    </td>
                  </tr>
                ) : filteredCertificates.length > 0 ? (
                  filteredCertificates.map(
                    (certificate) => (

                      <tr
                        key={certificate.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* Certificate */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                              <FaCertificate />
                            </div>

                            <div>
                              <p className="font-bold text-[#0F172A]">
                                {certificate.certificateId}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                InternShip Hub Certificate
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* Student */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#2563EB]">
                              {certificate.student.charAt(
                                0
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                              <FaUserGraduate className="text-slate-400" />
                              {certificate.student}
                            </div>

                          </div>

                        </td>

                        {/* Company */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                            <FaBuilding className="text-slate-400" />
                            {certificate.company}
                          </div>

                        </td>

                        {/* Internship */}
                        <td className="px-6 py-5">

                          <p className="max-w-[220px] text-sm font-medium text-slate-600">
                            {certificate.internship}
                          </p>

                        </td>

                        {/* Issue Date */}
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {certificate.issueDate}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">

                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                              certificate.status ===
                              "Issued"
                                ? "bg-green-50 text-green-600"
                                : certificate.status ===
                                  "Pending"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-red-50 text-red-600"
                            }`}
                          >

                            <span
                              className={`h-2 w-2 rounded-full ${
                                certificate.status ===
                                "Issued"
                                  ? "bg-green-500"
                                  : certificate.status ===
                                    "Pending"
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                              }`}
                            />

                            {certificate.status}

                          </span>

                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">

                          <div className="flex justify-end gap-2">

                            {/* View */}
                            <button
                              type="button"
                              title="View Certificate"
                              onClick={() =>
                                viewCertificate(
                                  certificate
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] transition hover:bg-blue-100"
                            >
                              <FaEye />
                            </button>

                            {/* Revoke */}
                            {certificate.status ===
                              "Issued" && (
                              <button
                                type="button"
                                title="Revoke Certificate"
                                disabled={
                                  actionLoading ===
                                  certificate.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    certificate.id,
                                    "Revoked"
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <FaTimesCircle />
                              </button>
                            )}

                            {/* Restore */}
                            {certificate.status ===
                              "Revoked" && (
                              <button
                                type="button"
                                title="Restore Certificate"
                                disabled={
                                  actionLoading ===
                                  certificate.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    certificate.id,
                                    "Issued"
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <FaUndo />
                              </button>
                            )}

                            {/* Delete */}
                            <button
                              type="button"
                              title="Delete Certificate"
                              onClick={() =>
                                deleteCertificate(
                                  certificate.id
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                            >
                              <FaTrash />
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )
                ) : (
                  <tr>

                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center"
                    >

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                        <FaSearch />
                      </div>

                      <p className="mt-4 font-bold text-[#0F172A]">
                        No certificates found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try searching with a different certificate, student
                        or company name.
                      </p>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* Certificate Verification Information */}
        <div className="mt-8 rounded-2xl border border-purple-100 bg-purple-50 p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#6D5DFB] shadow-sm">
              <FaCertificate />
            </div>

            <div>

              <h3 className="font-extrabold text-[#0F172A]">
                Certificate Verification
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Every certificate issued through InternShip Hub will have a
                unique certificate ID. In the final system, employers and
                other organizations will be able to verify certificates using
                the certificate ID or QR code.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                  Issued
                </span>

                <span className="text-slate-400">
                  →
                </span>

                <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700">
                  Certificate ID
                </span>

                <span className="text-slate-400">
                  →
                </span>

                <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-bold text-purple-700">
                  QR Verification
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ManageCertificates;