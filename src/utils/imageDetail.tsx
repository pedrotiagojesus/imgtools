const getImageMetadata = async (
    file: File
): Promise<{ dpi: number | string; width: number | string; height: number | string; format: number | string }> => {
    const formData = new FormData();
    formData.append("image", file);

    const endpoint = `${process.env.REACT_APP_API_URL}/image-metadata`;
    const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    return {
        dpi: data.dpi,
        width: data.width,
        height: data.height,
        format: data.format,
    };
};

export { getImageMetadata };
