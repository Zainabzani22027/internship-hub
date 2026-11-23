import React, { useEffect, useState } from "react";

import {
  Building2,
  CheckCircle,
  Globe,
  Mail,
  MapPin,
  Save,
} from "lucide-react";

import { apiGet, apiPost, apiPut } from "../../utils/api";

function CompanyProfile() {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    website: "",
    country: "",
    city: "",
    industry: "",
    size: "",
    linkedin: "",
    description: "",
  });

  const [verificationStatus, setVerificationStatus] =
    useState("PENDING");

  const [verificationMethod, setVerificationMethod] = useState("");
  const [verificationType, setVerificationType] = useState("WEBSITE");
  const [documentUrl, setDocumentUrl] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [verificationRecord, setVerificationRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verificationSubmitting, setVerificationSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const loadCompanyProfile = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await apiGet("/companies/profile");

      const company = data.company || data.profile || data;

      setFormData({
        companyName:
          company.companyName ||
          company.company_name ||
          "",

        email:
          company.official_email ||
          company.email ||
          "",

        website:
          company.website ||
          company.website_url ||
          "",

        country:
          company.country ||
          "",

        city:
          company.city ||
          "",

        industry:
          company.industry ||
          "",

        size:
          company.size ||
          company.company_size ||
          "",

        linkedin:
          company.linkedin ||
          company.linkedin_url ||
          "",

        description:
          company.description ||
          "",
      });

      setVerificationStatus(
        company.verificationStatus ||
          company.verification_status ||
          "PENDING"
      );

      try {
        const verificationData = await apiGet("/companies/verification");
        const verificationList = Array.isArray(verificationData.verifications)
          ? verificationData.verifications
          : [];
        const latestVerification = verificationList[0] || null;

        setVerificationRecord(latestVerification);
        if (latestVerification) {
          setVerificationType(latestVerification.verification_type || "WEBSITE");
          setDocumentUrl(latestVerification.document_url || "");
          setEvidenceText(latestVerification.evidence_text || "");
          setVerificationStatus(latestVerification.status || company.verification_status || "PENDING");
          setVerificationMethod(latestVerification.verification_type || "");
        } else {
          setVerificationRecord(null);
          setVerificationStatus(company.verification_status || "NOT_SUBMITTED");
          setVerificationMethod("");
          setDocumentUrl(company.website || "");
        }
      } catch (verificationError) {
        console.error("Load company verification error:", verificationError);
      }
    } catch (err) {
      console.error(
        "Load company profile error:",
        err
      );

      setError(
        err.message ||
          "Unable to load company profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "website" && verificationType === "WEBSITE") {
      setDocumentUrl(value);
    }

    setSuccess("");
    setError("");
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = await apiPut(
        "/companies/profile",
        {
          companyName: formData.companyName,
          officialEmail: formData.email,
          website: formData.website,
          country: formData.country,
          city: formData.city,
          industry: formData.industry,
          companySize: formData.size,
          linkedinUrl: formData.linkedin,
          description: formData.description,
        }
      );

      const company =
        data.company ||
        data.profile?.company ||
        data.profile ||
        null;

      if (company) {
        setFormData({
          companyName:
            company.companyName ||
            company.company_name ||
            formData.companyName,

          email:
            company.official_email ||
            company.email ||
            formData.email,

          website:
            company.website ||
            company.website_url ||
            formData.website,

          country:
            company.country ||
            formData.country,

          city:
            company.city ||
            formData.city,

          industry:
            company.industry ||
            formData.industry,

          size:
            company.size ||
            company.company_size ||
            formData.size,

          linkedin:
            company.linkedin ||
            company.linkedin_url ||
            formData.linkedin,

          description:
            company.description ||
            formData.description,
        });

        setVerificationStatus(
          company.verificationStatus ||
            company.verification_status ||
            verificationStatus
        );

        setVerificationMethod(
          company.verificationMethod ||
            company.verification_method ||
            verificationMethod
        );
      }

      setSuccess(
        data.message ||
          "Company profile saved successfully!"
      );
    } catch (err) {
      console.error(
        "Save company profile error:",
        err
      );

      setError(
        err.message ||
          "Unable to save company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!documentUrl.trim() && !evidenceText.trim()) {
      setError("Please provide a verification document URL or supporting evidence.");
      setSuccess("");
      return;
    }

    try {
      setVerificationSubmitting(true);
      setError("");
      setSuccess("");

      // Save the latest company details first so Admin reviews current information.
      await apiPut("/companies/profile", {
        companyName: formData.companyName,
        officialEmail: formData.email,
        website: formData.website,
        country: formData.country,
        city: formData.city,
        industry: formData.industry,
        companySize: formData.size,
        linkedinUrl: formData.linkedin,
        description: formData.description,
      });

      const response = await apiPost("/companies/verification", {
        verificationType,
        documentUrl: documentUrl.trim(),
        evidenceText: evidenceText.trim(),
      });

      setVerificationRecord(response.verification || null);
      setVerificationStatus(response.verification?.status || "PENDING");
      setVerificationMethod(verificationType);
      setSuccess(response.message || "Verification request submitted successfully.");
    } catch (err) {
      setError(err.message || "Unable to submit company verification.");
    } finally {
      setVerificationSubmitting(false);
    }
  };

  const isVerified =
    String(verificationStatus).toUpperCase() === "VERIFIED" ||
    String(verificationRecord?.status || "").toUpperCase() === "VERIFIED";
  const isVerificationPending =
    !isVerified && String(verificationRecord?.status || "").toUpperCase() === "PENDING";
  const displayedVerificationStatus = verificationRecord?.status || (
    String(verificationStatus).toUpperCase() === "REJECTED" ? "REJECTED" : "NOT_SUBMITTED"
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Building2 size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Company Profile
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your company information and
                verification details.
              </p>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-sm font-semibold text-blue-700">
              Loading company profile...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {!loading && success && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
            <div className="flex items-center gap-3">
              <CheckCircle
                size={20}
                className="text-green-600"
              />

              <p className="text-sm font-semibold text-green-700">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* COMPANY VERIFICATION STATUS */}
        <div
          className={`mb-6 rounded-2xl border p-5 ${
            isVerified
              ? "border-green-200 bg-green-50"
              : isVerificationPending
                ? "border-yellow-200 bg-yellow-50"
                : displayedVerificationStatus === "REJECTED"
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="flex items-start gap-4">
            <CheckCircle
              size={25}
              className={`mt-0.5 shrink-0 ${
                isVerified
                  ? "text-green-600"
                  : isVerificationPending
                    ? "text-yellow-600"
                    : displayedVerificationStatus === "REJECTED"
                      ? "text-red-600"
                      : "text-slate-500"
              }`}
            />

            <div>
              <h2 className="font-bold text-slate-900">
                {isVerified
                  ? "Verified Company"
                  : isVerificationPending
                    ? "Verification Pending"
                    : displayedVerificationStatus === "REJECTED"
                      ? "Verification Rejected"
                      : "Verification Not Submitted"}
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {isVerified
                  ? "Your company verification has been approved by InternShip Hub administration."
                  : isVerificationPending
                    ? "Your verification request is waiting for admin review."
                    : displayedVerificationStatus === "REJECTED"
                      ? "Your previous request was rejected. Review the admin note and submit updated evidence."
                      : "Submit company verification evidence below. You must be verified before posting internships."}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="space-y-6"
        >
          {/* BASIC INFORMATION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Basic Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                General information about your company.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* COMPANY NAME */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Name
                </label>

                <div className="relative">
                  <Building2
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={loading || saving}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Official Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading || saving}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* WEBSITE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Website
                </label>

                <div className="relative">
                  <Globe
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    disabled={loading || saving}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* LINKEDIN */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  LinkedIn Company Page
                </label>

                <div className="relative">
                  <Globe
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    disabled={loading || saving}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* COMPANY DETAILS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Company Details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Location, industry and company size.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* COUNTRY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Country
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={loading || saving}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* CITY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  City
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={loading || saving}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>

              {/* INDUSTRY */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Industry
                </label>

                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  disabled={loading || saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                >
                  <option value="">
                    Select Industry
                  </option>
                  <option>
                    Information Technology
                  </option>
                  <option>
                    Software Development
                  </option>
                  <option>
                    Artificial Intelligence
                  </option>
                  <option>
                    Cyber Security
                  </option>
                  <option>
                    Marketing
                  </option>
                  <option>
                    Finance
                  </option>
                  <option>
                    Education
                  </option>
                  <option>
                    Healthcare
                  </option>
                  <option>Other</option>
                </select>
              </div>

              {/* SIZE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Size
                </label>

                <select
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  disabled={loading || saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                >
                  <option value="">
                    Select Company Size
                  </option>
                  <option>
                    1-10 Employees
                  </option>
                  <option>
                    11-50 Employees
                  </option>
                  <option>
                    51-200 Employees
                  </option>
                  <option>
                    201-500 Employees
                  </option>
                  <option>
                    501-1000 Employees
                  </option>
                  <option>
                    1000+ Employees
                  </option>
                </select>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                Company Description
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tell students about your company.
              </p>
            </div>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading || saving}
              rows="6"
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              placeholder="Write your company description..."
            />
          </section>

          {/* VERIFICATION EVIDENCE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">Company Verification</h2>
              <p className="mt-1 text-sm text-slate-500">
                Submit official company evidence. An administrator must verify your company before you can publish internships.
              </p>
            </div>

            <div className={`mb-5 rounded-xl border p-4 ${isVerified ? "border-green-200 bg-green-50" : isVerificationPending ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current verification status</p>
              <p className="mt-1 font-bold text-slate-900">{isVerified ? "Verified" : isVerificationPending ? "Pending Admin Review" : displayedVerificationStatus === "REJECTED" ? "Rejected — Resubmission Required" : "Not Submitted"}</p>
              {verificationMethod && <p className="mt-1 text-sm text-slate-600">Method: {verificationMethod}</p>}
              {verificationRecord?.admin_note && (
                <p className="mt-2 text-sm text-slate-700">Admin note: {verificationRecord.admin_note}</p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Verification Method</label>
                <select
                  value={verificationType}
                  onChange={(event) => setVerificationType(event.target.value)}
                  disabled={loading || verificationSubmitting || isVerified || isVerificationPending}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                >
                  <option value="WEBSITE">Official Company Website</option>
                  <option value="NTN">NTN / Registration Number</option>
                  <option value="DOMAIN_EMAIL">Official Domain Email</option>
                  <option value="OTHER">Other Supporting Evidence</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Evidence URL (optional)</label>
                <input
                  type="url"
                  value={documentUrl}
                  onChange={(event) => setDocumentUrl(event.target.value)}
                  disabled={loading || verificationSubmitting || isVerified || isVerificationPending}
                  placeholder="https://your-company.com or document link"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Verification Details / Evidence</label>
                <textarea
                  value={evidenceText}
                  onChange={(event) => setEvidenceText(event.target.value)}
                  disabled={loading || verificationSubmitting || isVerified || isVerificationPending}
                  rows={4}
                  placeholder="Enter your NTN/registration number, official domain email, or explain the supporting evidence..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">You can submit a new request if your previous request was rejected.</p>
              <button
                type="button"
                onClick={handleSubmitVerification}
                disabled={loading || verificationSubmitting || isVerified || isVerificationPending}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verificationSubmitting ? "Submitting..." : isVerified ? "Company Verified" : isVerificationPending ? "Waiting for Admin Review" : displayedVerificationStatus === "REJECTED" ? "Resubmit Verification" : "Submit for Verification"}
              </button>
            </div>
          </section>

          {/* SAVE */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Save size={19} />

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompanyProfile;