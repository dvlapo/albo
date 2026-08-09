import { Form, Formik } from "formik";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { TextField } from "../../components/forms/Fields";
import { Button } from "../../components/ui/Button";
import { loginSchema, signupSchema } from "../../../validations/auth";

export function AuthPage({ mode }: { mode: "login" | "signup" }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState("");
    if (auth.ready && auth.authenticated)
        return <Navigate to="/studio" replace />;
    const signup = mode === "signup";
    return (
        <main className="relative grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_15%_20%,rgba(240,109,85,0.14),transparent_25%)] p-6">
            <Link
                to="/"
                className="absolute top-8 left-8 text-[1.65rem] leading-none font-extrabold tracking-[-0.08em] supports-[corner-shape:squircle]:[corner-shape:squircle] [&_span]:text-coral"
            >
                albo<span>.</span>
            </Link>
            <section className="relative w-[min(100%,560px)] rotate-[-0.5deg] border-2 border-ink bg-[#d8b65c] p-[clamp(2rem,6vw,4.5rem)] shadow-[10px_12px_0_var(--color-ink)] before:pointer-events-none before:absolute before:inset-3 before:border before:border-ink/35 before:content-[''] max-[520px]:px-6 max-[520px]:py-12 max-[520px]:shadow-[6px_8px_0_var(--color-ink)]">
                <div className="absolute -top-3 left-[calc(50%-50px)] h-7 w-[100px] rotate-2 bg-[#fff6cf]/72" />
                <p className="mb-3 text-xs font-extrabold tracking-[0.13em] uppercase">
                    {signup ? "Start a new shelf" : "Welcome back"}
                </p>
                <h1 className="text-[clamp(2.7rem,6vw,4.6rem)] max-[520px]:text-[2.8rem]">
                    {signup
                        ? "Keep the stories, not just the photos."
                        : "Your albums missed you."}
                </h1>
                <Formik
                    initialValues={{ name: "", email: "", password: "" }}
                    validationSchema={signup ? signupSchema : loginSchema}
                    onSubmit={async (values, helpers) => {
                        setError("");
                        try {
                            if (signup) {
                                await auth.signup(values);
                            } else {
                                await auth.login({
                                    email: values.email,
                                    password: values.password,
                                });
                            }
                            navigate(
                                (location.state as { from?: string } | null)
                                    ?.from ?? "/studio",
                                { replace: true },
                            );
                        } catch (e) {
                            setError(
                                e instanceof Error
                                    ? e.message
                                    : "Something went wrong",
                            );
                            helpers.setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="grid gap-4">
                            {signup && (
                                <TextField
                                    name="name"
                                    label="Your name"
                                    autoComplete="name"
                                />
                            )}
                            <TextField
                                name="email"
                                type="email"
                                label="Email address"
                                autoComplete="email"
                            />
                            <TextField
                                name="password"
                                type="password"
                                label="Password"
                                autoComplete={
                                    signup ? "new-password" : "current-password"
                                }
                            />
                            {error && (
                                <p
                                    className="text-[#872415] font-bold"
                                    role="alert"
                                >
                                    {error}
                                </p>
                            )}
                            <Button
                                type="submit"
                                variant="coral"
                                size="lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Opening…"
                                    : signup
                                      ? "Make my first album"
                                      : "Open my studio"}{" "}
                                <ArrowRightIcon />
                            </Button>
                        </Form>
                    )}
                </Formik>
                <p className="mt-6 mb-0 text-sm">
                    {signup ? "Already keeping memories?" : "New to Albo?"}{" "}
                    <Link
                        to={signup ? "/login" : "/signup"}
                        className="underline underline-offset-3 supports-[corner-shape:squircle]:[corner-shape:squircle]"
                    >
                        {signup ? "Log in" : "Create an account"}
                    </Link>
                </p>
            </section>
        </main>
    );
}
