import axiosInstance from "../api/axiosInstance";

export const getCategories = async () => {
    const response = await axiosInstance.get("/v1/categories");
    return response.data;
};

export const createCategory = async (data: any) => {
    const response = await axiosInstance.post("/v1/categories", data);
    return response.data;
};

export const updateCategory = async (id: number, data: any) => {
    const response = await axiosInstance.put(`/v1/categories/${id}`, data);
    return response.data;
};

export const deleteCategory = async (id: number) => {
    const response = await axiosInstance.delete(`/v1/categories/${id}`);
    return response.data;
};
