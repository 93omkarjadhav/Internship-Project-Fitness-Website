import { IoChevronBack } from "react-icons/io5";
import deleteMealIllustration from "../assets/delete-meal.png";
import { deleteMeal, deleteScheduledMeal } from "../lib/api";
import { useState } from "react";

export default function DeleteMealPopup({
    mealId,
    type,
    onClose,
    onDeleted
}: {
    mealId: number;
    type: "schedule" | "history";
    onClose: () => void;
    onDeleted: () => void;
}) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setStatus("loading");
        setError(null);
        try {
            // ALWAYS delete from meals table
            await deleteMeal(mealId);


            setStatus("success");
            setTimeout(() => {
                onDeleted();
                onClose();
            }, 800);
        } catch {
            setStatus("error");
            setError("Failed to delete meal. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999]">
            <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl text-center">

                <img
                    src={deleteMealIllustration}
                    alt="Delete"
                    className="w-full max-w-[200px] mx-auto"
                />

                <h2 className="text-xl font-semibold mt-4">
                    Delete {type === "schedule" ? "scheduled meal" : "logged meal"}?
                </h2>

                <p className="text-gray-600 text-sm mt-2">
                    Are you sure you want to remove this meal?
                </p>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="mt-6 flex flex-col gap-3">
                    <button
                        onClick={handleDelete}
                        disabled={status === "loading"}
                        className="bg-red-500 text-white py-3 rounded-xl shadow disabled:opacity-50"
                    >
                        {status === "loading" ? "Deleting..." : "Yes, Delete"}
                    </button>

                    <button
                        onClick={onClose}
                        className="border border-red-500 text-red-500 py-3 rounded-xl"
                    >
                        No, nevermind
                    </button>
                </div>

            </div>
        </div>
    );
}
