import { useState } from "react";

// Components
import EndpointFeedback from "../../components/EndpointFeedback/EndpointFeedback";
import ButtonSubmit from "../../components/ButtonSubmit/ButtonSubmit";
import ImageUploader from "../../components/ImageUploader/ImageUploader";

// CSS
import "./CreatePdf.css";

const CreatePdf = () => {
    const [images, setImages] = useState<File[]>([]);
    const [pdfTitle, setPdfTitle] = useState<string>("");
    const [pdfSubject, setPdfSubject] = useState<string>("");

    const [btnSumbit, setBtnSubmit] = useState({
        disabled: false,
        value: "Create PDF",
    });

    const [feedback, setFeedback] = useState({
        message: "",
        status: null as "success" | "error" | "warning" | "info" | "danger" | null,
    });

    const handleCreate = async (e: React.FormEvent) => {
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
        formData.append("pdfTitle", pdfTitle);
        formData.append("pdfSubject", pdfSubject);

        try {
            setBtnSubmit({
                value: "Creating...",
                disabled: true,
            });

            setFeedback({
                message: "Processing your images...",
                status: "info",
            });

            const endpoint = `${process.env.REACT_APP_API_URL}/pdf-from-images`;
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            const blob = await response.blob();

            // Tenta obter o nome do ficheiro do header
            const contentDisposition = response.headers.get("Content-Disposition");
            const headerFilename = contentDisposition?.match(/filename="?(.+)"?/)?.[1];
            const fallbackFilename = response.headers.get("X-Filename") || "output.pdf";

            const filename = headerFilename || fallbackFilename;

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            setFeedback({
                message: "PDF created!",
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
                value: "CreatePdf",
                disabled: false,
            });
        }
    };

    return (
        <div className="container-fluid">
            <h1 className="mb-4">Create PDF</h1>

            <form onSubmit={handleCreate}>
                <div className="mb-3">
                    <ImageUploader onChange={setImages} />
                </div>

                <div className="mb-3">
                    <label htmlFor="pdf-title" className="form-label">
                        PDF title
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="pdf-title"
                        onChange={(e) => setPdfTitle(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="pdf-subject" className="form-label">
                        PDF subject
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="pdf-subject"
                        onChange={(e) => setPdfSubject(e.target.value)}
                    />
                </div>

                <ButtonSubmit disabled={btnSumbit.disabled} description={btnSumbit.value} />
            </form>

            <EndpointFeedback status={feedback.status} description={feedback.message} />
        </div>
    );
};

export default CreatePdf;
