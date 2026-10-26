import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* NAVBAR */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-2xl font-extrabold">
            InternShip<span className="text-[#2563EB]">Hub</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              to="/"
              className="font-medium text-[#2563EB]"
            >
              Home
            </Link>

            <Link
              to="/about"
              className="font-medium text-slate-600 transition hover:text-[#2563EB]"
            >
              About
            </Link>

            <Link
              to="/login"
              className="font-medium text-slate-600 transition hover:text-[#2563EB]"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-lg bg-[#2563EB] px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <main>
        <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563EB]">
                Opportunities Without Borders
              </div>

              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Find the Right
                <span className="block text-[#2563EB]">
                  Internship Opportunity
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                InternShipHub connects students with companies offering
                internship opportunities from around the world. Discover,
                apply, and build your professional future.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="rounded-lg bg-[#2563EB] px-7 py-3.5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  Get Started
                </Link>

                <Link
                  to="/login"
                  className="rounded-lg border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:border-[#2563EB] hover:text-[#2563EB]"
                >
                  Login
                </Link>
              </div>
            </div>

            {/* HERO CARD */}
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-[#2563EB] to-[#6D5DFB] p-1 shadow-xl">
                <div className="rounded-[22px] bg-white p-8">
                  <h2 className="text-2xl font-bold">
                    Your Career Starts Here
                  </h2>

                  <p className="mt-3 text-slate-600">
                    Explore internships, connect with organizations, and gain
                    real-world experience.
                  </p>

                  <div className="mt-8 space-y-4">
                    <div className="rounded-xl bg-blue-50 p-4">
                      <h3 className="font-bold text-[#2563EB]">
                        🎓 For Students
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Find internships and apply to opportunities that match
                        your skills.
                      </p>
                    </div>

                    <div className="rounded-xl bg-purple-50 p-4">
                      <h3 className="font-bold text-[#6D5DFB]">
                        🏢 For Companies
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        Discover motivated students and manage internship
                        opportunities easily.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold">
                Everything You Need in One Platform
              </h2>

              <p className="mx-auto mt-3 max-w-2xl text-slate-600">
                InternShipHub makes the internship journey simple for both
                students and organizations.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="text-3xl">🔎</div>
                <h3 className="mt-4 text-xl font-bold">
                  Discover Opportunities
                </h3>
                <p className="mt-2 text-slate-600">
                  Search internships based on your field, skills, location,
                  and interests.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="text-3xl">🚀</div>
                <h3 className="mt-4 text-xl font-bold">
                  Apply Easily
                </h3>
                <p className="mt-2 text-slate-600">
                  Apply to suitable internships and keep track of your
                  applications.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="text-3xl">🏆</div>
                <h3 className="mt-4 text-xl font-bold">
                  Build Your Future
                </h3>
                <p className="mt-2 text-slate-600">
                  Gain practical experience and receive internship
                  certificates.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-[#0F172A] py-8 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-lg font-bold">
            InternShip<span className="text-blue-400">Hub</span>
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Opportunities Without Borders.
          </p>

          <p className="mt-4 text-xs text-slate-500">
            © 2026 InternShipHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;