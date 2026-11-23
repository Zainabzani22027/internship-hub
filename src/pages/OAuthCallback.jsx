import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet } from "../utils/api";

function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] =
    useSearchParams();

  const [message, setMessage] =
    useState(
      "Completing authentication..."
    );

  useEffect(() => {
    const completeAuthentication =
      async () => {
        const token =
          searchParams.get("token");

        const error =
          searchParams.get("error");

        if (error) {
          setMessage(
            error
          );

          setTimeout(() => {
            navigate("/login");
          }, 2500);

          return;
        }

        if (!token) {
          setMessage(
            "Authentication failed. Please try again."
          );

          setTimeout(() => {
            navigate("/login");
          }, 2500);

          return;
        }

        try {
          localStorage.setItem(
            "token",
            token
          );

          const data =
            await apiGet("/auth/me");

          if (
            !data.success ||
            !data.user
          ) {
            throw new Error(
              "Unable to load your account."
            );
          }

          localStorage.setItem(
            "user",
            JSON.stringify(
              data.user
            )
          );

          const role =
            data.user.role;

          if (role === "ADMIN") {
            navigate("/admin", {
              replace: true,
            });
          } else if (
            role === "COMPANY"
          ) {
            navigate("/company", {
              replace: true,
            });
          } else {
            navigate("/student", {
              replace: true,
            });
          }
        } catch (authError) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setMessage(
            authError.message ||
              "Authentication failed."
          );

          setTimeout(() => {
            navigate("/login");
          }, 2500);
        }
      };

    completeAuthentication();
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl">

        <img
          src="/internshiphub-logo.svg"
          alt="InternShipHub"
          className="mx-auto h-16 w-16"
        />

        <h1 className="mt-6 text-2xl font-extrabold text-slate-900">
          InternShipHub
        </h1>

        <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="mt-5 text-sm text-slate-500">
          {message}
        </p>

      </div>
    </div>
  );
}

export default OAuthCallback;