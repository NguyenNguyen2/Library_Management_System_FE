import {
  Alert,
  Button,
  Card,
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
import {
  BookOutlined,
  DeleteOutlined,
  SearchOutlined,
  ScanOutlined,
  CheckCircleOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useRef, useState } from 'react';
import { ReaderInfo, BookCopyInfo } from '../../api/checkoutApi';
import { checkoutHooks } from '../../hooks/useCheckout';
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
  const barcodeRef = useRef<InputRef>(null);

  const findReaderMutation = checkoutHooks.useFindReader();
  const validateCopyMutation = checkoutHooks.useValidateCopy();
  const checkoutMutation = checkoutHooks.useCheckout();

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
    setTimeout(() => barcodeRef.current?.focus(), 100);
  };

  const handleScanBarcode = () => {
    const trimmed = barcode.trim();
    if (!trimmed) return;

    if (selectedBooks.some((b) => b.barcode === trimmed)) {
      message.warning(`Barcode "${trimmed}" đã có trong danh sách.`);
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
        barcodeRef.current?.focus();
      },
      onError: (err) => {
        const msg = (err.response?.data as { message?: string })?.message;
        message.error(msg ?? 'Barcode không hợp lệ hoặc không thể mượn.');
        setBarcode('');
        barcodeRef.current?.focus();
      },
    });
  };

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
          Modal.success({
            title: 'Tạo phiếu mượn thành công',
            content: (
              <div className="space-y-1 mt-2">
                <p className="m-0">
                  <strong>Mã phiếu:</strong> #{result.borrow_id}
                </p>
                <p className="m-0">
                  <strong>Độc giả:</strong> {result.reader.full_name}
                </p>
                <p className="m-0">
                  <strong>Hạn trả:</strong> {dayjs(result.due_date).format('DD/MM/YYYY')}
                </p>
                <p className="m-0">
                  <strong>Số sách:</strong> {result.books.length} cuốn
                </p>
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
      width: 140,
      render: (v: string) => (
        <span className="font-mono font-semibold text-navyDark">{v}</span>
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
      width: 110,
      render: (v: string) => {
        const colorMap: Record<string, string> = {
          good: 'green',
          fair: 'orange',
          poor: 'red',
        };
        return (
          <Tag color={colorMap[v] ?? 'default'}>
            {v === 'good' ? 'Tốt' : v === 'fair' ? 'Bình thường' : v === 'poor' ? 'Kém' : v}
          </Tag>
        );
      },
    },
    {
      title: '',
      key: 'action',
      width: 48,
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
    <div className="max-w-[1300px] mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-xl font-bold text-navyDark">Mượn sách</h1>
        <p className="m-0 text-gray-500 text-sm">Tạo phiếu mượn sách cho độc giả</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Step 1: Find Reader */}
          <Card
            title={
              <span className="flex items-center gap-2 font-semibold">
                <UserOutlined className="text-blue-500" />
                Bước 1 — Tìm độc giả
              </span>
            }
            className="!rounded-[10px] border border-gray-200 shadow-sm"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Tìm theo tên hoặc mã thẻ (ít nhất 2 ký tự)..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onPressEnter={handleFindReader}
                prefix={<SearchOutlined className="text-gray-400" />}
                allowClear
                onClear={() => {
                  setKeyword('');
                  setReaderResults([]);
                  setSelectedReader(null);
                  setSelectedBooks([]);
                }}
              />
              <Button
                type="primary"
                onClick={handleFindReader}
                loading={findReaderMutation.isPending}
                icon={<SearchOutlined />}
              >
                Tìm
              </Button>
            </div>

            {/* Search results dropdown */}
            {readerResults.length > 0 && (
              <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                {readerResults.map((r) => (
                  <button
                    key={r.user_id}
                    onClick={() => handleSelectReader(r)}
                    className={cn(
                      'w-full text-left px-4 py-3 flex items-center justify-between bg-white hover:bg-blue-50 cursor-pointer border-0 transition-colors'
                    )}
                  >
                    <div>
                      <p className="m-0 font-semibold text-navyDark text-sm">{r.full_name}</p>
                      <p className="m-0 text-xs text-gray-500">
                        {r.library_card?.card_number ?? 'Chưa có thẻ'} · {r.email}
                      </p>
                    </div>
                    <div className="shrink-0">
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
              <div className="mt-3">
                <div
                  className={cn(
                    'rounded-lg border p-4',
                    selectedReader.can_borrow
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="m-0 font-bold text-navyDark">{selectedReader.full_name}</p>
                      <p className="m-0 text-sm text-gray-600">
                        Mã thẻ:{' '}
                        <span className="font-mono font-semibold">
                          {selectedReader.library_card?.card_number ?? '—'}
                        </span>
                      </p>
                      <p className="m-0 text-sm text-gray-600">
                        Đang mượn:{' '}
                        <strong>
                          {selectedReader.borrowing_count}/{selectedReader.borrow_limit}
                        </strong>{' '}
                        quyển
                      </p>
                      {selectedReader.unpaid_fines > 0 && (
                        <p className="m-0 text-sm text-red-600 font-medium">
                          Nợ phí:{' '}
                          {new Intl.NumberFormat('vi-VN').format(selectedReader.unpaid_fines)} VND
                        </p>
                      )}
                    </div>
                    {selectedReader.can_borrow ? (
                      <CheckCircleOutlined className="text-green-500 text-xl shrink-0" />
                    ) : (
                      <WarningOutlined className="text-red-500 text-xl shrink-0" />
                    )}
                  </div>

                  {selectedReader.warnings.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {selectedReader.warnings.map((w, i) => (
                        <Alert
                          key={i}
                          message={w}
                          type="warning"
                          showIcon
                          className="!py-1 !px-3 text-xs"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Step 2: Scan Barcode */}
          <Card
            title={
              <span className="flex items-center gap-2 font-semibold">
                <ScanOutlined className="text-blue-500" />
                Bước 2 — Quét barcode sách
              </span>
            }
            className="!rounded-[10px] border border-gray-200 shadow-sm"
          >
            <div className="flex gap-2">
              <Input
                ref={barcodeRef}
                placeholder="Quét hoặc nhập barcode, nhấn Enter..."
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onPressEnter={handleScanBarcode}
                prefix={<BookOutlined className="text-gray-400" />}
                disabled={!selectedReader || !selectedReader.can_borrow}
                allowClear
              />
              <Button
                type="default"
                onClick={handleScanBarcode}
                loading={validateCopyMutation.isPending}
                disabled={!selectedReader || !selectedReader.can_borrow || !barcode.trim()}
                icon={<ScanOutlined />}
              >
                Thêm
              </Button>
            </div>

            {!selectedReader && (
              <p className="mt-2 text-xs text-gray-400">
                Tìm và chọn độc giả trước khi quét sách.
              </p>
            )}

            {selectedBooks.length > 0 && (
              <>
                <Divider className="!my-4" />
                <Table<SelectedBook>
                  dataSource={selectedBooks}
                  columns={bookColumns}
                  rowKey="copy_id"
                  pagination={false}
                  size="small"
                  locale={{ emptyText: 'Chưa có sách nào được thêm' }}
                />
              </>
            )}
          </Card>
        </div>

        {/* Right column — Summary + Checkout */}
        <div className="lg:col-span-1">
          <Card
            title={
              <span className="flex items-center gap-2 font-semibold">
                <CheckCircleOutlined className="text-blue-500" />
                Bước 3 — Xác nhận mượn
              </span>
            }
            className="!rounded-[10px] border border-gray-200 shadow-sm lg:sticky lg:top-6"
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-2">Độc giả</p>
                {selectedReader ? (
                  <div className="space-y-1">
                    <p className="m-0 font-semibold text-navyDark">{selectedReader.full_name}</p>
                    <p className="m-0 text-sm text-gray-500">
                      {selectedReader.library_card?.card_number ?? 'Chưa có thẻ'}
                    </p>
                  </div>
                ) : (
                  <p className="m-0 text-sm text-gray-400 italic">Chưa chọn độc giả</p>
                )}
              </div>

              <Divider className="!my-3" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Đang mượn</span>
                  <span className="font-medium">
                    {selectedReader ? `${selectedReader.borrowing_count} quyển` : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Thêm hôm nay</span>
                  <span className="font-medium text-blue-600">{selectedBooks.length} quyển</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Giới hạn</span>
                  <span className="font-medium">
                    {selectedReader ? `${selectedReader.borrow_limit} quyển` : '—'}
                  </span>
                </div>
              </div>

              <Divider className="!my-3" />

              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-2">
                  Sách được chọn ({selectedBooks.length})
                </p>
                {selectedBooks.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">Chưa có sách nào</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedBooks.map((b) => (
                      <div
                        key={b.copy_id}
                        className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded"
                      >
                        <BookOutlined className="text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="m-0 font-mono text-xs text-gray-500">{b.barcode}</p>
                          <p className="m-0 truncate text-navyDark">{b.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Divider className="!my-3" />

              <Button
                type="primary"
                size="large"
                block
                disabled={!canCheckout}
                loading={checkoutMutation.isPending}
                onClick={handleCheckout}
                icon={<CheckCircleOutlined />}
              >
                Tạo phiếu mượn
              </Button>

              {selectedReader && !selectedReader.can_borrow && (
                <Alert
                  message="Độc giả không đủ điều kiện mượn"
                  type="error"
                  showIcon
                  className="!text-xs"
                />
              )}

              {exceedsLimit && (
                <Alert
                  message={`Vượt hạn mức: tổng ${totalAfterCheckout}/${selectedReader?.borrow_limit} quyển`}
                  type="error"
                  showIcon
                  className="!text-xs"
                />
              )}
            </div>
          </Card>
        </div>
      </div>

      {validateCopyMutation.isPending && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <Spin size="large" />
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
