import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { teamDPath } from "../constants";
import { ArrowLeft } from "lucide-react";

const FAQsPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I book a fitness club session?",
      answer: "You can browse available clubs on the welcome page, filter by price, and click on any club to view details and book a session. Most clubs offer daily passes starting from Rs. 30/day."
    },
    {
      question: "How does the nutrition tracking work?",
      answer: "Log your meals through the Nutrition section. Our AI assistant helps track calories, macros (protein, carbs, fats), and provides personalized insights based on your goals and preferences."
    },
    {
      question: "Can I track my period cycle on FitFare?",
      answer: "Yes! Female users can access the Period Tracker feature to log cycles, track symptoms, and get predictions for upcoming periods. Navigate to 'Periods Cycle' in the sidebar to get started."
    },
    {
      question: "What is the FitFare Score?",
      answer: "Your FitFare Score reflects your overall health and fitness engagement. It's calculated based on your activity tracking, nutrition logging, and consistent app usage. Higher scores unlock premium features!"
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team at fitfaresupport@gmail.com or use the Contact Support option in the app. We typically respond within 24 hours."
    },
    {
      question: "Are there membership plans available?",
      answer: "Yes! We offer various membership tiers including Plus Member benefits. Check your profile settings or contact support to learn more about available plans and pricing."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(teamDPath("settings"))}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors active:scale-95"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-white" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h1>
        </div>

        {/* FAQs Card */}
        <div className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900 dark:text-white font-semibold text-xl">
              Frequently Asked Questions
            </h2>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-600 last:border-b-0 pb-4 last:pb-0">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left flex items-center justify-between gap-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg px-2 -mx-2 transition-colors active:scale-[0.99]"
                >
                  <span className="text-gray-800 dark:text-white font-medium text-base flex-1">
                    {faq.question}
                  </span>
                  <span className={`text-blue-600 dark:text-blue-400 text-2xl font-bold transition-transform flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}>
                    {openIndex === index ? '−' : '+'}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-2 pr-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;

