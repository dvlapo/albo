import {
    ArrowRightIcon,
    MicrophoneIcon,
    ShareNetworkIcon,
    StackIcon,
} from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

const demoPhotos = [
    "https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1592599457566-c660153d9548?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&w=900&q=80",
];

export function LandingPage() {
    const reduced = useReducedMotion();
    return (
        <main className="landing">
            <nav className="landing-nav">
                <Link to="/" className="wordmark">
                    albo<span>.</span>
                </Link>
                <div>
                    <Link to="/login">Log in</Link>
                    <Button
                        variant="ink"
                        size="sm"
                        onClick={() => location.assign("/signup")}
                    >
                        Make an album <ArrowRightIcon />
                    </Button>
                </div>
            </nav>
            <section className="hero">
                <motion.div
                    className="hero-copy"
                    initial={reduced ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                >
                    <span className="stamp">Pass it around</span>
                    <h1>
                        Photos are better with the <em>whole story.</em>
                    </h1>
                    <p>
                        Build the kind of album that used to live on the coffee
                        table—only now, every photograph can speak.
                    </p>
                    <div className="hero-actions">
                        <Link
                            className="button button--coral button--lg"
                            to="/signup"
                        >
                            Start your album <ArrowRightIcon />
                        </Link>
                        <a href="#how">See how it works</a>
                    </div>
                </motion.div>
                <div
                    className="hero-collage"
                    aria-label="A playful stack of family photographs"
                >
                    {demoPhotos.map((src, i) => (
                        <motion.figure
                            key={src}
                            className={`hero-photo photo-${i + 1}`}
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
                            <img src={src} alt="" />
                            <figcaption>
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
            <section id="how" className="how">
                <p className="eyebrow">A living-room ritual, reimagined</p>
                <h2>Make memories feel held.</h2>
                <div className="steps">
                    <article>
                        <span>01</span>
                        <StackIcon />
                        <h3>Arrange the moments</h3>
                        <p>
                            Upload, caption, and shuffle photos around your
                            digital scrapbook.
                        </p>
                    </article>
                    <article>
                        <span>02</span>
                        <MicrophoneIcon />
                        <h3>Tell the real story</h3>
                        <p>
                            Add voice notes so the people, jokes, and little
                            details stay alive.
                        </p>
                    </article>
                    <article>
                        <span>03</span>
                        <ShareNetworkIcon />
                        <h3>Hand it to someone</h3>
                        <p>
                            Share a private link and let guests flip or flick
                            through at their own pace.
                        </p>
                    </article>
                </div>
            </section>
            <section className="closing">
                <p>Some stories deserve more than a camera roll.</p>
                <h2>Put yours on the coffee table.</h2>
                <Link className="button button--ink button--lg" to="/signup">
                    Make your first Albo <ArrowRightIcon />
                </Link>
            </section>
            <footer>
                <span className="wordmark">
                    albo<span>.</span>
                </span>
                <p>Made for stories worth passing around.</p>
            </footer>
        </main>
    );
}
