import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    handleScroll(); // Check on mount
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Marketplace", path: "/marketplace" },
    { name: "Talent", path: "/talent" },
    { name: "Teams", path: "/team-hub" },
    { name: "Community", path: "/community" },
    ...(user ? [
      { name: "Messages", path: "/messages" },
      { name: "Profile", path: `/profile/${user.username || 'dhruv'}` },
    ] : []),
  ];

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto",
        scrolled 
          ? "bg-gray-950/80 backdrop-blur-xl border-b border-white/5 py-4 shadow-2xl" 
          : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group" aria-label="HUSTLR Home">
          {/* Minimalist Geometric Mark */}
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg dark bg-gradient-to-b from-white/10 to-white/0 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.03)] overflow-hidden">
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
             <div className="w-2.5 h-2.5 bg-white rounded-[2px] group-hover:rotate-90 group-hover:scale-75 transition-all duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] box-border" />
          </div>
          <span className="text-white font-display font-semibold tracking-tight text-lg group-hover:text-white/90 transition-colors">
            HUSTLR
          </span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "text-[13px] font-medium transition-all duration-200 tracking-wide",
                  isActive
                    ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                    : "text-gray-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-5">
          {user ? (
            <>
              <Link 
                to="/dashboard"
                className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <div className="w-px h-4 bg-white/15" />
              <button
                onClick={logout}
                className="text-[13px] font-medium text-gray-400 hover:text-white cursor-pointer transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login"
                className="text-[13px] font-medium text-gray-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <div className="w-px h-4 bg-white/15" />
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center h-8 px-5 rounded-full overflow-hidden transition-all active:scale-95 border border-white/10 bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <span className="relative text-[13px] font-medium tracking-wide">Get Started</span>
              </Link>
            </>
          )}
        </div>


        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-950/95 backdrop-blur-2xl border-b border-white/5 p-4 flex flex-col shadow-2xl">
          <div className="flex flex-col gap-1 pb-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "px-4 py-3 md:text-sm text-base font-medium rounded-xl transition-colors",
                    isActive ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="h-px bg-white/5 my-2" />
          <div className="flex flex-col gap-3 px-4 pt-2 pb-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="text-center font-medium text-gray-400 hover:text-white py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center h-12 rounded-full bg-white text-black font-medium transition-all active:scale-95 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center font-medium text-gray-400 hover:text-white py-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center h-12 rounded-full bg-white text-black font-medium transition-all active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
