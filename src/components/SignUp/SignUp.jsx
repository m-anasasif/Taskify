import React, { useState } from "react";
import "./SignUp.css";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // for redirection
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const SignUp = () => {
  const [login, setLogin] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (login) {
      // --- LOGIN LOGIC ---
      if (data.email === "admin@gmail.com" && data.password === "admin123") {
        toast.success("Welcome Admin!");
        navigate("/admin-dashboard");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            email: data.email,
            password: data.password,
          }
        );

        toast.success("Login Successful!");
        console.log("User:", response.data.user);
        localStorage.setItem("userToken", response.data.token);
        reset();

        // Redirect to user dashboard
        navigate("/user-dashboard");
      } catch (err) {
        console.error("Login error:", err.response?.data || err.message);
        toast.error("User not found! Please sign up first.");
      }
    } else {
      // --- SIGNUP LOGIC ---

      if (data.email === "admin@gmail.com") {
        toast.error("Email Aready taken");
        setLogin(true);
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/signup",
          {
            ...data,
            role: "user",
          }
        );

        toast.success("Signup Successful! Please login now.");
        console.log("Server response:", response.data);
        reset();
        setLogin(true); // Switch to login view after signup
      } catch (err) {
        console.error("Signup failed:", err.response?.data || err.message);
        toast.error(
          "Signup Failed: " + (err.response?.data?.error || "Server Error")
        );
      }
    }
  };

  return (
    <>
    <h1 className="page-title">Taskify</h1>
    <div className="signup-container">
      <h2>{login ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {!login && (
          <>
            <label>Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <p className="error">{errors.name.message}</p>}
          </>
        )}

        <label>Email</label>
        <input
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              message: "Enter a valid email address",
            },
          })}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}

        <label>Password</label>
        <input
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters",
            },
          })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}

        <button type="submit">{login ? "Submit" : "Create Account"}</button>

        <p className="switch-form">
          {login ? "Don't have an account" : "Already have an account"}
          <span onClick={() => setLogin(!login)}>
            {login ? " Sign Up" : " Login here"}
          </span>
        </p>
      </form>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    </>
  );
};

export default SignUp;