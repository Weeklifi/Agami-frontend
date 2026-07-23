import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import AppShell from "../../components/AppShell";
import PostCard from "../../components/PostCard";
import Card from "../../components/ui/Card";
import BatchBanner from "../../components/BatchBanner";
import PhonePromptModal from "../../components/PhonePromptModal";
import BatchSidebar from "./BatchSidebar";
import BatchModals from "./BatchModals";
import Composer from "./Composer";

export default function RoomPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const isTeacher = user?.role === "TEACHER";

  const [batch, setBatch] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [needsPhone, setNeedsPhone] = useState(false);
  const [tool, setTool] = useState(null);
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
          setNeedsPhone(found.needs_phone);
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
  const q = search.toLowerCase();
  const filtered = posts.filter(
    (p) =>
      p.title?.toLowerCase().includes(q) || p.body?.toLowerCase().includes(q)
  );
  const pinned = filtered.filter((p) => p.is_pinned);
  const regular = filtered.filter((p) => !p.is_pinned);

  const upcomingExams = posts
    .filter(
      (p) => p.post_type === "EXAM" && p.event_date && new Date(p.event_date) > now
    )
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
    .slice(0, 3);

  return (
    <AppShell
      title={batch ? batch.name : t("room")}
      sidebar={
        batch && (
          <BatchSidebar
            batch={batch}
            isTeacher={isTeacher}
            onOpen={setTool}
            upcomingExams={upcomingExams}
            search={search}
            onSearch={setSearch}
          />
        )
      }
    >
      {!isTeacher && needsPhone && batch && (
        <PhonePromptModal
          batchId={id}
          batchName={batch.name}
          onDone={() => setNeedsPhone(false)}
        />
      )}

      {/* Feed — শুধু banner + post, এক column */}
      <div className="w-full min-w-0 max-w-2xl mx-auto space-y-4">
        {batch && <BatchBanner batch={batch} />}

        {pinned.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider
              text-brand-600 px-1">
              {t("pinnedPosts") || "গুরুত্বপূর্ণ"}
            </p>
            {pinned.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                canManage={isTeacher}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <div className="space-y-3 min-w-0">
          {loading ? (
            <p className="text-sm text-ink-400 text-center py-12">
              {t("loading")}
            </p>
          ) : filtered.length === 0 ? (
            <Card className="text-center py-16 border-dashed border-2">
              <p className="text-base font-semibold text-ink-700">
                {t("noPost")}
              </p>
              <p className="mt-1 text-sm text-ink-400">
                {search ? "কোনো ফলাফল নেই।" : t("firstPostHint")}
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

      {batch && (
        <BatchModals
          batch={batch}
          isTeacher={isTeacher}
          tool={tool}
          onClose={() => setTool(null)}
        />
      )}

      {isTeacher && <Composer batchId={id} onPosted={load} />}
    </AppShell>
  );
}