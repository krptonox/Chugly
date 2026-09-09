import { FormEvent, useEffect, useState } from "react";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { Input } from "./Input";
import { useRealtime } from "../features/realtime/RealtimeProvider";
import { roomApi } from "../features/rooms/room.api";
import type { RoomMessage } from "../features/rooms/room.types";

const addMessage = (messages: RoomMessage[], message: RoomMessage) =>
  messages.some((item) => item._id === message._id)
    ? messages
    : [...messages, message];

export function RoomChat({ roomId }: { roomId: string }) {
  const { onRoomMessage } = useRealtime();
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    void roomApi.getRoomMessages(roomId)
      .then((response) => {
        if (active) setMessages(response.data.data);
      })
      .catch(() => {
        if (active) setError("We could not load the room chat.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const removeListener = onRoomMessage((event) => {
      if (event.roomId === roomId) {
        setMessages((current) => addMessage(current, event.message));
      }
    });

    return () => {
      active = false;
      removeListener();
    };
  }, [onRoomMessage, roomId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent || sending) return;

    setSending(true);
    setError("");
    try {
      const response = await roomApi.sendRoomMessage(roomId, trimmedContent);
      setMessages((current) => addMessage(current, response.data.data));
      setContent("");
    } catch {
      setError("Your message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-4 rounded-3xl border border-ink/10 bg-white p-5 shadow-card sm:p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-coral-ink">Room chat</p>
        <h2 className="mt-2 text-2xl font-black text-ink">Talk with the room</h2>
      </div>
      {error && <Alert message={error} />}
      <div className="max-h-80 min-h-32 space-y-3 overflow-y-auto rounded-2xl bg-moss/[0.06] p-4" aria-live="polite">
        {loading && <p className="text-sm text-ink/50">Loading messages...</p>}
        {!loading && messages.length === 0 && <p className="text-sm text-ink/50">No messages yet. Start the conversation.</p>}
        {messages.map((message) => (
          <article key={message._id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-bold text-ink">{message.displayName}</p>
              <time className="text-xs text-ink/40" dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
            </div>
            <p className="mt-1 break-words text-sm leading-6 text-ink/75">{message.content}</p>
          </article>
        ))}
      </div>
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(event) => void handleSubmit(event)}>
        <Input aria-label="Message" maxLength={500} onChange={(event) => setContent(event.target.value)} placeholder="Write a message" value={content} />
        <Button loading={sending} type="submit" disabled={!content.trim()}>Send</Button>
      </form>
    </section>
  );
}