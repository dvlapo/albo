import * as yup from "yup";
export const albumSchema = yup.object({
    title: yup.string().trim().max(100).required("Give this album a title"),
    description: yup.string().trim().max(1000).default(""),
});
export const shareSchema = yup.object({
    passkey: yup.string().max(64).default(""),
    expiresAt: yup.string().default(""),
});
