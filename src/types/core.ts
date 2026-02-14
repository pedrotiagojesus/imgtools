export interface Feedback {
    message: string;
    status: "success" | "error" | "warning" | "info" | "danger" | null;
}