import { useEffect, useState } from "react";

import {
  FiAward,
  FiCheckCircle,
  FiDownload,
  FiExternalLink,
  FiShield,
} from "react-icons/fi";

import { apiGet } from "../../utils/api";

function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet("/certificates/student");

      setCertificates(data.certificates || []);
    } catch (err) {
      console.error("Load certificates error:", err);

      setError(
        err.message || "Unable to load certificates."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getCertificateTitle = (certificate) => {
    return (
      certificate.internship_title ||
      certificate.title ||
      certificate.internship_name ||
      "Internship Certificate"
    );
  };

  const getCompanyName = (certificate) => {
    return (
      certificate.company_name ||
      certificate.company ||
      "Company"
    );
  };

  const getCertificateId = (certificate) => {
    return (
      certificate.certificate_id ||
      certificate.id ||
      "N/A"
    );
  };

  const getSkills = (certificate) => {
    if (Array.isArray(certificate.skills)) {
      return certificate.skills;
    }

    if (typeof certificate.skills === "string") {
      return certificate.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return [];
  };

  const handleDownload = (certificate) => {
    const certificateUrl =
      certificate.certificate_url ||
      certificate.certificateUrl;

    if (!certificateUrl) {
      alert(
        "Certificate file is not available yet."
      );
      return;
    }

    window.open(
      certificateUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleVerify = async (certificate) => {
    const certificateId =
      certificate.certificate_id ||
      certificate.id;

    if (!certificateId) {
      alert("Certificate ID is not available.");
      return;
    }

    try {
      const data = await apiGet(
        `/certificates/verify/${certificateId}`
      );

      if (data.success) {
        alert(
          `Certificate ${certificateId} is verified by InternShip Hub.`
        );
      } else {
        alert(
          data.message ||
            "Certificate verification failed."
        );
      }
    } catch (err) {
      alert(
        err.message ||
          "Unable to verify certificate."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================== */}

        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <FiAward className="text-xl text-[#2563EB]" />

            <span className="text-sm font-semibold text-[#2563EB]">
              Student Certificates
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
            My Certificates
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#64748B]">
            View and verify internship certificates issued by companies
            through InternShip Hub.
          </p>
        </div>

        {/* =========================
            CERTIFICATE SUMMARY
        ========================== */}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <FiAward className="text-xl text-[#2563EB]" />
              </div>

              <div>
                <p className="text-sm text-[#64748B]">
                  Total Certificates
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0F172A]">
                  {certificates.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
                <FiCheckCircle className="text-xl text-green-600" />
              </div>

              <div>
                <p className="text-sm text-[#64748B]">
                  Verified
                </p>

                <p className="mt-1 text-2xl font-bold text-[#0F172A]">
                  {
                    certificates.filter(
                      (certificate) =>
                        certificate.is_verified === true ||
                        certificate.is_verified === "true"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                <FiShield className="text-xl text-[#6D5DFB]" />
              </div>

              <div>
                <p className="text-sm text-[#64748B]">
                  Platform
                </p>

                <p className="mt-1 text-lg font-bold text-[#0F172A]">
                  InternShip Hub
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* =========================
            LOADING
        ========================== */}

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-medium text-[#64748B]">
              Loading certificates...
            </p>
          </div>
        )}

        {/* =========================
            ERROR
        ========================== */}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              onClick={loadCertificates}
              className="mt-4 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =========================
            EMPTY STATE
        ========================== */}

        {!loading &&
          !error &&
          certificates.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <FiAward className="text-3xl text-[#2563EB]" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-[#0F172A]">
                No Certificates Yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                Your internship certificates will appear here after a
                company issues them.
              </p>
            </div>
          )}

        {/* =========================
            CERTIFICATES
        ========================== */}

        {!loading &&
          !error &&
          certificates.length > 0 && (
            <div className="grid gap-6 xl:grid-cols-2">

              {certificates.map((certificate) => {
                const certificateId =
                  getCertificateId(certificate);

                const title =
                  getCertificateTitle(certificate);

                const company =
                  getCompanyName(certificate);

                const skills =
                  getSkills(certificate);

                const verified =
                  certificate.is_verified === true ||
                  certificate.is_verified === "true";

                const issueDate =
                  certificate.issue_date ||
                  certificate.issued_date ||
                  certificate.issuedDate;

                const duration =
                  certificate.duration || "—";

                const certificateUrl =
                  certificate.certificate_url ||
                  certificate.certificateUrl;

                const qrCodeUrl =
                  certificate.qr_code_url ||
                  certificate.qrCodeUrl;

                return (
                  <article
                    key={certificateId}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* Certificate Header */}

                    <div className="relative overflow-hidden bg-gradient-to-r from-[#2563EB] to-[#6D5DFB] p-6 text-white sm:p-7">

                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

                      <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-white/10" />

                      <div className="relative">

                        <div className="flex items-start justify-between">

                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                            <FiAward className="text-3xl" />
                          </div>

                          <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur">
                            <FiCheckCircle />
                            {verified
                              ? "Verified"
                              : "Pending"}
                          </div>

                        </div>

                        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                          InternShip Hub
                        </p>

                        <h2 className="mt-2 text-xl font-bold leading-7 sm:text-2xl">
                          Certificate of Internship
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-blue-100">
                          This certificate recognizes the successful
                          completion of an internship program.
                        </p>

                      </div>
                    </div>

                    {/* Certificate Body */}

                    <div className="p-6 sm:p-7">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                          Internship
                        </p>

                        <h3 className="mt-1 text-lg font-bold text-[#0F172A]">
                          {title}
                        </h3>
                      </div>

                      <div className="mt-5 rounded-xl bg-slate-50 p-4">

                        <p className="text-xs text-[#64748B]">
                          Issued by
                        </p>

                        <p className="mt-1 text-base font-bold text-[#0F172A]">
                          {company}
                        </p>

                      </div>

                      {/* Details */}

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">

                        <div>
                          <p className="text-xs text-[#64748B]">
                            Duration
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                            {duration}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#64748B]">
                            Completed
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                            Internship Completed
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#64748B]">
                            Issued
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                            {formatDate(issueDate)}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[#64748B]">
                            Status
                          </p>

                          <p
                            className={`mt-1 flex items-center gap-1.5 text-sm font-semibold ${
                              verified
                                ? "text-green-600"
                                : "text-amber-600"
                            }`}
                          >
                            <FiCheckCircle />

                            {verified
                              ? "Verified"
                              : "Pending Verification"}
                          </p>
                        </div>

                      </div>

                      {/* Skills */}

                      {skills.length > 0 && (
                        <div className="mt-6">

                          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                            Skills
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {skills.map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#2563EB]"
                              >
                                {skill}
                              </span>
                            ))}

                          </div>

                        </div>
                      )}

                      {/* Certificate ID */}

                      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">

                        <p className="text-xs text-[#64748B]">
                          Certificate ID
                        </p>

                        <div className="mt-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">

                          <p className="font-mono text-sm font-bold text-[#0F172A]">
                            {certificateId}
                          </p>

                          <span
                            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                              verified
                                ? "bg-green-50 text-green-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <FiShield />

                            {verified
                              ? "Authentic"
                              : "Pending"}
                          </span>

                        </div>

                      </div>

                      {/* QR Code */}

                      <div className="mt-5 flex items-center gap-4 rounded-xl bg-slate-50 p-4">

                        {qrCodeUrl ? (
                          <img
                            src={qrCodeUrl}
                            alt="Certificate QR Code"
                            className="h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-white object-contain p-1"
                          />
                        ) : (
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white">
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                1, 2, 3, 4,
                                5, 6, 7, 8,
                                9, 10, 11, 12,
                              ].map((item) => (
                                <span
                                  key={item}
                                  className={`h-2 w-2 ${
                                    item % 2 === 0
                                      ? "bg-[#0F172A]"
                                      : "bg-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">
                            QR Verification
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#64748B]">
                            Scan the certificate QR code to verify its
                            authenticity.
                          </p>
                        </div>

                      </div>

                      {/* Actions */}

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                        <button
                          onClick={() =>
                            handleDownload(certificate)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          <FiDownload />
                          Download Certificate
                        </button>

                        <button
                          onClick={() =>
                            handleVerify(certificate)
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:bg-slate-50"
                        >
                          <FiExternalLink />
                          Verify Certificate
                        </button>

                      </div>

                    </div>
                  </article>
                );
              })}

            </div>
          )}

        {/* =========================
            INFORMATION CARD
        ========================== */}

        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:p-6">

          <div className="flex items-start gap-3">

            <FiShield className="mt-0.5 shrink-0 text-xl text-[#2563EB]" />

            <div>

              <h2 className="font-bold text-[#0F172A]">
                Certificate Verification
              </h2>

              <p className="mt-1 text-sm leading-6 text-[#64748B]">
                Every certificate issued through InternShip Hub receives
                a unique certificate ID. Companies, recruiters and other
                organizations can use this ID or the QR code to verify
                the certificate.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Certificates;