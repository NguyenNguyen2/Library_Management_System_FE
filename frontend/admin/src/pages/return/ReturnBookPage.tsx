import {
  Alert,
  Button,
  Divider,
  Input,
  InputRef,
  Modal,
  Spin,
  Table,
  TableColumnsType,
  Tag,
  message,
} from 'antd';
import type { TableRowSelection } from 'antd/es/table/interface';
import {
  RollbackOutlined,
  SearchOutlined,
  ScanOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useRef, useState } from 'react';
import { ReturnReaderInfo, BorrowedBook } from '../../api/returnApi';
import { returnHooks } from '../../hooks/useReturnBook';
import { receiptHooks } from '../../hooks/useReceipt';
import { cn } from '@shared/constants/commonConst';
import dayjs from 'dayjs';
import { Printer } from 'lucide-react';

const ReturnBookPage = () => {
  const [keyword, setKeyword] = useState('');
  const [readerResults, setReaderResults] = useState<ReturnReaderInfo[]>([]);
  const [selectedReader, setSelectedReader] = useState<ReturnReaderInfo | null>(null);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [selectedCopyIds, setSelectedCopyIds] = useState<number[]>([]);
  const [barcode, setBarcode] = useState('');
  const barcodeRef = useRef<InputRef>(null);

  const searchMutation = returnHooks.useSearchReader();
  const borrowedMutation = returnHooks.useGetBorrowedBooks();
  const validateMutation = returnHooks.useValidateCopy();
  const confirmMutation = returnHooks.useConfirmReturn();
  const returnReceiptMutation = receiptHooks.useReturnReceipt();

  const handleFindReader = () => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) {
      message.warning('Vui lòng nhập ít nhất 2 ký tự.');
      return;
    }
    searchMutation.mutate(trimmed, {
      onSuccess: (data) => {
        setReaderResults(data);
        setSelectedReader(null);
        setSelectedCopyIds([]);
        setBorrowedBooks([]);
        if (data.length === 0) message.info('Không tìm thấy độc giả nào đang mượn sách.');
      },
      onError: (err) => {
        const msg = (err.response?.data as { message?: string })?.message;
        message.error(msg ?? 'Lỗi tìm kiếm độc giả.');
      },
    });
  };

  const handleSelectReader = (reader: ReturnReaderInfo) => {
    setSelectedReader(reader);
    setReaderResults([]);
    setKeyword(reader.full_name);
    setSelectedCopyIds([]);
    setBorrowedBooks([]);
    borrowedMutation.mutate(reader.user_id, {
      onSuccess: (books) => {
        setBorrowedBooks(books);
        setTimeout(() => barcodeRef.current?.focus(), 100);
      },
      onError: () => {
        message.error('Không thể tải danh sách sách đang mượn.');
      },
    });
  };

  const handleClearReader = () => {
    setSelectedReader(null);
    setReaderResults([]);
    setKeyword('');
    setSelectedCopyIds([]);
    setBorrowedBooks([]);
  };

  const handleScanBarcode = () => {
    const trimmed = barcode.trim();
    if (!trimmed || !selectedReader) return;

    validateMutation.mutate(
      { barcode: trimmed, userId: selectedReader.user_id },
      {
        onSuccess: (copy) => {
          if (selectedCopyIds.includes(copy.copy_id)) {
            message.warning(`Barcode "${trimmed}" đã có trong danh sách trả.`);
          } else {
            setSelectedCopyIds((prev) => [...prev, copy.copy_id]);
            message.success(`Đã thêm: ${copy.title}`);
          }
          setBarcode('');
          barcodeRef.current?.focus();
        },
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Barcode không hợp lệ hoặc không thuộc độc giả này.');
          setBarcode('');
          barcodeRef.current?.focus();
        },
      }
    );
  };

  const handleConfirm = () => {
    if (!selectedReader || selectedCopyIds.length === 0) return;

    // Lấy borrow_id đầu tiên từ sách đang trả (dùng cho receipt)
    const firstBorrowId = borrowedBooks.find((b) => selectedCopyIds.includes(b.copy_id))?.borrow_id;

    confirmMutation.mutate(
      { user_id: selectedReader.user_id, copy_ids: selectedCopyIds },
      {
        onSuccess: (result) => {
          // borrow_id cho receipt: ưu tiên closed_transactions, rồi firstBorrowId
          const receiptBorrowId = result.closed_transactions[0] ?? firstBorrowId;

          Modal.success({
            title: 'Trả sách thành công',
            width: 420,
            content: (
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ngày trả</span>
                  <span className="font-medium">{dayjs(result.return_date).format('DD/MM/YYYY')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số cuốn đã trả</span>
                  <span className="font-medium">{result.returned_books_count} cuốn</span>
                </div>
                {result.total_penalty > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí phạt phát sinh</span>
                    <span className="font-semibold text-red-500">
                      {new Intl.NumberFormat('vi-VN').format(result.total_penalty)} VND
                    </span>
                  </div>
                )}
                {result.closed_transactions.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phiếu đã đóng</span>
                    <span className="font-mono text-xs text-gray-600">
                      {result.closed_transactions.map((id) => `#${id}`).join(', ')}
                    </span>
                  </div>
                )}
                {receiptBorrowId && (
                  <Button
                  type="default"
                  icon={<Printer size={14} />}
                  onClick={() => returnReceiptMutation.mutate(receiptBorrowId)}
                  className="rounded-lg h-9 flex items-center font-semibold"
                >
                  In biên lai PDF
                </Button>
                )}
              </div>
            ),
            okText: 'Đóng',
          });
          setSelectedReader(null);
          setKeyword('');
          setBorrowedBooks([]);
          setSelectedCopyIds([]);
          setBarcode('');
          setReaderResults([]);
        },
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Có lỗi xảy ra khi trả sách.');
        },
      }
    );
  };

  const selectedBooks = borrowedBooks.filter((b) => selectedCopyIds.includes(b.copy_id));
  const totalPenalty = selectedBooks.reduce((sum, b) => sum + b.penalty_fee, 0);
  const canConfirm = selectedReader !== null && selectedCopyIds.length > 0 && !confirmMutation.isPending;

  const rowSelection: TableRowSelection<BorrowedBook> = {
    selectedRowKeys: selectedCopyIds,
    onChange: (keys) => setSelectedCopyIds(keys as number[]),
    getCheckboxProps: () => ({ disabled: confirmMutation.isPending }),
  };

  const columns: TableColumnsType<BorrowedBook> = [
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 110,
      render: (v: string) => (
        <span className="font-mono text-xs font-semibold text-navyDark bg-gray-100 px-2 py-0.5 rounded">
          {v}
        </span>
      ),
    },
    {
      title: 'Tên sách',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Hạn trả',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 110,
      render: (v: string, record: BorrowedBook) => (
        <span className={record.overdue_days > 0 ? 'text-red-500 font-medium' : ''}>
          {dayjs(v).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: 'Quá hạn',
      dataIndex: 'overdue_days',
      key: 'overdue_days',
      width: 90,
      render: (v: number) =>
        v > 0 ? (
          <Tag color="red">{v} ngày</Tag>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
    {
      title: 'Phí phạt',
      dataIndex: 'penalty_fee',
      key: 'penalty_fee',
      width: 120,
      render: (v: number) =>
        v > 0 ? (
          <span className="font-medium text-red-500 text-xs">
            {new Intl.NumberFormat('vi-VN').format(v)} ₫
          </span>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        ),
    },
  ];

  return (
    <div className="max-w-[860px] mx-auto flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <RollbackOutlined className="text-red-500" style={{ fontSize: 22 }} />
        </div>
        <div>
          <h1 className="m-0 text-xl font-bold text-navyDark leading-tight">
            Trả sách (Check-in)
          </h1>
          <p className="m-0 text-sm text-gray-500 mt-0.5">Ghi nhận trả sách tại quầy</p>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Section 1 — Tìm độc giả */}
        <div className="px-6 py-5">
          <p className="m-0 mb-2 text-sm font-semibold text-gray-700">
            Tìm độc giả (mã thẻ / tên)
          </p>
          <div className="flex gap-2">
            <Input
              size="middle"
              placeholder="VD: LIB-01 hoặc Nguyễn Văn A"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleFindReader}
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              onClear={handleClearReader}
            />
            <Button
              type="primary"
              danger
              onClick={handleFindReader}
              loading={searchMutation.isPending}
              style={{ minWidth: 72 }}
            >
              Tìm
            </Button>
          </div>

          {/* Search results */}
          {readerResults.length > 0 && (
            <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100 shadow-sm">
              {readerResults.map((r) => (
                <button
                  key={r.user_id}
                  onClick={() => handleSelectReader(r)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 flex items-center justify-between',
                    'bg-white hover:bg-red-50 border-0 cursor-pointer transition-colors'
                  )}
                >
                  <div>
                    <p className="m-0 text-sm font-semibold text-navyDark">{r.full_name}</p>
                    <p className="m-0 text-xs text-gray-500">
                      {r.library_card?.card_number ?? '—'} · {r.email}
                    </p>
                  </div>
                  <div className="shrink-0 ml-3 flex gap-1.5">
                    <Tag color="blue">{r.active_borrows} sách</Tag>
                    {r.has_overdue && <Tag color="red">Quá hạn</Tag>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected reader info */}
          {selectedReader && (
            <div
              className={cn(
                'mt-3 rounded-xl border px-4 py-3 flex items-start gap-3',
                selectedReader.has_overdue
                  ? 'border-red-200 bg-red-50'
                  : 'border-green-200 bg-green-50'
              )}
            >
              <div className="mt-0.5 shrink-0">
                {selectedReader.has_overdue ? (
                  <WarningOutlined className="text-red-500 text-base" />
                ) : (
                  <CheckCircleOutlined className="text-green-500 text-base" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-navyDark">
                    {selectedReader.full_name}
                  </span>
                  <span className="font-mono text-xs text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
                    {selectedReader.library_card?.card_number ?? '—'}
                  </span>
                  {selectedReader.has_overdue && <Tag color="red">Có sách quá hạn</Tag>}
                </div>
                <p className="m-0 mt-1 text-xs text-gray-600">
                  Đang mượn: <strong>{selectedReader.active_borrows}</strong> cuốn
                </p>
              </div>
            </div>
          )}
        </div>

        <Divider className="!m-0" />

        {/* Section 2 — Quét barcode */}
        <div className="px-6 py-5">
          <p className="m-0 mb-2 text-sm font-semibold text-gray-700">Quét barcode sách trả</p>
          <div className="flex gap-2">
            <Input
              ref={barcodeRef}
              size="middle"
              placeholder="Quét hoặc nhập mã sách..."
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onPressEnter={handleScanBarcode}
              prefix={<ScanOutlined className="text-gray-400" />}
              disabled={!selectedReader}
              allowClear
            />
            <Button
              onClick={handleScanBarcode}
              loading={validateMutation.isPending}
              disabled={!selectedReader || !barcode.trim()}
              style={{ minWidth: 72 }}
            >
              Thêm
            </Button>
          </div>
          {!selectedReader && (
            <p className="mt-1.5 text-xs text-gray-400">
              Tìm và chọn độc giả trước khi quét sách.
            </p>
          )}
        </div>

        <Divider className="!m-0" />

        {/* Section 3 — Danh sách sách đang mượn */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Danh sách sách đang mượn</span>
            {borrowedBooks.length > 0 && (
              <div className="flex gap-2">
                <Button
                  size="small"
                  onClick={() => setSelectedCopyIds(borrowedBooks.map((b) => b.copy_id))}
                  disabled={selectedCopyIds.length === borrowedBooks.length}
                >
                  Chọn tất cả
                </Button>
                {selectedCopyIds.length > 0 && (
                  <Button size="small" danger onClick={() => setSelectedCopyIds([])}>
                    Bỏ chọn
                  </Button>
                )}
              </div>
            )}
          </div>

          {borrowedMutation.isPending ? (
            <div className="flex justify-center py-10">
              <Spin size="large" />
            </div>
          ) : borrowedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <RollbackOutlined style={{ fontSize: 28 }} className="mb-2 opacity-40" />
              <p className="m-0 text-sm">
                {selectedReader ? 'Không có sách đang mượn' : 'Chọn độc giả để xem danh sách'}
              </p>
            </div>
          ) : (
            <>
              <Table<BorrowedBook>
                dataSource={borrowedBooks}
                columns={columns}
                rowKey="copy_id"
                rowSelection={rowSelection}
                pagination={false}
                size="small"
                rowClassName={(record) =>
                  record.overdue_days > 0 ? '!bg-red-50' : ''
                }
              />
              <p className="mt-2 text-xs text-gray-500 text-right">
                Đã chọn: <strong>{selectedCopyIds.length}</strong> / {borrowedBooks.length} cuốn
              </p>
            </>
          )}
        </div>

        <Divider className="!m-0" />

        {/* Section 4 — Summary + Confirm */}
        <div className="px-6 py-5">
          {totalPenalty > 0 && (
            <Alert
              className="mb-4"
              type="warning"
              showIcon
              message={
                <span>
                  Tổng phí phạt quá hạn (sách đã chọn):{' '}
                  <strong className="text-red-600">
                    {new Intl.NumberFormat('vi-VN').format(totalPenalty)} ₫
                  </strong>
                </span>
              }
            />
          )}
          <Button
            type="primary"
            danger
            size="large"
            block
            disabled={!canConfirm}
            loading={confirmMutation.isPending}
            onClick={handleConfirm}
            icon={<RollbackOutlined />}
            style={{ height: 48, fontSize: 15, fontWeight: 600 }}
          >
            {selectedCopyIds.length > 0
              ? `Xác nhận trả sách (${selectedCopyIds.length} cuốn)`
              : 'Xác nhận trả sách'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReturnBookPage;
