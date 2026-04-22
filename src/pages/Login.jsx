import back from "../assets/back.jpg";
import bg from "../assets/background.png.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const [userId, setUserId] = useState(""); 
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await API.get("/sanctum/csrf-cookie");

      const response = await API.post("/api/login", {
        user_id: userId,
        password,
      });

      alert("Login successful!");

      const res = await API.get("/api/user");
      localStorage.setItem("user", JSON.stringify(res.data));
 
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert("Login successful!");
      navigate("/dashboard");

      navigate("/dashboard");
    } catch (err) {
      alert("Invalid user ID or password");
      console.error(err);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
      }}
      className="relative"
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* MAIN CONTENT */}
      <div className="relative flex items-center justify-center min-h-screen px-4">
        
        <div className="w-full max-w-5xl h-[550px] bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
          
          {/* LEFT SIDE - FORM */}
          <div className="p-12 flex flex-col justify-between h-full bg-gradient-to-br from-blue-50 to-blue-100">
            
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-500 mb-8">
                Sign in to your account
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                
                <input
                  type="email"
                  placeholder="Email Address"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />

                <input
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />

                <div className="text-right">
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Sign In
                </button>
              </form>
            </div>

            {/* Bottom spacing for balance */}
            <div></div>
          </div>

          {/* RIGHT SIDE - IMAGE */}
           <div className="hidden md:flex items-center justify-center h-full relative overflow-hidden bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200">

            {/* Floating blobs */}
            <div className="absolute w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-30 top-10 left-10"></div>
            <div className="absolute w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-30 bottom-10 right-10"></div>

            <img
              src={back}
              alt="Login Illustration"
               className="relative max-w-[75%] object-contain drop-shadow-2xl"
            />
          </div>

        </div>

    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md">

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">

          {/* USER ID */}
          <input
            type="text"
            placeholder="User ID (e.g. SUP-2026-XXXXXX)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;