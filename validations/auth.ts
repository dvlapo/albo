import * as yup from "yup";

export const loginSchema = yup.object({
    email: yup
        .string()
        .email("Use a valid email address")
        .required("Email is required"),
    password: yup.string().required("Password is required"),
});

export const signupSchema = yup.object({
    name: yup.string().trim().required("Name is required"),
    email: yup
        .string()
        .email("Use a valid email address")
        .required("Email is required"),
    password: yup
        .string()
        .min(8, "Use at least 8 characters")
        .required("Password is required"),
});
