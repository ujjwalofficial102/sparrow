import { useState } from "react";
import { Link } from "react-router-dom";

import BirdSvg from "../../../components/svgs/BirdSvg.jsx";

import { MdOutlineMail } from "react-icons/md";
import { MdPassword } from "react-icons/md";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const queryClient = useQueryClient();

  const {
    mutate: loginMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (data.success == false) {
          throw new Error(data.message);
        }
        console.log(data);
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
    loginMutation(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <BirdSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="w-full flex justify-between flex-wrap">
            <BirdSvg className="w-12 lg:hidden fill-white" />
            <h1 className="text-4xl font-extrabold text-white">
              {"Let's"} go.
            </h1>
          </div>
          <label className="input input-bordered rounded flex items-center gap-2 focus-within:outline-none focus-within:border-primary focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-1 focus-within:ring-offset-base-100">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

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
            {isPending ? "Loading..." : "Login"}
          </button>
          {isError && (
            <p className="text-red-600 text-sm text-center">{error.message}</p>
          )}
        </form>
        <div className="flex flex-col lg:w-2/3 gap-2 mt-4">
          <p className="text-white text-lg">{"Don't"} have an account?</p>
          <Link to="/signup">
            <button className="btn rounded-full btn-primary text-white btn-outline w-full">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
