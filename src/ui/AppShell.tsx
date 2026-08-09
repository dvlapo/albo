import { SignOutIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";

export function AppShell() {
    const { logout } = useAuth();
    return (
        <div className="min-h-dvh">
            <header className="sticky top-0 z-20 m-auto flex max-w-none items-center justify-between border-b border-ink/20 bg-paper/88 px-[clamp(1rem,4vw,3.5rem)] py-5 backdrop-blur-[14px] [@media(prefers-reduced-transparency:reduce)]:bg-paper [@media(prefers-reduced-transparency:reduce)]:backdrop-blur-none max-[520px]:px-4 max-[520px]:py-[0.85rem]">
                <Link
                    to="/studio"
                    className="text-[1.65rem] leading-none font-extrabold tracking-[-0.08em] supports-[corner-shape:squircle]:[corner-shape:squircle] [&_span]:text-coral"
                    aria-label="Albo studio"
                >
                    albo<span>.</span>
                </Link>
                <nav className="flex items-center gap-4 max-[800px]:hidden" aria-label="Studio navigation">
                    <NavLink className="flex items-center gap-1.5 font-[750]" to="/studio" end>
                        <SquaresFourIcon weight="bold" /> Albums
                    </NavLink>
                </nav>
                <Button variant="paper" size="sm" className="max-[520px]:w-11 max-[520px]:px-0 max-[520px]:text-[0] max-[520px]:[&_svg]:size-5" onClick={logout}>
                    <SignOutIcon /> Sign out
                </Button>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}
