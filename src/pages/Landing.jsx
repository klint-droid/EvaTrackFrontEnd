import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex flex-col">
      
      {/* Emergency Alert Banner */}
      <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium animate-pulse">
        🚨 Active Alert: Typhoon Signal No. 3 in effect. Please proceed to the nearest evacuation center if in low-lying areas.
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          Disaster Readiness & Response
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mb-10">
          Find safe shelter instantly. Our real-time portal tracks evacuation center capacities, locations, and available services for you and your family.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/portal"
            className="px-8 py-4 bg-white text-blue-900 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-transform hover:scale-105 text-center"
          >
            Find Evacuation Centers 
          </Link>
          <Link 
            to="/login"
            className="px-8 py-4 bg-blue-700 text-white font-bold rounded-full border border-blue-500 shadow-lg hover:bg-blue-600 transition-transform hover:scale-105 text-center"
          >
            Responder Login 
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">





      </div>
    </div>
  );
};

export default Landing;