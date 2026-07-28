import { Form, Formik } from "formik";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { Link, useNavigate } from "react-router-dom";
import { TextAreaField, TextField } from "../../components/forms/Fields";
import { Button } from "../../components/ui/Button";
import { useCreateAlbum } from "../../hooks/queries/albums";
import { albumSchema } from "../../../validations/albums";

export function NewAlbumPage() {
  const create = useCreateAlbum(); const navigate = useNavigate();
  return <div className="form-page"><Link to="/studio" className="back-link"><ArrowLeft /> Back to the shelf</Link><section className="new-album-book"><p className="eyebrow">A blank cover</p><h1>What should we call this chapter?</h1>
    <Formik initialValues={{ title: "", description: "" }} validationSchema={albumSchema} onSubmit={async (values) => { const album = await create.mutateAsync(values); navigate(`/studio/albums/${album.id}`); }}>
      {({ isSubmitting }) => <Form className="album-form"><TextField name="title" label="Album title" autoFocus /><TextAreaField name="description" label="A note for the inside cover (optional)" /><Button type="submit" variant="coral" size="lg" disabled={isSubmitting}>Create the album <ArrowRight /></Button></Form>}
    </Formik>
  </section></div>;
}
