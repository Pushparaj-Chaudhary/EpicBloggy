import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const { navigate, token, setToken, user, setUser } = useAppContext();

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex justify-between items-center py-4 px-4 sm:px-12">
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-1 cursor-pointer shrink-0"
      >
        <img src={assets.logo} className="w-8 sm:w-11" />

        <span className="text-lg sm:text-3xl font-bold text-black">
          EpicBloggy
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {token && user ? (
          <>
            {user.role === 'admin' && (
              <button
                onClick={() => navigate("/admin")}
                className="hidden text-white bg-black/80 hover:bg-black sm:block text-xs sm:text-sm font-medium cursor-pointer rounded-full px-3 sm:px-8 py-1.5 sm:py-2 whitespace-nowrap"
              >
                Dashboard
              </button>
            )}
            {user.role !== 'admin' && (
              <button
                onClick={() => navigate("/submit-blog")}
                className="flex items-center gap-2 rounded-full text-xs sm:text-sm cursor-pointer bg-black/80 text-white px-3 sm:px-8 py-1.5 sm:py-2 whitespace-nowrap hover:bg-black"
              >
                Create Blog
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full text-xs sm:text-sm cursor-pointer bg-red-600 text-white px-3 sm:px-8 py-1.5 sm:py-2 whitespace-nowrap hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 rounded-full text-xs sm:text-sm cursor-pointer bg-black text-white px-4 sm:px-10 py-2 sm:py-2.5 whitespace-nowrap"
          >
            Login / Register
            <img src={assets.arrow} className="w-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
