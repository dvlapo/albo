import { SignOutIcon, SquaresFourIcon } from "@phosphor-icons/react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/Button";

export function AppShell() {
    const { logout } = useAuth();
    return (
        <div className="studio-shell">
            <header className="studio-nav">
                <Link
                    to="/studio"
                    className="wordmark"
                    aria-label="Albo studio"
                >
                    albo<span>.</span>
                </Link>
                <nav aria-label="Studio navigation">
                    <NavLink to="/studio" end>
                        <SquaresFourIcon weight="bold" /> Albums
                    </NavLink>
                </nav>
                <Button variant="paper" size="sm" onClick={logout}>
                    <SignOutIcon /> Sign out
                </Button>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}
