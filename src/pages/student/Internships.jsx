import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiBookmark,
} from "react-icons/fi";

import { apiGet } from "../../utils/api";

function Internships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const loadInternships = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (country.trim()) {
        params.append("country", country.trim());
      }

      if (city.trim()) {
        params.append("city", city.trim());
      }

      if (workMode) {
        params.append("workMode", workMode);
      }

      if (categoryId) {
        params.append("categoryId", categoryId);
      }

      const query = params.toString();

      const data = await apiGet(
        `/student/internships${
          query ? `?${query}` : ""
        }`
      );

      setInternships(
        data.internships || []
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to load internships."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternships();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    loadInternships();
  };

  const clearFilters = () => {
    setSearch("");
    setCountry("");
    setCity("");
    setWorkMode("");
    setCategoryId("");

    setTimeout(() => {
      loadInternships();
    }, 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Find Internships
          </h1>

          <p className="mt-2 text-slate-500">
            Discover opportunities and start
            building your career.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <form
            onSubmit={handleSearch}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-5"
          >
            {/* Search */}
            <div className="relative lg:col-span-2">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search internships..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Country */}
            <input
              type="text"
              value={country}
              onChange={(event) =>
                setCountry(event.target.value)
              }
              placeholder="Country"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {/* City */}
            <input
              type="text"
              value={city}
              onChange={(event) =>
                setCity(event.target.value)
              }
              placeholder="City"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            {/* Work Mode */}
            <select
              value={workMode}
              onChange={(event) =>
                setWorkMode(event.target.value)
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                All Work Modes
              </option>

              <option value="REMOTE">
                Remote
              </option>

              <option value="ONSITE">
                On-site
              </option>

              <option value="HYBRID">
                Hybrid
              </option>
            </select>

            {/* Category */}
            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                All Categories
              </option>

              <option value="1">
                Computer Science
              </option>

              <option value="2">
                Information Technology
              </option>

              <option value="3">
                Software Engineering
              </option>

              <option value="4">
                Cyber Security
              </option>

              <option value="5">
                AI & Machine Learning
              </option>

              <option value="6">
                Marketing
              </option>

              <option value="7">
                Design
              </option>

              <option value="8">
                Data Science
              </option>
            </select>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {loading
                ? "Loading..."
                : "Search"}
            </button>

            {/* Clear */}
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading internships...
            </p>
          </div>
        ) : internships.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">
              No internships found
            </h2>

            <p className="mt-2 text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Result Count */}
            <div className="mb-5">
              <p className="text-sm font-medium text-slate-500">
                {internships.length} internship
                {internships.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

            {/* Internship Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {internships.map((internship) => (
                <div
                  key={internship.id}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">

                    <div>
                      <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {internship.category_name ||
                          "Internship"}
                      </span>

                      <h2 className="mt-3 text-xl font-bold text-slate-900">
                        {internship.title}
                      </h2>

                      <p className="mt-1 font-medium text-slate-600">
                        {internship.company_name}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                      title="Save internship"
                    >
                      <FiBookmark size={20} />
                    </button>
                  </div>

                  <p className="mb-5 line-clamp-3 text-sm leading-6 text-slate-500">
                    {internship.description}
                  </p>

                  <div className="mb-5 space-y-3 text-sm text-slate-600">

                    <div className="flex items-center gap-2">
                      <FiMapPin className="text-blue-600" />

                      <span>
                        {internship.city
                          ? `${internship.city}, `
                          : ""}
                        {internship.country ||
                          "Location not specified"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiClock className="text-purple-600" />

                      <span>
                        {internship.duration ||
                          "Duration not specified"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiDollarSign className="text-green-600" />

                      <span>
                        {internship.payment_type ===
                        "PAID"
                          ? `${internship.stipend || 0} stipend`
                          : "Unpaid"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap gap-2">
                    {(
                      internship.skills || []
                    ).map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-5">

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      {internship.work_mode ||
                        "Flexible"}
                    </span>

                    <Link
                      to={`/student/internships/${internship.id}`}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Internships;