import { Form, Formik } from "formik";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { TextAreaField, TextField } from "../../components/forms/Fields";
import { Button } from "../../components/ui/Button";
import { useCreateAlbum } from "../../hooks/queries/albums";
import { albumSchema } from "../../../validations/albums";

export function NewAlbumPage() {
    const create = useCreateAlbum();
    const navigate = useNavigate();
    return (
        <div className="m-auto max-w-[1400px] p-[clamp(2rem,5vw,4rem)] max-[800px]:px-4 max-[800px]:py-8">
            <Link
                to="/studio"
                className="mb-8 inline-flex items-center gap-1.5 font-[750] supports-[corner-shape:squircle]:[corner-shape:squircle]"
            >
                <ArrowLeftIcon /> Back to the shelf
            </Link>
            <section className="m-auto max-w-[760px] border-[1.5px] border-l-[12px] border-ink border-l-coral bg-paper-bright p-[clamp(2rem,5vw,4rem)] shadow-paper">
                <p className="mb-3 text-xs font-extrabold tracking-[0.13em] uppercase">
                    A blank cover
                </p>
                <h1 className="text-[clamp(3rem,6vw,5.5rem)]">
                    What should we call this chapter?
                </h1>
                <Formik
                    initialValues={{ title: "", description: "" }}
                    validationSchema={albumSchema}
                    onSubmit={async (values) => {
                        const album = await create.mutateAsync(values);
                        navigate(`/studio/albums/${album.id}`);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="grid gap-4">
                            <TextField
                                name="title"
                                label="Album title"
                                autoFocus
                            />
                            <TextAreaField
                                name="description"
                                label="A note for the inside cover (optional)"
                            />
                            <Button
                                type="submit"
                                variant="coral"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                Create the album <ArrowRightIcon />
                            </Button>
                        </Form>
                    )}
                </Formik>
            </section>
        </div>
    );
}
