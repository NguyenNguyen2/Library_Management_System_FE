import axiosInstance from "../api/axiosInstance";

// Lấy danh sách sách (có phân trang và tìm kiếm)
export const getBooks = async (page = 1, q = "") => {
    // API v1/books trả về dạng paginated
    const response = await axiosInstance.get(`/v1/books?page=${page}&q=${encodeURIComponent(q)}`);
    return response.data;
};

// Thêm sách
export const createBook = async (data: any) => {
    const response = await axiosInstance.post("/v1/books", data);
    return response.data;
};

// Cập nhật sách
export const updateBook = async (id: number, data: any) => {
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