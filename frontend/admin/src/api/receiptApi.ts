import axiosInstance from './axiosInstance';

const openPdfBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};

export const receiptApi = {
  getCheckoutReceipt: async (borrowId: number): Promise<void> => {
    const res = await axiosInstance.get(
      `/private/v1/receipt/checkout/${borrowId}`,
      { responseType: 'blob' }
    );
    openPdfBlob(res.data as Blob, `phieu-muon-${String(borrowId).padStart(6, '0')}.pdf`);
  },

  getReturnReceipt: async (borrowId: number): Promise<void> => {
    const res = await axiosInstance.get(
      `/private/v1/receipt/return/${borrowId}`,
      { responseType: 'blob' }
    );
    openPdfBlob(res.data as Blob, `bien-lai-tra-${String(borrowId).padStart(6, '0')}.pdf`);
  },
};
