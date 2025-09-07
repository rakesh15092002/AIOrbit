import { Protect, useClerk, useUser } from "@clerk/clerk-react";
import React from "react";
// Importing icons from lucide-react
import {
  Eraser,
  FileText,
  Hash,
  House,
  Scissors,
  SquarePen,
  Image,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

// List of sidebar navigation items (route, label, and icon)
const navItems = [
  { to: "/ai", label: "Dashboard", Icon: House },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Remove Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: Scissors },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  // Getting current user info (profile image, name, etc.)
  const { user } = useUser();
  // Clerk functions for sign out and opening user profile
  const { signOut, openUserProfile } = useClerk();

  return (
    <div
      // Sidebar container
      className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center 
      max-sm:absolute top-14 bottom-0 
      ${sidebar ? "translate-x-0" : "max-sm:translate-x-full"} 
      transition-all duration-200 ease-in-out`}
    >
      <div className="my-7 w-full">
        {/* User profile image */}
        <img
          src={user.imageUrl}
          alt="User avatar"
          className="w-13 rounded-full mx-auto"
        />

        {/* User full name */}
        <h1 className="mt-1 text-center">{user.fullName}</h1>

        {/* Navigation links */}
        <div className="px-6 mt-5 text-sm text-gray-600 font-medium">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to} // Unique key for each nav item
              to={to} // Route path
              end={to === "/ai"} // "end" ensures only exact /ai matches
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded 
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white"
                    : ""
                }`
              }
              // Close sidebar on mobile when link is clicked
              onClick={() => setSidebar(false)}
            >
              {/* Icon + Label */}
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center cursor-pointer">
          <img src={user.imageUrl} className="w-8 rounded-full " alt="" />
          <div>
            <h1 className="text-sm font-medium">{user.fullName}</h1>
            <p className="text-xs text-gray-500">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
              plan
            </p>
          </div>
        </div>
        <LogOut
          onClick={signOut}
          className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Sidebar;
