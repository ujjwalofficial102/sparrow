import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import BirdSvg from "../../../components/svgs/BirdSvg.jsx";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullname: "",
    password: "",
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    mutate: signupMutation,
    isError,
    isPending,
    error,
  } = useMutation({
    mutationFn: async ({ email, username, fullname, password }) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, fullname, password }),
        });
        const data = await res.json();
        if (data.success === false)
          throw new Error(data.message || "Failed to Create Account");

        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signupMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <BirdSvg className=" lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between mb-8 gap-2">
            <BirdSvg className="w-12 lg:hidden fill-white" />

            <div className="text-4xl font-extrabold text-slate-50 tracking-widest">
              SPARROW
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white">Join today.</h1>
          <label
            className="input input-bordered rounded flex items-center gap-2 focus-within:outline-none focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-1 focus-within:ring-offset-base-100
"
          >
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1 focus-within:outline-none focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-1 focus-within:ring-offset-base-100">
              <FaUser />
              <input
                type="text"
                className="grow"
                placeholder="Username"
                name="username"
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>
            <label className="input input-bordered rounded flex items-center gap-2 flex-1 focus-within:outline-none focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-1 focus-within:ring-offset-base-100">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                placeholder="Full Name"
                name="fullname"
                onChange={handleInputChange}
                value={formData.fullname}
              />
            </label>
          </div>
          <label className="input input-bordered rounded flex items-center gap-2 focus-within:outline-none focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-1 focus-within:ring-offset-base-100">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            {isPending ? "Loading..." : "Sign up"}
          </button>
          {isError && (
            <p className="text-red-600 text-center text-sm">{error.message}</p>
          )}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">Already have an account?</p>
          <Link to="/login">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full ">
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SignUpPage;
