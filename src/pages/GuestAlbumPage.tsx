import { Form, Formik } from "formik";
import { KeyIcon } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { PublicAlbum } from "../api/types";
import { ApiError } from "../api/client";
import { publicAlbumsApi } from "../api/public-albums";
import { guestSessionStore } from "../auth/token-store";
import { AlbumViewer } from "../components/AlbumViewer";
import { TextField } from "../components/forms/Fields";
import { Button } from "../components/ui/Button";
import { VoiceNotePlayer } from "../components/VoiceNotePlayer";

type State = "loading" | "passkey" | "ready" | "missing" | "cooldown" | "error";
export function GuestAlbumPage() {
    const { token = "" } = useParams();
    const [state, setState] = useState<State>("loading");
    const [album, setAlbum] = useState<PublicAlbum | null>(null);
    const [message, setMessage] = useState("");
    const fetchAlbum = useCallback(
        async (guestToken: string) => {
            try {
                setAlbum(await publicAlbumsApi.get(token, guestToken));
                setState("ready");
            } catch (e) {
                if (e instanceof ApiError && e.status === 401) {
                    guestSessionStore.remove(token);
                    setState("loading");
                    await verify();
                } else
                    setState(
                        e instanceof ApiError && e.status === 404
                            ? "missing"
                            : "error",
                    );
            }
        },
        // Verification intentionally re-enters this request after an expired guest session.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [token],
    );
    const verify = useCallback(
        async (passkey?: string) => {
            try {
                const result = await publicAlbumsApi.verify(token, passkey);
                guestSessionStore.set(token, result.guest_session_token);
                await fetchAlbum(result.guest_session_token);
            } catch (e) {
                if (e instanceof ApiError) {
                    if (e.status === 401) setState("passkey");
                    else if (e.status === 404) setState("missing");
                    else if (e.status === 429) setState("cooldown");
                    else {
                        setMessage(e.message);
                        setState("error");
                    }
                }
            }
        },
        [fetchAlbum, token],
    );
    useEffect(() => {
        const saved = guestSessionStore.get(token);
        if (saved) fetchAlbum(saved);
        else verify();
    }, [fetchAlbum, token, verify]);
    if (state === "loading")
        return (
            <div className="grid min-h-dvh place-items-center p-8 text-center">
                <span className="text-[1.65rem] leading-none font-extrabold tracking-[-0.08em] [&_span]:text-coral">
                    albo<span>.</span>
                </span>
                <p>Opening the album…</p>
            </div>
        );
    if (state === "passkey")
        return (
            <main className="grid min-h-dvh place-items-center p-8 text-center">
                <Link to="/" className="absolute top-8 left-8 text-[1.65rem] leading-none font-extrabold tracking-[-0.08em] supports-[corner-shape:squircle]:[corner-shape:squircle] [&_span]:text-coral">
                    albo<span>.</span>
                </Link>
                <section className="max-w-[500px] -rotate-1 border-2 border-ink bg-[#e4cd7b] p-12 text-left shadow-[8px_10px_0_var(--color-ink)] [&>svg]:size-11">
                    <KeyIcon />
                    <p className="mb-3 text-xs font-extrabold tracking-[0.13em] uppercase">A private album</p>
                    <h1 className="text-5xl">This one needs the family word.</h1>
                    <Formik
                        initialValues={{ passkey: "" }}
                        onSubmit={async (values) => verify(values.passkey)}
                    >
                        {({ isSubmitting }) => (
                            <Form className="grid gap-4 text-left">
                                <TextField
                                    name="passkey"
                                    label="Passkey"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    variant="coral"
                                    disabled={isSubmitting}
                                >
                                    Open album
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </section>
            </main>
        );
    if (state === "missing" || state === "cooldown" || state === "error")
        return (
            <div className="grid min-h-dvh place-items-center p-8 text-center">
                <span className="text-[1.65rem] leading-none font-extrabold tracking-[-0.08em] [&_span]:text-coral">
                    albo<span>.</span>
                </span>
                <h1>
                    {state === "missing"
                        ? "This album is no longer on the table."
                        : state === "cooldown"
                          ? "Let’s wait a moment."
                          : "The album wouldn’t open."}
                </h1>
                <p>
                    {state === "missing"
                        ? "The link may have expired or been put away by its owner."
                        : state === "cooldown"
                          ? "Too many passkey attempts. Try again in about a minute."
                          : message}
                </p>
                <Link to="/" className="underline underline-offset-4 supports-[corner-shape:squircle]:[corner-shape:squircle]">
                    Return to Albo
                </Link>
            </div>
        );
    if (!album) return null;
    return (
        <main className="min-h-dvh overflow-x-hidden p-6">
            <header className="m-auto grid max-w-[1200px] grid-cols-[auto_1fr] items-start gap-12 max-[800px]:grid-cols-1 max-[800px]:gap-4">
                <Link to="/" className="text-[1.65rem] leading-none font-extrabold tracking-[-0.08em] supports-[corner-shape:squircle]:[corner-shape:squircle] [&_span]:text-coral max-[800px]:text-left">
                    albo<span>.</span>
                </Link>
                <div className="text-center">
                    <p className="my-12 mb-3 text-xs font-extrabold tracking-[0.13em] uppercase">
                        You’ve been handed an album
                    </p>
                    <h1 className="mb-1 text-[clamp(2.5rem,5vw,4.5rem)]">{album.title}</h1>
                    <p className="mb-2">{album.description}</p>
                    <div className="mx-auto w-fit">
                        {album.voiceNotes[0] && (
                            <VoiceNotePlayer
                                src={album.voiceNotes[0].url}
                                label="Play the introduction"
                                durationSeconds={
                                    album.voiceNotes[0].durationSeconds
                                }
                            />
                        )}
                    </div>
                </div>
            </header>
            <AlbumViewer album={album} />
        </main>
    );
}
