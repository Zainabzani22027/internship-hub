import React, { useEffect, useState } from "react";

import {
  Building2,
  CheckCircle,
  Globe,
  Mail,
  MapPin,
  Save,
} from "lucide-react";

import { apiGet, apiPut } from "../../utils/api";

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

  const [verificationMethod, setVerificationMethod] =
    useState("Official Company Website");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const data = await apiGet("/company/profile");

      const company = data.company || data.profile || data;

      setFormData({
        companyName:
          company.companyName ||
          company.company_name ||
          "",

        email:
          company.email ||
          company.official_email ||
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

      setVerificationMethod(
        company.verificationMethod ||
          company.verification_method ||
          "Official Company Website"
      );
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
        "/company/profile",
        {
          companyName: formData.companyName,
          email: formData.email,
          website: formData.website,
          country: formData.country,
          city: formData.city,
          industry: formData.industry,
          size: formData.size,
          linkedin: formData.linkedin,
          description: formData.description,
        }
      );

      const company =
        data.company ||
        data.profile ||
        null;

      if (company) {
        setFormData({
          companyName:
            company.companyName ||
            company.company_name ||
            formData.companyName,

          email:
            company.email ||
            company.official_email ||
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

  const isVerified =
    String(verificationStatus).toUpperCase() ===
    "VERIFIED";

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

        {/* VERIFIED BANNER */}
        <div
          className={`mb-6 rounded-2xl border p-5 ${
            isVerified
              ? "border-green-200 bg-green-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          <div className="flex items-start gap-4">
            <CheckCircle
              size={25}
              className={`mt-0.5 shrink-0 ${
                isVerified
                  ? "text-green-600"
                  : "text-yellow-600"
              }`}
            />

            <div>
              <h2
                className={`font-bold ${
                  isVerified
                    ? "text-green-900"
                    : "text-yellow-900"
                }`}
              >
                {isVerified
                  ? "Verified Company"
                  : "Verification Pending"}
              </h2>

              <p
                className={`mt-1 text-sm ${
                  isVerified
                    ? "text-green-700"
                    : "text-yellow-700"
                }`}
              >
                {isVerified
                  ? "Your company verification has been approved by InternShip Hub administration."
                  : "Your company verification is currently pending administration approval."}
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
              <h2 className="text-lg font-bold text-slate-900">
                Verification Evidence
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your company verification information.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Verification Method
                </p>

                <p className="mt-2 font-semibold text-slate-900">
                  {verificationMethod}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Verification Status
                </p>

                <div
                  className={`mt-2 flex items-center gap-2 font-semibold ${
                    isVerified
                      ? "text-green-600"
                      : "text-yellow-600"
                  }`}
                >
                  <CheckCircle size={17} />

                  {isVerified
                    ? "Verified"
                    : verificationStatus}
                </div>
              </div>
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