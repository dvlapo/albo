import { ArrowRightIcon, ImagesIcon, PlusIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useAlbumsQuery } from "../../hooks/queries/albums";

export function StudioPage() {
    const albums = useAlbumsQuery();
    return (
        <div className="studio-page">
            <header className="page-intro">
                <div>
                    <p className="eyebrow">Your album shelf</p>
                    <h1>Stories you’re keeping.</h1>
                    <p>Pick one up, or begin with a blank cover.</p>
                </div>
                <Link
                    className="button button--coral button--lg squircle"
                    to="/studio/albums/new"
                >
                    <PlusIcon /> New album
                </Link>
            </header>
            {albums.isLoading && (
                <div className="album-grid" aria-label="Loading albums">
                    {[1, 2, 3].map((i) => (
                        <div className="album-card skeleton" key={i} />
                    ))}
                </div>
            )}
            {albums.isError && (
                <div className="paper-message">
                    <h2>The shelf wouldn’t load.</h2>
                    <p>{albums.error.message}</p>
                    <button onClick={() => albums.refetch()}>Try again</button>
                </div>
            )}
            {albums.data?.length === 0 && (
                <div className="empty-shelf">
                    <ImagesIcon />
                    <h2>Your shelf is waiting.</h2>
                    <p>
                        Every great album starts with one photo and the story
                        behind it.
                    </p>
                    <Link
                        className="button button--ink button--md squircle"
                        to="/studio/albums/new"
                    >
                        Make the first one <ArrowRightIcon />
                    </Link>
                </div>
            )}
            <div className="album-grid">
                {albums.data?.map((album, i) => (
                    <Link
                            className="album-card squircle"
                        to={`/studio/albums/${album.id}`}
                        key={album.id}
                        style={
                            {
                                "--tilt": `${[-1.2, 0.8, -0.5][i % 3]}deg`,
                            } as React.CSSProperties
                        }
                    >
                        <div className="album-card-cover">
                            {album.coverPhoto ? (
                                <img src={album.coverPhoto.url} alt="" />
                            ) : (
                                <span>albo.</span>
                            )}
                        </div>
                        <h2>{album.title}</h2>
                        <p>
                            {album.description || "No note on the cover yet."}
                        </p>
                        <small>
                            {album._count.photos}{" "}
                            {album._count.photos === 1 ? "photo" : "photos"}
                        </small>
                    </Link>
                ))}
            </div>
        </div>
    );
}
