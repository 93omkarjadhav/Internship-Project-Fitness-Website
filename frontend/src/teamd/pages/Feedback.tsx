import { useState } from "react";
import { submitFeedback } from "../api/api";
import { useNavigate } from "react-router-dom";
import { teamDPath } from "../constants";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import RateImage from "../assets/RateOurApp/RateOurAppAvatar.png";
import reshareicon from "../assets/RateOurApp/reshareicon.png";
import rightarrow from "../assets/ChangePassword/RightArrow.png";

import {
  BsEmojiDizzy,
  BsEmojiFrown,
  BsEmojiNeutral,
  BsEmojiSmile,
  BsEmojiLaughing,
} from "react-icons/bs";

interface Message {
  type: "success" | "error";
  text: string;
}

export default function FeedbackPage() {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message | null>(null);

  const navigate = useNavigate();

  const emojiIcons = [
    BsEmojiDizzy,
    BsEmojiFrown,
    BsEmojiNeutral,
    BsEmojiSmile,
    BsEmojiLaughing,
  ];

  const handleSubmit = async (): Promise<void> => {
    if (rating === 0 || feedback.trim() === "") {
      setMessage({
        type: "error",
        text: "Please give a rating and write feedback.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await submitFeedback({ rating, feedback });
      setMessage({ type: "success", text: "Thanks for your feedback!" });

      setRating(0);
      setFeedback("");

      setTimeout(() => navigate(teamDPath("settings")), 2000);
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setMessage({
        type: "error",
        text: "Could not submit feedback.",
      });
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this app",
          text: "Have a look at this awesome app!",
          url: shareUrl,
        });
      } catch (error) {
        console.log("Share dismissed", error);
      }
    } else {
      toast.error("Sharing not supported on this browser");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-800 px-4">
      <div className="relative w-full max-w-md bg-white dark:bg-gray-700 rounded-2xl shadow p-6 text-center">

        {/* Back Arrow (FIXED) */}
        <button
          onClick={() => navigate(teamDPath("settings"))}
          className="absolute top-5 left-5 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-white" />
        </button>

        <img
          src={RateImage}
          alt="Rate our app"
          className="w-40 mx-auto mb-4 dark:opacity-90"
        />

        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Rate Our App
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-5">
          Like the app? Then rate our app.
        </p>

        {message && (
          <div
            className={`p-3 rounded-lg mb-4 text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Emoji Rating */}
        <div className="flex justify-center mb-6 gap-4">
          {emojiIcons.map((EmojiIcon, index) => {
            const current = index + 1;
            const active = current === rating || current === hover;

            return (
              <div
                key={index}
                onClick={() => !loading && setRating(current)}
                onMouseEnter={() => !loading && setHover(current)}
                onMouseLeave={() => setHover(null)}
                className={`w-12 h-10 flex items-center justify-center rounded-full cursor-pointer text-2xl transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white scale-110"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <EmojiIcon />
              </div>
            );
          })}
        </div>

        <textarea
          maxLength={300}
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Enter your main text here..."
          className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-gray-700 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 outline-none"
          disabled={loading}
        />

        <p className="text-right text-gray-400 dark:text-gray-400 text-sm mt-1">
          {feedback.length}/300
        </p>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center gap-2 active:scale-95"
          >
            Submit Feedback
            <img src={rightarrow} alt="" className="dark:invert" />
          </button>

          <button
            onClick={handleShare}
            className="bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <img src={reshareicon} alt="" className="dark:invert" />
            Share via App
          </button>
        </div>
      </div>
    </div>
  );
}
