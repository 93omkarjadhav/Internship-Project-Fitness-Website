// src/pages/ProfileSettings.tsx
import React, { useState, useEffect, useRef } from "react";
import { getUserProfile, updateUserProfileWithHeader, uploadProfileImage } from "../api/api";
import QuetionInCircleIcon from "../assets/ProfileSetting/QuetionInCircleIcon.jpg";
import smallCircle from "../assets/ProfileSetting/smallCircle.jpg";
import lockProfileIcon from "../assets/ProfileSetting/lockProfileIcon.jpg";
import UserIcon from "../assets/ProfileSetting/UserIcon.jpg";
import msgIcon from "../assets/ProfileSetting/msgIcon.jpg";
import mapIcon from "../assets/ProfileSetting/mapIcon.jpg";
import DropDownIcon from "../assets/ProfileSetting/DropDownIcon.jpg";
import calenderIcon from "../assets/ProfileSetting/calenderIcon.png";
import ReactCountryFlag from "react-country-flag";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { teamDPath } from "../constants";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import DatePicker from "react-datepicker";


import '../DatePicker.css';

interface Country {
  name: string;
  code: string;
  dialCode: string;
}

const countries: Country[] = [
  { name: "United States", code: "US", dialCode: "+1" },
  { name: "India", code: "IN", dialCode: "+91" },
  { name: "United Kingdom", code: "GB", dialCode: "+44" },
  { name: "Australia", code: "AU", dialCode: "+61" },
  { name: "Canada", code: "CA", dialCode: "+1" },
  { name: "Germany", code: "DE", dialCode: "+49" },
  { name: "France", code: "FR", dialCode: "+33" },
  { name: "Japan", code: "JP", dialCode: "+81" },
  { name: "China", code: "CN", dialCode: "+86" },
  { name: "Brazil", code: "BR", dialCode: "+55" },
];


interface Profile {
  fullName: string;
  country: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
}

interface Message {
  type: "success" | "error";
  text: string;
}

const ProfileSettings: React.FC = () => {
  const [profile, setProfile] = useState<Profile>({
    fullName: "",
    country: "United States",
    gender: "Female",
    dob: "",
    phone: "", // This will now be populated correctly
    email: "",
    address: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const [uploading, setUploading] = useState<boolean>(false); // ✨ Loading state for image

  // States for your new complex inputs
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<Country>(countries[0]);
  const [phoneNumber, setPhoneNumber] = useState<string>(""); // Just the number
  const dobInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const selected = countries.find((c) => c.name === e.target.value);
    if (selected) {
      setSelectedCountry(selected);
    }
  };

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        setMessage({ type: "error", text: "You must be logged in. Please log in again." });
        setTimeout(() => navigate(teamDPath("settings")), 2000);
        return;
      }

      try {
        const { data } = await getUserProfile();
        const formattedDob = data.dob ? new Date(data.dob).toISOString().split('T')[0] : "";

        // --- ✨ UPDATED FETCH LOGIC ---
        // Find the country object that matches the saved name
        const savedCountry = countries.find(c => c.name === data.country) || countries[0];

        // Find the phone country, or default
        // This splits "+91 987..." into ["+91", "987..."]
        const phoneParts = data.phone ? data.phone.split(' ') : ["+1", ""];
        const savedDialCode = phoneParts[0] || "+1";
        const savedPhoneNumber = phoneParts[1] || "";
        const savedPhoneCountry = countries.find(c => c.dialCode === savedDialCode) || countries[0];

        setProfile({
          fullName: data.full_name || "",
          country: savedCountry.name,
          gender: data.gender || "Female",
          dob: formattedDob,
          phone: data.phone || "", // Store the full phone string
          email: data.email || "",
          address: data.address || "",
        });

        // Set the separate states for your UI
        setSelectedCountry(savedCountry);
        setSelectedPhoneCountry(savedPhoneCountry);
        setPhoneNumber(savedPhoneNumber);

        if (data.profile_image_url) {
          setProfileImage(data.profile_image_url);
        }
      } catch (err: any) {
        console.error("Error fetching profile:", err);
        // Handle authentication errors
        if (err?.isAuthError || err?.response?.status === 401) {
          setMessage({ type: "error", text: "Your session has expired. Redirecting to login..." });
          localStorage.clear();
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        } else {
          setMessage({ type: "error", text: err?.response?.data?.msg || "Could not load profile." });
        }
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Invalid file type. Please upload a JPEG, PNG, WebP, or AVIF image." });
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setMessage({ type: "error", text: "File too large. Maximum size is 10MB." });
      return;
    }

    setUploading(true);
    setMessage(null);

    // 1. Create FormData to send the file
    const formData = new FormData();
    formData.append('image', file); // 'image' must match upload.single('image') in backend

    try {
      // 2. Call your new API endpoint
      const { data } = await uploadProfileImage(formData);

      // 3. Save the new Cloudinary URL to state
      setProfileImage(data.url);
      setMessage({ type: "success", text: "Image uploaded successfully!" });

    } catch (err: any) {
      console.error("Error uploading image:", err);
      // Extract error message from response
      let errorMsg = err?.response?.data?.msg || err?.response?.data?.message || err?.message || "Image upload failed. Please try again.";

      // Handle authentication errors specifically
      if (err?.isAuthError || err?.response?.status === 401) {
        errorMsg = "Your session has expired. Please log in again.";
        // Optionally redirect to login after a delay
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/login';
        }, 2000);
      }

      setMessage({ type: "error", text: errorMsg });
    } finally {
      setUploading(false);
    }
  };

  // ---
  // ✨✨ THIS IS THE MAIN FIX ✨✨
  // ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage(null);

    const userId = localStorage.getItem("userId");
    if (!userId) {
      setMessage({ type: "error", text: "You must be logged in." });
      return;
    }

    // --- FIX 1: Build the phone number and country from the correct states ---
    // The phone number is the dial code + the number
    const combinedPhone = `${selectedPhoneCountry.dialCode} ${phoneNumber}`;

    // --- FIX 2: Create the data payload from all the correct UI states ---
    const profileData = {
      fullName: profile.fullName,
      country: selectedCountry.name, // Use the state from the country dropdown
      gender: profile.gender,
      dob: profile.dob,
      phone: combinedPhone,          // Use the combined phone string
      email: profile.email,
      address: profile.address,
      // ✨ Send the Cloudinary URL (which is in profileImage state)
      profile_image_url: profileImage
    };

    try {
      // Use the helper that includes X-User-ID header for reliability
      await updateUserProfileWithHeader(userId, profileData);
      toast.success("Profile updated successfully!");
      setMessage({ type: "success", text: "Profile updated successfully!" });
      // ⏳ redirect after 1.5 seconds
      setTimeout(() => {
        navigate(teamDPath("settings"));
      }, 1500);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      const serverMsg = err?.response?.data?.msg || err?.response?.data?.message || err?.message;
      setMessage({ type: "error", text: serverMsg || "Error updating profile." });
    }
  };

  // ---
  // The rest of your UI JSX remains exactly the same
  // ---
  return (
    <div className="flex justify-center items-start md:items-center min-h-screen bg-gray-50 dark:bg-gray-800 px-4 py-4 md:py-0 overflow-y-auto">

      <div className="w-full max-w-md bg-white dark:bg-gray-700 rounded-2xl shadow-md p-4 md:p-6 mb-4 md:mb-0">
        <button
          onClick={() => navigate(teamDPath("settings"))}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-white" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white text-center">
          Profile Settings
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-center mb-6">
          Your health privacy matters. Control and own your data here.
        </p>

        {message && (
          <div className={`p-3 rounded-lg mb-4 text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col items-center mb-6">
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            <img
              src={
                profileImage ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-2 md:border-4 border-blue-100"
            />
            {/* ✨ Loading spinner for uploads */}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
            <label
              htmlFor="upload"
              className="absolute bottom-0 right-0 bg-blue-500 text-white text-sm rounded-full p-1 cursor-pointer"
            >
              +
            </label>
            <input
              type="file"
              id="upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-gray-600 dark:text-gray-300 text-sm font-extrabold">Full Name</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-2 mt-1 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 transition-all">
              <div className="flex items-center justify-center bg-transparent dark:bg-transparent">
                <img src={UserIcon} className="mr-2 dark:invert w-5 h-5" />
              </div>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name..."
                value={profile.fullName}
                onChange={handleChange}
                className="w-full outline-none text-gray-700 dark:text-white bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Country / Nationality */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 dark:text-gray-300 text-sm font-extrabold">
              Country / Nationality
            </label>
            <div className="relative flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-xl p-2 bg-white dark:bg-gray-800 shadow-sm">
              <div className="w-8 h-8 rounded-full border-0 dark:border-0 flex items-center justify-center overflow-hidden bg-transparent dark:bg-transparent">
                <ReactCountryFlag
                  countryCode={selectedCountry.code}
                  svg
                  style={{
                    width: "2em",
                    height: "2em",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                  title={selectedCountry.name}
                />
              </div>
              <select
                name="country" // This name doesn't matter since we use handleCountryChange
                value={selectedCountry.name}
                onChange={handleCountryChange} // This uses the custom handler
                className="flex-1 mx-2 outline-none text-gray-700 dark:text-white bg-transparent dark:bg-gray-800 appearance-none"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.name} className="bg-white dark:bg-gray-800">
                    {country.name} ({country.code})
                  </option>
                ))}
              </select>
              <span className="absolute right-10 text-gray-600 dark:text-gray-300 font-medium">
                {selectedCountry.code}

              </span>
              <div className="bg-gray-800 dark:bg-gray-800 rounded p-0.5">
                <img 
                  src={DropDownIcon} 
                  alt="" 
                  className="dark:invert w-4 h-4" 
                />
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="text-gray-600 dark:text-gray-300 text-sm font-extrabold">Gender</label>
            <div className="relative">
              <img
                src={smallCircle}
                alt="circle icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 dark:invert"
              />
              <select
                name="gender"
                value={profile.gender}
                onChange={handleChange} // This uses the generic handler, which is correct
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-2 pl-9 mt-1 text-gray-700 dark:text-white bg-white dark:bg-gray-800 outline-none appearance-none text-sm md:text-base"
              >
                <option className="bg-white dark:bg-gray-800">Female</option>
                <option className="bg-white dark:bg-gray-800">Male</option>
                <option className="bg-white dark:bg-gray-800">Other</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-gray-800 dark:bg-gray-800 rounded p-0.5">
                <img 
                  src={DropDownIcon} 
                  alt="" 
                  className="dark:invert w-4 h-4" 
                />
              </div>

            </div>
          </div>

          {/* DOB */}
          <div>
            <label className="text-gray-600 dark:text-gray-300 text-sm font-extrabold">
              Date of Birth
            </label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-2 mt-1 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 transition-all">
              <div className="flex items-center w-full">
                <input
                  ref={dobInputRef}
                  type="date"
                  name="dob"
                  placeholder="00/00/0000"
                  value={profile.dob}
                  onChange={handleChange} // This uses the generic handler, which is correct
                  className="w-full outline-none text-gray-700 dark:text-white bg-transparent pr-2 hide-calendar-icon placeholder-gray-400 dark:placeholder-gray-500"
                />
                <div className="flex items-center justify-center bg-transparent dark:bg-transparent">
                  <img
                    src={calenderIcon}
                    className="ml-2 mr-2 flex-shrink-0 w-4 h-4 cursor-pointer dark:invert hover:opacity-80 transition-opacity"
                    onClick={() => {
                    const input = dobInputRef.current;
                    if (!input) return;
                    // Prefer modern showPicker if available
                    if (typeof (input as any).showPicker === 'function') {
                      try {
                        (input as any).showPicker();
                        return;
                      } catch (e) {
                        // ignore and fallback to focus/click
                      }
                    }
                    // Fallback: focus and dispatch click
                    input.focus();
                    input.click();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const input = dobInputRef.current;
                      if (!input) return;
                      if (typeof (input as any).showPicker === 'function') {
                        (input as any).showPicker();
                      } else {
                        input.focus();
                        input.click();
                      }
                    }
                  }}
                    role="button"
                    tabIndex={0}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div>
            <label className="text-gray-600 text-sm font-extrabold">
              Date of Birth
            </label>

            <div className="relative mt-1">
              <DatePicker
                selected={profile.dob ? new Date(profile.dob) : null}
                onChange={(date: Date | null) => {
                  if (!date) return;
                  const formatted = date.toISOString().split("T")[0];
                  setProfile({ ...profile, dob: formatted });
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="DD / MM / YYYY"
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="
        w-full border rounded-xl px-3 py-2
        text-gray-700 bg-white
        focus:ring-2 focus:ring-blue-500
        outline-none transition-all
      "
              />

              <img
                src={calenderIcon}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 opacity-70 pointer-events-none"
              />
            </div>
          </div> */}

          {/* Phone Number */}
          <div className="flex flex-col gap-1 w-full max-w-md">
            <label className="text-gray-600 dark:text-gray-300 text-sm font-extrabold">Phone Number</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-2 bg-white dark:bg-gray-800 shadow-sm focus-within:ring-2 focus-within:ring-blue-500">
              <div className="relative flex items-center w-12 justify-center bg-transparent dark:bg-transparent">
                <ReactCountryFlag
                  countryCode={selectedPhoneCountry.code}
                  svg
                  style={{
                    width: "2em",
                    height: "2em",
                    borderRadius: "50%",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  title={selectedPhoneCountry.name}
                />
                <select
                  value={selectedPhoneCountry.code}
                  onChange={(e) => {
                    const country = countries.find((c) => c.code === e.target.value);
                    if (country) {
                      setSelectedPhoneCountry(country);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code} className="bg-white dark:bg-gray-800">
                      {country.name}
                    </option>
                  ))}
                </select>
                <div className="bg-gray-800 dark:bg-gray-800 rounded p-0.5" style={{ marginLeft: "8px" }}>
                  <img
                    src={DropDownIcon}
                    alt="Dropdown"
                    className="dark:invert w-4 h-4"
                  />
                </div>
              </div>
              <span className="ml-3 text-gray-700 dark:text-white font-semibold">
                {selectedPhoneCountry.dialCode}
              </span>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phoneNumber} // Uses the separate 'phoneNumber' state
                onChange={(e) => setPhoneNumber(e.target.value)} // Updates the separate 'phoneNumber' state
                className="flex-1 ml-3 text-gray-800 dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-500 bg-transparent"
              />
              <HiOutlineQuestionMarkCircle className="text-gray-400 dark:text-gray-400 text-xl ml-2" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-gray-600 dark:text-gray-300 text-sm font-extrabold">Email Address</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-2 mt-1 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 transition-all">
              <div className="flex items-center justify-center bg-transparent dark:bg-transparent">
                <img src={msgIcon} className="mr-2 dark:invert w-5 h-5" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="example@gmail.com"
                value={profile.email}
                onChange={handleChange} // This uses the generic handler, which is correct
                className="w-full outline-none text-gray-700 dark:text-white bg-transparent placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-gray-600 dark:text-gray-300 text-sm font-extrabold">Address</label>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-xl p-2 mt-1 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 transition-all">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-transparent dark:bg-transparent mr-4 ml-1 mb-4">
                <img src={mapIcon} className="dark:invert w-5 h-5" />
              </div>
              <textarea
                name="address"
                placeholder="Enter your address..."
                rows={1}
                value={profile.address}
                onChange={handleChange} // This uses the generic handler, which is correct
                className="w-full m-7 outline-none text-gray-700 dark:text-white bg-transparent resize-none placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 rounded-xl font-medium mt-3 transition-all active:scale-95 shadow-md hover:shadow-lg"
          >
            Update Profile <span className="ml-2">✓</span>
          </button>
        </form>

        <p className="text-center text-gray-400 dark:text-gray-400 text-xs font-semibold mt-4 flex flex-col items-center justify-center">
          <img src={lockProfileIcon} className="mr-1 dark:invert" />
          <p className="dark:text-gray-400"> Your profile information is safe with us and we
            don't share data to anyone.</p>
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings;

