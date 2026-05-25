import { Link, useLocation } from "react-router-dom";
import evaTrackLogo from "../assets/evatrack_logo_horizontal.svg";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="bg-black border-b border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-12 items-center">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center cursor-pointer">
            <img
              src={evaTrackLogo}
              alt="EvaTrack logo"
              className="h-10 w-40 object-contain"
            />
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-1 sm:space-x-5">
            <Link
              to="/"
              className={`px-2 py-2 text-xs font-semibold transition-colors ${
                currentPath === '/' 
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/portal"
              className={`px-2 py-2 text-xs font-medium transition-colors ${
                currentPath === '/portal' 
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Live Map
            </Link>
            <Link
              to="/login"
              className="px-2 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
            >
              Login
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
