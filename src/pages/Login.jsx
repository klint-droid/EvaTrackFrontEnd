import back from "../assets/back.jpg";
import bg from "../assets/background.png.jpg";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await API.get("/sanctum/csrf-cookie");

      await API.post("/api/login", {
        email,
        password,
      });

      alert("Login successful!");

      const res = await API.get("/api/user");
      localStorage.setItem("user", JSON.stringify(res.data));

      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
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

      </div>
    </div>
  );
}

export default Login;