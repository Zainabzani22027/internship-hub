import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  Users,
  Eye,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  LockKeyhole,
} from "lucide-react";
import { apiDelete, apiGet, apiPut } from "../../utils/api";

const FILTERS = ["All", "Pending", "Approved", "Rejected", "Closed"];

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function getInternshipStatus(internship) {
  const internshipStatus = String(internship.internship_status || "").toUpperCase();
  const approvalStatus = String(internship.approval_status || "").toUpperCase();

  if (internshipStatus === "CLOSED") return "Closed";
  if (approvalStatus === "REJECTED") return "Rejected";
  if (approvalStatus === "APPROVED" && internshipStatus === "LIVE") return "Approved";
  if (approvalStatus === "PENDING") return "Pending";
  return "Draft";
}

function ManageInternships() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadInternships = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiGet("/internships/company");
      const list = response?.internships || [];
      setInternships(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Unable to load internships.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInternships();
  }, [loadInternships]);

  const getStatusStyle = (status) => ({
    Approved: "bg-green-50 text-green-700",
    Closed: "bg-slate-100 text-slate-700",
    Rejected: "bg-red-50 text-red-700",
    Pending: "bg-amber-50 text-amber-700",
    Draft: "bg-blue-50 text-blue-700",
  }[status] || "bg-slate-100 text-slate-700");

  const getLocation = (internship) =>
    [internship.city, internship.country].filter(Boolean).join(", ") || "Location not specified";

  const filterCounts = useMemo(() => {
    const counts = { All: internships.length, Pending: 0, Approved: 0, Rejected: 0, Closed: 0 };
    internships.forEach((internship) => {
      const status = getInternshipStatus(internship);
      if (Object.prototype.hasOwnProperty.call(counts, status)) counts[status] += 1;
    });
    return counts;
  }, [internships]);

  const filteredInternships = useMemo(() => {
    if (activeFilter === "All") return internships;
    return internships.filter((internship) => getInternshipStatus(internship) === activeFilter);
  }, [activeFilter, internships]);

  const handleClose = async (internship) => {
    if (!window.confirm(`Close "${internship.title}"? Existing applications will remain saved.`)) return;
    try {
      setBusyId(internship.id);
      setError("");
      setNotice("");
      const response = await apiPut(`/internships/${internship.id}/close`, {});
      setNotice(response.message || "Internship closed successfully.");
      await loadInternships();
    } catch (err) {
      setError(err.message || "Unable to close internship.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (internship) => {
    if (!window.confirm(`Permanently delete "${internship.title}"? This cannot be undone.`)) return;
    try {
      setBusyId(internship.id);
      setError("");
      setNotice("");
      const response = await apiDelete(`/internships/${internship.id}`);
      setNotice(response.message || "Internship deleted successfully.");
      await loadInternships();
    } catch (err) {
      setError(err.message || "Unable to delete internship.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/company")}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600"
            >
              <ArrowLeft size={17} /> Dashboard
            </button>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Manage Internships</h1>
            <p className="mt-1 text-sm text-slate-500">View your posting history and manage each internship.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/company/post-internship")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={18} /> Post Internship
          </button>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">{notice}</div>}

        <div className="mb-6 flex flex-wrap gap-2" aria-label="Filter internships by status">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              aria-pressed={activeFilter === filter}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {filter} <span className={activeFilter === filter ? "ml-1 text-blue-100" : "ml-1 text-slate-400"}>{filterCounts[filter]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">Loading internships...</div>
        ) : internships.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <BriefcaseBusiness size={42} className="mx-auto text-slate-300" />
            <h2 className="mt-4 text-lg font-bold text-slate-800">No internships yet</h2>
            <p className="mt-2 text-sm text-slate-500">Your internship postings will appear here after you submit them.</p>
            <button
              type="button"
              onClick={() => navigate("/company/post-internship")}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create your first internship
            </button>
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <BriefcaseBusiness size={36} className="mx-auto text-slate-300" />
            <h2 className="mt-3 font-bold text-slate-800">No {activeFilter.toLowerCase()} internships</h2>
            <p className="mt-1 text-sm text-slate-500">Try another status filter to view your other postings.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInternships.map((internship) => {
              const status = getInternshipStatus(internship);
              const applications = Number(internship.application_count || 0);
              const closed = status === "Closed";
              const working = busyId === internship.id;

              return (
                <article key={internship.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-slate-900">{internship.title}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(status)}`}>{status}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{internship.category_name || "Uncategorized"}</p>
                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />Posted: {formatDate(internship.created_at)}</span>
                        <span className="inline-flex items-center gap-1.5"><MapPin size={15} />{getLocation(internship)}</span>
                        <span className="inline-flex items-center gap-1.5"><Users size={15} />{applications} application{applications === 1 ? "" : "s"}</span>
                        <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} />Deadline: {formatDate(internship.deadline)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button type="button" disabled={working} onClick={() => navigate(`/company/internships/${internship.id}`)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                        <Eye size={16} /> View Details
                      </button>
                      {!closed && (
                        <button type="button" disabled={working} onClick={() => navigate(`/company/internships/${internship.id}/edit`)} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50">
                          <Pencil size={16} /> Edit
                        </button>
                      )}
                      {!closed && status === "Approved" && (
                        <button type="button" disabled={working} onClick={() => handleClose(internship)} className="inline-flex items-center gap-2 rounded-lg border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 disabled:opacity-50">
                          <LockKeyhole size={16} /> {working ? "Please wait" : "Close"}
                        </button>
                      )}
                      {applications === 0 && (
                        <button type="button" disabled={working} onClick={() => handleDelete(internship)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                          <Trash2 size={16} /> {working ? "Please wait" : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={loadInternships} disabled={loading} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 disabled:opacity-50">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageInternships;
