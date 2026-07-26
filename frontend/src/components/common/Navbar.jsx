import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  HiMenu,
  HiX,
  HiShoppingCart,
  HiBell,
  HiSearch,
  HiChatAlt2,
  HiMenuAlt2,
} from "react-icons/hi";
import useAuthStore from "../../store/authStore";
import useUiStore from "../../store/uiStore";
import useCartStore from "../../store/cartStore";
import { apiGet } from "../../services/api";
import { signOut } from "../../firebase/auth";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";

import toast from "react-hot-toast";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated } = useAuthStore();
  const { setSidebarOpen } = useUiStore();
  const itemCount = useCartStore((s) => s.items.length);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/admin");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileOpen]);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const res = await apiGet("/notifications/unread-count");
          setUnreadCount(res.data?.count || 0);
        } catch (error) {
          console.error("Failed to fetch unread count", error);
        }
      };
      fetchUnreadCount();

      // Optional: poll every minute for new notifications
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await signOut();
    toast.success("You've been logged out successfully.");
    navigate("/");
  };

  const navLinks = [
    { label: "Marketplace", to: "/products" },
    { label: "Request Product", to: "/request-product" },
    { label: "Features", to: "/about" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "glass-nav shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "bg-white/95 backdrop-blur-sm border-b border-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Mobile Sidebar Toggle */}
          <div className="flex items-center">
            {isAuthenticated && isDashboardRoute && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 mr-1 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-[10px] transition-all"
              >
                <HiMenuAlt2 className="w-5 h-5" />
              </button>
            )}
            <Link
              to="/"
              className="flex items-center hover:opacity-90 transition-opacity"
            >
              <img src="/streamkart-logo-nav.png" alt="StreamKart" className="h-12 md:h-14 scale-[2.0] origin-left w-auto object-contain drop-shadow-sm ml-2" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-[13px] font-medium rounded-[10px] transition-all duration-200 ${
                    isActive
                      ? "text-[#5B4BFF] bg-[#5B4BFF]/5"
                      : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-1.5">
            {isAuthenticated ? (
              <>
                {user?.role === "user" && (
                  <Link
                    to="/dashboard/apply-seller"
                    className="hidden sm:flex items-center text-[13px] font-semibold text-[#5B4BFF] hover:text-[#4F3FE8] bg-[#5B4BFF]/[0.06] hover:bg-[#5B4BFF]/[0.1] px-4 py-2 rounded-full transition-all duration-200 mr-1"
                  >
                    Become a Seller
                  </Link>
                )}
                <button
                  onClick={() => navigate("/search")}
                  className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-[10px] transition-all duration-200 hidden sm:flex items-center justify-center"
                >
                  <HiSearch className="w-[18px] h-[18px]" />
                </button>
                <Link
                  to="/wishlist"
                  className="relative p-2 text-[#94A3B8] hover:text-pink-500 hover:bg-pink-50 rounded-[10px] transition-all duration-200 hidden sm:flex items-center justify-center"
                >
                  <svg
                    className="w-[18px] h-[18px]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </Link>
                <Link
                  to="/notifications"
                  className="relative p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-[10px] transition-all duration-200 flex items-center justify-center"
                >
                  <HiBell className="w-[18px] h-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#EF4444] ring-2 ring-white animate-pulse" />
                  )}
                </Link>
                <Link
                  to="/dashboard/chats"
                  className="relative p-2 text-[#94A3B8] hover:text-[#5B4BFF] hover:bg-[#5B4BFF]/5 rounded-[10px] transition-all duration-200 flex items-center justify-center"
                  title="Chats"
                >
                  <HiChatAlt2 className="w-[18px] h-[18px]" />
                </Link>
                <Link
                  to="/cart"
                  className="relative p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-[10px] transition-all duration-200 flex items-center justify-center"
                >
                  <HiShoppingCart className="w-[18px] h-[18px]" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0 -right-0 h-[18px] min-w-[18px] px-1 rounded-full bg-[#5B4BFF] text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <div className="relative ml-1" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity p-0.5 rounded-full"
                  >
                    <Avatar src={user?.avatar} name={user?.name} size="sm" />
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E2E8F0] rounded-[16px] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.12)] py-1.5 animate-slideDown overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#F1F5F9]">
                        <p
                          className="text-[#0F172A] text-sm font-semibold truncate"
                          title={user?.name}
                        >
                          {user?.name}
                        </p>
                        <p
                          className="text-[#94A3B8] text-xs truncate mt-0.5"
                          title={user?.email}
                        >
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors font-medium"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors font-medium"
                        >
                          Profile
                        </Link>
                        <Link
                          to="/dashboard/my-requests"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors font-medium"
                        >
                          My Requests
                        </Link>
                        {(user?.role === "seller" ||
                          user?.role === "admin") && (
                          <Link
                            to="/seller"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors font-medium"
                          >
                            Seller Panel
                          </Link>
                        )}
                        {user?.role === "admin" && (
                          <Link
                            to="/admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors font-medium"
                          >
                            Admin Panel
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-[#F1F5F9] pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#FEF2F2] transition-colors font-medium"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard/apply-seller"
                  className="hidden sm:block text-[13px] font-semibold text-[#5B4BFF] hover:text-[#4F3FE8] mr-2 transition-colors"
                >
                  Become a Seller
                </Link>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-[10px] transition-all ml-1"
            >
              {mobileOpen ? (
                <HiX className="w-5 h-5" />
              ) : (
                <HiMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-[#F1F5F9] animate-slideDown">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 px-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-[10px] transition-all font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
