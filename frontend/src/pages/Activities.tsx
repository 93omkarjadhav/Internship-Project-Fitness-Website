import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const Activities = () => {
  const activities = [
    {
      id: 1,
      title: "Strength Training",
      description: "Build muscle and increase strength with weight training exercises",
      img: "/strength-img.png",
      color: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      id: 2,
      title: "Cardio",
      description: "Improve cardiovascular health with running, cycling, and aerobic exercises",
      img: "/cardio.png",
      color: "from-red-500 to-red-600",
      iconBg: "bg-red-50",
    },
    {
      id: 3,
      title: "Yoga",
      description: "Enhance flexibility, balance, and mental wellness through yoga practice",
      img: "/yoga.png",
      color: "from-purple-500 to-purple-600",
      iconBg: "bg-purple-50",
    },
    {
      id: 4,
      title: "Calisthenics",
      description: "Bodyweight exercises for strength, flexibility, and coordination",
      img: "/fitness_calesthenics.jpeg",
      color: "from-green-500 to-green-600",
      iconBg: "bg-green-50",
    },
    {
      id: 5,
      title: "Kick Boxing",
      description: "High-intensity martial arts training for fitness and self-defense",
      img: "/kick.png",
      color: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-50",
    },
    {
      id: 6,
      title: "Zumba",
      description: "Dance fitness program combining Latin and international music",
      img: "/zumba.png",
      color: "from-pink-500 to-pink-600",
      iconBg: "bg-pink-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-20">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <Link to="/welcome" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">All Activities</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="px-6 py-6">
        <div className="mb-4">
          <p className="text-gray-600 text-sm">
            Explore different activities to track your fitness journey
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              to={`/wellness/${activity.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 p-5">
                {/* Activity Image/Icon */}
                <div className={`${activity.iconBg} w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <img
                    src={activity.img}
                    alt={activity.title}
                    className="w-14 h-14 object-contain"
                  />
                </div>

                {/* Activity Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {activity.description}
                  </p>
                </div>

                {/* Arrow Icon */}
                <div className="flex-shrink-0">
                  <div className={`bg-gradient-to-br ${activity.color} w-10 h-10 rounded-full flex items-center justify-center`}>
                    <img
                      src="/chevron-right.png"
                      alt="arrow"
                      className="w-5 h-5 filter brightness-0 invert"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Ready to Get Started?</h3>
          <p className="text-sm opacity-90 mb-4">
            Choose an activity and start tracking your progress today
          </p>
          <Link
            to="/welcome"
            className="inline-block bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Activities;

