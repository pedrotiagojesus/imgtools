import type { AxiosResponse } from "axios";

export async function downloadFilesFromResponse(res: AxiosResponse): Promise<void> {
    if (!res.status) {
        throw new Error(`Request failed with status ${res.status}`);
    }

    const data = await res.data;

    if (!data.files || !Array.isArray(data.files)) {
        throw new Error("Resposta inválida do servidor");
    }

    data.files.forEach((file: { filename: string; mimeType: string; data: string }) => {
        const byteCharacters = atob(file.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: file.mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 10000);
    });
}
