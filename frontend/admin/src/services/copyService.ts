import axiosInstance from "../api/axiosInstance";

// Lấy danh sách bản sao (có phân trang và tìm kiếm)
export const getBookCopies = async (page = 1, q = "") => {
    const response = await axiosInstance.get(`/v1/book-copies?page=${page}&q=${encodeURIComponent(q)}`);
    return response.data;
};

// Thêm bản sao
export const createBookCopy = async (data: any) => {
    const response = await axiosInstance.post("/v1/book-copies", data);
    return response.data;
};

// Cập nhật bản sao
export const updateBookCopy = async (id: number, data: any) => {
    const response = await axiosInstance.put(`/v1/book-copies/${id}`, data);
    return response.data;
};

// Xóa bản sao (Thanh lý bản sao)
export const deleteBookCopy = async (id: number, data?: any) => {
    const response = await axiosInstance.delete(`/v1/book-copies/${id}`, { data });
    return response.data;
};

// Sinh barcode mới, chưa tồn tại trong kho, để gợi ý cho ô nhập barcode
export const generateBarcode = async (): Promise<string> => {
    const response = await axiosInstance.get(`/v1/book-copies/generate-barcode`);
    return response.data.barcode;
};

// Nhập kho hàng loạt từ file Excel/CSV
export const importCopies = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post("/v1/book-copies/import", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

// Lấy số liệu báo cáo kho tổng hợp (có lọc theo thể loại)
export const getInventorySummary = async (categoryId?: number) => {
    const url = `/v1/book-copies/summary-report` + (categoryId ? `?category_id=${categoryId}` : '');
    const response = await axiosInstance.get(url);
    return response.data;
};

