import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Phone } from "lucide-react";
import { toast } from "sonner";
import { teamDPath } from "../constants";
import { IoChevronBack } from "react-icons/io5";
import { Link } from "react-router-dom";
interface Contact {
  id: number;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  is_invited: boolean;
}

const InviteFriends = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/referrals/contacts`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (contactId: number) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/referrals/contacts/invite/${contactId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Invitation sent!");
        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === contactId ? { ...contact, is_invited: true } : contact
          )
        );
        // Navigate to success page
        navigate(teamDPath("referral-success"));
      } else {
        toast.error("Failed to send invitation");
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
  {/* Header */}
  <div className="max-w-md mx-auto px-4 pt-4">
    <Link
      to="/wellness/referral-code"
      className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-200 transition"
    >
      <IoChevronBack className="w-6 h-6 text-gray-800" />
    </Link>
  </div>
      <div className="container mx-auto max-w-md px-4 py-6 mt-10">
        <div className="mb-8">

          <h1 className="text-[30px] font-bold text-foreground mb-3 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Invite your friend
          </h1>
          <p className="text-base text-muted-foreground font-normal leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Let's invite your friend to experience the app and get your referral bonus
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-foreground mb-4">My Contacts</h2>
          {contacts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <p className="text-gray-600">No contacts yet. Add your first contact to start inviting!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className={`flex items-center justify-between bg-white p-4 rounded-3xl border-gray-500 shadow-md ${contact.is_invited ? "border-gray-100" : "border-transparent"}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-blue-700 font-bold text-lg">
                        {contact.contact_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-foreground mb-1">
                        {contact.contact_name}
                      </p>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <p className="text-sm font-normal">{contact.contact_phone}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    {contact.is_invited ? (
                      <span className="text-sm font-medium text-blue-300 bg-blue-50 px-3 py-1 rounded-lg">
                        Invited
                      </span>
                    ) : (
                      <button
                        onClick={() => handleInvite(contact.id)}
                        className="h-9 px-6 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        Invite
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate(teamDPath("add-contact"))}
          className="w-full h-14 text-base font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition flex items-center justify-center"
        >
          <Plus className="mr-2 w-5 h-5" />
          Add New Contact
        </button>
      </div>
    </div>
  );
};

export default InviteFriends;

