import { ArrowRightIcon, ImagesIcon, PlusIcon } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { buttonClassName } from "../../components/ui/buttonStyles";
import { useAlbumsQuery } from "../../hooks/queries/albums";

export function StudioPage() {
    const albums = useAlbumsQuery();

    return (
        <div className="m-auto max-w-[1400px] p-[clamp(2rem,5vw,4rem)] max-[800px]:px-4 max-[800px]:py-8">
            <header className="mb-16 flex items-end justify-between gap-8 max-[800px]:flex-col max-[800px]:items-start">
                <div>
                    <p className="mb-3 text-xs font-extrabold tracking-[0.13em] uppercase">
                        Your album shelf
                    </p>
                    <h1 className="mb-2 text-[clamp(3rem,6vw,5.5rem)]">
                        Stories you’re keeping.
                    </h1>
                    <p className="text-graphite">
                        Pick one up, or begin with a blank cover.
                    </p>
                </div>
                <Link
                    className={buttonClassName({
                        variant: "coral",
                        size: "lg",
                    })}
                    to="/studio/albums/new"
                >
                    <PlusIcon /> New album
                </Link>
            </header>

            {albums.isLoading && (
                <div
                    className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[clamp(2rem,4vw,4.5rem)]"
                    aria-label="Loading albums"
                >
                    {[1, 2, 3].map((i) => (
                        <div
                            className="min-h-[380px] animate-[shimmer_1.4s_linear_infinite] bg-linear-to-r from-[#e4dfd2] via-[#f9f6ed] to-[#e4dfd2] bg-size-[200%]"
                            key={i}
                        />
                    ))}
                </div>
            )}

            {albums.isError && (
                <div className="mx-auto my-16 max-w-[650px] border-[1.5px] border-dashed border-ink px-8 py-16 text-center">
                    <h2>The shelf wouldn’t load.</h2>
                    <p>{albums.error.message}</p>
                    <button
                        className="cursor-pointer underline underline-offset-4"
                        onClick={() => albums.refetch()}
                    >
                        Try again
                    </button>
                </div>
            )}

            {albums.data?.length === 0 && (
                <div className="mx-auto my-16 max-w-[650px] border-[1.5px] border-dashed border-ink px-8 py-16 text-center">
                    <ImagesIcon className="mx-auto size-[54px]" />
                    <h2 className="text-[2.5rem]">Your shelf is waiting.</h2>
                    <p>
                        Every great album starts with one photo and the story
                        behind it.
                    </p>
                    <Link
                        className={buttonClassName({ variant: "ink" })}
                        to="/studio/albums/new"
                    >
                        Make the first one <ArrowRightIcon />
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-[clamp(2rem,4vw,4.5rem)]">
                {albums.data?.map((album, i) => (
                    <Link
                        className="transform-[rotate(var(--tilt,0))] transition-transform duration-200 ease-out hover:transform-[rotate(0)_translateY(-8px)] supports-[corner-shape:squircle]:[corner-shape:squircle]"
                        to={`/studio/albums/${album.id}`}
                        key={album.id}
                        style={
                            {
                                "--tilt": `${[-1.2, 0.8, -0.5][i % 3]}deg`,
                            } as React.CSSProperties
                        }
                    >
                        <div className="grid aspect-4/5 place-items-center overflow-hidden border-2 border-ink bg-[#445b49] p-4 shadow-[6px_8px_0_var(--color-ink)]">
                            {album.coverPhoto ? (
                                <img
                                    className="h-full w-full object-cover outline outline-1 outline-black/10"
                                    src={album.coverPhoto.url}
                                    alt=""
                                />
                            ) : (
                                <span className="text-[2rem] text-[#f8e9bb] font-extrabold">
                                    albo.
                                </span>
                            )}
                        </div>
                        <h2 className="mt-3.5 mb-1 text-[1.6rem]">
                            {album.title}
                        </h2>
                        <p className="m-0 text-graphite">
                            {album.description || "No note on the cover yet."}
                        </p>
                        <small className="font-[750]">
                            {album._count.photos}{" "}
                            {album._count.photos === 1 ? "photo" : "photos"}
                        </small>
                    </Link>
                ))}
            </div>
        </div>
    );
}
