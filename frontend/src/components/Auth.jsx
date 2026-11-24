
import { useState } from "react";

const API_URL = "http://localhost:5000/api/auth";

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    const endpoint = isLogin ? "login" : "register";

    const body = isLogin
      ? { email, password }
      : { username, email, password };

    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          "Server returned a non-JSON response. Check that the backend is running."
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      setSuccess(data.message);

      // Send the logged-in user details to App.jsx
      onAuthSuccess(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setPassword("");
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-teal-50 to-slate-100 p-6">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-100 bg-white p-7 shadow-xl sm:p-9">

        <div className="text-lg font-extrabold text-teal-700">ChatWave</div>

        <h2 className="mt-5 text-2xl font-bold text-slate-900">
          {isLogin ? "Welcome Back!" : "Create Your Account"}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {isLogin
            ? "Log in to continue chatting with your friends."
            : "Join ChatWave and start connecting."}
        </p>

        <form className="mt-6" onSubmit={handleSubmit}>

          {!isLogin && (
            <div className="mb-4">
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                minLength={3}
                maxLength={30}
                required
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
              className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm text-emerald-600">{success}</p>}

          <button
            type="submit"
            className="mt-2 h-11 w-full rounded-lg bg-teal-700 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Log In"
                : "Create Account"}
          </button>

        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          {isLogin
            ? "Don't have an account?"
            : "Already have an account?"}

          <button type="button" className="ml-1 font-bold text-teal-700" onClick={switchMode}>
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>

      </div>
    </div>
  );
}

export default Auth;
