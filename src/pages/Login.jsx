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

      await API.post("/login", {
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
    <div>
      <h2 className="text-3xl font-semibold text-green-600">Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />

        <button type="submit">Login</button>
      </form>
    </div>

    
    
  );
}

export default Login;