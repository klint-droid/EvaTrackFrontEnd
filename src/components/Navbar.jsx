import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold text-xl mr-3">
              E
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              EVA<span className="text-blue-600">TRACK</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex space-x-1 sm:space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPath === '/' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            <Link
              to="/portal"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPath === '/portal' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              Live Map
            </Link>
            <Link
              to="/login"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 border border-transparent hover:bg-gray-50 transition-colors"
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