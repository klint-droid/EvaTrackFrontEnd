import { Link, useLocation } from "react-router-dom";
import { LogIn, Home, Radio } from "lucide-react";
import Logo from "../assets/evatrack_logo_horizontal.svg";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/portal", label: "Live Map", icon: Radio },
    { to: "/login", label: "Responder Login", icon: LogIn },
  ];

  return (
    <nav className="bg-[#0B1120] border-b border-white/[0.06] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex justify-between h-14 items-center">

          {/* Logo / Brand */}
          <Link to="/" className="flex items-center group hover:opacity-90 transition-opacity">
            <img src={Logo} alt="EvaTrack Logo" className="h-12 w-auto" />
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon size={14} strokeWidth={2} />
                  <span className="hidden sm:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
