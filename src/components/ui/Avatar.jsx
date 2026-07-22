import { avatarColor, initials } from "../../lib/colors";

export default function Avatar({ name, size = "md" }) {
  const sizes = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm" };
  return (
    <div
      className={`${sizes[size]} ${avatarColor(name)} rounded-full
        flex items-center justify-center font-semibold text-white shrink-0`}
    >
      {initials(name)}
    </div>
  );
}