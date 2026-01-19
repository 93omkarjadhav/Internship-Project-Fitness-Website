import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/SideBar";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 relative">
      
      {/* Hamburger Icon (Open) */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="absolute top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed top-0 left-0 h-full z-50 bg-white shadow-2xl transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:w-64`}
      >
        {/* FIX: Changed from a standard div to 'absolute'. 
           This ensures the button floats on top and doesn't push the sidebar down.
        */}
        <div className="absolute top-4 right-4 z-[60] md:hidden">
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            <X size={22} className="text-gray-700" />
          </button>
        </div>

        {/* Now the Sidebar can take up the full height starting from the very top */}
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-10">
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Welcome to Your Dashboard ⚡
        </h1>
        <p className="text-gray-600 max-w-xl">
          Manage your profile, settings, and activities from here.  
          Click the hamburger icon to toggle your sidebar menu.
        </p>
      </main>
    </div>
  );
}