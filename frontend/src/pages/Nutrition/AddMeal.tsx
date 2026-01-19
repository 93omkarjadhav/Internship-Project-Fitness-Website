import { IoChevronBack, IoAdd } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import addMealIllustration from '../assets/add-meal-image.png';

export default function AddMeal() {
  return (
    <div className="mt-20 w-full flex flex-col items-center justify-center p-0 md:p-4">
      <div className=" md:rounded-2xl md:shadow-lg p-0  w-[600px] md:max-w-4xl flex flex-col">

      <PageHeader />

      <div className="flex flex-col items-center text-center px-8 pt-16 lg:pt-24">
        <img 
          src={addMealIllustration} 
          alt="Log your meal"
          className="w-full max-w-[250px] h-auto"
        />
        
        <h2 className="text-2xl font-semibold text-gray-900 mt-6">
          Log your meal & <span>nutrition</span>
        </h2>
        
        <p className="text-base text-gray-600 mt-2 max-w-xs">
          Please select how you'd like to log your meal
        </p>

        <Link 
          to="/add-meal-manually"
          className="
            mt-8 flex items-center justify-center
            w-full max-w-xs mb-5
            px-4 py-3.5 
            rounded-[12px] 
            text-base font-semibold 
            bg-blue-600 text-white
            shadow-[0px_4px_12px_rgba(30,64,175,0.35)]
          "
        >
           Add manually<IoAdd className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
    </div>
  );
}

function PageHeader() {
  return (
    <header className="sticky top-0 z-10 bg-white  px-4 py-3 flex items-center justify-between">
      <Link to="/schedule">
        <IoChevronBack className="w-6 h-6 text-gray-800" />
      </Link>
      <h1 className="text-lg font-semibold text-gray-900">Add New Nutrition</h1>
      <div className="w-6 h-6"></div>
    </header>
  );
}
