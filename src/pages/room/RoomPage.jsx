import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/AppShell";
import PostCard from "../../components/PostCard";
import Card from "../../components/ui/Card";
import BatchBanner from "../../components/BatchBanner";
import BatchActionBar from "./BatchActionBar";
import Composer from "./Composer";
import PhonePromptModal from "../../components/PhonePromptModal";
import { formatDateTime } from "../../lib/postTypes";

export default function RoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const isTeacher = user?.role === "TEACHER";

  const [batch, setBatch] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [needsPhone, setNeedsPhone] = useState(false);
  const bottomRef = useRef(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    if (isTeacher) {
      client.get(`/api/batches/${id}/`).then((res) => setBatch(res.data));
    } else {
      client.get(`/api/batches/my/`).then((res) => {
        const found = res.data.results.find((b) => b.id === id);
        if (found) {
          setBatch(found);
          setNeedsPhone(found.needs_phone); // phone দেওয়া না থাকলে popup
        }
      });
    }
  }, [id, isTeacher]);

  const load = useCallback(() => {
    client
      .get(`/api/batches/${id}/posts/`)
      .then((res) => setPosts([...res.data.results].reverse()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  useEffect(() => {
    if (posts.length === 0) return;
    bottomRef.current?.scrollIntoView({
      behavior: firstLoad.current ? "auto" : "smooth",
      block: "nearest",
    });
    firstLoad.current = false;
  }, [posts]);

  const handleDelete = async (postId) => {
    if (!confirm(t("deleteConfirm"))) return;
    await client.delete(`/api/batches/${id}/posts/${postId}/`);
    load();
  };

  const now = new Date();

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.body?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filteredPosts.filter((p) => p.is_pinned);
  const regular = filteredPosts.filter((p) => !p.is_pinned);

  const upcomingExams = posts
    .filter(
      (p) =>
        p.post_type === "EXAM" &&
        p.event_date &&
        new Date(p.event_date) > now
    )
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 3);

  return (
    <AppShell title={batch ? batch.name : t("room")}>
      {/* Phone না দিলে popup — student, needs_phone true হলে (বন্ধ করা যাবে না) */}
      {!isTeacher && needsPhone && batch && (
        <PhonePromptModal
          batchId={id}
          batchName={batch.name}
          onDone={() => setNeedsPhone(false)}
        />
      )}

      <div className="w-full min-w-0 overflow-x-hidden space-y-5">
        {batch && <BatchBanner batch={batch} />}

        {/* Action bar + search */}
        <div className="border border-line bg-white p-3 space-y-3 min-w-0">
          {batch && (
            <div className="min-w-0">
              <BatchActionBar batch={batch} isTeacher={isTeacher} />
            </div>
          )}

          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder={t("searchPosts") || "খুঁজুন…"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-page border border-line
                focus:outline-none focus:border-brand-500 focus:bg-white
                transition-all placeholder:text-ink-400"
            />
            <span className="absolute left-3 top-2 text-ink-400 text-sm">🔍</span>
          </div>
        </div>

        {/* Grid — stream + sidebar */}
        <div className="md:grid md:grid-cols-[1fr_280px] md:gap-5 md:items-start min-w-0">
          {/* Stream — বাঁয়ে */}
          <div className="flex flex-col min-h-[50vh] md:order-1 space-y-4 min-w-0">
            {/* Pinned */}
            {pinned.length > 0 && (
              <div className="space-y-4 bg-brand-50/30 p-4 border border-brand-100 min-w-0">
                <div className="flex items-center gap-2 text-xs font-bold
                  text-brand-600 tracking-wider uppercase">
                  <span className="w-2 h-2 bg-brand-500" />
                  {t("pinnedPosts") || "গুরুত্বপূর্ণ"}
                </div>
                <div className="space-y-4 min-w-0">
                  {pinned.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      canManage={isTeacher}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular */}
            <div className="flex-1 space-y-4 min-w-0">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <p className="text-sm text-ink-400">{t("loading")}</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card className="text-center py-16 border-dashed border-2 border-line">
                  <p className="text-base font-semibold text-ink-700">
                    {t("noPost")}
                  </p>
                  <p className="mt-1 text-sm text-ink-400">
                    {searchQuery ? "কোনো ফলাফল নেই।" : t("firstPostHint")}
                  </p>
                </Card>
              ) : (
                regular.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    canManage={isTeacher}
                    onDelete={handleDelete}
                  />
                ))
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Sidebar — ডানে sticky, desktop only */}
          <div className="hidden md:block md:order-2 sticky top-[73px] min-w-0">
            <Card className="!p-4 border border-line">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-line">
                <h2 className="text-sm font-bold text-ink-800">
                  {t("upcomingExams")}
                </h2>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warn opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-warn" />
                </span>
              </div>

              {upcomingExams.length === 0 ? (
                <p className="text-xs text-ink-400 text-center py-6">
                  {t("noExams")} 🎉
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {upcomingExams.map((p) => (
                    <li
                      key={p.id}
                      className="p-3 border border-line hover:bg-page transition-colors min-w-0"
                    >
                      <p className="text-xs font-bold text-ink-700 leading-snug break-words">
                        📝 {p.title}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="text-[10px] bg-amber-50 text-warn px-2 py-0.5 font-medium shrink-0">
                          {t("exam")}
                        </span>
                        <p className="text-[11px] text-ink-400 truncate">
                          {formatDateTime(p.event_date)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>

      {isTeacher && <Composer batchId={id} onPosted={load} />}
    </AppShell>
  );
}