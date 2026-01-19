import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { teamDPath } from "../constants";

const AddContact = () => {
  const navigate = useNavigate();
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newContact.name || !newContact.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        toast.error("You need to be signed in to add contacts");
        navigate("/signin");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/referrals/contacts/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newContact.name,
            phone: newContact.phone,
            email: newContact.email,
          }),
        }
      );

      if (response.ok) {
        toast.success("Contact added successfully!");
        navigate(teamDPath("invite-friends"));
      } else {
        const data = await response.json();
        const errorMessage = data.error || "Failed to add contact";
        
        // Show specific error messages
        if (response.status === 401 || response.status === 403) {
          toast.error("Session expired. Please sign in again.");
          navigate("/signin");
        } else if (response.status === 400 && errorMessage.includes("already exists")) {
          toast.error("This contact already exists in your list");
        } else {
          toast.error(errorMessage);
        }
        
        console.error("Server error:", errorMessage);
      }
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen mt-20">
      <div className="container mx-auto max-w-md px-4 py-6">
        <h1 className="text-[30px] font-bold text-foreground mb-3 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Add New Contact
        </h1>
        <p className="text-base text-muted-foreground font-normal leading-relaxed mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Add your friend's details to send them an invitation
        </p>

        <form onSubmit={handleAddContact} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={newContact.name}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Enter name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={newContact.phone}
              onChange={(e) =>
                setNewContact({ ...newContact, phone: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Enter phone number"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={newContact.email}
              onChange={(e) =>
                setNewContact({ ...newContact, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Enter email"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(teamDPath("invite-friends"))}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Add Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContact;

