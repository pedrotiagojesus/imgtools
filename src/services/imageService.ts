import client from "../api/client";
import API_ENDPOINTS from "../api/endpoint";

// Types
import type { ImageMetadata } from "@appTypes/image";

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

export const resizeImages = async (images: File[], width: string, height: string) => {
    try {
        const imagesCoded = await Promise.all(
            Array.from(images).map(async (file: File) => {
                const base64 = await fileToBase64(file);
                return { data: base64, mimeType: file.type, originalName: file.name };
            }),
        );

        const payload = {
            width: width?.toString(),
            height: height?.toString(),
            zip: "false",
            images: JSON.stringify(imagesCoded),
        };

        return await client.post(API_ENDPOINTS.RESIZE, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        throw new Error("O formato de destino não é suportado ou ocorreu um erro na conversão.");
    }
};

export const convertImages = async (images: File[], format: string) => {
    try {
        const imagesCoded = await Promise.all(
            Array.from(images).map(async (file: File) => {
                const base64 = await fileToBase64(file);
                return { data: base64, mimeType: file.type, originalName: file.name };
            }),
        );

        const payload = {
            format,
            zip: "false",
            images: JSON.stringify(imagesCoded),
        };

        return await client.post(API_ENDPOINTS.CONVERT, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        throw new Error(" formato de destino não é suportado ou ocorreu um erro na conversão.");
    }
};

export const dpiImages = async (images: File[], dpi: string) => {
    try {
        const imagesCoded = await Promise.all(
            Array.from(images).map(async (file: File) => {
                const base64 = await fileToBase64(file);
                return { data: base64, mimeType: file.type, originalName: file.name };
            }),
        );

        const payload = {
            dpi,
            zip: "false",
            images: JSON.stringify(imagesCoded),
        };

        return await client.post(API_ENDPOINTS.DPI, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        throw new Error("O valor de DPI informado é inválido ou ocorreu um erro no processamento.");
    }
};

export const createPdf = async (images: File[], pdfTitle: string, pdfSubject: string) => {
    try {
        const imagesCoded = await Promise.all(
            Array.from(images).map(async (file: File) => {
                const base64 = await fileToBase64(file);
                return { data: base64, mimeType: file.type, originalName: file.name };
            }),
        );

        const payload = {
            pdfTitle,
            pdfSubject,
            images: JSON.stringify(imagesCoded),
        };

        return await client.post(API_ENDPOINTS.PDF, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        throw new Error("Ocorreu um erro ao criar o PDF. Tente novamente com menos imagens.");
    }
};

export const getImageMetadata = async (file: File) => {
    try {
        const base64 = await fileToBase64(file);

        const payload = {
            image: base64,
            mimeType: file.type,
        };

        const response = await client.post<ImageMetadata>(API_ENDPOINTS.METADATA, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return response.data;
    } catch (error) {
        throw new Error("Falha ao obter metadados da imagem enviada.");
    }
};
