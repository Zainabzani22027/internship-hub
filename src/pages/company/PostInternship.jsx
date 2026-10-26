import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle,
  Info,
  Send,
} from "lucide-react";

import { apiGet, apiPost } from "../../utils/api";

function PostInternship() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    category: "Computer Science",
    description: "",
    duration: "3 Months",
    stipend: "",
    paymentType: "Paid",
    location: "",
    mode: "Remote",
    skills: "",
    deadline: "",
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);

      const data = await apiGet("/categories");

      setCategories(data.categories || []);
    } catch (error) {
      console.error(
        "Load categories error:",
        error
      );

      // Fallback categories
      setCategories([
        {
          id: 1,
          name: "Computer Science",
        },
        {
          id: 2,
          name: "Information Technology",
        },
        {
          id: 3,
          name: "Software Engineering",
        },
        {
          id: 4,
          name: "Cyber Security",
        },
        {
          id: 5,
          name: "AI & Machine Learning",
        },
        {
          id: 6,
          name: "Marketing",
        },
        {
          id: 7,
          name: "Data Science",
        },
        {
          id: 8,
          name: "Design",
        },
        {
          id: 9,
          name: "Business",
        },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const selectedCategory = categories.find(
        (category) =>
          String(category.name).toLowerCase() ===
          String(formData.category).toLowerCase()
      );

      const categoryId =
        selectedCategory?.id ||
        selectedCategory?.category_id;

      if (!categoryId) {
        throw new Error(
          "Please select a valid internship category."
        );
      }

      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),
        categoryId: Number(categoryId),
        description: formData.description.trim(),
        duration: formData.duration,
        stipend:
          formData.paymentType === "Unpaid"
            ? "0"
            : formData.stipend.trim(),
        paymentType:
          formData.paymentType.toUpperCase(),
        location: formData.location.trim(),
        workMode:
          formData.mode.toUpperCase(),
        skills: skillsArray,
        deadline: formData.deadline,
      };

      await apiPost("/internships", payload);

      setSubmitted(true);
    } catch (error) {
      console.error(
        "Create internship error:",
        error
      );

      setError(
        error.message ||
          "Unable to submit internship."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg sm:p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle size={42} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            Internship Submitted!
          </h1>

          <p className="mt-3 leading-7 text-slate-500">
            Your internship has been submitted successfully and is now
            waiting for Admin approval. It will become live after approval.
          </p>

          <div className="mt-7 rounded-xl bg-blue-50 p-4 text-left">
            <div className="flex gap-3">
              <Info
                className="mt-0.5 shrink-0 text-blue-600"
                size={20}
              />

              <p className="text-sm leading-6 text-blue-800">
                Admin will review your internship details before publishing
                it on InternShip Hub.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                navigate("/company/internships")
              }
              className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Manage Internships
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/company")
              }
              className="flex-1 rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-7">
          <button
            type="button"
            onClick={() =>
              navigate("/company")
            }
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <BriefcaseBusiness size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                Post Internship
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create a new internship opportunity for students.
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <Info
              className="mt-0.5 shrink-0 text-blue-600"
              size={21}
            />

            <div>
              <h2 className="font-semibold text-blue-900">
                Admin Approval Required
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Every internship is reviewed by the InternShip Hub admin team
                before it becomes visible to students.
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              {error}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
        >
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900">
              Internship Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Provide complete information about the internship.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Internship Title *
              </label>

              <input
                required
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={submitting}
                placeholder="e.g. Frontend Developer Intern"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category *
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={
                  loadingCategories ||
                  submitting
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              >
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option
                      key={
                        category.id ||
                        category.category_id
                      }
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option>
                    Loading categories...
                  </option>
                )}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Duration *
              </label>

              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              >
                <option>1 Month</option>
                <option>2 Months</option>
                <option>3 Months</option>
                <option>4 Months</option>
                <option>5 Months</option>
                <option>6 Months</option>
                <option>12 Months</option>
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description *
              </label>

              <textarea
                required
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={submitting}
                rows="7"
                placeholder="Describe the internship, responsibilities, learning opportunities and expectations..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            {/* Stipend */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Stipend
              </label>

              <input
                type="text"
                name="stipend"
                value={formData.stipend}
                onChange={handleChange}
                disabled={
                  submitting ||
                  formData.paymentType ===
                    "Unpaid"
                }
                placeholder="e.g. 25000"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            {/* Payment */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Type *
              </label>

              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              >
                <option>Paid</option>
                <option>Unpaid</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location *
              </label>

              <input
                required
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={submitting}
                placeholder="e.g. Islamabad, Pakistan"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            {/* Mode */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Work Mode *
              </label>

              <select
                name="mode"
                value={formData.mode}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              >
                <option>Remote</option>
                <option>On-site</option>
                <option>Hybrid</option>
              </select>
            </div>

            {/* Skills */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Required Skills *
              </label>

              <input
                required
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                disabled={submitting}
                placeholder="e.g. React, JavaScript, HTML, CSS"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />

              <p className="mt-2 text-xs text-slate-500">
                Separate multiple skills using commas.
              </p>
            </div>

            {/* Deadline */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Application Deadline *
              </label>

              <input
                required
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                disabled={submitting}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                navigate("/company")
              }
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />

              {submitting
                ? "Submitting..."
                : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostInternship;