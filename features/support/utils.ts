import { SupportAttachmentInput } from "./types";

export const SUPPORT_ATTACHMENT_ACCEPT =
    "application/pdf,image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const MAX_SUPPORT_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export const isImageAttachmentUrl = (url: string) =>
    /\.(png|jpe?g|webp|svg)(\?.*)?$/i.test(url);

export const getAttachmentDisplayName = (url: string, index: number) => {
    try {
        const pathname = new URL(url).pathname;
        const name = pathname.split("/").pop();
        return name || `Attachment ${index + 1}`;
    } catch {
        const name = url.split("/").pop();
        return name || `Attachment ${index + 1}`;
    }
};

export const fileToSupportAttachment = (file: File): Promise<SupportAttachmentInput> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;
            if (typeof result !== "string") {
                reject(new Error("Failed to read file"));
                return;
            }

            const [, base64 = ""] = result.split(",");
            resolve({
                base64,
                filename: file.name,
                mimeType: file.type || "application/octet-stream",
            });
        };

        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
