import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);

  const imgRef = useRef(null);

  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, img }) => {
      try {
        const res = await fetch("/api/posts/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text, img }),
        });
        const data = await res.json();
        if (data.success === false) {
          throw new Error(data.message || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setText("");
      setImg(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({ text, img });
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImg(reader.result);
      };
    }
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={authUser.user.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea bg-[#101010] w-full pt-1 text-lg resize-none border-none focus:outline-none  border-gray-900"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                imgRef.current.value = null;
              }}
            />
            <img
              src={img}
              className="w-full mx-auto h-72 object-contain rounded"
            />
          </div>
        )}

        <div className="flex justify-between  py-2">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-secondary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-yellow-400 w-5 h-5 cursor-pointer" />
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button
            disabled={isPending}
            className="btn btn-primary rounded-full btn-sm text-white px-4"
          >
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && <div className="text-red-600 text-sm">{error.message}</div>}
      </form>
    </div>
  );
};
export default CreatePost;
