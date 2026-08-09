import { Form, Formik } from "formik";
import { ArrowLeftIcon, TrashIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TextAreaField, TextField } from "../../components/forms/Fields";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import {
    useAlbumQuery,
    useDeleteAlbum,
    useUpdateAlbum,
} from "../../hooks/queries/albums";
import { albumSchema } from "../../../validations/albums";

export function AlbumSettingsPage() {
    const { albumId = "" } = useParams();
    const album = useAlbumQuery(albumId);
    const update = useUpdateAlbum(albumId);
    const remove = useDeleteAlbum(albumId);
    const navigate = useNavigate();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    if (!album.data)
        return (
            <div className="grid min-h-[60vh] place-items-center font-display text-2xl italic">
                Opening settings…
            </div>
        );

    return (
        <div className="m-auto max-w-[1400px] p-[clamp(2rem,5vw,4rem)] max-[800px]:px-4 max-[800px]:py-8">
            <Link
                to={`/studio/albums/${albumId}`}
                className="mb-8 inline-flex items-center gap-1.5 font-[750] supports-[corner-shape:squircle]:[corner-shape:squircle]"
            >
                <ArrowLeftIcon /> Back to album
            </Link>
            <section className="m-auto max-w-[760px] border-[1.5px] border-ink bg-paper-bright p-[clamp(2rem,5vw,4rem)] shadow-paper">
                <p className="mb-3 text-xs font-extrabold tracking-[0.13em] uppercase">
                    Inside cover details
                </p>
                <h1 className="text-[clamp(3rem,6vw,5.5rem)]">
                    Album settings
                </h1>
                <Formik
                    initialValues={{
                        title: album.data.title,
                        description: album.data.description ?? "",
                    }}
                    validationSchema={albumSchema}
                    onSubmit={async (values) => update.mutateAsync(values)}
                >
                    {({ isSubmitting }) => (
                        <Form className="grid gap-4">
                            <TextField name="title" label="Album title" />
                            <TextAreaField
                                name="description"
                                label="Inside-cover note"
                            />
                            <Button
                                type="submit"
                                variant="ink"
                                disabled={isSubmitting}
                            >
                                Save changes
                            </Button>
                        </Form>
                    )}
                </Formik>
                <div className="mt-12 border-t-2 border-coral pt-8">
                    <h2>Remove this album</h2>
                    <p className="my-2">
                        This permanently removes its photos, voice notes, and
                        share links.
                    </p>
                    <Button
                        variant="coral"
                        onClick={() => {
                            setDeleteError("");
                            setDeleteDialogOpen(true);
                        }}
                    >
                        <TrashIcon /> Delete album
                    </Button>
                </div>
            </section>
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={`Delete “${album.data.title}”?`}
                description="This permanently removes the album, every photo and voice note inside it, and all active share links. This action cannot be undone."
                confirmLabel="Delete album"
                cancelLabel="Keep album"
                pendingLabel="Deleting album…"
                pending={remove.isPending}
                error={deleteError}
                onConfirm={async () => {
                    setDeleteError("");
                    try {
                        await remove.mutateAsync();
                        navigate("/studio");
                    } catch (error) {
                        setDeleteError(
                            error instanceof Error
                                ? error.message
                                : "The album could not be deleted.",
                        );
                    }
                }}
            />
        </div>
    );
}
