import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import {
  apiGet,
  apiPut,
} from "../../utils/api";

function EditInternship() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    description: "",
    duration: "",
    stipend: "",
    paymentType: "PAID",
    location: "",
    workMode: "REMOTE",
    skills: "",
    deadline: "",
  });

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
  |--------------------------------------------------------------------------
  | LOAD INTERNSHIP + CATEGORIES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const internshipResponse =
          await apiGet(`/internships/${id}`);

        const internship =
          internshipResponse?.internship ||
          internshipResponse?.data ||
          internshipResponse;

        if (!internship) {
          throw new Error(
            "Internship information could not be loaded."
          );
        }

        let skillsValue = "";

        if (Array.isArray(internship.skills)) {
          skillsValue =
            internship.skills.join(", ");
        } else if (
          typeof internship.skills === "string"
        ) {
          skillsValue = internship.skills;
        }

        let deadlineValue = "";

        if (internship.deadline) {
          const parsedDate = new Date(
            internship.deadline
          );

          if (
            !Number.isNaN(parsedDate.getTime())
          ) {
            deadlineValue = parsedDate
              .toISOString()
              .split("T")[0];
          }
        }

        setFormData({
          title: internship.title || "",

          categoryId:
            internship.category_id ||
            internship.categoryId ||
            "",

          description:
            internship.description || "",

          duration:
            internship.duration || "",

          stipend:
            internship.stipend ?? "",

          paymentType:
            internship.payment_type ||
            internship.paymentType ||
            "PAID",

          location:
            internship.location || "",

          workMode:
            internship.work_mode ||
            internship.workMode ||
            "REMOTE",

          skills: skillsValue,

          deadline: deadlineValue,
        });

        /*
        |--------------------------------------------------------------------------
        | LOAD CATEGORIES
        |--------------------------------------------------------------------------
        */

        try {
          const categoryResponse =
            await apiGet("/categories");

          const categoryList =
            categoryResponse?.categories ||
            categoryResponse?.data ||
            [];

          if (Array.isArray(categoryList)) {
            setCategories(categoryList);
          }
        } catch (categoryError) {
          console.error(
            "Unable to load categories:",
            categoryError
          );

          /*
            Category loading failure should not stop
            the internship edit page.
          */
        }
      } catch (err) {
        console.error(
          "Load internship error:",
          err
        );

        setError(
          err.message ||
            "Unable to load internship."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | HANDLE INPUT
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE INTERNSHIP
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!formData.title.trim()) {
        throw new Error(
          "Internship title is required."
        );
      }

      if (!formData.description.trim()) {
        throw new Error(
          "Internship description is required."
        );
      }

      if (!formData.categoryId) {
        throw new Error(
          "Please select a category."
        );
      }

      const skills = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title.trim(),

        categoryId: Number(
          formData.categoryId
        ),

        description:
          formData.description.trim(),

        duration:
          formData.duration.trim(),

        stipend:
          formData.paymentType === "UNPAID"
            ? 0
            : Number(formData.stipend) || 0,

        paymentType:
          formData.paymentType,

        location:
          formData.location.trim(),

        workMode:
          formData.workMode,

        skills,

        deadline:
          formData.deadline || null,
      };

      const response = await apiPut(
        `/internships/${id}`,
        payload
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "Unable to update internship."
        );
      }

      setSuccess(
        response.message ||
          "Internship updated successfully."
      );

      /*
        Give the user a moment to see
        the success message before returning.
      */

      setTimeout(() => {
        navigate(
          `/company/internships/${id}`
        );
      }, 1000);
    } catch (err) {
      console.error(
        "Update internship error:",
        err
      );

      setError(
        err.message ||
          "Unable to update internship."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center">

          <Loader2
            size={40}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading internship...
          </p>

        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-5xl">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate(
              `/company/internships/${id}`
            )
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={18} />

          Back to Internship
        </button>


        {/* HEADER */}

        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm">

          <div className="p-6 text-white sm:p-8">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                <BriefcaseBusiness size={28} />
              </div>

              <div>

                <p className="text-sm font-medium text-blue-100">
                  Company Dashboard
                </p>

                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  Edit Internship
                </h1>

                <p className="mt-2 text-sm text-blue-100">
                  Update your internship
                  information.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-500"
            />

            <p className="text-sm font-medium text-red-700">
              {error}
            </p>

          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4">

            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-green-600"
            />

            <p className="text-sm font-medium text-green-700">
              {success}
            </p>

          </div>
        )}


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >

          <div className="grid gap-6 md:grid-cols-2">

            {/* TITLE */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Internship Title *
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer Intern"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>


            {/* CATEGORY */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category *
              </label>

              {categories.length > 0 ? (
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >

                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name ||
                          category.category_name}
                      </option>
                    )
                  )}

                </select>
              ) : (
                <input
                  type="number"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  placeholder="Category ID"
                  min="1"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              )}

            </div>


            {/* DURATION */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Duration
              </label>

              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="e.g. 3 Months"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>


            {/* PAYMENT TYPE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Payment Type
              </label>

              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="PAID">
                  Paid
                </option>

                <option value="UNPAID">
                  Unpaid
                </option>

              </select>

            </div>


            {/* STIPEND */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Stipend
              </label>

              <input
                type="number"
                name="stipend"
                value={
                  formData.paymentType ===
                  "UNPAID"
                    ? 0
                    : formData.stipend
                }
                onChange={handleChange}
                disabled={
                  formData.paymentType ===
                  "UNPAID"
                }
                min="0"
                placeholder="e.g. 25000"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>


            {/* LOCATION */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Islamabad, Pakistan"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>


            {/* WORK MODE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Work Mode
              </label>

              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              >

                <option value="REMOTE">
                  Remote
                </option>

                <option value="ON_SITE">
                  On-site
                </option>

                <option value="HYBRID">
                  Hybrid
                </option>

              </select>

            </div>


            {/* DEADLINE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Application Deadline
              </label>

              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>


            {/* SKILLS */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Required Skills
              </label>

              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="HTML, CSS, JavaScript, React"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

              <p className="mt-2 text-xs text-slate-400">
                Separate multiple skills with
                commas.
              </p>

            </div>


            {/* DESCRIPTION */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Internship Description *
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="8"
                placeholder="Write internship description..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
              />

            </div>

          </div>


          {/* BUTTONS */}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              disabled={saving}
              onClick={() =>
                navigate(
                  `/company/internships/${id}`
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />

                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditInternship;