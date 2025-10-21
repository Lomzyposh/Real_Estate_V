export async function uploadImageToServer(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload image");

    const data = await res.json();
    return data.url; 
}
