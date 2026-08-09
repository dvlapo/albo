import { Form, Formik } from "formik";
import {
    ArrowLeftIcon,
    CheckIcon,
    CopyIcon,
    ShareNetworkIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { play } from "cuelume";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TextField } from "../../components/forms/Fields";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import type { ShareLink } from "../../api/types";
import {
    useCreateShareLink,
    useRevokeShareLink,
    useShareLinks,
} from "../../hooks/queries/sharing";
import { shareSchema } from "../../../validations/albums";

export function SharePage() {
    const { albumId = "" } = useParams();
    const links = useShareLinks(albumId);
    const create = useCreateShareLink(albumId);
    const revoke = useRevokeShareLink(albumId);
    const [copied, setCopied] = useState("");
    const [linkToRevoke, setLinkToRevoke] = useState<ShareLink | null>(null);
    const [revokeError, setRevokeError] = useState("");
    const copy = async (url: string, id: string) => {
        await navigator.clipboard.writeText(url);
        play("success", { volume: 0.4 });
        setCopied(id);
        window.setTimeout(() => setCopied(""), 1500);
    };
    return (
        <div className="m-auto max-w-[1200px] p-[clamp(2rem,5vw,4rem)] max-[800px]:px-4 max-[800px]:py-8">
            <Link
                to={`/studio/albums/${albumId}`}
                className="mb-8 inline-flex items-center gap-1.5 font-[750] supports-[corner-shape:squircle]:[corner-shape:squircle]"
            >
                <ArrowLeftIcon /> Back to album
            </Link>
            <header className="mb-16 flex items-end justify-between gap-8 max-[800px]:flex-col max-[800px]:items-start">
                <div>
                    <p className="mb-3 text-xs font-extrabold tracking-[0.13em] uppercase">
                        Pass it around
                    </p>
                    <h1 className="mb-2 text-[clamp(3rem,6vw,5.5rem)]">
                        Invite someone to the coffee table.
                    </h1>
                    <p className="text-graphite">
                        Each link opens only this album. Add a passkey when the
                        stories are just for family.
                    </p>
                </div>
            </header>
            <div className="grid grid-cols-[0.8fr_1.2fr] gap-8 max-[800px]:grid-cols-1">
                <section className="max-w-[760px] border-[1.5px] border-ink bg-paper-bright p-[clamp(2rem,5vw,4rem)] shadow-paper">
                    <h2>Make a new link</h2>
                    <Formik
                        initialValues={{ passkey: "", expiresAt: "" }}
                        validationSchema={shareSchema}
                        onSubmit={async (values, helpers) => {
                            const body = {
                                ...(values.passkey
                                    ? { passkey: values.passkey }
                                    : {}),
                                ...(values.expiresAt
                                    ? {
                                          expires_at: new Date(
                                              values.expiresAt,
                                          ).toISOString(),
                                      }
                                    : {}),
                            };
                            const result = await create.mutateAsync(body);
                            await copy(result.url, result.id);
                            helpers.resetForm();
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="grid gap-4">
                                <TextField
                                    name="passkey"
                                    label="Passkey (optional)"
                                    placeholder="A family word or PIN"
                                />
                                <TextField
                                    name="expiresAt"
                                    type="datetime-local"
                                    label="Expiry (optional)"
                                />
                                <Button
                                    variant="coral"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    <ShareNetworkIcon />{" "}
                                    {isSubmitting
                                        ? "Making link…"
                                        : "Create and copy link"}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </section>
                <section className="max-w-[760px] border-[1.5px] border-ink bg-paper-bright p-[clamp(2rem,5vw,4rem)] shadow-paper">
                    <h2>Active links</h2>
                    {links.data?.length === 0 && <p>No active links yet.</p>}
                    <div className="grid gap-3">
                        {links.data?.map((link) => (
                            <article
                                className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-dashed border-ink pb-3 max-[520px]:grid-cols-[1fr_auto] max-[520px]:[&>button:last-child]:col-start-2"
                                key={link.id}
                            >
                                <div>
                                    <strong>
                                        Shared{" "}
                                        {new Date(
                                            link.createdAt,
                                        ).toLocaleDateString()}
                                    </strong>
                                    <small className="block text-graphite">
                                        {link.expiresAt
                                            ? `Expires ${new Date(link.expiresAt).toLocaleString()}`
                                            : "No expiry"}
                                    </small>
                                </div>
                                <Button
                                    variant="paper"
                                    size="sm"
                                    onClick={() =>
                                        copy(
                                            `${location.origin}/albums/${link.token}`,
                                            link.id,
                                        )
                                    }
                                >
                                    {copied === link.id ? (
                                        <CheckIcon />
                                    ) : (
                                        <CopyIcon />
                                    )}{" "}
                                    {copied === link.id ? "Copied" : "Copy"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Revoke link"
                                    onClick={() => {
                                        setRevokeError("");
                                        setLinkToRevoke(link);
                                    }}
                                >
                                    <TrashIcon />
                                </Button>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
            <ConfirmDialog
                open={Boolean(linkToRevoke)}
                onOpenChange={(open) => !open && setLinkToRevoke(null)}
                title="Revoke this share link?"
                description="Anyone using this URL will lose access immediately. Your album, photos, and voice notes will stay safely in your studio."
                confirmLabel="Revoke link"
                cancelLabel="Keep link"
                pendingLabel="Revoking…"
                pending={revoke.isPending}
                error={revokeError}
                onConfirm={async () => {
                    if (!linkToRevoke) return;
                    setRevokeError("");
                    try {
                        await revoke.mutateAsync(linkToRevoke.id);
                        play("droplet", { volume: 0.38 });
                        setLinkToRevoke(null);
                    } catch (error) {
                        setRevokeError(
                            error instanceof Error
                                ? error.message
                                : "The share link could not be revoked.",
                        );
                    }
                }}
            />
        </div>
    );
}
