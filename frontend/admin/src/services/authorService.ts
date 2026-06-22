import axiosInstance from "../api/axiosInstance";

export const getAuthors = async (page = 1) => {
    // Backend paginates authors
    const response = await axiosInstance.get(`/v1/authors?page=${page}`);
    return response.data;
};

export const createAuthor = async (data: any) => {
    const response = await axiosInstance.post("/v1/authors", data);
    return response.data;
};

export const updateAuthor = async (id: number, data: any) => {
    const response = await axiosInstance.put(`/v1/authors/${id}`, data);
    return response.data;
};

export const deleteAuthor = async (id: number) => {
    const response = await axiosInstance.delete(`/v1/authors/${id}`);
    return response.data;
};

export const getAuthorDetail = async (id: number) => {
    const response = await axiosInstance.get(`/v1/authors/${id}`);
    return response.data;
};
