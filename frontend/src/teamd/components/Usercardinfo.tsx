interface UserInfoCardProps {
  name: string;
}

export default function UserInfoCard({ name }: UserInfoCardProps) {
  return (
    <div
      className="bg-blue-500 text-white py-6 px-5"
      style={{ borderRadius: "0 0 20px 0" }}
    >
      <div className="flex justify-between items-center mb-4"></div>

      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-sm opacity-90">You’re on track for January, Mori!</p>
    </div>
  );
}
