import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { apiPost, API_BASE_URL } from "../utils/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  |--------------------------------------------------------------------------
  | SOCIAL LOGIN
  |--------------------------------------------------------------------------
  */

  const handleSocialLogin = (provider) => {
    setError("");
    setSocialLoading(provider);

    const params = new URLSearchParams({
      mode: "login",
    });

    window.location.href =
      `${API_BASE_URL}/auth/${provider}?${params.toString()}`;
  };

  /*
  |--------------------------------------------------------------------------
  | EMAIL / PASSWORD LOGIN
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !formData.email.trim() ||
      !formData.password
    ) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);

      const data = await apiPost(
        "/auth/login",
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      if (!data.success || !data.token) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      if (data.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      const role =
        data.user?.role ||
        data.role;

      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "COMPANY") {
        navigate("/company");
      } else {
        navigate("/student");
      }
    } catch (loginError) {
      setError(
        loginError.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            to="/"
            className="flex items-center gap-3"
          >

            <img
              src="/internshiphub-logo.svg"
              alt="InternShipHub"
              className="h-11 w-11 rounded-xl object-contain"
            />

            <div>

              <div className="text-xl font-extrabold tracking-tight text-slate-900">
                InternShip
                <span className="text-blue-600">
                  Hub
                </span>
              </div>

              <p className="hidden text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:block">
                Opportunities Without Borders
              </p>

            </div>

          </Link>

          <Link
            to="/"
            className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            ← Back to Home
          </Link>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-10">

        <div className="w-full max-w-md">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">

            {/* =================================================
                LOGIN CONTENT
            ================================================== */}

            <div className="p-7 sm:p-9">

              {/* Logo */}

              <div className="mb-7 text-center">

                <img
                  src="/internshiphub-logo.svg"
                  alt="InternShipHub logo"
                  className="mx-auto mb-4 h-16 w-16 object-contain"
                />

                <h1 className="text-3xl font-extrabold text-slate-900">
                  Welcome Back
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  Login to your InternShipHub account
                </p>

              </div>

              {/* Error */}

              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {error}
                </div>
              )}

              {/* =================================================
                  GOOGLE / APPLE
              ================================================== */}

              <div className="grid gap-3 sm:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    handleSocialLogin("google")
                  }
                  disabled={
                    loading ||
                    socialLoading !== ""
                  }
                  className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {socialLoading === "google" ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                  ) : (
                    <FcGoogle className="text-xl" />
                  )}

                  {socialLoading === "google"
                    ? "Connecting..."
                    : "Google"}

                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleSocialLogin("apple")
                  }
                  disabled={
                    loading ||
                    socialLoading !== ""
                  }
                  className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {socialLoading === "apple" ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  ) : (
                    <FaApple className="text-xl text-black" />
                  )}

                  {socialLoading === "apple"
                    ? "Connecting..."
                    : "Apple"}

                </button>

              </div>

              {/* Divider */}

              <div className="my-7 flex items-center gap-4">

                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  or continue with email
                </span>

                <div className="h-px flex-1 bg-slate-200" />

              </div>

              {/* =================================================
                  EMAIL LOGIN
              ================================================== */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                <div>

                  <label
                    htmlFor="login-email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={
                      loading ||
                      socialLoading !== ""
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                </div>

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="login-password"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>

                  </div>

                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={
                      loading ||
                      socialLoading !== ""
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    socialLoading !== ""
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3.5 font-bold text-white shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading
                    ? "Logging in..."
                    : "Login"}

                </button>

              </form>

              {/* Create account */}

              <div className="mt-7 text-center text-sm text-slate-600">

                Don't have an account?{" "}

                <Link
                  to="/signup"
                  className="font-bold text-blue-600 transition hover:text-purple-600"
                >
                  Create Account
                </Link>

              </div>

            </div>

          </div>

          {/* Footer */}

          <p className="mt-5 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} InternShipHub.
            Opportunities Without Borders.
          </p>

        </div>

      </main>

    </div>
  );
}

export default Login;