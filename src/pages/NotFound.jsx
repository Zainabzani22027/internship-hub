function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-[#2563EB]">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-bold text-[#0F172A]">
          Page Not Found
        </h2>

        <p className="mt-2 text-slate-500">
          The page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}

export default NotFound;