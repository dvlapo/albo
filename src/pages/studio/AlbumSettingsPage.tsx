import { Form, Formik } from "formik";
import { ArrowLeft, Trash } from "@phosphor-icons/react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TextAreaField, TextField } from "../../components/forms/Fields";
import { Button } from "../../components/ui/Button";
import { useAlbumQuery, useDeleteAlbum, useUpdateAlbum } from "../../hooks/queries/albums";
import { albumSchema } from "../../../validations/albums";

export function AlbumSettingsPage() {
  const { albumId = "" } = useParams(); const album = useAlbumQuery(albumId); const update = useUpdateAlbum(albumId); const remove = useDeleteAlbum(albumId); const navigate = useNavigate();
  if (!album.data) return <div className="page-loader">Opening settings…</div>;
  return <div className="form-page"><Link to={`/studio/albums/${albumId}`} className="back-link"><ArrowLeft /> Back to album</Link><section className="paper-panel settings"><p className="eyebrow">Inside cover details</p><h1>Album settings</h1><Formik initialValues={{ title: album.data.title, description: album.data.description ?? "" }} validationSchema={albumSchema} onSubmit={async (values) => update.mutateAsync(values)}>
    {({ isSubmitting }) => <Form className="album-form"><TextField name="title" label="Album title" /><TextAreaField name="description" label="Inside-cover note" /><Button type="submit" variant="ink" disabled={isSubmitting}>Save changes</Button></Form>}
  </Formik><div className="danger-zone"><h2>Remove this album</h2><p>This permanently removes its photos, voice notes, and share links.</p><Button variant="paper" onClick={async () => { if (confirm(`Permanently delete “${album.data?.title}”?`)) { await remove.mutateAsync(); navigate("/studio"); } }}><Trash /> Delete album</Button></div></section></div>;
}
