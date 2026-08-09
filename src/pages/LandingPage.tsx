import {
    ArrowRightIcon,
    MicrophoneIcon,
    ShareNetworkIcon,
    StackIcon,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { buttonClassName } from "../components/ui/buttonStyles";
import { cn } from "../lib/utils";

const demoPhotos = [
    "https://images.unsplash.com/photo-1759416782439-38871fb1083b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1642420290986-c7a55bab708f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=900&q=80",
];

const photoPositions = [
    "left-[2%] top-[16%] -rotate-[8deg]",
    "right-[1%] top-[2%] rotate-[7deg]",
    "bottom-[2%] left-[28%] rotate-[2deg] max-[520px]:left-[18%]",
];

const stepStyles = [
    "bg-paper-bright",
    "rotate-[1.2deg] bg-[#fde0d8] max-[800px]:rotate-0",
    "-rotate-[0.8deg] bg-[#dceff0] max-[800px]:rotate-0",
];

export function LandingPage() {
    const reduced = useReducedMotion();
    const navigate = useNavigate();

    return (
        <main>
            <nav className="m-auto flex max-w-[1400px] items-center justify-between px-[clamp(1rem,4vw,3.5rem)] py-5 max-[520px]:p-4">
                <Link
                    to="/"
                    className="text-[1.65rem] leading-none font-extrabold tracking-[-0.08em] supports-[corner-shape:squircle]:[corner-shape:squircle] [&_span]:text-coral"
                >
                    albo<span>.</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link
                        to="/login"
                        className="supports-[corner-shape:squircle]:[corner-shape:squircle] max-[800px]:hidden"
                    >
                        Log in
                    </Link>
                    <Button
                        variant="ink"
                        size="sm"
                        onClick={() => navigate("/signup")}
                    >
                        Make an album <ArrowRightIcon />
                    </Button>
                </div>
            </nav>
            <section className="m-auto grid min-h-[calc(100dvh-88px)] max-w-[1400px] grid-cols-[0.9fr_1.1fr] items-center gap-[5vw] overflow-hidden px-[clamp(1rem,5vw,4rem)] py-[clamp(3rem,8vw,7rem)] max-[800px]:grid-cols-1 max-[800px]:pt-12">
                <motion.div
                    className="isolate max-w-[610px]"
                    initial={reduced ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                >
                    <span className="inline-block -rotate-2 border-[1.5px] border-ink bg-yellow px-2.5 py-1.5 text-[0.73rem] font-extrabold uppercase">
                        Pass it around
                    </span>
                    <h1 className="mb-6 text-[clamp(3.5rem,7.4vw,7rem)] max-[800px]:text-[clamp(3.4rem,15vw,5.5rem)]">
                        Photos are better with the{" "}
                        <em className="relative z-0 font-medium after:absolute after:inset-x-0 after:bottom-[0.08em] after:-z-10 after:h-[0.12em] after:-rotate-1 after:bg-coral after:content-['']">
                            whole story.
                        </em>
                    </h1>
                    <p className="max-w-[55ch] text-[1.08rem]">
                        Build the kind of album that used to live on the coffee
                        table—only now, every photograph can speak.
                    </p>
                    <div className="mt-8 flex items-center gap-5 font-[750] max-[520px]:flex-col max-[520px]:items-stretch max-[520px]:[&_a]:text-center">
                        <Link
                            className={buttonClassName({
                                variant: "coral",
                                size: "lg",
                            })}
                            to="/signup"
                        >
                            Start your album <ArrowRightIcon />
                        </Link>
                        <a href="#how">See how it works</a>
                    </div>
                </motion.div>
                <div
                    className="relative min-h-[600px] max-[800px]:min-h-[500px] max-[520px]:min-h-[430px]"
                    aria-label="A playful stack of family photographs"
                >
                    {demoPhotos.map((src, i) => (
                        <motion.figure
                            key={src}
                            className={cn(
                                "absolute m-0 w-[min(58%,360px)] border border-black/20 bg-paper-bright px-[0.7rem] pt-[0.7rem] pb-[2.7rem] shadow-[8px_10px_20px_rgba(45,39,28,0.2)] max-[520px]:w-[65%]",
                                photoPositions[i],
                            )}
                            whileHover={
                                reduced
                                    ? undefined
                                    : { rotate: i === 1 ? 2 : -2, y: -8 }
                            }
                            transition={{
                                type: "spring",
                                duration: 0.4,
                                bounce: 0.12,
                            }}
                        >
                            <img
                                className="aspect-4/3 w-full object-cover outline-1 outline-black/10"
                                src={src}
                                alt=""
                            />
                            <figcaption className="absolute bottom-3 left-4 font-display text-[1.05rem] italic">
                                {
                                    [
                                        "Sunday, 1998",
                                        "The whole gang",
                                        "One more for the album",
                                    ][i]
                                }
                            </figcaption>
                        </motion.figure>
                    ))}
                </div>
            </section>
            <section
                id="how"
                className="border-y-2 border-ink px-[clamp(1rem,5vw,4rem)] py-[clamp(5rem,9vw,8rem)]"
            >
                <p className="mb-3 text-xs font-extrabold tracking-[0.13em] uppercase">
                    A living-room ritual, reimagined
                </p>
                <h2 className="max-w-[800px] text-[clamp(3rem,6vw,6rem)]">
                    Make memories feel held.
                </h2>
                <div className="mt-16 grid grid-cols-3 gap-8 max-[800px]:grid-cols-1">
                    {[StackIcon, MicrophoneIcon, ShareNetworkIcon].map(
                        (Icon, i) => (
                            <article
                                key={i}
                                className={cn(
                                    "relative border-[1.5px] border-ink p-8 shadow-paper",
                                    stepStyles[i],
                                )}
                            >
                                <span className="absolute top-4 right-4 font-extrabold">
                                    0{i + 1}
                                </span>
                                <Icon className="mb-8 size-[38px]" />
                                <h3 className="text-xl">
                                    {
                                        [
                                            "Arrange the moments",
                                            "Tell the real story",
                                            "Hand it to someone",
                                        ][i]
                                    }
                                </h3>
                                <p>
                                    {
                                        [
                                            "Upload, caption, and shuffle photos around your digital scrapbook.",
                                            "Add voice notes so the people, jokes, and little details stay alive.",
                                            "Share a private link and let guests flip or flick through at their own pace.",
                                        ][i]
                                    }
                                </p>
                            </article>
                        ),
                    )}
                </div>
            </section>
            <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
                <p>Some stories deserve more than a camera roll.</p>
                <h2 className="mb-8 max-w-[800px] text-[clamp(3rem,6vw,6rem)]">
                    Put yours on the coffee table.
                </h2>
                <Link
                    className={buttonClassName({ variant: "ink", size: "lg" })}
                    to="/signup"
                >
                    Make your first Albo <ArrowRightIcon />
                </Link>
            </section>
            <footer className="flex justify-between border-t-[1.5px] border-ink px-[4vw] py-8 max-[520px]:flex-col">
                <span className="text-[1.65rem] leading-none font-extrabold tracking-[-0.08em] [&_span]:text-coral">
                    albo<span>.</span>
                </span>
                <p>Made for stories worth passing around.</p>
            </footer>
        </main>
    );
}
