import { Form, Formik } from "formik";
import {
    ArrowLeftIcon,
    CheckIcon,
    CopyIcon,
    ShareNetworkIcon,
    TrashIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TextField } from "../../components/forms/Fields";
import { Button } from "../../components/ui/Button";
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
    const copy = async (url: string, id: string) => {
        await navigator.clipboard.writeText(url);
        setCopied(id);
        window.setTimeout(() => setCopied(""), 1500);
    };
    return (
        <div className="form-page wide">
            <Link to={`/studio/albums/${albumId}`} className="back-link">
                <ArrowLeftIcon /> Back to album
            </Link>
            <header className="page-intro">
                <div>
                    <p className="eyebrow">Pass it around</p>
                    <h1>Invite someone to the coffee table.</h1>
                    <p>
                        Each link opens only this album. Add a passkey when the
                        stories are just for family.
                    </p>
                </div>
            </header>
            <div className="share-layout">
                <section className="paper-panel">
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
                            <Form className="album-form">
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
                <section className="paper-panel">
                    <h2>Active links</h2>
                    {links.data?.length === 0 && <p>No active links yet.</p>}
                    <div className="link-list">
                        {links.data?.map((link) => (
                            <article key={link.id}>
                                <div>
                                    <strong>
                                        Shared{" "}
                                        {new Date(
                                            link.createdAt,
                                        ).toLocaleDateString()}
                                    </strong>
                                    <small>
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
                                    onClick={() => revoke.mutate(link.id)}
                                >
                                    <TrashIcon />
                                </Button>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
