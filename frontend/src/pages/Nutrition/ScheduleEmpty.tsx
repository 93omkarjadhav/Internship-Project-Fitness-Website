// // src/pages/ScheduleEmpty.tsx

// import {
//   IoChevronBack, IoNotificationsOutline, IoAdd
// } from 'react-icons/io5';
// import { Link } from 'react-router-dom';
// import { useState } from 'react';

// // ▼▼▼ IMPORT YOUR ILLUSTRATIONS ▼▼▼
// import emptyScheduleIllustration from '../assets/empty-schedule.png';
// import bellIcon from '../assets/bell-icon.png';

// // This is the main page component (using default export)
// export default function ScheduleEmptyPage() {
//   return (
//     // This simple container will fill the responsive "frame" from App.tsx
//     <div className="bg-white min-h-screen">
//       <PageHeader />
//       <DateSelector />
      
//       {/* This is the content with the CORRECT order */}
//       <div className="flex flex-col items-center text-center px-8 pt-16 lg:pt-24">
//         <img 
//           src={emptyScheduleIllustration} 
//           alt="You haven't eaten anything"
//           className="w-full max-w-[300px] h-auto"
//         />
        
//         {/* ▼▼▼ CORRECT ORDER ▼▼▼ */}

//         {/* 1. Button */}
//         <Link 
//           to="/add-meal" 
//           className="mt-8 flex items-center justify-center gap-2 w-full max-w-xs px-4 py-3.5 rounded-full text-base font-semibold bg-blue-600 text-white"
//         >
//           <IoAdd className="w-5 h-5" /> Add Meal
//         </Link>

//         {/* 2. Main Text */}
//         <h2 className="text-2xl font-semibold text-gray-900 mt-6">
//           You haven't eaten anything 
//           <h2> today </h2>
//         </h2>
        
//         {/* 3. Sub-text */}
//         <p className="text-base text-gray-600 mt-2 max-w-xs">
//           Let's log your first meal today and get insights.
//         </p>

//       </div>

//     </div>
//   );
// }

// // --- Page Header Component ---
// function PageHeader() {
//   return (
//     <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
//       <Link to="/schedule">
//         <IoChevronBack className="w-6 h-6 text-gray-800" />
//       </Link>
//       <h1 className="text-lg font-semibold text-gray-900">Nutrition Schedule</h1>
//       <button className="p-2 -mr-2 hover:bg-gray-100 rounded-lg">
//         <img src={bellIcon} alt="Notifications" className="w-6 h-6" />
//       </button>
//     </header>
//   );
// }

// // --- Date Selector Component ---
// function DateSelector() {
//   const [selectedDate, setSelectedDate] = useState("21"); // Set "T 21" to active
//   const weekDays = [
//     { day: "M", date: 20 },
//     { day: "T", date: 21 },
//     { day: "W", date: 22 },
//     { day: "T", date: 23 },
//     { day: "F", date: 24 },
//     { day: "S", date: 25 },
//     { day: "S", date: 26 },
//   ];

//   return (
//     <div className="sticky top-[61px] z-10 bg-white border-b border-gray-200 p-4">
//       <div className="flex gap-2 overflow-x-auto">
//         {weekDays.map((day) => (
//           <button
//             key={day.date}
//             onClick={() => setSelectedDate(day.date.toString())}
//             className={`flex flex-col items-center justify-center w-11 h-11 rounded-full border flex-shrink-0
//               ${
//                 selectedDate === day.date.toString()
//                   ? "bg-blue-600 text-white border-blue-600"
//                   : "bg-white text-gray-900 border-gray-200"
//               }`}
//           >
//             <span className="text-xs font-medium">{day.day}</span>
//             <span className="text-sm font-semibold">{day.date}</span>
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }


// src/pages/ScheduleEmpty.tsx

import {
    IoChevronBack, IoAdd
  } from 'react-icons/io5';
  import { Link } from 'react-router-dom';
  import { useState } from 'react';
  
  import emptyScheduleIllustration from '../assets/empty-schedule.png';
  import bellIcon from '/icons/bell-icon.png';
  
  export default function ScheduleEmpty() {
    return (
      <div className=" min-h-screen rounded-2xl -mt-10 w-full flex flex-col items-center justify-center p-4 md:p-4">
        <div className="bg-gray-50 md:rounded-2xl md:shadow-lg p-0  w-full md:max-w-4xl flex flex-col">
          <PageHeader />
          <DateSelector />
  
          <div className="flex flex-col items-center text-center px-8 pt-16 lg:pt-24 w-full">
            <img
              src={emptyScheduleIllustration}
              alt="You haven't eaten anything"
              className="w-full max-w-[300px] h-auto"
            />
  
            {/* Add Meal Button */}
            <Link
              to="/add-meal"
              className="mt-8 w-full max-w-sm h-[56px] flex items-center justify-center gap-3 bg-[#2563EB] text-white text-[17px] font-semibold rounded-[16px] shadow-[0px_6px_18px_rgba(37,99,235,0.35)]"
            >
              <span>Add Meal</span>
              <IoAdd className="w-6 h-6" />
            </Link>
  
            {/* Main Title */}
            <h2 className="text-2xl font-semibold text-gray-900 mt-6 leading-tight">
              You haven't eaten anything today.
            </h2>
  
            {/* Sub Text */}
            <p className="text-base text-gray-600 mt-2 mb-5 max-w-xs">
              Let's log your first meal today and get insights.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  function PageHeader() {
    return (
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link to="/schedule">
          <IoChevronBack className="w-6 h-6 text-gray-800" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">Nutrition Schedule</h1>
        <button className="p-2 -mr-2 hover:bg-gray-100 rounded-lg">
          <img src={bellIcon} alt="Notifications" className="w-6 h-6" />
        </button>
      </header>
    );
  }
  
  function DateSelector() {
    const [selectedDate, setSelectedDate] = useState("21");
    const weekDays = [
      { day: "M", date: 20 },
      { day: "T", date: 21 },
      { day: "W", date: 22 },
      { day: "T", date: 23 },
      { day: "F", date: 24 },
      { day: "S", date: 25 },
      { day: "S", date: 26 },
      { day: "M", date: 27 },
      { day: "T", date: 28 },
      { day: "W", date: 29 },
      { day: "T", date: 30 },
      { day: "F", date: 31 },
      { day: "S", date: 1 },
      { day: "S", date: 2 },
      { day: "M", date: 3 },
    ];
  
    return (
      <div className="sticky bg-white top-[61px] z-10  p-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {weekDays.map((day) => (
            <button
              key={day.date}
              onClick={() => setSelectedDate(day.date.toString())}
              className={`flex flex-col items-center justify-center rounded-full border w-11 h-14 flex-shrink-0
                ${selectedDate === day.date.toString()
                  ? "bg-blue-50  border-blue-500"
                  : " border-gray-300 text-gray-900"
                }`}
            >
              <span className="text-[10px] font-medium">{day.day}</span>
              <span className="text-[14px] font-semibold">{day.date}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
  