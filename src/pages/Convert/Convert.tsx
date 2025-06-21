import { useEffect, useState } from "react";

// Components
import EndpointFeedback from "../../components/EndpointFeedback/EndpointFeedback";
import ButtonSubmit from "../../components/ButtonSubmit/ButtonSubmit";
import ImageUploader from "../../components/ImageUploader/ImageUploader";

// CSS
import "./Convert.css";

// Utils
import { downloadFilesFromResponse } from "../../utils/downloadFiles";
import { getImageMetadata } from "../../utils/imageDetail";

const Convert = () => {
    var converOptions = [
        {
            value: "jpeg",
            name: "JPEG",
            disabled: false,
        },
        {
            value: "png",
            name: "PNG",
            disabled: false,
        },
        {
            value: "webp",
            name: "WebP",
            disabled: false,
        },
        {
            value: "avif",
            name: "AVIF",
            disabled: true,
        },
        {
            value: "tiff",
            name: "TIFF",
            disabled: false,
        },
        {
            value: "svg",
            name: "SVG",
            disabled: false,
        },
    ];

    const [images, setImages] = useState<File[]>([]);
    const [format, setFormat] = useState("jpeg");
    const [metadataMap, setMetadataMap] = useState<Record<string, string>>({});

    const [btnSumbit, setBtnSubmit] = useState({
        disabled: false,
        value: "Convert",
    });

    const [feedback, setFeedback] = useState({
        message: "",
        status: null as "success" | "error" | "warning" | "info" | "danger" | null,
    });

    useEffect(() => {
        setFeedback({
            message: "",
            status: "success",
        });

        setBtnSubmit({
            value: "Convert",
            disabled: false,
        });

        if (format !== "svg" || images.length === 0) {
            return;
        }

        setFeedback({
            message: "Converting to SVG only works well on simple, black and white images",
            status: "info",
        });

        Array.from(images).forEach((file) => {
            if (file.type !== "image/png") {
                setFeedback({
                    message: "You can only apply SVG conversion from PNG file",
                    status: "warning",
                });

                setBtnSubmit({
                    value: "Convert",
                    disabled: true,
                });
            }
        });
    }, [images, format]);

    useEffect(() => {
        const fetchMetadata = async () => {
            const map: Record<string, string> = {};
            for (const img of images) {
                try {
                    const { format } = await getImageMetadata(img);
                    map[img.name] = `${format}`;
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

    const handleConvert = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!images || images.length === 0) {
            setFeedback({
                message: "Select at least one image",
                status: "warning",
            });
            return;
        }

        const formData = new FormData();
        Array.from(images).forEach((file) => {
            formData.append("images", file);
        });
        formData.append("format", format);
        formData.append("zip", "false");

        try {
            setBtnSubmit({
                value: "Converting...",
                disabled: true,
            });

            setFeedback({
                message: "Processing your images...",
                status: "info",
            });

            const endpoint = `${process.env.REACT_APP_API_URL}/convert-image`;
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

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
                value: "Convert",
                disabled: false,
            });
        }
    };

    const renderOverlay = (file: File) => {
        return metadataMap[file.name] || "";
    };

    return (
        <div className="container-fluid">
            <h1 className="mb-4">Image Converter</h1>

            <form onSubmit={handleConvert}>
                <div className="mb-3">
                    <ImageUploader onChange={setImages} renderOverlay={renderOverlay} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Target format</label>
                    <select className="form-select" value={format} onChange={(e) => setFormat(e.target.value)}>
                        {converOptions.map((row, i) => (
                            <option key={i} value={row.value} disabled={row.disabled}>
                                {row.name}
                            </option>
                        ))}
                    </select>
                </div>

                <ButtonSubmit disabled={btnSumbit.disabled} description={btnSumbit.value} />
            </form>

            <EndpointFeedback status={feedback.status} description={feedback.message} />
        </div>
    );
};

export default Convert;
