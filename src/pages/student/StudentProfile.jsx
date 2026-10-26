import { useEffect, useState } from "react";
import {
  FiCamera,
  FiCheckCircle,
  FiEdit3,
  FiFileText,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUpload,
  FiUser,
} from "react-icons/fi";

import {
  apiGet,
  apiPut,
  apiUpload,
} from "../../utils/api";

function StudentProfile() {
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    university: "",
    degree: "",
    graduation: "",
    bio: "",
  });

  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [cvName, setCvName] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [cvUploading, setCvUploading] = useState(false);
  const [cvError, setCvError] = useState("");
  const [cvSuccess, setCvSuccess] = useState("");

  const [profileCompletion, setProfileCompletion] =
    useState(0);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROFILE
  |--------------------------------------------------------------------------
  */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiGet(
        "/student/profile"
      );

      const student = data.profile;

      if (!student) {
        throw new Error(
          "Student profile data not found."
        );
      }

      setProfile({
        name: student.full_name || "",
        email: student.email || "",
        phone: student.phone || "",
        location:
          student.city && student.country
            ? `${student.city}, ${student.country}`
            : student.city ||
              student.country ||
              "",
        university:
          student.university || "",
        degree:
          student.degree || "",
        graduation:
          student.graduation_year
            ? String(
                student.graduation_year
              )
            : "",
        bio:
          student.about || "",
      });

      setSkills(
        Array.isArray(student.skills)
          ? student.skills
          : []
      );

      setCvUrl(
        student.cv_url || ""
      );

      if (student.cv_url) {
        const urlParts =
          student.cv_url.split("/");

        setCvName(
          urlParts[
            urlParts.length - 1
          ] || "CV uploaded"
        );
      } else {
        setCvName("");
      }

      setProfileCompletion(
        Number(
          student.profile_completion || 0
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load student profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | CHANGE PROFILE FIELD
  |--------------------------------------------------------------------------
  */

  const handleChange = (
    field,
    value
  ) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | ADD SKILL
  |--------------------------------------------------------------------------
  */

  const addSkill = () => {
    const skill =
      newSkill.trim();

    if (!skill) return;

    if (!skills.includes(skill)) {
      setSkills((previous) => [
        ...previous,
        skill,
      ]);
    }

    setNewSkill("");
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE SKILL
  |--------------------------------------------------------------------------
  */

  const removeSkill = (
    skillToRemove
  ) => {
    setSkills((previous) =>
      previous.filter(
        (skill) =>
          skill !== skillToRemove
      )
    );
  };

  /*
  |--------------------------------------------------------------------------
  | UPLOAD CV
  |--------------------------------------------------------------------------
  */

  const handleCVUpload = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setCvError("");
    setCvSuccess("");
    setError("");
    setSuccess("");

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];

    const extension =
      file.name
        .substring(
          file.name.lastIndexOf(".")
        )
        .toLowerCase();

    if (
      !allowedTypes.includes(
        file.type
      ) &&
      !allowedExtensions.includes(
        extension
      )
    ) {
      setCvError(
        "Only PDF, DOC and DOCX files are allowed."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setCvError(
        "CV file must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setCvUploading(true);

      const formData =
        new FormData();

      formData.append(
        "cv",
        file
      );

      const data =
        await apiUpload(
          "/student/profile/cv",
          formData
        );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to upload CV."
        );
      }

      setCvName(
        data.fileName ||
          file.name
      );

      setCvUrl(
        data.cvUrl || ""
      );

      setCvSuccess(
        "CV uploaded successfully."
      );

      await loadProfile();
    } catch (err) {
      setCvError(
        err.message ||
          "Unable to upload CV."
      );
    } finally {
      setCvUploading(false);

      event.target.value = "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | VIEW CV
  |--------------------------------------------------------------------------
  */

  const handleViewCV = () => {
    if (!cvUrl) return;

    const fullUrl =
      cvUrl.startsWith("http")
        ? cvUrl
        : `http://localhost:5000${cvUrl}`;

    window.open(
      fullUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE PROFILE
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const locationParts =
        profile.location
          .split(",")
          .map((part) =>
            part.trim()
          )
          .filter(Boolean);

      const city =
        locationParts.length > 1
          ? locationParts
              .slice(0, -1)
              .join(", ")
          : locationParts[0] || "";

      const country =
        locationParts.length > 1
          ? locationParts[
              locationParts.length - 1
            ]
          : "";

      const data =
        await apiPut(
          "/student/profile",
          {
            fullName:
              profile.name,
            phone:
              profile.phone,
            country,
            city,
            university:
              profile.university,
            degree:
              profile.degree,
            graduationYear:
              profile.graduation
                ? Number(
                    profile.graduation
                  )
                : null,
            about:
              profile.bio,
            skills,
            cvUrl:
              cvUrl || null,
          }
        );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to save profile."
        );
      }

      setProfileCompletion(
        Number(
          data.profileCompletion ||
            0
        )
      );

      setEditing(false);

      setSuccess(
        "Profile saved successfully!"
      );

      await loadProfile();
    } catch (err) {
      setError(
        err.message ||
          "Unable to save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING SCREEN
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

            <div className="mb-4 h-8 w-64 rounded bg-slate-200" />

            <div className="mb-8 h-4 w-96 max-w-full rounded bg-slate-200" />

            <div className="grid gap-6 lg:grid-cols-[300px_1fr]">

              <div className="h-80 rounded-2xl bg-slate-200" />

              <div className="space-y-5">
                <div className="h-72 rounded-2xl bg-slate-200" />
                <div className="h-48 rounded-2xl bg-slate-200" />
                <div className="h-40 rounded-2xl bg-slate-200" />
              </div>

            </div>
          </div>
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* PAGE HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <FiUser className="text-xl text-[#2563EB]" />

              <span className="text-sm font-semibold text-[#2563EB]">
                Student Profile
              </span>

            </div>

            <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-[#64748B]">
              Keep your profile complete and internship-ready.
            </p>

          </div>

          {editing ? (

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <FiCheckCircle />

              {saving
                ? "Saving..."
                : "Save Profile"}

            </button>

          ) : (

            <button
              type="button"
              onClick={() => {
                setError("");
                setSuccess("");
                setEditing(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >

              <FiEdit3 />

              Edit Profile

            </button>

          )}

        </div>

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* MAIN GRID */}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">

          {/* LEFT PROFILE CARD */}

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            {/* PROFILE PICTURE */}

            <div className="relative mx-auto h-28 w-28">

              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-3xl font-bold text-[#2563EB]">

                {(profile.name ||
                  "Student")
                  .split(" ")
                  .map(
                    (name) =>
                      name.charAt(0)
                  )
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}

              </div>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "Profile photo upload will be connected later."
                  )
                }
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-[#2563EB] text-white shadow-md transition hover:bg-blue-700"
                title="Change profile photo"
              >
                <FiCamera className="text-sm" />
              </button>

            </div>

            {/* NAME */}

            <div className="mt-5 text-center">

              <h2 className="text-xl font-bold text-[#0F172A]">
                {profile.name ||
                  "Student"}
              </h2>

              <p className="mt-1 text-sm text-[#64748B]">
                {profile.degree ||
                  "Student"}
              </p>

            </div>

            {/* CONTACT INFORMATION */}

            <div className="mt-6 space-y-4">

              <div className="flex items-start gap-3 text-sm text-[#64748B]">

                <FiMail className="mt-0.5 shrink-0 text-[#2563EB]" />

                <span className="break-all">
                  {profile.email ||
                    "Email not available"}
                </span>

              </div>

              <div className="flex items-center gap-3 text-sm text-[#64748B]">

                <FiPhone className="shrink-0 text-[#2563EB]" />

                <span>
                  {profile.phone ||
                    "Phone not added"}
                </span>

              </div>

              <div className="flex items-start gap-3 text-sm text-[#64748B]">

                <FiMapPin className="mt-0.5 shrink-0 text-[#2563EB]" />

                <span>
                  {profile.location ||
                    "Location not added"}
                </span>

              </div>

            </div>

            {/* PROFILE COMPLETION */}

            <div className="mt-7 rounded-2xl bg-blue-50 p-4">

              <div className="flex items-center justify-between">

                <span className="text-sm font-semibold text-[#0F172A]">
                  Profile Completion
                </span>

                <span className="text-sm font-bold text-[#2563EB]">
                  {profileCompletion}%
                </span>

              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">

                <div
                  className="h-full rounded-full bg-[#2563EB] transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        profileCompletion,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-xs leading-5 text-[#64748B]">
                Complete your profile to improve your chances of getting
                shortlisted by companies.
              </p>

            </div>

          </aside>

          {/* RIGHT CONTENT */}

          <main className="space-y-6">

            {/* PERSONAL INFORMATION */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div>

                <h2 className="text-lg font-bold text-[#0F172A]">
                  Personal Information
                </h2>

                <p className="mt-1 text-sm text-[#64748B]">
                  Your basic information and contact details.
                </p>

              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* FULL NAME */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={profile.name}
                    disabled={!editing}
                    onChange={(e) =>
                      handleChange(
                        "name",
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-500"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0F172A] outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  />

                </div>

                {/* PHONE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    value={profile.phone}
                    disabled={!editing}
                    onChange={(e) =>
                      handleChange(
                        "phone",
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-500"
                  />

                </div>

                {/* LOCATION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                    Location
                  </label>

                  <input
                    type="text"
                    value={profile.location}
                    disabled={!editing}
                    onChange={(e) =>
                      handleChange(
                        "location",
                        e.target.value
                      )
                    }
                    placeholder="City, Country"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-500"
                  />

                </div>

                {/* UNIVERSITY */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                    University
                  </label>

                  <input
                    type="text"
                    value={
                      profile.university
                    }
                    disabled={!editing}
                    onChange={(e) =>
                      handleChange(
                        "university",
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-500"
                  />

                </div>

                {/* DEGREE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                    Degree
                  </label>

                  <input
                    type="text"
                    value={
                      profile.degree
                    }
                    disabled={!editing}
                    onChange={(e) =>
                      handleChange(
                        "degree",
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-500"
                  />

                </div>

                {/* GRADUATION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                    Graduation Year
                  </label>

                  <input
                    type="text"
                    value={
                      profile.graduation
                    }
                    disabled={!editing}
                    onChange={(e) =>
                      handleChange(
                        "graduation",
                        e.target.value
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-500"
                  />

                </div>

              </div>

              {/* BIO */}

              <div className="mt-5">

                <label className="mb-2 block text-sm font-semibold text-[#0F172A]">
                  About Me
                </label>

                <textarea
                  rows="5"
                  value={profile.bio}
                  disabled={!editing}
                  onChange={(e) =>
                    handleChange(
                      "bio",
                      e.target.value
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-500"
                />

              </div>

            </section>

            {/* SKILLS */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div>

                <h2 className="text-lg font-bold text-[#0F172A]">
                  Skills
                </h2>

                <p className="mt-1 text-sm text-[#64748B]">
                  Add technical skills that match the internships you want.
                </p>

              </div>

              <div className="mt-5 flex flex-wrap gap-2">

                {skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-[#2563EB]"
                    >

                      {skill}

                      {editing && (
                        <button
                          type="button"
                          onClick={() =>
                            removeSkill(
                              skill
                            )
                          }
                          className="ml-2 font-bold text-blue-400 transition hover:text-red-500"
                        >
                          ×
                        </button>
                      )}

                    </span>
                  )
                )}

                {skills.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No skills added yet.
                  </p>
                )}

              </div>

              {editing && (

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) =>
                      setNewSkill(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {

                      if (
                        e.key === "Enter"
                      ) {
                        e.preventDefault();
                        addSkill();
                      }

                    }}
                    placeholder="Enter a new skill"
                    className="h-11 flex-1 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="button"
                    onClick={addSkill}
                    className="rounded-xl bg-[#0F172A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Add Skill
                  </button>

                </div>

              )}

            </section>

            {/* CV / RESUME */}

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-start gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
                  <FiFileText className="text-xl text-[#6D5DFB]" />
                </div>

                <div>

                  <h2 className="text-lg font-bold text-[#0F172A]">
                    CV / Resume
                  </h2>

                  <p className="mt-1 text-sm text-[#64748B]">
                    Upload your latest CV so companies can review your
                    application.
                  </p>

                </div>

              </div>

              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="font-semibold text-[#0F172A]">
                      {cvName ||
                        "No CV uploaded yet"}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Accepted formats: PDF, DOC, DOCX · Maximum 5 MB
                    </p>

                  </div>

                  <label
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition ${
                      cvUploading
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563EB]"
                    }`}
                  >

                    <FiUpload />

                    {cvUploading
                      ? "Uploading..."
                      : "Upload CV"}

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={
                        handleCVUpload
                      }
                      disabled={
                        cvUploading
                      }
                      className="hidden"
                    />

                  </label>

                </div>

              </div>

              {cvError && (
                <p className="mt-3 text-sm font-medium text-red-600">
                  {cvError}
                </p>
              )}

              {cvSuccess && (
                <p className="mt-3 text-sm font-medium text-green-600">
                  {cvSuccess}
                </p>
              )}

              {cvUrl && (
                <button
                  type="button"
                  onClick={
                    handleViewCV
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >

                  <FiFileText />

                  View CV

                </button>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-[#64748B]">

                <FiCheckCircle className="text-green-600" />

                Your CV will be available to companies when you apply
                for internships.

              </div>

            </section>

          </main>

        </div>

      </div>

    </div>
  );
}

export default StudentProfile;