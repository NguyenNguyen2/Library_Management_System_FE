import axiosInstance from './axiosInstance';

const openPdfBlob = async (
  url: string,
  borrowId: number,
  filename: string
): Promise<void> => {
  const res = await axiosInstance.get(url, { responseType: 'blob' });

  const blob = res.data as Blob;

  // Guard: server trả về JSON error thay vì PDF
  if (blob.type.includes('application/json')) {
    const text = await blob.text();
    const json = JSON.parse(text);
    throw new Error(json?.message ?? 'Lỗi tạo PDF.');
  }

  const objectUrl = URL.createObjectURL(blob);

  // window.open không bị popup blocker khi gọi từ async handler
  const win = window.open(objectUrl, '_blank');
  if (!win) {
    // Nếu vẫn bị block → fallback: download file
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
};

export const receiptApi = {
  getCheckoutReceipt: async (borrowId: number): Promise<void> => {
    await openPdfBlob(
      `/private/v1/receipt/checkout/${borrowId}`,
      borrowId,
      `phieu-muon-${String(borrowId).padStart(6, '0')}.pdf`
    );
  },

  getReturnReceipt: async (borrowId: number): Promise<void> => {
    await openPdfBlob(
      `/private/v1/receipt/return/${borrowId}`,
      borrowId,
      `bien-lai-tra-${String(borrowId).padStart(6, '0')}.pdf`
    );
  },
};
