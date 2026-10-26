export const orderDocumentExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'tar'];
export const orderDocumentAccept = orderDocumentExtensions.map((extension) => `.${extension}`);

export function validateOrderDocument(file) {
    const extension = file.name?.split('.').pop()?.toLowerCase();
    if (!orderDocumentExtensions.includes(extension) || !Number.isFinite(file.size) || file.size <= 0 || file.size > 10 * 1024 * 1024) {
        throw new Error('Use a PDF, JPEG/PNG/GIF/WebP image, Word, Excel, PowerPoint, ZIP or TAR file, no larger than 10 MiB.');
    }
}
