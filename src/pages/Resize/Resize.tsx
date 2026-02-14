import { useEffect, useState } from "react";

// Components
import EndpointFeedback from "@components/EndpointFeedback/EndpointFeedback";
import ButtonSubmit from "@components/ButtonSubmit/ButtonSubmit";
import ImageUploader from "@components/ImageUploader/ImageUploader";

// CSS
import "./Resize.css";

// Utils
import { downloadFilesFromResponse } from "@utils/downloadFiles";

// Services
import { resizeImages, getImageMetadata } from "@services/imageService";

// Types
import type { Feedback } from "@appTypes/core";

const Resize = () => {
    const [images, setImages] = useState<File[]>([]);
    const [metadataMap, setMetadataMap] = useState<Record<string, string>>({});

    const [btnSumbit, setBtnSubmit] = useState({
        disabled: false,
        value: "Resize",
    });

    const [feedback, setFeedback] = useState<Feedback>({
        message: "",
        status: null
    });

    const [dimensions, setDimensions] = useState({
        width: "300",
        height: "300",
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
                        const { width, height } = await getImageMetadata(img);
                        return [img.name, `${width} x ${height}`] as const;
                    } catch {
                        return [img.name, "Unknown"] as const;
                    }
                }),
            );

            setMetadataMap(Object.fromEntries(entries));
        };

        fetchMetadata();
    }, [images]);

    const handleResize = async (e: React.FormEvent) => {
        e.preventDefault();

        if (images.length === 0) {
            setFeedback({
                message: "Select at least one image",
                status: "warning",
            });
            return;
        }

        if (!dimensions.width && !dimensions.height) {
            setFeedback({
                message: "Set the width and height",
                status: "warning",
            });
            return;
        }

        try {
            setBtnSubmit({
                value: "Resizing...",
                disabled: true,
            });

            setFeedback({
                message: "Processing your images...",
                status: "info",
            });

            const response = await resizeImages(images, dimensions.width, dimensions.height);
            await downloadFilesFromResponse(response);

            setFeedback({
                message: "Resize complete!",
                status: "success",
            });
        } catch (error) {
            setFeedback({
                message: error instanceof Error ? error.message : "Processing failure",
                status: "danger",
            });
        } finally {
            setBtnSubmit({
                value: "Resize",
                disabled: false,
            });
        }
    };

    const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDimensions((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const renderOverlay = (file: File) => {
        return metadataMap[file.name] || "";
    };

    return (
        <div className="container-fluid">
            <h1 className="mb-4">Resize Image</h1>

            <form onSubmit={handleResize}>
                <div className="mb-3">
                    <ImageUploader onChange={setImages} renderOverlay={renderOverlay} />
                </div>

                <div className="mb-3 row">
                    <div className="col">
                        <label className="form-label">Width</label>
                        <div className="input-group">
                            <input
                                type="number"
                                name="width"
                                min={0}
                                className="form-control"
                                value={dimensions.width}
                                onChange={handleDimensionChange}
                            />
                            <span className="input-group-text">px</span>
                        </div>
                    </div>

                    <div className="col">
                        <label className="form-label">Height</label>
                        <div className="input-group">
                            <input
                                type="number"
                                name="height"
                                min={0}
                                className="form-control"
                                value={dimensions.height}
                                onChange={handleDimensionChange}
                            />
                            <span className="input-group-text">px</span>
                        </div>
                    </div>
                </div>
                <ButtonSubmit disabled={btnSumbit.disabled} description={btnSumbit.value} />
            </form>
            <EndpointFeedback status={feedback.status} description={feedback.message} />
        </div>
    );
};

export default Resize;
