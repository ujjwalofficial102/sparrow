import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const NotificationPage = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notification"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success === false) {
          throw new Error(data.message || "Something went wrong");
        }
        return data.notifications;
      } catch (error) {
        throw new Error(error.message);
      }
    },
  });

  const { mutate: deleteNotifications, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/notifications", {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success === false) {
          throw new Error(data.message);
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["notification"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold ml-10">Notifications</p>
          <div className="dropdown dropdown-left">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-4 transition-all duration-300 ease-in-out"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-screen items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {!isLoading && notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {!isLoading &&
          notifications?.map((notification) => (
            <div className="border-b border-gray-700" key={notification._id}>
              <div className="flex gap-2 p-4">
                {notification.type === "follow" && (
                  <FaUser className="w-7 h-7 text-primary" />
                )}
                {notification.type === "like" && (
                  <FaHeart className="w-7 h-7 text-red-500" />
                )}
                <Link to={`/profile/${notification.from.username}`}>
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img
                        src={
                          notification.from.profileImg ||
                          "/avatar-placeholder.png"
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <span className="font-bold">
                      @{notification.from.username}
                    </span>{" "}
                    {notification.type === "follow"
                      ? "followed you"
                      : "liked your post"}
                  </div>
                </Link>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};
export default NotificationPage;
