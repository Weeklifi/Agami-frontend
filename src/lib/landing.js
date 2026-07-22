import client from "../api/client";

/**
 * Login/landing-এর পর user-কে কোথায় পাঠানো হবে।
 * Teacher → batch list; Student → ১টা batch হলে সরাসরি Room।
 */
export async function landingPath(user) {
  if (!user.role) return "/select-role";
  if (user.role === "TEACHER") return "/teacher/batches";

  // Student: ক'টা batch?
  try {
    const { data } = await client.get("/api/batches/my/");
    const batches = data.results;
    if (batches.length === 1) return `/student/batches/${batches[0].id}`;
  } catch {
    // API fail করলে নিরাপদ fallback
  }
  return "/student/batches";
}