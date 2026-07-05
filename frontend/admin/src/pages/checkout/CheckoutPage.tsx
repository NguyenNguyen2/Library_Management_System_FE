import {
  Alert,
  AutoComplete,
  Button,
  Divider,
  Input,
  type InputRef,
  Modal,
  Spin,
  Table,
  type TableColumnsType,
  Tag,
  message,
} from 'antd';
import {
  BookOutlined,
  DeleteOutlined,
  ExportOutlined,
  PrinterOutlined,
  ScanOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useRef, useState } from 'react';
import { ReaderInfo, BookCopyInfo, AvailableCopy } from '../../api/checkoutApi';
import { checkoutHooks } from '../../hooks/useCheckout';
import { receiptHooks } from '../../hooks/useReceipt';
import { cn } from '@shared/constants/commonConst';
import dayjs from 'dayjs';

interface SelectedBook {
  copy_id: number;
  barcode: string;
  title: string;
  condition: string;
}

const CheckoutPage = () => {
  const [keyword, setKeyword] = useState('');
  const [readerResults, setReaderResults] = useState<ReaderInfo[]>([]);
  const [selectedReader, setSelectedReader] = useState<ReaderInfo | null>(null);
  const [barcode, setBarcode] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<SelectedBook[]>([]);
  const barcodeInputRef = useRef<InputRef>(null);

  const findReaderMutation = checkoutHooks.useFindReader();
  const { data: availableCopies = [], isFetching: searchingCopies } =
    checkoutHooks.useSearchAvailableCopies(selectedReader ? barcode : '');
  const validateCopyMutation = checkoutHooks.useValidateCopy();
  const checkoutMutation = checkoutHooks.useCheckout();
  const checkoutReceiptMutation = receiptHooks.useCheckoutReceipt();

  const handleFindReader = () => {
    const trimmed = keyword.trim();
    if (trimmed.length < 2) {
      message.warning('Vui lòng nhập ít nhất 2 ký tự.');
      return;
    }
    findReaderMutation.mutate(trimmed, {
      onSuccess: (data) => {
        setReaderResults(data);
        setSelectedReader(null);
        setSelectedBooks([]);
        if (data.length === 0) message.info('Không tìm thấy độc giả nào.');
      },
      onError: (err) => {
        const msg = (err.response?.data as { message?: string })?.message;
        message.error(msg ?? 'Lỗi tìm kiếm độc giả.');
      },
    });
  };

  const handleSelectReader = (reader: ReaderInfo) => {
    setSelectedReader(reader);
    setReaderResults([]);
    setKeyword(reader.full_name);
    setSelectedBooks([]);
    setTimeout(() => barcodeInputRef.current?.focus(), 100);
  };

  const handleClearReader = () => {
    setSelectedReader(null);
    setReaderResults([]);
    setKeyword('');
    setSelectedBooks([]);
  };

  const addCopyByBarcode = (barcodeValue: string) => {
    const trimmed = barcodeValue.trim();
    if (!trimmed) return;

    if (selectedBooks.some((b) => b.barcode === trimmed)) {
      message.warning(`"${trimmed}" đã có trong danh sách.`);
      setBarcode('');
      return;
    }

    validateCopyMutation.mutate(trimmed, {
      onSuccess: (copy: BookCopyInfo) => {
        setSelectedBooks((prev) => [
          ...prev,
          {
            copy_id: copy.copy_id,
            barcode: copy.barcode,
            title: copy.book.title,
            condition: copy.condition,
          },
        ]);
        setBarcode('');
        setTimeout(() => barcodeInputRef.current?.focus(), 50);
      },
      onError: (err) => {
        const msg = (err.response?.data as { message?: string })?.message;
        message.error(msg ?? 'Không tìm thấy sách hoặc sách không khả dụng.');
        setBarcode('');
        setTimeout(() => barcodeInputRef.current?.focus(), 50);
      },
    });
  };

  // Gợi ý từ search (khi chưa có kết quả search, vẫn cho dùng barcode cứng)
  const autoOptions = (availableCopies as AvailableCopy[]).map((c) => ({
    value: c.barcode,
    label: (
      <div className="flex items-center justify-between gap-2 py-0.5">
        <div className="min-w-0">
          <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1 rounded mr-2">
            {c.barcode}
          </span>
          <span className="text-sm text-gray-700">{c.title}</span>
          {c.author && (
            <span className="text-xs text-gray-400 ml-1">— {c.author}</span>
          )}
        </div>
        <Tag
          color={
            c.condition === 'new' ? 'blue'
            : c.condition === 'good' ? 'green'
            : c.condition === 'heavy' ? 'red'
            : 'orange'
          }
          className="shrink-0 !text-xs"
        >
          {{ new: 'Mới', good: 'Tốt', old: 'Cũ', light: 'Hỏng nhẹ', heavy: 'Hỏng nặng' }[c.condition] ?? c.condition}
        </Tag>
      </div>
    ),
  }));

  const handleRemoveBook = (copyId: number) => {
    setSelectedBooks((prev) => prev.filter((b) => b.copy_id !== copyId));
  };

  const totalAfterCheckout = (selectedReader?.borrowing_count ?? 0) + selectedBooks.length;
  const exceedsLimit =
    selectedReader !== null &&
    selectedReader.borrow_limit > 0 &&
    totalAfterCheckout > selectedReader.borrow_limit;

  const canCheckout =
    selectedReader !== null &&
    selectedReader.can_borrow &&
    selectedBooks.length > 0 &&
    !exceedsLimit &&
    !checkoutMutation.isPending;

  const handleCheckout = () => {
    if (!selectedReader) return;
    checkoutMutation.mutate(
      {
        user_id: selectedReader.user_id,
        copy_ids: selectedBooks.map((b) => b.copy_id),
      },
      {
        onSuccess: (result) => {
          // Tự động mở PDF phiếu mượn trong tab mới
          checkoutReceiptMutation.mutate(result.borrow_id, {
            onError: () => message.warning('Không thể tạo PDF. Vui lòng thử lại sau.'),
          });

          Modal.success({
            title: 'Tạo phiếu mượn thành công',
            width: 420,
            content: (
              <div className="space-y-2 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mã phiếu</span>
                  <span className="font-bold text-navyDark">#{result.borrow_id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Độc giả</span>
                  <span className="font-medium">{result.reader.full_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mã thẻ</span>
                  <span className="font-mono">{result.reader.card_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hạn trả</span>
                  <span className="font-semibold text-red-500">
                    {dayjs(result.due_date).format('DD/MM/YYYY')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Số sách</span>
                  <span className="font-medium">{result.books.length} cuốn</span>
                </div>
                <div className="text-xs text-blue-500 mt-2">
                  Phiếu mượn PDF đang mở trong tab mới...
                </div>
              </div>
            ),
            okText: 'Đóng',
          });
          setSelectedReader(null);
          setSelectedBooks([]);
          setKeyword('');
          setBarcode('');
          setReaderResults([]);
        },
        onError: (err) => {
          const msg = (err.response?.data as { message?: string })?.message;
          message.error(msg ?? 'Có lỗi xảy ra khi tạo phiếu mượn.');
        },
      }
    );
  };

  const bookColumns: TableColumnsType<SelectedBook> = [
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 130,
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
      title: 'Tình trạng',
      dataIndex: 'condition',
      key: 'condition',
      width: 100,
      render: (v: string) => {
        const colorMap: Record<string, string> = {
          new: 'blue', good: 'green', old: 'default', light: 'orange', heavy: 'red',
        };
        const labelMap: Record<string, string> = {
          new: 'Mới', good: 'Tốt', old: 'Cũ', light: 'Hỏng nhẹ', heavy: 'Hỏng nặng',
        };
        return <Tag color={colorMap[v] ?? 'default'}>{labelMap[v] ?? v}</Tag>;
      },
    },
    {
      title: '',
      key: 'remove',
      width: 44,
      render: (_: unknown, record: SelectedBook) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveBook(record.copy_id)}
        />
      ),
    },
  ];

  return (
    <div className="max-w-[860px] mx-auto flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
          <ExportOutlined className="text-blue-600" style={{ fontSize: 22 }} />
        </div>
        <div>
          <h1 className="m-0 text-xl font-bold text-navyDark leading-tight">
            Mượn sách (Check-out)
          </h1>
          <p className="m-0 text-sm text-gray-500 mt-0.5">Ghi nhận cho mượn tại quầy</p>
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
              placeholder="VD: TV001 hoặc Nguyễn Văn A"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleFindReader}
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              onClear={handleClearReader}
            />
            <Button
              type="primary"
              onClick={handleFindReader}
              loading={findReaderMutation.isPending}
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
                    'bg-white hover:bg-blue-50 border-0 cursor-pointer transition-colors'
                  )}
                >
                  <div>
                    <p className="m-0 text-sm font-semibold text-navyDark">{r.full_name}</p>
                    <p className="m-0 text-xs text-gray-500">
                      {r.library_card?.card_number ?? 'Chưa có thẻ'} · {r.email}
                    </p>
                  </div>
                  <div className="shrink-0 ml-3">
                    {r.can_borrow ? (
                      <Tag color="green">Có thể mượn</Tag>
                    ) : (
                      <Tag color="red">Không thể mượn</Tag>
                    )}
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
                selectedReader.can_borrow
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              )}
            >
              <div className="mt-0.5 shrink-0">
                {selectedReader.can_borrow ? (
                  <CheckCircleOutlined className="text-green-500 text-base" />
                ) : (
                  <WarningOutlined className="text-red-500 text-base" />
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
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                  <span>
                    Đang mượn:{' '}
                    <strong>
                      {selectedReader.borrowing_count}/{selectedReader.borrow_limit}
                    </strong>{' '}
                    quyển
                  </span>
                  {selectedReader.unpaid_fines > 0 && (
                    <span className="text-red-600 font-medium">
                      Nợ phí:{' '}
                      {new Intl.NumberFormat('vi-VN').format(selectedReader.unpaid_fines)} VND
                    </span>
                  )}
                </div>
                {selectedReader.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedReader.warnings.map((w, i) => (
                      <Alert key={i} message={w} type="warning" showIcon className="!py-1 text-xs" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Divider className="!m-0" />

        {/* Section 2 — Quét barcode */}
        <div className="px-6 py-5">
          <p className="m-0 mb-2 text-sm font-semibold text-gray-700">Quét barcode sách</p>

          <div className="flex gap-2">
            <AutoComplete
              style={{ flex: 1 }}
              options={autoOptions}
              value={barcode}
              onChange={(val) => setBarcode(val)}
              onSelect={(val: string) => addCopyByBarcode(val)}
              disabled={!selectedReader || !selectedReader.can_borrow}
              notFoundContent={
                barcode.trim().length >= 1 && !searchingCopies
                  ? <span className="text-xs text-gray-400 px-2">Không tìm thấy — nhấn Enter để quét trực tiếp</span>
                  : null
              }
            >
              <Input
                ref={barcodeInputRef}
                size="middle"
                placeholder="Nhập tên sách, barcode hoặc ISBN..."
                prefix={
                  searchingCopies
                    ? <Spin size="small" />
                    : <ScanOutlined className="text-gray-400" />
                }
                allowClear
                onPressEnter={() => addCopyByBarcode(barcode)}
              />
            </AutoComplete>
            <Button
              onClick={() => addCopyByBarcode(barcode)}
              loading={validateCopyMutation.isPending}
              disabled={!selectedReader || !selectedReader.can_borrow || !barcode.trim()}
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
          {selectedReader && selectedReader.can_borrow && (
            <p className="mt-1.5 text-xs text-gray-400">
              Gõ tên sách để tìm nhanh, hoặc quét barcode trực tiếp rồi nhấn Enter.
            </p>
          )}
        </div>

        <Divider className="!m-0" />

        {/* Section 3 — Danh sách sách */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Danh sách sách mượn</span>
            <span className="text-sm text-gray-400">{selectedBooks.length} cuốn</span>
          </div>

          {selectedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <BookOutlined style={{ fontSize: 28 }} className="mb-2 opacity-40" />
              <p className="m-0 text-sm">Chưa có sách nào — quét barcode để bắt đầu</p>
            </div>
          ) : (
            <>
              <Table<SelectedBook>
                dataSource={selectedBooks}
                columns={bookColumns}
                rowKey="copy_id"
                pagination={false}
                size="small"
              />
              {exceedsLimit && (
                <Alert
                  className="mt-3"
                  message={`Vượt hạn mức: tổng ${totalAfterCheckout}/${selectedReader?.borrow_limit} quyển`}
                  type="error"
                  showIcon
                />
              )}
            </>
          )}
        </div>

        <Divider className="!m-0" />

        {/* Bottom — Confirm button */}
        <div className="px-6 py-4">
          <Button
            type="primary"
            size="large"
            block
            disabled={!canCheckout}
            loading={checkoutMutation.isPending}
            onClick={handleCheckout}
            icon={<PrinterOutlined />}
            style={{ height: 48, fontSize: 15, fontWeight: 600 }}
          >
            Xác nhận &amp; In biên lai PDF
          </Button>
        </div>
      </div>

    </div>
  );
};

export default CheckoutPage;
