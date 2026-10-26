import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaEye, FaEyeSlash } from "react-icons/fa";

function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
    agree: false,
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nameIsMissing =
      role === "student"
        ? !formData.fullName
        : !formData.companyName;

    if (
      nameIsMissing ||
      !formData.email ||
      !formData.password
    ) {
      alert("Please complete all required fields.");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (!formData.agree) {
      alert("Please accept the Terms and Privacy Policy.");
      return;
    }

    if (role === "student") {
      navigate("/student");
    } else {
      navigate("/company");
    }
  };

  const handleSocialSignup = (provider) => {
    alert(
      `${provider} Sign-Up will be connected with authentication later.`
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Header */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link to="/" className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] text-xl text-white shadow-md">
              🎓
            </div>

            <div>

              <div className="text-xl font-extrabold text-[#0F172A]">
                InternShip
                <span className="text-[#2563EB]">Hub</span>
              </div>

              <p className="hidden text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:block">
                Opportunities Without Borders
              </p>

            </div>

          </Link>

          <Link
            to="/"
            className="text-sm font-semibold text-slate-600 transition hover:text-[#2563EB]"
          >
            ← Back to Home
          </Link>

        </div>

      </header>

      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5 py-12">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl lg:grid-cols-2">

          {/* Information */}

          <div className="hidden bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] p-12 text-white lg:flex lg:flex-col lg:justify-between">

            <div>

              <div className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                🚀 Start Your Journey
              </div>

              <h1 className="mt-8 text-4xl font-extrabold leading-tight">
                Build opportunities without borders.
              </h1>

              <p className="mt-5 leading-7 text-blue-100">
                Join InternShip Hub to discover internships, connect with
                global talent and build professional experience.
              </p>

            </div>

            <div className="space-y-4">

              <div className="rounded-2xl bg-white/10 p-4">
                🎓 Students — Find verified internships
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                🏢 Companies — Discover talented students
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                🛡️ Admin-approved opportunities
              </div>

            </div>

          </div>

          {/* Signup */}

          <div className="p-6 sm:p-10 lg:p-12">

            <p className="text-sm font-bold uppercase tracking-wider text-[#2563EB]">
              Join InternShip Hub
            </p>

            <h2 className="mt-2 text-3xl font-extrabold text-[#0F172A]">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              First select the type of account you want to create.
            </p>

            {/* Role */}

            <div className="my-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">

              <button
                type="button"
                onClick={() => setRole("student")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  role === "student"
                    ? "bg-white text-[#2563EB] shadow-sm"
                    : "text-slate-500"
                }`}
              >
                🎓 I'm a Student
              </button>

              <button
                type="button"
                onClick={() => setRole("company")}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  role === "company"
                    ? "bg-white text-[#2563EB] shadow-sm"
                    : "text-slate-500"
                }`}
              >
                🏢 I'm a Company
              </button>

            </div>

            {/* Social */}

            <div className="grid gap-3 sm:grid-cols-2">

              <button
                type="button"
                onClick={() => handleSocialSignup("Google")}
                className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FcGoogle className="text-xl" />
                Google
              </button>

              <button
                type="button"
                onClick={() => handleSocialSignup("Apple")}
                className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FaApple className="text-xl" />
                Apple
              </button>

            </div>

            <div className="my-6 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs uppercase text-slate-400">
                or
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* Form */}

            <form onSubmit={handleSubmit} className="space-y-4">

              {role === "student" ? (

                <div>

                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              ) : (

                <div>

                  <label
                    htmlFor="companyName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Company Name
                  </label>

                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                  />

                </div>

              )}

              <div>

                <label
                  htmlFor="signupEmail"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="signupEmail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                />

              </div>

              <div>

                <label
                  htmlFor="signupPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="signupPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>

                </div>

              </div>

              <label className="flex items-start gap-3 text-sm text-slate-500">

                <input
                  name="agree"
                  type="checkbox"
                  checked={formData.agree}
                  onChange={handleChange}
                  className="mt-1"
                />

                <span>
                  I agree to the Terms of Service and Privacy Policy.
                </span>

              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#2563EB] px-5 py-3.5 font-bold text-white shadow-md transition hover:bg-blue-700"
              >
                Create {role === "student" ? "Student" : "Company"} Account
              </button>

            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-[#2563EB]"
              >
                Login
              </Link>
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Signup;