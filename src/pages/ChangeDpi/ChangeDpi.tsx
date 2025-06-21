import { useEffect, useState } from "react";

// Components
import ButtonSubmit from "../../components/ButtonSubmit/ButtonSubmit";
import EndpointFeedback from "../../components/EndpointFeedback/EndpointFeedback";
import ImageUploader from "../../components/ImageUploader/ImageUploader";

// CSS
import "./ChangeDpi.css";

// Utils
import { downloadFilesFromResponse } from "../../utils/downloadFiles";
import { getImageMetadata } from "../../utils/imageDetail";

const ChangeDpi = () => {
    const [images, setImages] = useState<File[]>([]);
    const [dpi, setDpi] = useState<"72" | "150" | "300">("300");
    const [metadataMap, setMetadataMap] = useState<Record<string, string>>({});

    const [btnSumbit, setBtnSubmit] = useState({
        disabled: false,
        value: "Change DPI",
    });

    const [feedback, setFeedback] = useState({
        message: "",
        status: null as "success" | "error" | "warning" | "info" | "danger" | null,
    });

    useEffect(() => {
        const fetchMetadata = async () => {
            const map: Record<string, string> = {};
            for (const img of images) {
                try {
                    const { dpi } = await getImageMetadata(img);
                    map[img.name] = `DPI: ${dpi}`;
                } catch {
                    map[img.name] = "DPI: Unknown";
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!images || images.length === 0) {
            setFeedback({
                message: "Select at least one image",
                status: "warning",
            });
            return;
        }

        const formData = new FormData();
        Array.from(images).forEach((image) => {
            formData.append("images", image);
        });
        formData.append("dpi", dpi);
        formData.append("zip", "false");

        try {
            setBtnSubmit({
                value: "Processing...",
                disabled: true,
            });

            setFeedback({
                message: "Processing your images...",
                status: "info",
            });

            const endpoint = `${process.env.REACT_APP_API_URL}/ajust-dpi`;
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
