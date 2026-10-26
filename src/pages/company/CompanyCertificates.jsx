import React, { useEffect, useState } from "react";
import {
  Award,
  CheckCircle,
  Download,
  Eye,
  FilePlus2,
  Search,
  User,
} from "lucide-react";

import { apiGet, apiPost } from "../../utils/api";

function CompanyCertificates() {
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [issuingId, setIssuingId] = useState(null);

  useEffect(() => {
    loadEligibleStudents();
  }, []);

  const loadEligibleStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet(
        "/company/applications"
      );

      const applications =
        data.applications || [];

      /*
       * Only SELECTED applications are
       * eligible for company certificates.
       */
      const selectedApplications =
        applications.filter((application) => {
          return (
            String(
              application.status || ""
            ).toUpperCase() === "SELECTED"
          );
        });

      const formattedStudents =
        selectedApplications.map(
          (application) => ({
            id: application.id,

            applicationId:
              application.id,

            name:
              application.student_name ||
              application.studentName ||
              application.full_name ||
              application.fullName ||
              application.name ||
              "Student",

            internship:
              application.internship_title ||
              application.internshipTitle ||
              application.title ||
              "Internship",

            duration:
              application.duration ||
              "Not specified",

            completionDate:
              application.completion_date ||
              application.completionDate ||
              application.completed_at ||
              application.completedAt ||
              "Not specified",

            status: "Eligible",

            certificateId:
              application.certificate_id ||
              application.certificateId ||
              "",
            
            certificateUrl:
              application.certificate_url ||
              application.certificateUrl ||
              "",
          })
        );

      setStudents(formattedStudents);
    } catch (err) {
      console.error(
        "Load certificate students error:",
        err
      );

      setError(
        err.message ||
          "Unable to load eligible students."
      );
    } finally {
      setLoading(false);
    }
  };

  const issueCertificate = async (
    applicationId
  ) => {
    try {
      setIssuingId(applicationId);
      setError("");

      const data = await apiPost(
        `/certificates/issue/${applicationId}`
      );

      const certificate =
        data.certificate || {};

      setStudents((current) =>
        current.map((student) =>
          student.applicationId ===
          applicationId
            ? {
                ...student,
                status:
                  "Certificate Issued",
                certificateId:
                  certificate.certificate_id ||
                  certificate.certificateId ||
                  certificate.id ||
                  student.certificateId,
                certificateUrl:
                  certificate.certificate_url ||
                  certificate.certificateUrl ||
                  student.certificateUrl,
              }
            : student
        )
      );

      alert(
        data.message ||
          "Certificate issued successfully!"
      );
    } catch (err) {
      console.error(
        "Issue certificate error:",
        err
      );

      setError(
        err.message ||
          "Unable to issue certificate."
      );
    } finally {
      setIssuingId(null);
    }
  };

  const filteredStudents =
    students.filter((student) => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) return true;

      return (
        student.name
          .toLowerCase()
          .includes(query) ||
        student.internship
          .toLowerCase()
          .includes(query) ||
        String(
          student.certificateId || ""
        )
          .toLowerCase()
          .includes(query)
      );
    });

  const viewCertificate = (student) => {
    if (student.certificateUrl) {
      window.open(
        student.certificateUrl,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    alert(
      `Certificate ${student.certificateId} can be verified using the certificate ID.`
    );
  };

  const downloadCertificate = (student) => {
    if (student.certificateUrl) {
      const link =
        document.createElement("a");

      link.href =
        student.certificateUrl;

      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return;
    }

    alert(
      "Certificate file is not available yet. You can verify it using the certificate ID."
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-600 text-white shadow-lg">
              <Award size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Company Certificates
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Issue certificates to students who successfully completed
                internships.
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <Award
              size={22}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <h2 className="font-bold text-blue-900">
                Certificate Issuance
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                After a student completes an internship, the company can
                issue an official InternShip Hub certificate. Each certificate
                receives a unique certificate ID for verification.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={loadEligibleStudents}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search student, internship or certificate ID..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <Award
              size={44}
              className="mx-auto animate-pulse text-purple-400"
            />

            <h3 className="mt-4 font-semibold text-slate-800">
              Loading certificate records...
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we load eligible students.
            </p>
          </div>
        )}

        {/* Certificates */}
        {!loading && (
          <div className="grid gap-5">
            {filteredStudents.map(
              (student) => (
                <div
                  key={student.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Student */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                        <User size={24} />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-bold text-slate-900">
                            {student.name}
                          </h2>

                          {student.status ===
                          "Certificate Issued" ? (
                            <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                              <CheckCircle
                                size={14}
                              />
                              Certificate Issued
                            </span>
                          ) : (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                              Eligible
                            </span>
                          )}
                        </div>

                        <p className="mt-2 font-medium text-slate-700">
                          {student.internship}
                        </p>

                        <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-2 sm:gap-x-6">
                          <p>
                            <span className="font-semibold text-slate-600">
                              Duration:
                            </span>{" "}
                            {student.duration}
                          </p>

                          <p>
                            <span className="font-semibold text-slate-600">
                              Completion:
                            </span>{" "}
                            {student.completionDate}
                          </p>

                          <p className="sm:col-span-2">
                            <span className="font-semibold text-slate-600">
                              Certificate ID:
                            </span>{" "}
                            {student.certificateId ||
                              "Not issued yet"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {student.status ===
                      "Eligible" ? (
                        <button
                          type="button"
                          disabled={
                            issuingId ===
                            student.applicationId
                          }
                          onClick={() =>
                            issueCertificate(
                              student.applicationId
                            )
                          }
                          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FilePlus2
                            size={17}
                          />

                          {issuingId ===
                          student.applicationId
                            ? "Issuing..."
                            : "Issue Certificate"}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              viewCertificate(
                                student
                              )
                            }
                            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye size={17} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              downloadCertificate(
                                student
                              )
                            }
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                          >
                            <Download
                              size={17}
                            />
                            Download
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {filteredStudents.length ===
              0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <Award
                  size={44}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-semibold text-slate-800">
                  No eligible students found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try another search term."
                    : "Students with a SELECTED application will appear here when they are eligible for certificates."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Workflow */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Certificate Workflow
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                1
              </div>

              <h3 className="font-semibold text-slate-900">
                Internship Completed
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Student successfully completes the internship period.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                2
              </div>

              <h3 className="font-semibold text-slate-900">
                Company Issues Certificate
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Company creates and issues the official certificate.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                3
              </div>

              <h3 className="font-semibold text-slate-900">
                Certificate Verification
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Certificate can later be verified using its unique ID or QR
                code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyCertificates;