import axiosInstance from "../api/axiosInstance";

// Lấy danh sách sách (có phân trang và tìm kiếm)
export const getBooks = async (page = 1, q = "") => {
    // API v1/books trả về dạng paginated
    const response = await axiosInstance.get(`/v1/books?page=${page}&q=${encodeURIComponent(q)}`);
    return response.data;
};

// Lấy danh sách sách nổi bật (phân trang từ toàn bộ DB, không giới hạn ở trang đang tải của danh sách chính)
export const getFeaturedBooks = async (page = 1) => {
    const response = await axiosInstance.get(`/v1/books?page=${page}&is_featured=1`);
    return response.data;
};

// Chuyển object dữ liệu sách (có thể chứa File ảnh bìa) thành multipart FormData
const buildBookFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (value instanceof File) {
            formData.append(key, value);
        } else if (Array.isArray(value)) {
            value.forEach((item) => formData.append(`${key}[]`, String(item)));
        } else if (typeof value === "boolean") {
            formData.append(key, value ? "1" : "0");
        } else {
            formData.append(key, String(value));
        }
    });
    return formData;
};

// Thêm sách (multipart — hỗ trợ upload ảnh bìa, barcode, tạo bản sao đầu tiên)
export const createBook = async (data: any) => {
    const formData = buildBookFormData(data);
    const response = await axiosInstance.post("/v1/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

// Cập nhật sách. Nếu có ảnh mới hoặc yêu cầu xóa ảnh thì gửi multipart (kèm _method=PUT
// vì PHP không tự đọc được file từ request PUT thật); các trường hợp còn lại giữ nguyên PUT JSON.
export const updateBook = async (id: number, data: any) => {
    const hasNewCover = data?.cover_image instanceof File;
    const hasRemoveFlag = data?.remove_cover_image === true;

    if (hasNewCover || hasRemoveFlag) {
        const formData = buildBookFormData(data);
        formData.append("_method", "PUT");
        const response = await axiosInstance.post(`/v1/books/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    }

    const response = await axiosInstance.put(`/v1/books/${id}`, data);
    return response.data;
};

// Xóa sách
export const deleteBook = async (id: number) => {
    const response = await axiosInstance.delete(`/v1/books/${id}`);
    return response.data;
};

// Lấy theo ISBN
export const getBookByISBN = async (isbn: string) => {
    const response = await axiosInstance.get(`/v1/books/isbn/${isbn}`);
    return response.data;
};

// Lấy danh sách tác giả, thể loại, nhà xuất bản để tạo/sửa sách
export const getFilterOptions = async () => {
    const response = await axiosInstance.get("/v1/books/filter-options");
    return response.data;
};

// Lấy chi tiết sách bao gồm lịch sử chỉnh sửa (admin endpoint)
export const getBookDetail = async (id: number) => {
    const response = await axiosInstance.get(`/v1/books/${id}/admin-detail`);
    return response.data;
};