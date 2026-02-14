import { useEffect, useState } from "react";

// CSS
import "./Convert.css";

// Components
import EndpointFeedback from "@components/EndpointFeedback/EndpointFeedback";
import ButtonSubmit from "@components/ButtonSubmit/ButtonSubmit";
import ImageUploader from "@components/ImageUploader/ImageUploader";

// Utils
import { downloadFilesFromResponse } from "@utils/downloadFiles";

// Services
import { convertImages, getImageMetadata } from "@services/imageService";

// Types
import type { Feedback } from "@appTypes/core";

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

    const [feedback, setFeedback] = useState<Feedback>({
        message: "",
        status: null,
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
        if (images.length === 0) {
            setMetadataMap({});
            return;
        }
        const fetchMetadata = async () => {
            const entries = await Promise.all(
                images.map(async (img) => {
                    try {
                        const { format } = await getImageMetadata(img);
                        return [img.name, `${format}`] as const;
                    } catch {
                        return [img.name, "Unknown"] as const;
                    }
                }),
            );

            setMetadataMap(Object.fromEntries(entries));
        };

        fetchMetadata();
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

        try {
            setBtnSubmit({
                value: "Converting...",
                disabled: true,
            });

            setFeedback({
                message: "Processing your images...",
                status: "info",
            });

            const response = await convertImages(images,format);
            await downloadFilesFromResponse(response);

            setFeedback({
                message: "Conversion complete!",
                status: "success",
            });
        } catch (error) {
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
