import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBan,
  FaCheckCircle,
  FaEdit,
  FaSearch,
  FaTrash,
  FaUserGraduate,
  FaUsers,
} from "react-icons/fa";
import { apiGet, apiPut } from "../../utils/api";

function ManageStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");

  const [editingStudent, setEditingStudent] =
    useState(null);

  const [editLoading, setEditLoading] =
    useState(false);

  const [editError, setEditError] =
    useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD STUDENTS
  |--------------------------------------------------------------------------
  */

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiGet(
        "/admin/students"
      );

      const studentList =
        response?.students ||
        response?.data ||
        response?.users ||
        [];

      setStudents(
        Array.isArray(studentList)
          ? studentList
          : []
      );
    } catch (err) {
      console.error(
        "Load students error:",
        err
      );

      setError(
        err.message ||
          "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STUDENT HELPERS
  |--------------------------------------------------------------------------
  */

  const getStudentName = (student) => {
    return (
      student?.name ||
      student?.full_name ||
      student?.fullName ||
      student?.student_name ||
      student?.studentName ||
      "Student"
    );
  };

  const getStudentEmail = (student) => {
    return (
      student?.email ||
      "No email"
    );
  };

  const getStudentField = (student) => {
    return (
      student?.field ||
      student?.degree ||
      student?.program ||
      student?.department ||
      student?.category ||
      "Not specified"
    );
  };

  const getStudentStatus = (student) => {
    const status = String(
      student?.status ||
        student?.account_status ||
        student?.accountStatus ||
        ""
    ).toUpperCase();

    if (
      status === "BLOCKED" ||
      status === "INACTIVE" ||
      status === "SUSPENDED" ||
      student?.is_active === false ||
      student?.isActive === false
    ) {
      return "Blocked";
    }

    return "Active";
  };

  const getJoinedDate = (student) => {
    const date =
      student?.created_at ||
      student?.createdAt ||
      student?.joined_at ||
      student?.joinedAt;

    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(date);
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | BLOCK / UNBLOCK STUDENT
  |--------------------------------------------------------------------------
  */

  const toggleStatus = async (student) => {
    const currentStatus =
      getStudentStatus(student);

    const newIsActive =
      currentStatus !== "Active";

    try {
      setActionLoading(
        student.id
      );

      setError("");

      const response =
        await apiPut(
          `/admin/users/${student.id}/status`,
          {
            isActive:
              newIsActive,
          }
        );

      const updatedUser =
        response?.user;

      setStudents(
        (currentStudents) =>
          currentStudents.map(
            (item) =>
              item.id === student.id
                ? {
                    ...item,

                    ...(updatedUser ||
                      {}),

                    is_active:
                      newIsActive,

                    isActive:
                      newIsActive,

                    status:
                      newIsActive
                        ? "ACTIVE"
                        : "BLOCKED",

                    account_status:
                      newIsActive
                        ? "ACTIVE"
                        : "BLOCKED",
                  }
                : item
          )
      );
    } catch (err) {
      console.error(
        "Update student status error:",
        err
      );

      setError(
        err.message ||
          "Unable to update student status."
      );
    } finally {
      setActionLoading(
        null
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | OPEN EDIT MODAL
  |--------------------------------------------------------------------------
  */

  const openEditStudent = (
    student
  ) => {
    setEditingStudent({
      id: student.id,

      fullName:
        student?.full_name ||
        student?.fullName ||
        student?.name ||
        "",

      email:
        student?.email ||
        "",

      phone:
        student?.phone ||
        "",

      country:
        student?.country ||
        "",

      city:
        student?.city ||
        "",

      university:
        student?.university ||
        "",

      degree:
        student?.degree ||
        "",

      graduationYear:
        student?.graduation_year ||
        student?.graduationYear ||
        "",

      about:
        student?.about ||
        "",

      skills:
        Array.isArray(
          student?.skills
        )
          ? student.skills.join(
              ", "
            )
          : student?.skills ||
            "",
    });

    setEditError("");
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE STUDENT
  |--------------------------------------------------------------------------
  */

  const saveStudent = async () => {
    if (!editingStudent) {
      return;
    }

    if (
      !editingStudent.fullName.trim() ||
      !editingStudent.email.trim()
    ) {
      setEditError(
        "Full name and email are required."
      );

      return;
    }

    try {
      setEditLoading(true);
      setEditError("");

      const response =
        await apiPut(
          `/admin/students/${editingStudent.id}`,
          {
            fullName:
              editingStudent.fullName,

            email:
              editingStudent.email,

            phone:
              editingStudent.phone,

            country:
              editingStudent.country,

            city:
              editingStudent.city,

            university:
              editingStudent.university,

            degree:
              editingStudent.degree,

            graduationYear:
              editingStudent.graduationYear,

            about:
              editingStudent.about,

            skills:
              editingStudent.skills,
          }
        );

      const updatedStudent =
        response?.student;

      if (updatedStudent) {
        setStudents(
          (currentStudents) =>
            currentStudents.map(
              (student) =>
                student.id ===
                editingStudent.id
                  ? {
                      ...student,
                      ...updatedStudent,
                    }
                  : student
            )
        );
      } else {
        await loadStudents();
      }

      setEditingStudent(null);
    } catch (err) {
      console.error(
        "Update student error:",
        err
      );

      setEditError(
        err.message ||
          "Unable to update student."
      );
    } finally {
      setEditLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  const deleteStudent = () => {
    window.alert(
      "Student deletion is not available yet. You can Block or Unblock the student instead."
    );
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER
  |--------------------------------------------------------------------------
  */

  const filteredStudents =
    students.filter(
      (student) => {
        const search =
          searchTerm.toLowerCase();

        const name =
          getStudentName(
            student
          ).toLowerCase();

        const email =
          getStudentEmail(
            student
          ).toLowerCase();

        const field =
          getStudentField(
            student
          ).toLowerCase();

        return (
          name.includes(search) ||
          email.includes(search) ||
          field.includes(search)
        );
      }
    );

  /*
  |--------------------------------------------------------------------------
  | STATISTICS
  |--------------------------------------------------------------------------
  */

  const activeStudents =
    students.filter(
      (student) =>
        getStudentStatus(
          student
        ) === "Active"
    ).length;

  const blockedStudents =
    students.filter(
      (student) =>
        getStudentStatus(
          student
        ) === "Blocked"
    ).length;

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

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
              Manage Students
            </h1>

            <p className="mt-2 text-slate-500">
              View, manage and control registered student accounts.
            </p>

          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-[#2563EB]">
            <FaUserGraduate />
          </div>

        </div>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}

        <div className="mb-8 grid gap-4 sm:grid-cols-3">

          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>

                <p className="mt-2 text-3xl font-extrabold text-[#0F172A]">
                  {loading
                    ? "..."
                    : students.length}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-[#2563EB]">
                <FaUsers />
              </div>

            </div>

          </div>

          {/* Active */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Active Students
                </p>

                <p className="mt-2 text-3xl font-extrabold text-green-600">
                  {loading
                    ? "..."
                    : activeStudents}
                </p>

              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-green-600">
                <FaCheckCircle />
              </div>

            </div>

          </div>

          {/* Blocked */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  Blocked Students
                </p>

                <p className="mt-2 text-3xl font-extrabold text-red-600">
                  {loading
                    ? "..."
                    : blockedStudents}
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
              placeholder="Search student by name, email or field..."
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

        {/* Students Table */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Registered Students
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage student accounts and their platform access.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50">

                <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">

                  <th className="px-6 py-4">
                    Student
                  </th>

                  <th className="px-6 py-4">
                    Field
                  </th>

                  <th className="px-6 py-4">
                    Joined
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
                      colSpan="5"
                      className="px-6 py-12 text-center"
                    >

                      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563EB]" />

                      <p className="mt-4 text-sm font-semibold text-slate-600">
                        Loading students...
                      </p>

                    </td>

                  </tr>
                ) : filteredStudents.length > 0 ? (

                  filteredStudents.map(
                    (student) => {

                      const studentName =
                        getStudentName(
                          student
                        );

                      const studentStatus =
                        getStudentStatus(
                          student
                        );

                      const isActionLoading =
                        actionLoading ===
                        student.id;

                      return (
                        <tr
                          key={
                            student.id
                          }
                          className="transition hover:bg-slate-50"
                        >

                          {/* Student */}

                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] font-bold text-white">
                                {studentName
                                  .charAt(
                                    0
                                  )
                                  .toUpperCase()}
                              </div>

                              <div>

                                <p className="font-bold text-[#0F172A]">
                                  {
                                    studentName
                                  }
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                  {
                                    getStudentEmail(
                                      student
                                    )
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Field */}

                          <td className="px-6 py-5">

                            <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-[#2563EB]">
                              {
                                getStudentField(
                                  student
                                )
                              }
                            </span>

                          </td>

                          {/* Joined */}

                          <td className="px-6 py-5 text-sm text-slate-500">
                            {
                              getJoinedDate(
                                student
                              )
                            }
                          </td>

                          {/* Status */}

                          <td className="px-6 py-5">

                            <span
                              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                                studentStatus ===
                                "Active"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >

                              <span
                                className={`h-2 w-2 rounded-full ${
                                  studentStatus ===
                                  "Active"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                                }`}
                              />

                              {
                                studentStatus
                              }

                            </span>

                          </td>

                          {/* Actions */}

                          <td className="px-6 py-5">

                            <div className="flex justify-end gap-2">

                              {/* Block / Unblock */}

                              <button
                                type="button"
                                onClick={() =>
                                  toggleStatus(
                                    student
                                  )
                                }
                                disabled={
                                  isActionLoading
                                }
                                title={
                                  studentStatus ===
                                  "Active"
                                    ? "Block Student"
                                    : "Unblock Student"
                                }
                                className={`flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${
                                  studentStatus ===
                                  "Active"
                                    ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                    : "bg-green-50 text-green-600 hover:bg-green-100"
                                }`}
                              >

                                {isActionLoading ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : studentStatus ===
                                  "Active" ? (
                                  <FaBan />
                                ) : (
                                  <FaCheckCircle />
                                )}

                              </button>

                              {/* Edit */}

                              <button
                                type="button"
                                title="Edit Student"
                                onClick={() =>
                                  openEditStudent(
                                    student
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] transition hover:bg-blue-100"
                              >
                                <FaEdit />
                              </button>

                              {/* Delete */}

                              <button
                                type="button"
                                onClick={() =>
                                  deleteStudent(
                                    student.id
                                  )
                                }
                                title="Delete Student"
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
                      colSpan="5"
                      className="px-6 py-12 text-center"
                    >

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
                        <FaSearch />
                      </div>

                      <p className="mt-4 font-bold text-[#0F172A]">
                        No students found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {searchTerm
                          ? "Try searching with a different name, email or field."
                          : "No student accounts are available yet."}
                      </p>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================================
          EDIT STUDENT MODAL
      ====================================================== */}

      {editingStudent && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">

              <div>

                <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
                  ADMIN MANAGEMENT
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-[#0F172A]">
                  Edit Student
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update student account and profile information.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingStudent(
                    null
                  )
                }
                disabled={
                  editLoading
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl font-bold text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>

            </div>

            {/* Modal Body */}

            <div className="space-y-6 p-6">

              {editError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {editError}
                </div>
              )}

              {/* Account Information */}

              <div>

                <h3 className="mb-4 text-lg font-extrabold text-[#0F172A]">
                  Account Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={
                        editingStudent.fullName
                      }
                      onChange={(
                        event
                      ) =>
                        setEditingStudent(
                          {
                            ...editingStudent,
                            fullName:
                              event.target.value,
                          }
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={
                        editingStudent.email
                      }
                      onChange={(
                        event
                      ) =>
                        setEditingStudent(
                          {
                            ...editingStudent,
                            email:
                              event.target.value,
                          }
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>

              </div>

              {/* Contact Information */}

              <div>

                <h3 className="mb-4 text-lg font-extrabold text-[#0F172A]">
                  Contact Information
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Phone
                    </label>

                    <input
                      type="text"
                      value={
                        editingStudent.phone
                      }
                      onChange={(
                        event
                      ) =>
                        setEditingStudent(
                          {
                            ...editingStudent,
                            phone:
                              event.target.value,
                          }
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Country
                    </label>

                    <input
                      type="text"
                      value={
                        editingStudent.country
                      }
                      onChange={(
                        event
                      ) =>
                        setEditingStudent(
                          {
                            ...editingStudent,
                            country:
                              event.target.value,
                          }
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      City
                    </label>

                    <input
                      type="text"
                      value={
                        editingStudent.city
                      }
                      onChange={(
                        event
                      ) =>
                        setEditingStudent(
                          {
                            ...editingStudent,
                            city:
                              event.target.value,
                          }
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      University
                    </label>

                    <input
                      type="text"
                      value={
                        editingStudent.university
                      }
                      onChange={(
                        event
                      ) =>
                        setEditingStudent(
                          {
                            ...editingStudent,
                            university:
                              event.target.value,
                          }
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>

              </div>

              {/* Education */}

              <div>

                <h3 className="mb-4 text-lg font-extrabold text-[#0F172A]">
                  Education
                </h3>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Degree / Program
                    </label>

                    <input
                      type="text"
                      value={
                        editingStudent.degree
                      }
                      onChange={(
                        event
                      ) =>
                        setEditingStudent(
                          {
                            ...editingStudent,
                            degree:
                              event.target.value,
                          }
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Graduation Year
                    </label>

                    <input
                      type="number"
                      value={
                        editingStudent.graduationYear
                      }
                      onChange={(
                        event
                      ) =>
                        setEditingStudent(
                          {
                            ...editingStudent,
                            graduationYear:
                              event.target.value,
                          }
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />

                  </div>

                </div>

              </div>

              {/* About */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  About
                </label>

                <textarea
                  rows="4"
                  value={
                    editingStudent.about
                  }
                  onChange={(
                    event
                  ) =>
                    setEditingStudent(
                      {
                        ...editingStudent,
                        about:
                          event.target.value,
                      }
                    )
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* Skills */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Skills
                </label>

                <input
                  type="text"
                  placeholder="C++, Java, React, SQL"
                  value={
                    editingStudent.skills
                  }
                  onChange={(
                    event
                  ) =>
                    setEditingStudent(
                      {
                        ...editingStudent,
                        skills:
                          event.target.value,
                      }
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Separate multiple skills with commas.
                </p>

              </div>

            </div>

            {/* Modal Footer */}

            <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white px-6 py-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setEditingStudent(
                    null
                  )
                }
                disabled={
                  editLoading
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveStudent
                }
                disabled={
                  editLoading ||
                  !editingStudent.fullName.trim() ||
                  !editingStudent.email.trim()
                }
                className="rounded-xl bg-gradient-to-r from-[#2563EB] to-[#6D5DFB] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >

                {editLoading ? (
                  <span className="flex items-center justify-center gap-2">

                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    Saving...

                  </span>
                ) : (
                  "Save Changes"
                )}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default ManageStudents;