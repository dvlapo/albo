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
        return <div className="page-loader">Opening settings…</div>;

    return (
        <div className="form-page">
            <Link to={`/studio/albums/${albumId}`} className="back-link">
                <ArrowLeftIcon /> Back to album
            </Link>
            <section className="paper-panel settings">
                <p className="eyebrow">Inside cover details</p>
                <h1>Album settings</h1>
                <Formik
                    initialValues={{
                        title: album.data.title,
                        description: album.data.description ?? "",
                    }}
                    validationSchema={albumSchema}
                    onSubmit={async (values) => update.mutateAsync(values)}
                >
                    {({ isSubmitting }) => (
                        <Form className="album-form">
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
                <div className="danger-zone">
                    <h2>Remove this album</h2>
                    <p>
                        This permanently removes its photos, voice notes, and
                        share links.
                    </p>
                    <Button
                        variant="paper"
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
