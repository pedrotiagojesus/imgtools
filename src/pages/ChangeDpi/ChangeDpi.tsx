import { useEffect, useState } from "react";

// CSS
import "./ChangeDpi.css";

// Components
import EndpointFeedback from "@components/EndpointFeedback/EndpointFeedback";
import ButtonSubmit from "@components/ButtonSubmit/ButtonSubmit";
import ImageUploader from "@components/ImageUploader/ImageUploader";

// Utils
import { downloadFilesFromResponse } from "@utils/downloadFiles";

// Services
import { dpiImages, getImageMetadata } from "@services/imageService";

// Types
import type { Feedback } from "@appTypes/core";

const ChangeDpi = () => {
    const [images, setImages] = useState<File[]>([]);
    const [dpi, setDpi] = useState<"72" | "150" | "300">("300");
    const [metadataMap, setMetadataMap] = useState<Record<string, string>>({});

    const [btnSumbit, setBtnSubmit] = useState({
        disabled: false,
        value: "Change DPI",
    });

    const [feedback, setFeedback] = useState<Feedback>({
        message: "",
        status: null,
    });

    useEffect(() => {
        if (images.length === 0) {
            setMetadataMap({});
            return;
        }
        const fetchMetadata = async () => {
            const entries = await Promise.all(
                images.map(async (img) => {
                    try {
                        const { dpi } = await getImageMetadata(img);
                        return [img.name, `DPI: ${dpi}`] as const;
                    } catch {
                        return [img.name, "DPI: Unknown"] as const;
                    }
                }),
            );

            setMetadataMap(Object.fromEntries(entries));
        };

        fetchMetadata();
    }, [images]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!images || images.length === 0) {
            setFeedback({
                message: "Select at least one image",
                status: "warning",
            });
            return;
        }

        try {
            setBtnSubmit({
                value: "Processing...",
                disabled: true,
            });

            setFeedback({
                message: "Processing your images...",
                status: "info",
            });

            const response = await dpiImages(images, dpi);
            await downloadFilesFromResponse(response);

            setFeedback({
                message: "Conversion complete!",
                status: "success",
            });
        } catch (error) {
            console.error(error);
            setFeedback({
                message: error instanceof Error ? error.message : "Processing failure",
                status: "danger",
            });
        } finally {
            setBtnSubmit({
                value: "Change DPI",
                disabled: false,
            });
        }
    };

    const renderOverlay = (file: File) => {
        return metadataMap[file.name] || "";
    };

    return (
        <div className="container-fluid">
            <h1 className="mb-4">Change DPI of Images</h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <ImageUploader onChange={setImages} renderOverlay={renderOverlay} />
                </div>

                <div className="mb-3">
                    <label className="form-label">DPI</label>
                    <select
                        className="form-select"
                        value={dpi}
                        onChange={(e) => setDpi(e.target.value as "72" | "150" | "300")}
                    >
                        <option value="72">72</option>
                        <option value="150">150</option>
                        <option value="300">300</option>
                    </select>
                </div>

                <ButtonSubmit disabled={btnSumbit.disabled} description={btnSumbit.value} />
            </form>
            <EndpointFeedback status={feedback.status} description={feedback.message} />
        </div>
    );
};

export default ChangeDpi;
