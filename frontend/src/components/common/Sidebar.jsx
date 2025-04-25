import BirdSvg from "../svgs/BirdSvg.jsx";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useState } from "react";
import { CiMenuBurger } from "react-icons/ci"; // Menu icon

const Sidebar = () => {
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { mutate: logoutMutation } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
        });
        const data = await res.json();
        if (data.success === false) {
          throw new Error(data.message);
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  const authUser = queryClient.getQueryData(["authUser"]);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-zinc-900 rounded-full"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
      >
        <CiMenuBurger className="w-6 h-6 text-white" />
      </button>
      <div className="md:flex-[2_2_0]   max-w-52 flex items-start">
        <div
          className={`fixed top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-64 bg-[#101010] z-40 transition-transform duration-300 transform
  ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  } md:translate-x-0 md:static md:flex`}
        >
          <Link
            to="/"
            className="flex justify-center md:justify-start items-center gap-1"
          >
            <BirdSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-zinc-900" />
            <span className="text-xl font-bold hidden md:block ">Sparrow</span>
          </Link>
          <ul className="flex flex-col gap-3 mt-4 ">
            <li className="flex  md:justify-start">
              <Link
                to="/"
                onClick={handleLinkClick}
                className="flex gap-3 items-center hover:bg-zinc-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
              >
                <MdHomeFilled className="w-6 h-6" />
                <span className="text-lg block">Home</span>
              </Link>
            </li>
            <li className="flex  md:justify-start">
              <Link
                to="/notifications"
                onClick={handleLinkClick}
                className="flex gap-3 items-center hover:bg-zinc-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
              >
                <IoNotifications className="w-6 h-6" />
                <span className="text-lg block">Notifications</span>
              </Link>
            </li>

            <li className="flex  md:justify-start">
              <Link
                to={`/profile/${authUser.user?.username}`}
                onClick={handleLinkClick}
                className="flex gap-3 items-center hover:bg-zinc-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
              >
                <FaUser className="w-6 h-6" />
                <span className="text-lg block">Profile</span>
              </Link>
            </li>
          </ul>
          {authUser.user && (
            <Link
              to={`/profile/${authUser.user.username}`}
              className="mt-auto mb-10 flex gap-2  items-center transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full"
            >
              <div className="avatar inline-flex">
                <div className="w-8 rounded-full ">
                  <img
                    src={authUser.user?.profileImg || "/avatar-placeholder.png"}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center flex-1">
                <div className="block">
                  <p className="text-white font-bold text-sm w-20 truncate">
                    {authUser.user?.fullname}
                  </p>
                  <p className="text-slate-500 text-sm">
                    @{authUser.user?.username}
                  </p>
                </div>
                <BiLogOut
                  className="w-5 h-5 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    logoutMutation();
                  }}
                  title="Logout"
                />
              </div>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
export default Sidebar;
