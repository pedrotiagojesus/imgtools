import { useEffect, useState } from "react";

// Components
import EndpointFeedback from "../../components/EndpointFeedback/EndpointFeedback";
import ButtonSubmit from "../../components/ButtonSubmit/ButtonSubmit";
import ImageUploader from "../../components/ImageUploader/ImageUploader";

// CSS
import "./Resize.css";

// Utils
import { downloadFilesFromResponse } from "../../utils/downloadFiles";
import { getImageMetadata } from "../../utils/imageDetail";

const Resize = () => {
    const [images, setImages] = useState<File[]>([]);
    const [metadataMap, setMetadataMap] = useState<Record<string, string>>({});

    const [btnSumbit, setBtnSubmit] = useState({
        disabled: false,
        value: "Resize",
    });

    const [feedback, setFeedback] = useState({
        message: "",
        status: null as "success" | "error" | "warning" | "info" | "danger" | null,
    });

    const [dimensions, setDimensions] = useState({
        width: "300",
        height: "300",
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            const map: Record<string, string> = {};
            for (const img of images) {
                try {
                    const { width, height } = await getImageMetadata(img);
                    map[img.name] = `${width} x ${height}`;
                } catch {
                    map[img.name] = "Unknown";
                }
            }
            setMetadataMap(map);
        };

        if (images.length > 0) {
            fetchMetadata();
        } else {
            setMetadataMap({});
        }
    }, [images]);

    const handleResize = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!images || images.length === 0) {
            setFeedback({
                message: "Select at least one image",
                status: "warning",
            });
            return;
        }

        if (!dimensions.width && !dimensions.height) {
            setFeedback({
                message: "Set the width and/or height",
                status: "warning",
            });
            return;
        }

        const formData = new FormData();
        Array.from(images).forEach((image) => {
            formData.append("images", image);
        });

        if (dimensions.width) formData.append("width", dimensions.width);
        if (dimensions.height) formData.append("height", dimensions.height);
        formData.append("zip", "false");

        try {
            setBtnSubmit({
                value: "Resizing...",
                disabled: true,
            });

            setFeedback({
                message: "Processing your images...",
                status: "info",
            });

            const endpoint = `${process.env.REACT_APP_API_URL}/resize`;
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            await downloadFilesFromResponse(response);

            setFeedback({
                message: "Resize complete!",
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
