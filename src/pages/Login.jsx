import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
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

      console.log(res.data);

      // Save user
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");

    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  };

  return (
HEAD
    <div>
      <h2 className="text-3xl font-semibold text-green-600">Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md">
        
        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Login
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
c91e08ed080e83d737d23e2bdb6618441fd6c121

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

 HEAD
        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setPassword(e.target.value)}
        />
=======
          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
>>>>>>> c91e08ed080e83d737d23e2bdb6618441fd6c121

          {/* Button */}
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