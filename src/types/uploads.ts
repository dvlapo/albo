export type UploadStatus = "queued" | "uploading" | "success" | "error";

export type UploadEntry<TSource, TResult = unknown> = {
    id: string;
    label: string;
    source: TSource;
    status: UploadStatus;
    progress: number | null;
    result?: TResult;
    error?: string;
};

export function uploadPercentage(loaded: number, total?: number) {
    if (!total || total <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
}
