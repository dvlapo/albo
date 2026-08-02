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
        <main className="auth-page">
            <Link to="/" className="wordmark">
                albo<span>.</span>
            </Link>
            <section className="album-cover">
                <div className="cover-tape" />
                <p className="eyebrow">
                    {signup ? "Start a new shelf" : "Welcome back"}
                </p>
                <h1>
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
                        <Form className="auth-form">
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
                                <p className="form-error" role="alert">
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
                <p className="auth-switch">
                    {signup ? "Already keeping memories?" : "New to Albo?"}{" "}
                    <Link to={signup ? "/login" : "/signup"}>
                        {signup ? "Log in" : "Create an account"}
                    </Link>
                </p>
            </section>
        </main>
    );
}
