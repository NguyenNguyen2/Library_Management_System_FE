// Route public (không cần auth). Backend trả text/html bọc PDF blob →
// IDM không chặn vì chỉ chặn application/pdf, không chặn text/html.
const BASE_URL = ((import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

const openReceiptUrl = (path: string): void => {
  const url = `${BASE_URL}/${path}`;
  const win = window.open(url, '_blank');
  if (!win) {
    // Popup bị block: dùng anchor tag
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

export const receiptApi = {
  getCheckoutReceipt: async (borrowId: number): Promise<void> => {
    openReceiptUrl(`private/v1/receipt/checkout/${borrowId}`);
  },

  getReturnReceipt: async (borrowId: number): Promise<void> => {
    openReceiptUrl(`private/v1/receipt/return/${borrowId}`);
  },
};
