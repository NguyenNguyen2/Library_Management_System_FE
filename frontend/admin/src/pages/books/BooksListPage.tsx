import { Link, useSearchParams } from 'react-router-dom';
import {
  Card,
  Input,
  Button,
  Tag,
  Table,
  Space,
  Modal,
  Form,
  Select,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Image,
  Tooltip,
  Tabs,
  Drawer,
  List,
  Descriptions,
  Upload,
  Checkbox
} from 'antd';
import {
  Plus,
  Search,
  BookOpen,
  Hash,
  Award,
  BookMarked,
  Edit,
  Trash2,
  RefreshCw,
  Info,
  History,
  User,
  Tags,
  Globe,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  QrCode,
  Archive,
  Upload as UploadIcon,
  FileBarChart,
  Layers,
  Printer,
  Download
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  getBooks,
  createBook,
  updateBook,
  deleteBook,
  getBookByISBN,
  getFilterOptions,
  getBookDetail,
  getFeaturedBooks
} from '../../services/bookService';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../services/categoryService';
import {
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorDetail
} from '../../services/authorService';
import {
  getBookCopies,
  createBookCopy,
  updateBookCopy,
  deleteBookCopy,
  importCopies,
  getInventorySummary,
  generateBarcode,
  liquidateBookCopyByBarcode
} from '../../services/copyService';

type Author = {
  author_id: number;
  author_name: string;
  name?: string;
  bio?: string;
  birth_date?: string;
  nationality?: string;
  is_active?: number | boolean;
};

type Category = {
  category_id: number;
  category_name: string;
  description?: string;
  parent_id?: number;
  status?: number;
};

type Publisher = {
  publisher_id: number;
  name: string;
};

type Book = {
  book_id: number;
  title: string;
  isbn: string;
  cover_image?: string;
  publish_date?: string;
  publish_year?: number;
  edition?: string;
  language?: string;
  pages?: number;
  dimensions?: string;
  cover_type?: string;
  description?: string;
  replacement_cost?: number;
  is_featured?: number | boolean;
  authors?: Author[];
  categories?: Category[];
  publisher?: Publisher;
};

const COVER_IMAGE_ACCEPT = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const COVER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

// Ảnh bìa lưu trong DB là đường dẫn tương đối (storage local) hoặc URL đầy đủ (import ISBN / ảnh cũ).
const resolveCoverImageUrl = (coverImage?: string | null): string | null => {
  if (!coverImage) return null;
  return coverImage.startsWith('http') ? coverImage : `http://127.0.0.1:8000/storage/${coverImage}`;
};

export function BooksListPage() {
  console.log("BooksListPage loaded");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'list';

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Pagination
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  // Featured books — loaded independently from the whole DB (not derived from the main
  // list's current page), so it stays accurate regardless of pagination/sort.
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [featuredBooksLoading, setFeaturedBooksLoading] = useState(false);
  const [featuredBooksTotal, setFeaturedBooksTotal] = useState(0);
  const [featuredBooksPage, setFeaturedBooksPage] = useState(1);

  // Quick ISBN Import
  const [isbnImportText, setIsbnImportText] = useState('');
  const [importingIsbn, setImportingIsbn] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [saving, setSaving] = useState(false);

  // Book detail drawer (opened by clicking a book title)
  const [isBookDetailOpen, setIsBookDetailOpen] = useState(false);
  const [bookDetail, setBookDetail] = useState<any>(null);
  const [bookDetailLoading, setBookDetailLoading] = useState(false);

  // Cover image upload state (Add/Edit Book modal) — kept outside the Form since it's a File, not a form value
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [generatingBarcode, setGeneratingBarcode] = useState(false);

  // Edit history modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyBookTitle, setHistoryBookTitle] = useState('');

  // Category state
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm] = Form.useForm();

  // Author state
  const [authorsList, setAuthorsList] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [authorsTotal, setAuthorsTotal] = useState(0);
  const [authorsPage, setAuthorsPage] = useState(1);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [authorForm] = Form.useForm();

  // Author profile Drawer state
  const [isAuthorProfileOpen, setIsAuthorProfileOpen] = useState(false);
  const [profileAuthor, setProfileAuthor] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Book copies management states
  const [copies, setCopies] = useState<any[]>([]);
  const [copiesLoading, setCopiesLoading] = useState(false);
  const [copiesPage, setCopiesPage] = useState(1);
  const [totalCopies, setTotalCopies] = useState(0);
  const [copiesSearchText, setCopiesSearchText] = useState('');
  const [copiesStats, setCopiesStats] = useState({ available: 0, borrowed: 0, reserved: 0, lost: 0, total: 0 });
  const [selectedCopyKeys, setSelectedCopyKeys] = useState<React.Key[]>([]);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [editingCopy, setEditingCopy] = useState<any | null>(null);
  const [selectBooks, setSelectBooks] = useState<Book[]>([]);
  const [copyForm] = Form.useForm();
  const [addCopyForm] = Form.useForm();
  const [isRetireModalOpen, setIsRetireModalOpen] = useState(false);
  const [retiringCopyId, setRetiringCopyId] = useState<number | null>(null);
  const [retireForm] = Form.useForm();
  const [directRetireForm] = Form.useForm();
  const [liquidatingDirectly, setLiquidatingDirectly] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);

  // Warehouse report states
  const [summaryData, setSummaryData] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCategoryId, setSummaryCategoryId] = useState<number | undefined>(undefined);

  const nowYMD = () => {
    const d = new Date();
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  };

  const loadCopies = async (page = 1, query = '') => {
    setCopiesLoading(true);
    try {
      const res = await getBookCopies(page, query);
      if (res) {
        setCopies(res.data || []);
        setTotalCopies(res.total || 0);
        setCopiesPage(res.current_page || 1);
        if (res.stats) {
          setCopiesStats(res.stats);
        }
      }
    } catch (err: any) {
      console.error(err);
      message.error("Lỗi khi tải danh sách bản sao!");
    } finally {
      setCopiesLoading(false);
    }
  };

  const loadSelectBooks = async (query = '') => {
    try {
      const res = await getBooks(1, query);
      if (res && res.data) {
        setSelectBooks(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải sách:", err);
    }
  };

  const openCopyModal = (copy: any | null = null) => {
    setEditingCopy(copy);
    setIsCopyModalOpen(true);
    if (copy) {
      copyForm.setFieldsValue({
        barcode: copy.barcode,
        shelf_location: copy.location === 'Chưa xếp kệ' ? '' : copy.location,
        condition: copy.condition,
        status: copy.status,
        acquisition_date: copy.acquired
      });
    } else {
      copyForm.resetFields();
      copyForm.setFieldsValue({
        condition: 'good',
        status: 'available',
        acquisition_date: nowYMD()
      });
    }
  };

  const handleSaveCopy = async (values: any) => {
    try {
      if (editingCopy) {
        await updateBookCopy(editingCopy.copy_id, {
          barcode: values.barcode,
          shelf_location: values.shelf_location,
          condition: values.condition,
          status: values.status,
          acquisition_date: values.acquisition_date
        });
        message.success("Cập nhật bản sao thành công!");
      } else {
        await createBookCopy({
          book_id: values.book_id,
          barcode: values.barcode,
          shelf_location: values.shelf_location,
          condition: values.condition,
          status: values.status,
          acquisition_date: values.acquisition_date
        });
        message.success("Thêm mới bản sao thành công!");
      }
      setIsCopyModalOpen(false);
      loadCopies(copiesPage, copiesSearchText);
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Lỗi khi lưu bản sao!");
    }
  };

  const openRetireModal = (copyId: number) => {
    setRetiringCopyId(copyId);
    setIsRetireModalOpen(true);
    retireForm.setFieldsValue({
      reason: 'Hư hỏng nặng không thể sửa',
      retired_date: nowYMD(),
      note: ''
    });
  };

  const handleSaveRetire = async (values: any) => {
    if (!retiringCopyId) return;
    try {
      await deleteBookCopy(retiringCopyId, {
        reason: values.reason,
        retired_date: values.retired_date,
        note: values.note
      });
      message.success("Thanh lý bản sao thành công!");
      setIsRetireModalOpen(false);
      loadCopies(copiesPage, copiesSearchText);
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Lỗi khi thanh lý bản sao!");
    }
  };

  const handleDirectRetire = async (values: any) => {
    setLiquidatingDirectly(true);
    try {
      await liquidateBookCopyByBarcode({
        barcode: values.barcode,
        reason: values.reason,
        retired_date: values.retired_date,
        note: values.note
      });
      message.success(`Thanh lý bản sao có barcode "${values.barcode}" thành công!`);
      directRetireForm.resetFields();
      directRetireForm.setFieldsValue({
        reason: 'Hư hỏng nặng không thể sửa',
        retired_date: nowYMD(),
        note: ''
      });
      loadCopies(copiesPage, copiesSearchText);
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Lỗi khi thanh lý bản sao!");
    } finally {
      setLiquidatingDirectly(false);
    }
  };
 
  const handleImportExcel = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await importCopies(file);
      if (res) {
        setImportResult({
          successCount: res.success_count,
          errors: res.errors || [],
          errorCsv: res.error_csv || null
        });
        if (res.errors && res.errors.length > 0) {
          message.warning(`Nhập kho hoàn tất với một số lỗi! Thành công: ${res.success_count}, Thất bại: ${res.errors.length}`);
        } else {
          message.success(`Nhập kho thành công toàn bộ! Số lượng: ${res.success_count}`);
        }
        loadCopies(1);
      }
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Lỗi hệ thống khi tải file!");
    } finally {
      setImporting(false);
    }
  };

  const loadSummaryReport = async (categoryId?: number) => {
    setSummaryLoading(true);
    try {
      const res = await getInventorySummary(categoryId);
      setSummaryData(res);
    } catch (err: any) {
      console.error(err);
      message.error("Lỗi khi tải số liệu báo cáo kho!");
    } finally {
      setSummaryLoading(false);
    }
  };

  // Filter dropdown data
  const [filterData, setFilterData] = useState<{
    categories: Category[];
    authors: Author[];
    publishers: Publisher[];
    languages: string[];
  }>({
    categories: [],
    authors: [],
    publishers: [],
    languages: []
  });

  const [form] = Form.useForm();
  const watchCreateFirstCopy = Form.useWatch('create_first_copy', form);
  const watchBarcode = Form.useWatch('barcode', form);
  const watchCopiesCount = Form.useWatch('copies_count', form);

  const translateFieldName = (field: string) => {
    const map: Record<string, string> = {
      title: 'Tên sách',
      isbn: 'Mã ISBN',
      publisher_id: 'Nhà xuất bản',
      author_id: 'Tác giả chính',
      publish_date: 'Ngày xuất bản',
      publish_year: 'Năm xuất bản',
      edition: 'Phiên bản',
      language: 'Ngôn ngữ',
      pages: 'Số trang',
      dimensions: 'Kích thước',
      cover_type: 'Loại bìa',
      description: 'Mô tả tóm tắt',
      cover_image: 'Ảnh bìa',
      replacement_cost: 'Giá đền bù',
      is_featured: 'Trạng thái nổi bật',
      authors: 'Danh sách tác giả',
      categories: 'Danh sách thể loại',
    };
    return map[field] || field;
  };

  // Load books
  const loadBooks = async (page = 1, query = '') => {
    setLoading(true);
    try {
      const res = await getBooks(page, query);
      if (res && res.data) {
        setBooks(res.data);
        setTotalBooks(res.total || res.data.length);
        setPageSize(res.per_page || 20);
        setCurrentPage(res.current_page || 1);
      } else {
        setBooks(res || []);
      }
    } catch (err: any) {
      console.error(err);
      message.error("Lỗi khi tải danh sách sách!");
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedBooks = async (page = 1) => {
    setFeaturedBooksLoading(true);
    try {
      const res = await getFeaturedBooks(page);
      if (res && res.data) {
        setFeaturedBooks(res.data);
        setFeaturedBooksTotal(res.total || res.data.length);
        setFeaturedBooksPage(res.current_page || 1);
      } else {
        setFeaturedBooks(res || []);
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách sách nổi bật!");
    } finally {
      setFeaturedBooksLoading(false);
    }
  };

  // Load dropdown options
  const loadFilterOptions = async () => {
    try {
      const res = await getFilterOptions();
      if (res) {
        setFilterData({
          categories: res.categories || [],
          authors: res.authors || [],
          publishers: res.publishers || [],
          languages: res.languages || []
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải filter options:", err);
    }
  };

  // Trigger search with 300ms debounce (only for main book list tab)
  useEffect(() => {
    if (activeTab === 'list') {
      const delayDebounceFn = setTimeout(() => {
        loadBooks(1, searchText);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchText, activeTab]);

  useEffect(() => {
    loadFilterOptions();
    loadFeaturedBooks(1); // also feeds the "Sách nổi bật" stat card on the main list tab
  }, []);

  // Trigger loading the featured books list when its tab is opened
  useEffect(() => {
    if (activeTab === 'featured') {
      loadFeaturedBooks(1);
    }
  }, [activeTab]);

  // Category and Author tab loaders
  const loadCategoriesData = async () => {
    setCategoriesLoading(true);
    try {
      const res = await getCategories();
      setCategoriesList(res || []);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách thể loại!");
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadAuthorsData = async (page = 1) => {
    setAuthorsLoading(true);
    try {
      const res = await getAuthors(page);
      if (res && res.data) {
        setAuthorsList(res.data);
        setAuthorsTotal(res.total || res.data.length);
        setAuthorsPage(res.current_page || 1);
      } else {
        setAuthorsList(res || []);
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách tác giả!");
    } finally {
      setAuthorsLoading(false);
    }
  };

  // Trigger loading Category & Author data
  useEffect(() => {
    if (activeTab === 'authors') {
      loadCategoriesData();
      loadAuthorsData(1);
    }
  }, [activeTab]);

  // Trigger loading copy list
  useEffect(() => {
    if (activeTab === 'copies') {
      const delayDebounceFn = setTimeout(() => {
        loadCopies(1, copiesSearchText);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [copiesSearchText, activeTab]);

  // Initialize direct retire form
  useEffect(() => {
    if (activeTab === 'import') {
      directRetireForm.setFieldsValue({
        reason: 'Hư hỏng nặng không thể sửa',
        retired_date: nowYMD(),
        note: ''
      });
    }
  }, [activeTab]);

  // Trigger loading report summary data
  useEffect(() => {
    if (activeTab === 'report') {
      loadSummaryReport(summaryCategoryId);
    }
  }, [activeTab, summaryCategoryId]);

  // Trigger actions from URL query parameters (e.g., from AI demand page)
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create-book') {
      const title = searchParams.get('title');
      if (title) {
        openEditModal(null);
        form.setFieldsValue({ title: title });
        setSearchParams({ tab: activeTab });
      }
    } else if (action === 'create-copy') {
      const bookId = searchParams.get('book_id');
      const bookTitle = searchParams.get('book_title') || 'Đầu sách gợi ý';
      if (bookId) {
        const idNum = Number(bookId);
        setSelectBooks((prev) => {
          if (prev.some(b => b.book_id === idNum)) return prev;
          return [...prev, { book_id: idNum, title: bookTitle } as any];
        });
        openCopyModal(null);
        copyForm.setFieldsValue({ book_id: idNum });
        setSearchParams({ tab: activeTab });
      }
    }
  }, [searchParams]);

  // View Author Profile Page (Drawer)
  const viewAuthorProfile = async (id: number) => {
    setIsAuthorProfileOpen(true);
    setProfileLoading(true);
    try {
      const res = await getAuthorDetail(id);
      setProfileAuthor(res);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải hồ sơ tác giả!");
    } finally {
      setProfileLoading(false);
    }
  };

  // Category CRUD logic
  const openCategoryModal = (cat: Category | null = null) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
    if (cat) {
      categoryForm.setFieldsValue({
        category_name: cat.category_name,
        description: cat.description,
        parent_id: cat.parent_id,
        status: cat.status
      });
    } else {
      categoryForm.resetFields();
      categoryForm.setFieldsValue({ status: 1 });
    }
  };

  const handleSaveCategory = async (values: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.category_id, values);
        message.success("Cập nhật thể loại thành công!");
      } else {
        await createCategory(values);
        message.success("Thêm mới thể loại thành công!");
      }
      setIsCategoryModalOpen(false);
      loadCategoriesData();
      loadFilterOptions();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Lỗi khi lưu thể loại!");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await deleteCategory(id);
      message.success("Xóa thể loại thành công!");
      loadCategoriesData();
      loadFilterOptions();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Lỗi khi xóa thể loại!");
    }
  };

  const toggleCategoryStatus = async (record: Category) => {
    try {
      const newStatus = record.status === 1 ? 0 : 1;
      await updateCategory(record.category_id, {
        category_name: record.category_name,
        description: record.description,
        parent_id: record.parent_id,
        status: newStatus
      });
      message.success(newStatus === 1 ? "Đã hiển thị thể loại trên tìm kiếm!" : "Đã ẩn thể loại khỏi tìm kiếm thành công!");
      loadCategoriesData();
      loadFilterOptions();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi cập nhật trạng thái thể loại!");
    }
  };

  // Author CRUD logic
  const openAuthorModal = (auth: Author | null = null) => {
    setEditingAuthor(auth);
    setIsAuthorModalOpen(true);
    if (auth) {
      authorForm.setFieldsValue({
        name: auth.name || auth.author_name,
        bio: auth.bio,
        birth_date: auth.birth_date,
        nationality: auth.nationality,
        is_active: auth.is_active === undefined ? true : !!auth.is_active
      });
    } else {
      authorForm.resetFields();
      authorForm.setFieldsValue({ is_active: true });
    }
  };

  const handleSaveAuthor = async (values: any) => {
    try {
      const data = {
        ...values,
        is_active: values.is_active ? 1 : 0
      };
      if (editingAuthor) {
        await updateAuthor(editingAuthor.author_id, data);
        message.success("Cập nhật tác giả thành công!");
      } else {
        await createAuthor(data);
        message.success("Thêm mới tác giả thành công!");
      }
      setIsAuthorModalOpen(false);
      loadAuthorsData(authorsPage);
      loadFilterOptions();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Lỗi khi lưu tác giả!");
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    try {
      await deleteAuthor(id);
      message.success("Đã ẩn tác giả khỏi danh sách!");
      loadAuthorsData(authorsPage);
      loadFilterOptions();
    } catch (err: any) {
      console.error(err);
      message.error(err?.response?.data?.message || "Lỗi khi xóa tác giả!");
    }
  };

  // Show book detail drawer (triggered by clicking the book title)
  const showBookDetail = async (record: Book) => {
    setIsBookDetailOpen(true);
    setBookDetailLoading(true);
    try {
      const res = await getBookDetail(record.book_id);
      setBookDetail(res || null);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải thông tin chi tiết sách!");
    } finally {
      setBookDetailLoading(false);
    }
  };

  // Load book edit history
  const showEditHistory = async (record: Book) => {
    setHistoryBookTitle(record.title);
    setIsHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await getBookDetail(record.book_id);
      if (res && res.book_edit_histories) {
        // Sort history by date descending
        const sortedHistory = [...res.book_edit_histories].sort(
          (a, b) => new Date(b.edited_at).getTime() - new Date(a.edited_at).getTime()
        );
        setHistoryList(sortedHistory);
      } else {
        setHistoryList([]);
      }
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải lịch sử chỉnh sửa!");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Quick ISBN Import execution
  const handleIsbnImport = async () => {
    if (!isbnImportText.trim()) {
      message.warning("Vui lòng nhập mã ISBN để import!");
      return;
    }
    setImportingIsbn(true);
    try {
      message.loading({ content: "Đang tìm và import sách từ Google Books...", key: "isbnImport" });
      const newBook = await getBookByISBN(isbnImportText.trim());
      if (newBook) {
        message.success({ content: `Đã import thành công sách: "${newBook.title}"!`, key: "isbnImport", duration: 3 });
        setIsbnImportText('');
        loadBooks(1, searchText);
        loadFilterOptions(); // Refresh options in case new author/publisher got created
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || "Không tìm thấy hoặc không import được sách từ ISBN này!";
      message.error({ content: errMsg, key: "isbnImport", duration: 4 });
    } finally {
      setImportingIsbn(false);
    }
  };

  // Open Modal for Create or Edit Book
  const openEditModal = (book: Book | null = null) => {
    setEditingBook(book);
    setIsModalOpen(true);
    setCoverFile(null);
    setRemoveCoverImage(false);
    if (book) {
      // Map structure to form values
      form.setFieldsValue({
        title: book.title,
        isbn: book.isbn,
        publisher_id: book.publisher?.publisher_id,
        authors: book.authors?.map(a => a.author_name) || [],
        categories: book.categories?.map(c => c.category_id) || [],
        publish_date: book.publish_date,
        publish_year: book.publish_year,
        edition: book.edition,
        language: book.language,
        pages: book.pages,
        dimensions: book.dimensions,
        cover_type: book.cover_type,
        description: book.description,
        replacement_cost: book.replacement_cost,
        is_featured: !!book.is_featured,
      });
      setCoverPreviewUrl(resolveCoverImageUrl(book.cover_image));
    } else {
      form.resetFields();
      form.setFieldsValue({
        language: 'vi',
        cover_type: 'Bìa mềm',
        is_featured: false,
        create_first_copy: true,
      });
      setCoverPreviewUrl(null);
    }
  };

  const closeBookModal = () => {
    setIsModalOpen(false);
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setRemoveCoverImage(false);
  };

  // Validate + stage a newly selected cover image file (preview only — uploaded on form submit)
  const handleCoverFileSelect = (file: File) => {
    if (!COVER_IMAGE_ACCEPT.includes(file.type)) {
      message.error("Chỉ chấp nhận ảnh định dạng JPG, JPEG, PNG hoặc WEBP!");
      return Upload.LIST_IGNORE;
    }
    if (file.size > COVER_IMAGE_MAX_BYTES) {
      message.error("Ảnh bìa không được vượt quá 5MB!");
      return Upload.LIST_IGNORE;
    }
    setCoverFile(file);
    setRemoveCoverImage(false);
    setCoverPreviewUrl(URL.createObjectURL(file));
    return false; // ngăn antd tự upload — file được gửi kèm khi lưu sách
  };

  const handleRemoveCoverImage = () => {
    setCoverFile(null);
    setCoverPreviewUrl(null);
    setRemoveCoverImage(true);
  };

  // Sinh barcode duy nhất cho bản sao đầu tiên (nút "Sinh barcode")
  const handleGenerateBarcode = async () => {
    setGeneratingBarcode(true);
    try {
      const barcode = await generateBarcode();
      form.setFieldsValue({ barcode });
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không thể sinh barcode, vui lòng thử lại!");
    } finally {
      setGeneratingBarcode(false);
    }
  };

  // Save Book (Create or Update)
  const handleSaveBook = async (values: any) => {
    setSaving(true);
    try {
      const dataToSave: any = {
        ...values,
        is_featured: values.is_featured ? 1 : 0,
      };

      if (coverFile) {
        dataToSave.cover_image = coverFile;
      } else if (editingBook && removeCoverImage) {
        dataToSave.remove_cover_image = true;
      }

      // Bản sao đầu tiên chỉ áp dụng khi tạo sách mới — sửa sách không bao giờ đụng tới book_copies
      if (editingBook) {
        delete dataToSave.create_first_copy;
        delete dataToSave.barcode;
        delete dataToSave.shelf_location;
        delete dataToSave.copies_count;
      } else {
        dataToSave.create_first_copy = values.create_first_copy !== false;
      }

      if (editingBook) {
        await updateBook(editingBook.book_id, dataToSave);
        message.success("Cập nhật sách thành công!");
      } else {
        await createBook(dataToSave);
        message.success("Thêm mới sách thành công!");
      }
      closeBookModal();
      loadBooks(currentPage, searchText);
      loadFilterOptions();
      loadFeaturedBooks(featuredBooksPage); // is_featured may have just changed
    } catch (err: any) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || "Lỗi khi lưu sách! Vui lòng kiểm tra lại thông tin.";
      message.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // Delete Book
  const handleDeleteBook = async (id: number) => {
    try {
      const res = await deleteBook(id);
      message.success(res?.message || "Xóa sách thành công!");
      loadBooks(currentPage, searchText);
      loadFeaturedBooks(featuredBooksPage);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.message || "Không thể xóa sách này!";
      message.error(errMsg);
    }
  };

  // Since we search on backend, filteredBooks is just books directly
  const filteredBooks = books;

  // Table Columns config
  const columns = [
    {
      title: 'Ảnh bìa',
      dataIndex: 'cover_image',
      key: 'cover_image',
      width: 80,
      render: (coverUrl: string, record: Book) => {
        const finalUrl = resolveCoverImageUrl(coverUrl);
        return (
          <div className="w-[50px] h-[75px] rounded overflow-hidden shadow-sm hover:scale-105 transition-transform duration-200 bg-gray-100 flex items-center justify-center">
            {finalUrl ? (
              <Image
                src={finalUrl}
                alt={record.title}
                fallback="https://placehold.co/100x150/e2e8f0/64748b?text=Book"
                className="w-full h-full object-cover"
                preview={{ mask: 'Xem' }}
              />
            ) : (
              <BookOpen size={20} className="text-gray-400" />
            )}
          </div>
        );
      }
    },
    {
      title: 'Tên sách & ISBN',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: Book) => (
        <div>
          <div
            onClick={() => showBookDetail(record)}
            className="font-semibold text-navyDark text-sm hover:text-blue-600 cursor-pointer transition-colors duration-150"
          >
            {title}
          </div>
          <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1 mt-1">
            <Hash size={12} className="text-gray-400" />
            {record.isbn}
          </div>
        </div>
      )
    },
    {
      title: 'Tác giả',
      dataIndex: 'authors',
      key: 'authors',
      render: (authors: Author[]) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {authors && authors.length > 0 ? (
            authors.map((a) => (
              <Tag key={a.author_id} color="blue" className="!rounded-md border-0 font-medium text-xs">
                {a.author_name}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      )
    },
    {
      title: 'Thể loại',
      dataIndex: 'categories',
      key: 'categories',
      render: (categories: Category[]) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {categories && categories.length > 0 ? (
            categories.map((c) => (
              <Tag key={c.category_id} color="purple" className="!rounded-md border-0 font-medium text-xs">
                {c.category_name}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      )
    },
    {
      title: 'Nhà xuất bản',
      dataIndex: 'publisher',
      key: 'publisher',
      render: (publisher: Publisher) => (
        <span className="font-medium text-gray-700">
          {publisher?.name || <span className="text-gray-400">—</span>}
        </span>
      )
    },
    {
      title: 'Đặc điểm',
      key: 'details',
      render: (_: any, record: Book) => (
        <div className="text-xs text-gray-500 space-y-0.5">
          {record.pages && <div>{record.pages} trang</div>}
          {record.language && <div>Ngôn ngữ: {record.language.toUpperCase()}</div>}
          {record.is_featured ? <Tag color="gold" className="!rounded-full border-0 text-[10px] px-2">Nổi bật</Tag> : null}
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      render: (_: any, record: Book) => (
        <Space size="middle">
          <Tooltip title="Sửa thông tin">
            <Button
              type="text"
              icon={<Edit size={16} className="text-blue-500 hover:text-blue-700" />}
              onClick={() => openEditModal(record)}
              className="flex items-center justify-center p-1 rounded hover:bg-blue-50 border-0"
            />
          </Tooltip>
          <Tooltip title="Lịch sử chỉnh sửa">
            <Button
              type="text"
              icon={<History size={16} className="text-amber-500 hover:text-amber-700" />}
              onClick={() => showEditHistory(record)}
              className="flex items-center justify-center p-1 rounded hover:bg-amber-50 border-0"
            />
          </Tooltip>
          <Tooltip title="Xóa sách">
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa sách này?"
              onConfirm={() => handleDeleteBook(record.book_id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={<Trash2 size={16} className="text-red-500 hover:text-red-700" />}
                className="flex items-center justify-center p-1 rounded hover:bg-red-50 border-0"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  const copiesColumns = [
    {
      title: 'Mã bản sao',
      dataIndex: 'copy_id',
      key: 'copy_id',
      width: 110,
      render: (id: number) => <span className="font-mono text-gray-500 font-semibold">CP-{id}</span>
    },
    {
      title: 'Tên sách',
      dataIndex: 'book_title',
      key: 'book_title',
      className: 'font-semibold text-gray-800 text-left',
    },
    {
      title: 'Barcode',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 130,
      render: (barcode: string) => <span className="font-mono text-xs text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{barcode}</span>
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (loc: string) => <span className="text-gray-700">{loc}</span>
    },
    {
      title: 'Tình trạng',
      dataIndex: 'condition',
      key: 'condition',
      width: 120,
      render: (cond: string) => {
        let label = 'Tốt';
        let color = 'success';
        if (cond === 'new') {
          label = 'Mới';
          color = 'blue';
        } else if (cond === 'old') {
          label = 'Cũ';
          color = 'default';
        } else if (cond === 'light') {
          label = 'Hỏng nhẹ';
          color = 'warning';
        } else if (cond === 'heavy') {
          label = 'Hỏng nặng';
          color = 'error';
        }
        return (
          <Tag color={color} className="!rounded-md border-0 font-medium text-xs">
            {label}
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        let label = 'Có sẵn';
        let color = 'green';
        if (status === 'borrowed') {
          label = 'Đang mượn';
          color = 'blue';
        } else if (status === 'reserved') {
          label = 'Đặt trước';
          color = 'orange';
        } else if (status === 'maintenance') {
          label = 'Bảo trì';
          color = 'purple';
        } else if (status === 'lost') {
          label = 'Mất/Hỏng';
          color = 'red';
        } else if (status === 'liquidated') {
          label = 'Đã thanh lý';
          color = 'default';
        }
        return (
          <Tag color={color} className="!rounded-full border-0 font-semibold text-xs px-2.5">
            {label}
          </Tag>
        );
      }
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'acquired',
      key: 'acquired',
      width: 120,
      render: (date: string) => <span className="text-gray-500 text-xs">{date}</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 140,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="In QR Barcode">
            <Button
              type="text"
              icon={<QrCode size={16} className="text-blue-600 hover:text-blue-800" />}
              onClick={() => {
                Modal.info({
                  title: 'Mã QR Bản sao: ' + record.barcode,
                  content: (
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="border p-4 bg-white rounded-lg shadow-sm">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${record.barcode}`} 
                          alt="QR Code" 
                          className="w-[150px] h-[150px]"
                        />
                      </div>
                      <p className="mt-3 font-mono font-bold text-gray-700">{record.barcode}</p>
                      <p className="text-xs text-gray-400 mt-1">{record.book_title}</p>
                    </div>
                  ),
                  centered: true,
                });
              }}
              className="flex items-center justify-center p-1 rounded hover:bg-blue-50 border-0"
            />
          </Tooltip>
          <Tooltip title="Sửa bản sao">
            <Button
              type="text"
              icon={<Edit size={16} className="text-amber-500 hover:text-amber-700" />}
              onClick={() => openCopyModal(record)}
              className="flex items-center justify-center p-1 rounded hover:bg-amber-50 border-0"
            />
          </Tooltip>
          <Tooltip title="Thanh lý bản sao">
            <Button
              type="text"
              icon={<Trash2 size={16} className={record.status === 'liquidated' ? "text-gray-300" : "text-red-500 hover:text-red-700"} />}
              onClick={() => openRetireModal(record.copy_id)}
              disabled={record.status === 'liquidated'}
              className="flex items-center justify-center p-1 rounded hover:bg-red-50 border-0"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Tab change handlers mapped to SearchParams URL sync
  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const totalDistinctBooks = totalBooks;
  const featuredBooksCount = featuredBooksTotal;

  const isWarehouseTab = ['copies', 'add-copy', 'import', 'report'].includes(activeTab);

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-4 animate-fade-in text-left">
      
      {!isWarehouseTab && (
        <Tabs activeKey={activeTab} onChange={handleTabChange} type="card" className="book-tabs font-semibold">
          
          {/* TAB 1: BOOK LIST */}
          <Tabs.TabPane tab={<span><BookOpen size={14} className="inline mr-1" /> Danh sách sách</span>} key="list">
          <div className="flex flex-col gap-6">
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-blue-50/20" bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
                    <BookOpen size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 m-0 font-medium">Tổng đầu sách</p>
                    <p className="m-0 text-[20px] font-bold text-navyDark mt-0.5">{totalDistinctBooks}</p>
                  </div>
                </div>
              </Card>

              <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-amber-50/20" bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-50 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
                    <Award size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 m-0 font-medium">Sách nổi bật</p>
                    <p className="m-0 text-[20px] font-bold text-amber-500 mt-0.5">{featuredBooksCount}</p>
                  </div>
                </div>
              </Card>

              <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-purple-50/20" bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-50 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
                    <BookMarked size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 m-0 font-medium">Tác giả trong hệ thống</p>
                    <p className="m-0 text-[20px] font-bold text-purple-600 mt-0.5">{filterData.authors.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-teal-50/20" bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-teal-50 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
                    <Info size={20} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 m-0 font-medium">Thể loại</p>
                    <p className="m-0 text-[20px] font-bold text-teal-600 mt-0.5">{filterData.categories.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* SEARCH AND IMPORT PANEL */}
            <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-white" bodyStyle={{ padding: '20px' }}>
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="w-full lg:w-1/3">
                  <Input
                    placeholder="Tìm kiếm sách theo tên, tác giả, NXB, ISBN..."
                    prefix={<Search size={16} className="text-gray-400" />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    allowClear
                    className="h-10 rounded-lg"
                  />
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:w-auto flex gap-2 border border-blue-100 p-1 rounded-lg bg-blue-50/30">
                    <Input
                      placeholder="Nhập ISBN Google Books..."
                      value={isbnImportText}
                      onChange={(e) => setIsbnImportText(e.target.value)}
                      onPressEnter={handleIsbnImport}
                      disabled={importingIsbn}
                      className="w-full sm:w-48 h-8 rounded border-gray-200 bg-white"
                    />
                    <Button
                      type="primary"
                      ghost
                      icon={<RefreshCw size={14} className={importingIsbn ? "animate-spin" : ""} />}
                      onClick={handleIsbnImport}
                      loading={importingIsbn}
                      className="h-8 rounded flex items-center justify-center font-medium"
                    >
                      Auto Import
                    </Button>
                  </div>

                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => openEditModal(null)}
                    className="w-full sm:w-auto h-10 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center font-semibold shadow-md shadow-blue-500/10"
                  >
                    Thêm sách thủ công
                  </Button>
                </div>
              </div>
            </Card>

            {/* BOOKS LIST TABLE */}
            <Card className="!rounded-[12px] border border-gray-100 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
              <Table
                columns={columns}
                dataSource={filteredBooks.map((b) => ({ ...b, key: b.book_id }))}
                loading={loading}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: totalBooks,
                  onChange: (page) => {
                    setCurrentPage(page);
                    loadBooks(page, searchText);
                  },
                  showTotal: (total) => `Tổng số ${total} đầu sách`,
                  className: "px-6 py-4 border-t border-gray-50",
                }}
                className="book-table"
              />
            </Card>
          </div>
        </Tabs.TabPane>

        {/* TAB 2: CATEGORY & AUTHOR MANAGEMENT */}
        <Tabs.TabPane tab={<span><User size={14} className="inline mr-1" /> Tác giả & Thể loại</span>} key="authors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN: CATEGORIES LIST */}
            <Card
              className="!rounded-[12px] border border-gray-100 shadow-sm"
              title={
                <div className="flex items-center justify-between pb-1">
                  <span className="flex items-center gap-2 font-bold text-navyDark text-sm">
                    <Tags size={16} className="text-purple-500" />
                    <span>Quản lý thể loại</span>
                  </span>
                  <Button
                    type="primary"
                    size="small"
                    icon={<Plus size={14} />}
                    onClick={() => openCategoryModal(null)}
                    className="bg-purple-600 hover:bg-purple-700 rounded-md text-xs flex items-center justify-center h-7"
                  >
                    Thêm thể loại
                  </Button>
                </div>
              }
            >
              <Table
                dataSource={categoriesList.map(c => ({ ...c, key: c.category_id }))}
                loading={categoriesLoading}
                pagination={{ pageSize: 6 }}
                columns={[
                  {
                    title: 'Tên thể loại',
                    dataIndex: 'category_name',
                    key: 'category_name',
                    className: 'font-semibold text-gray-800'
                  },
                  {
                    title: 'Mô tả',
                    dataIndex: 'description',
                    key: 'description',
                    ellipsis: true,
                    render: (text) => text || <span className="text-gray-400 font-italic">Không có mô tả</span>
                  },
                  {
                    title: 'Ẩn / Hiện',
                    key: 'status',
                    width: 100,
                    render: (_, record) => (
                      <Switch
                        checked={record.status === 1}
                        checkedChildren="Hiện"
                        unCheckedChildren="Ẩn"
                        onChange={() => toggleCategoryStatus(record)}
                      />
                    )
                  },
                  {
                    title: 'Thao tác',
                    key: 'action',
                    width: 90,
                    render: (_, record) => (
                      <Space>
                        <Button
                          type="text"
                          icon={<Edit size={14} className="text-blue-500" />}
                          onClick={() => openCategoryModal(record)}
                          className="p-1"
                        />
                        <Popconfirm
                          title="Xóa thể loại này sẽ không làm mất dữ liệu sách của bạn. Bạn chắc chắn?"
                          onConfirm={() => handleDeleteCategory(record.category_id)}
                          okText="Xóa"
                          cancelText="Hủy"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            icon={<Trash2 size={14} className="text-red-500" />}
                            className="p-1"
                          />
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
              />
            </Card>

            {/* RIGHT COLUMN: AUTHORS LIST */}
            <Card
              className="!rounded-[12px] border border-gray-100 shadow-sm"
              title={
                <div className="flex items-center justify-between pb-1">
                  <span className="flex items-center gap-2 font-bold text-navyDark text-sm">
                    <User size={16} className="text-blue-500" />
                    <span>Quản lý tác giả</span>
                  </span>
                  <Button
                    type="primary"
                    size="small"
                    icon={<Plus size={14} />}
                    onClick={() => openAuthorModal(null)}
                    className="bg-blue-600 hover:bg-blue-700 rounded-md text-xs flex items-center justify-center h-7"
                  >
                    Thêm tác giả
                  </Button>
                </div>
              }
            >
              <Table
                dataSource={authorsList.map(a => ({ ...a, key: a.author_id }))}
                loading={authorsLoading}
                pagination={{
                  current: authorsPage,
                  pageSize: 10,
                  total: authorsTotal,
                  onChange: (page) => loadAuthorsData(page),
                  showTotal: (total) => `Tổng số ${total} tác giả`
                }}
                columns={[
                  {
                    title: 'Tên tác giả',
                    dataIndex: 'author_name',
                    key: 'author_name',
                    className: 'font-semibold text-gray-800'
                  },
                  {
                    title: 'Quốc tịch',
                    dataIndex: 'nationality',
                    key: 'nationality',
                    render: (text) => text || '—'
                  },
                  {
                    title: 'Năm sinh',
                    dataIndex: 'birth_date',
                    key: 'birth_date',
                    render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '—'
                  },
                  {
                    title: 'Thao tác',
                    key: 'action',
                    width: 120,
                    render: (_, record) => (
                      <Space>
                        <Tooltip title="Xem hồ sơ & sách viết">
                          <Button
                            type="text"
                            icon={<Eye size={14} className="text-gray-500 hover:text-blue-500" />}
                            onClick={() => viewAuthorProfile(record.author_id)}
                            className="p-1"
                          />
                        </Tooltip>
                        <Button
                          type="text"
                          icon={<Edit size={14} className="text-blue-500" />}
                          onClick={() => openAuthorModal(record)}
                          className="p-1"
                        />
                        <Popconfirm
                          title="Ẩn tác giả này?"
                          onConfirm={() => handleDeleteAuthor(record.author_id)}
                        >
                          <Button
                            type="text"
                            icon={<Trash2 size={14} className="text-red-500" />}
                            className="p-1"
                          />
                        </Popconfirm>
                      </Space>
                    )
                  }
                ]}
              />
            </Card>

          </div>
        </Tabs.TabPane>

        {/* TAB 3: FEATURED BOOKS */}
        <Tabs.TabPane tab={<span><Award size={14} className="inline mr-1" /> Sách nổi bật</span>} key="featured">
          <Card className="!rounded-[12px] border border-gray-100 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
            <Table
              columns={columns}
              dataSource={featuredBooks.map((b) => ({ ...b, key: b.book_id }))}
              loading={featuredBooksLoading}
              pagination={{
                current: featuredBooksPage,
                pageSize: 20,
                total: featuredBooksTotal,
                onChange: (page) => loadFeaturedBooks(page),
                showTotal: (total) => `Tổng số ${total} sách nổi bật`,
              }}
              locale={{ emptyText: 'Chưa có sách nào được đánh dấu là nổi bật.' }}
            />
          </Card>
        </Tabs.TabPane>

      </Tabs>
      )}

      {/* TAB 4: COPIES LIST (QUẢN LÝ KHO) */}
      {activeTab === 'copies' && (
        <div className="flex flex-col gap-6 text-left">
            {/* STATS OVERVIEW CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/20" bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 m-0 font-medium">Có sẵn</p>
                    <p className="m-0 text-[20px] font-bold text-emerald-600 mt-0.5">{copiesStats.available}</p>
                  </div>
                </div>
              </Card>

              <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-blue-50/20" bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
                    <BookOpen size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 m-0 font-medium">Đang mượn</p>
                    <p className="m-0 text-[20px] font-bold text-blue-600 mt-0.5">{copiesStats.borrowed}</p>
                  </div>
                </div>
              </Card>

              <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-amber-50/20" bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-amber-50 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
                    <History size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 m-0 font-medium">Đặt trước</p>
                    <p className="m-0 text-[20px] font-bold text-amber-500 mt-0.5">{copiesStats.reserved}</p>
                  </div>
                </div>
              </Card>

              <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-red-50/20" bodyStyle={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="bg-red-50 p-2.5 rounded-xl shrink-0 flex items-center justify-center">
                    <XCircle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 m-0 font-medium">Mất / Hỏng</p>
                    <p className="m-0 text-[20px] font-bold text-red-500 mt-0.5">{copiesStats.lost}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* SEARCH AND ACTION PANEL */}
            <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-white" bodyStyle={{ padding: '20px' }}>
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="w-full lg:w-1/3">
                  <Input
                    placeholder="Tìm theo tên sách, barcode, kệ..."
                    prefix={<Search size={16} className="text-gray-400" />}
                    value={copiesSearchText}
                    onChange={(e) => setCopiesSearchText(e.target.value)}
                    allowClear
                    className="h-10 rounded-lg"
                  />
                </div>

                <div className="w-full lg:w-auto flex flex-wrap gap-3 items-center justify-end">
                  {copies.length > 0 && (
                    <Button
                      type="primary"
                      icon={<Printer size={16} />}
                      onClick={() => {
                        const printIds = selectedCopyKeys.length > 0 
                          ? selectedCopyKeys.join(',') 
                          : copies.map((c: any) => c.copy_id).join(',');
                        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                        window.open(`${baseUrl}/v1/book-copies/print-labels?ids=${printIds}`, '_blank');
                      }}
                      className={`h-10 rounded-lg border-0 flex items-center justify-center font-semibold shadow-md ${
                        selectedCopyKeys.length > 0 
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10 text-white' 
                          : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/10 text-white'
                      }`}
                    >
                      {selectedCopyKeys.length > 0 
                        ? `In nhãn đã chọn (${selectedCopyKeys.length})` 
                        : 'In toàn bộ trang này (A4 PDF)'}
                    </Button>
                  )}
                  <Button
                    type="default"
                    icon={<Download size={16} />}
                    onClick={() => {
                      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                      window.open(`${baseUrl}/v1/book-copies/export-excel`, '_blank');
                    }}
                    className="h-10 rounded-lg flex items-center justify-center font-semibold border-emerald-500 text-emerald-600 hover:text-emerald-700 hover:border-emerald-600 hover:bg-emerald-50/10"
                  >
                    Xuất Excel kho
                  </Button>
                  <Button
                    type="default"
                    icon={<UploadIcon size={16} />}
                    onClick={() => handleTabChange('import')}
                    className="h-10 rounded-lg flex items-center justify-center font-semibold"
                  >
                    Nhập & Thanh lý kho
                  </Button>
                  <Button
                    type="default"
                    icon={<FileBarChart size={16} />}
                    onClick={() => handleTabChange('report')}
                    className="h-10 rounded-lg flex items-center justify-center font-semibold"
                  >
                    Báo cáo kho
                  </Button>
                  <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={() => handleTabChange('add-copy')}
                    className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center font-semibold shadow-md shadow-blue-500/10"
                  >
                    Thêm bản sao
                  </Button>
                </div>
              </div>
            </Card>

            {/* COPIES TABLE */}
            <Card className="!rounded-[12px] border border-gray-100 shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
              <Table
                rowSelection={{
                  selectedRowKeys: selectedCopyKeys,
                  onChange: (keys) => setSelectedCopyKeys(keys),
                }}
                columns={copiesColumns}
                dataSource={copies.map((c) => ({ ...c, key: c.copy_id }))}
                loading={copiesLoading}
                pagination={{
                  current: copiesPage,
                  pageSize: 20,
                  total: totalCopies,
                  onChange: (page) => {
                    setCopiesPage(page);
                    loadCopies(page, copiesSearchText);
                  },
                  showTotal: (total) => `Tổng số ${total} bản sao`,
                  className: "px-6 py-4 border-t border-gray-50",
                }}
                className="copy-table"
              />
            </Card>
          </div>
      )}

      {/* TAB 5: ADD COPY FORM */}
      {activeTab === 'add-copy' && (
          <Card className="!rounded-[12px] border border-gray-100 shadow-sm max-w-[800px] mx-auto text-left" title={<span className="font-bold text-navyDark text-base">Thêm mới bản sao vật lý</span>}>
            <Form
              form={addCopyForm}
              layout="vertical"
              onFinish={async (values) => {
                try {
                  await createBookCopy({
                    book_id: values.book_id,
                    barcode: values.barcode,
                    shelf_location: values.shelf_location,
                    condition: values.condition,
                    status: values.status,
                    acquisition_date: values.acquisition_date
                  });
                  message.success("Thêm mới bản sao thành công!");
                  addCopyForm.resetFields(); // Reset fields after success
                  handleTabChange('copies');
                } catch (err: any) {
                  console.error(err);
                  message.error(err?.response?.data?.message || "Lỗi khi thêm bản sao!");
                }
              }}
              initialValues={{
                condition: 'good',
                status: 'available',
                acquisition_date: nowYMD()
              }}
              className="py-2"
            >
              <Form.Item
                name="book_id"
                label={<span className="font-semibold text-gray-700">Chọn đầu sách</span>}
                rules={[{ required: true, message: 'Vui lòng chọn đầu sách!' }]}
              >
                <Select
                  showSearch
                  placeholder="Nhập tên sách để tìm kiếm..."
                  onSearch={(val) => loadSelectBooks(val)}
                  filterOption={false}
                  options={selectBooks.map(b => ({ value: b.book_id, label: b.title + ' (ISBN: ' + b.isbn + ')' }))}
                  onDropdownVisibleChange={(open) => {
                    if (open && selectBooks.length === 0) {
                      loadSelectBooks('');
                    }
                  }}
                  className="w-full"
                />
              </Form.Item>
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Form.Item
                  name="barcode"
                  label={<span className="font-semibold text-gray-700">Barcode / Mã vạch</span>}
                  rules={[{ required: true, message: 'Vui lòng nhập hoặc tự sinh barcode!' }]}
                >
                  <Input 
                    placeholder="Ví dụ: A1-01 hoặc tự sinh..." 
                    className="h-9" 
                    addonAfter={
                      <Button 
                        type="link" 
                        size="small" 
                        onClick={() => {
                          const randomBarcode = 'LIB-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                          addCopyForm.setFieldsValue({ barcode: randomBarcode });
                        }}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        Tự sinh
                      </Button>
                    }
                  />
                </Form.Item>
 
                <Form.Item
                  name="shelf_location"
                  label={<span className="font-semibold text-gray-700">Vị trí kệ</span>}
                >
                  <Input placeholder="Ví dụ: A1-01, B2-05..." className="h-9" />
                </Form.Item>
 
                <Form.Item
                  name="condition"
                  label={<span className="font-semibold text-gray-700">Tình trạng vật lý</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn tình trạng vật lý!' }]}
                >
                  <Select className="h-9">
                    <Select.Option value="new">Mới (New)</Select.Option>
                    <Select.Option value="good">Tốt (Good)</Select.Option>
                    <Select.Option value="old">Cũ (Old)</Select.Option>
                    <Select.Option value="light">Hỏng nhẹ (Light damage)</Select.Option>
                    <Select.Option value="heavy">Hỏng nặng (Heavy damage)</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="status"
                  label={<span className="font-semibold text-gray-700">Trạng thái</span>}
                  rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                >
                  <Select className="h-9">
                    <Select.Option value="available">Có sẵn trong kho (Available)</Select.Option>
                    <Select.Option value="borrowed">Đang cho mượn (Borrowed)</Select.Option>
                    <Select.Option value="reserved">Đang đặt trước (Reserved)</Select.Option>
                    <Select.Option value="maintenance">Bảo trì (Maintenance)</Select.Option>
                    <Select.Option value="lost">Mất/Hỏng (Lost/Damaged)</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="acquisition_date"
                  label={<span className="font-semibold text-gray-700">Ngày nhập kho</span>}
                  className="md:col-span-2"
                >
                  <Input type="date" className="h-9" />
                </Form.Item>
              </div>

              <Form.Item className="mb-0 flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
                <Button onClick={() => handleTabChange('copies')} className="mr-2 h-9 rounded-lg">
                  Hủy bỏ
                </Button>
                <Button type="primary" htmlType="submit" className="bg-blue-600 hover:bg-blue-700 h-9 rounded-lg">
                  Thêm bản sao
                </Button>
              </Form.Item>
            </Form>
          </Card>
      )}

      {/* TAB 6: IMPORT & LIQUIDATION */}
      {activeTab === 'import' && (
          <Card 
            className="!rounded-[12px] border border-gray-100 shadow-sm max-w-[800px] mx-auto text-center py-6" 
            title={<span className="font-bold text-navyDark text-base">Nhập & Thanh lý kho</span>}
            extra={
              <Button onClick={() => handleTabChange('copies')} className="rounded-lg h-9">
                Quay lại danh sách
              </Button>
            }
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <Upload.Dragger
                accept=".csv"
                beforeUpload={(file: any) => {
                  handleImportExcel(file);
                  return false;
                }}
                showUploadList={false}
                disabled={importing}
                className="w-full bg-gray-50/30 p-6 rounded-xl border-dashed border-gray-200 hover:border-blue-400 transition-all duration-200"
              >
                <p className="ant-upload-drag-icon flex justify-center mb-2">
                  <UploadIcon size={40} className="text-blue-500 animate-bounce" />
                </p>
                <p className="ant-upload-text font-bold text-gray-700 text-sm">
                  Kéo thả file CSV nhập kho vào đây hoặc click để chọn file
                </p>
                <p className="ant-upload-hint text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Hỗ trợ định dạng file .csv chứa thông tin: barcode, isbn, shelf_location, condition, status, acquisition_date.
                </p>
              </Upload.Dragger>
 
              <Button 
                type="link" 
                onClick={() => {
                  const headers = 'barcode,isbn,shelf_location,condition,status,acquisition_date\n';
                  const row1 = 'LIB-SP001,978-604-1-09876-5,A1-01,new,available,2026-06-25\n';
                  const row2 = 'LIB-SP002,978-604-1-09876-5,B2-04,good,available,2026-06-25\n';
                  const blob = new Blob([headers + row1 + row2], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', 'file_mau_nhap_kho.csv');
                  link.click();
                }}
                className="text-xs text-blue-500 hover:text-blue-700 mt-0"
              >
                Tải file CSV mẫu (Template)
              </Button>
 
              {importResult && (
                <div className="w-full text-left bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2 space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <span className="font-bold text-gray-800 text-sm">Kết quả nhập kho hàng loạt:</span>
                    {importResult.errorCsv && (
                      <Button 
                        type="primary" 
                        danger 
                        size="small" 
                        icon={<Printer size={12} />} // Reusing icon for print/download
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = 'data:text/csv;charset=utf-8;base64,' + importResult.errorCsv;
                          link.download = `file_loi_nhap_kho_${new Date().getTime()}.csv`;
                          link.click();
                        }}
                      >
                        Tải file lỗi (.csv)
                      </Button>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>✓ Nhập kho thành công: <strong className="text-green-600">{importResult.successCount}</strong> bản sao hợp lệ.</p>
                    <p>✗ Bị từ chối nhập: <strong className="text-red-500">{importResult.errors.length}</strong> dòng dữ liệu bị lỗi.</p>
                  </div>
 
                  {importResult.errors.length > 0 && (
                    <div className="mt-2 border border-red-100 rounded-lg overflow-hidden max-h-[180px] overflow-y-auto">
                      <Table
                        size="small"
                        dataSource={importResult.errors.map((e: any, idx: number) => ({ ...e, key: idx }))}
                        columns={[
                          { title: 'Dòng', dataIndex: 'row', width: 60, align: 'center' },
                          { title: 'Mã Barcode', dataIndex: 'barcode', width: 120 },
                          { 
                            title: 'Chi tiết lỗi phát hiện', 
                            dataIndex: 'errors', 
                            render: (errs: string[]) => <span className="text-red-500 font-medium text-xs">{errs.join(', ')}</span> 
                          }
                        ]}
                        pagination={false}
                        className="error-table"
                      />
                    </div>
                  )}
                </div>
              )}
 
              <div className="border-t border-gray-100 w-full my-4 pt-4 text-left">
                <h4 className="font-bold text-gray-700 mb-2 text-sm">Thanh lý bản sao (Liquidation)</h4>
                <p className="text-xs text-gray-400 mb-4">
                  Nhập mã Barcode của bản sao sách cần thanh lý. Bản sao sẽ chuyển sang trạng thái <strong>'Đã thanh lý'</strong> và ghi nhận thông tin vào hệ thống (không xóa khỏi cơ sở dữ liệu).
                </p>

                <Form
                  form={directRetireForm}
                  layout="vertical"
                  onFinish={handleDirectRetire}
                  className="bg-gray-50/50 p-4 rounded-xl border border-gray-100/80"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Form.Item
                      name="barcode"
                      label={<span className="font-semibold text-xs text-gray-600">Mã Barcode bản sao</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập mã Barcode bản sao!' }]}
                    >
                      <Input placeholder="Ví dụ: BC260705..." className="h-9 rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      name="reason"
                      label={<span className="font-semibold text-xs text-gray-600">Lý do thanh lý</span>}
                      rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập lý do!' }]}
                    >
                      <Select 
                        className="h-9"
                        options={[
                          { value: 'Hư hỏng nặng không thể sửa', label: 'Hư hỏng nặng không thể sửa' },
                          { value: 'Sách bị mất / Thất thoát', label: 'Sách bị mất / Thất thoát' },
                          { value: 'Hết hạn sử dụng / Lỗi thời', label: 'Hết hạn sử dụng / Lỗi thời' },
                          { value: 'Khác', label: 'Lý do khác' }
                        ]}
                      />
                    </Form.Item>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <Form.Item
                      name="retired_date"
                      label={<span className="font-semibold text-xs text-gray-600">Ngày thanh lý</span>}
                      rules={[{ required: true, message: 'Vui lòng chọn ngày thanh lý!' }]}
                    >
                      <Input type="date" className="h-9 rounded-lg" />
                    </Form.Item>

                    <Form.Item
                      name="note"
                      label={<span className="font-semibold text-xs text-gray-600">Ghi chú thêm (nếu có)</span>}
                    >
                      <Input placeholder="Chi tiết tình trạng..." className="h-9 rounded-lg" />
                    </Form.Item>
                  </div>

                  <Form.Item className="mb-0 text-right">
                    <Button 
                      type="default" 
                      onClick={() => handleTabChange('copies')} 
                      className="mr-2 h-9 rounded-lg"
                    >
                      Đi tới danh sách bản sao
                    </Button>
                    <Button 
                      type="primary" 
                      danger 
                      htmlType="submit" 
                      loading={liquidatingDirectly} 
                      className="h-9 rounded-lg"
                    >
                      Xác nhận thanh lý
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </Card>
      )}

      {/* TAB 7: REPORT */}
      {activeTab === 'report' && (
          <Card 
            className="!rounded-[12px] border border-gray-100 shadow-sm max-w-[900px] mx-auto text-left" 
            title={<span className="font-bold text-navyDark text-base">Báo cáo tình trạng kho sách</span>}
            extra={
              <Space size="middle">
                <Select
                  placeholder="Lọc theo thể loại"
                  allowClear
                  style={{ width: 200 }}
                  value={summaryCategoryId}
                  onChange={(val) => setSummaryCategoryId(val)}
                  className="rounded-lg"
                >
                  {filterData.categories.map((cat: any) => (
                    <Select.Option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </Select.Option>
                  ))}
                </Select>
                <Button
                  type="default"
                  icon={<Printer size={14} />}
                  onClick={() => {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                    const url = `${baseUrl}/v1/book-copies/export-pdf${summaryCategoryId ? `?category_id=${summaryCategoryId}` : ''}`;
                    window.open(url, '_blank');
                  }}
                  className="rounded-lg h-9 flex items-center font-semibold"
                >
                  Xuất PDF báo cáo
                </Button>
                <Button
                  type="primary"
                  icon={<Download size={14} />}
                  onClick={() => {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                    const url = `${baseUrl}/v1/book-copies/export-excel${summaryCategoryId ? `?category_id=${summaryCategoryId}` : ''}`;
                    window.open(url, '_blank');
                  }}
                  className="rounded-lg h-9 bg-emerald-600 hover:bg-emerald-700 border-0 flex items-center font-semibold text-white"
                >
                  Xuất Excel kho
                </Button>
              </Space>
            }
          >
            <div className="flex flex-col gap-6 p-4">
              {/* SUMMARY STATISTICS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-blue-50/20" bodyStyle={{ padding: '16px' }} loading={summaryLoading}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">Tổng đầu sách</span>
                    <span className="text-xl font-bold text-navyDark mt-1">{summaryData?.total_books ?? 0}</span>
                  </div>
                </Card>
                <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-purple-50/20" bodyStyle={{ padding: '16px' }} loading={summaryLoading}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">Tổng bản sao</span>
                    <span className="text-xl font-bold text-purple-600 mt-1">{summaryData?.total_copies ?? 0}</span>
                  </div>
                </Card>
                <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/20" bodyStyle={{ padding: '16px' }} loading={summaryLoading}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">Số có sẵn</span>
                    <span className="text-xl font-bold text-emerald-600 mt-1">{summaryData?.available ?? 0}</span>
                  </div>
                </Card>
                <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-blue-50/20" bodyStyle={{ padding: '16px' }} loading={summaryLoading}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">Số đang mượn</span>
                    <span className="text-xl font-bold text-blue-600 mt-1">{summaryData?.borrowed ?? 0}</span>
                  </div>
                </Card>
                <Card className="!rounded-[12px] border border-gray-100 shadow-sm bg-gradient-to-br from-white to-amber-50/20" bodyStyle={{ padding: '16px' }} loading={summaryLoading}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium">Số bảo trì/mất</span>
                    <span className="text-xl font-bold text-amber-600 mt-1">{summaryData?.maintenance_or_lost ?? 0}</span>
                  </div>
                </Card>
              </div>

              {/* GRAPHICS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                  <h4 className="font-bold text-gray-700 mb-3">Phân bổ trạng thái bản sao</h4>
                  <div className="space-y-3.5">
                    {[
                      { label: 'Có sẵn (Available)', count: summaryData?.available ?? 0, color: 'bg-emerald-500' },
                      { label: 'Đang mượn (Borrowed)', count: summaryData?.borrowed ?? 0, color: 'bg-blue-500' },
                      { label: 'Đặt trước (Reserved)', count: summaryData?.reserved ?? 0, color: 'bg-purple-500' },
                      { label: 'Bảo trì (Maintenance)', count: summaryData?.maintenance ?? 0, color: 'bg-violet-400' },
                      { label: 'Mất / Hỏng (Lost)', count: summaryData?.lost ?? 0, color: 'bg-red-500' },
                    ].map((item, idx) => {
                      const total = summaryData?.total_copies || 1;
                      const pct = Math.round((item.count / total) * 100);
                      return (
                        <div key={idx} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-semibold text-gray-600">
                            <span>{item.label}</span>
                            <span>{item.count} quyển ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-200/60 rounded-full h-2">
                            <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border border-gray-100 p-4 rounded-xl bg-gray-50/50">
                  <h4 className="font-bold text-gray-700 mb-3">Tình trạng vật lý sách bản sao</h4>
                  <div className="space-y-3.5">
                    {[
                      { label: 'Mới (New)', count: summaryData?.conditions?.new ?? 0, color: 'bg-green-500' },
                      { label: 'Tốt (Good)', count: summaryData?.conditions?.good ?? 0, color: 'bg-blue-500' },
                      { label: 'Cũ (Old)', count: summaryData?.conditions?.old ?? 0, color: 'bg-yellow-500' },
                      { label: 'Hỏng nhẹ (Light damage)', count: summaryData?.conditions?.light ?? 0, color: 'bg-orange-500' },
                      { label: 'Hỏng nặng (Heavy damage)', count: summaryData?.conditions?.heavy ?? 0, color: 'bg-red-500' },
                    ].map((item, idx) => {
                      const total = summaryData?.total_copies || 1;
                      const pct = Math.round((item.count / total) * 100);
                      return (
                        <div key={idx} className="flex flex-col gap-1">
                          <div className="flex justify-between text-xs font-semibold text-gray-600">
                            <span>{item.label}</span>
                            <span>{item.count} quyển ({pct}%)</span>
                          </div>
                          <div className="w-full bg-gray-200/60 rounded-full h-2">
                            <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Card>
      )}

      {/* CREATE & EDIT BOOK MODAL */}
      <Modal
        title={
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-base font-bold text-navyDark">
            <BookOpen size={18} className="text-blue-500" />
            {editingBook ? "Chỉnh sửa thông tin sách" : "Thêm mới sách thủ công"}
          </div>
        }
        open={isModalOpen}
        onCancel={closeBookModal}
        width={750}
        footer={[
          <Button key="cancel" onClick={closeBookModal} className="rounded-lg h-9">
            Hủy bỏ
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={saving}
            onClick={() => form.submit()}
            className="rounded-lg h-9 bg-blue-600 hover:bg-blue-700"
          >
            {editingBook ? "Lưu thay đổi" : "Tạo sách"}
          </Button>
        ]}
        centered
        className="custom-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveBook}
          className="py-4 grid grid-cols-1 md:grid-cols-2 gap-x-6"
        >
          <Form.Item
            label={<span className="font-semibold text-gray-700">Ảnh bìa</span>}
            className="col-span-1 md:col-span-2"
          >
            <div className="flex items-center gap-4">
              {coverPreviewUrl ? (
                <div className="relative w-[90px] h-[120px] rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                  <img src={coverPreviewUrl} alt="Ảnh bìa" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 shadow hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa ảnh"
                  >
                    <XCircle size={18} className="text-red-500" />
                  </button>
                </div>
              ) : (
                <div className="w-[90px] h-[120px] rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 text-gray-400">
                  <BookOpen size={24} />
                </div>
              )}
              <Upload
                accept=".jpg,.jpeg,.png,.webp"
                showUploadList={false}
                beforeUpload={handleCoverFileSelect}
                maxCount={1}
              >
                <Button icon={<UploadIcon size={14} />} className="rounded-lg">
                  {coverPreviewUrl ? 'Đổi ảnh khác' : 'Tải ảnh lên'}
                </Button>
              </Upload>
              <span className="text-xs text-gray-400">JPG, JPEG, PNG, WEBP · tối đa 5MB</span>
            </div>
          </Form.Item>

          <Form.Item
            name="title"
            label={<span className="font-semibold text-gray-700">Tên sách</span>}
            rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}
            className="col-span-1 md:col-span-2"
          >
            <Input placeholder="Nhập tên sách..." className="h-9 rounded-lg" />
          </Form.Item>

          <Form.Item
            name="isbn"
            label={<span className="font-semibold text-gray-700">Mã ISBN</span>}
            rules={[{ required: true, message: 'Vui lòng nhập mã ISBN!' }]}
          >
            <Input placeholder="Nhập mã ISBN..." className="h-9 rounded-lg" />
          </Form.Item>

          <Form.Item
            name="publisher_id"
            label={<span className="font-semibold text-gray-700">Nhà xuất bản</span>}
            rules={[{ required: true, message: 'Vui lòng chọn nhà xuất bản!' }]}
          >
            <Select
              placeholder="Chọn nhà xuất bản..."
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={filterData.publishers.map(p => ({ value: p.publisher_id, label: p.name }))}
              className="w-full custom-select"
            />
          </Form.Item>

          <Form.Item
            name="authors"
            label={<span className="font-semibold text-gray-700">Tác giả</span>}
            rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập ít nhất một tác giả!' }]}
            className="col-span-1 md:col-span-2"
            extra={<span className="text-xs text-gray-400">Chọn tác giả có sẵn hoặc gõ tên mới rồi nhấn Enter — hệ thống sẽ tự kiểm tra trên Google Books và tạo tác giả mới nếu hợp lệ.</span>}
          >
            <Select
              mode="tags"
              placeholder="Chọn hoặc nhập tên tác giả..."
              showSearch
              tokenSeparators={[',']}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={filterData.authors.map(a => ({ value: a.author_name, label: a.author_name }))}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="categories"
            label={<span className="font-semibold text-gray-700">Thể loại</span>}
            className="col-span-1 md:col-span-2"
          >
            <Select
              mode="multiple"
              placeholder="Chọn các thể loại..."
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={filterData.categories.map(c => ({ value: c.category_id, label: c.category_name }))}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="publish_date"
            label={<span className="font-semibold text-gray-700">Ngày xuất bản</span>}
          >
            <Input type="date" className="h-9 rounded-lg" />
          </Form.Item>

          <Form.Item
            name="publish_year"
            label={<span className="font-semibold text-gray-700">Năm xuất bản</span>}
          >
            <InputNumber placeholder="Ví dụ: 2024" className="w-full h-9 rounded-lg pt-1" min={1000} max={3000} />
          </Form.Item>

          <Form.Item
            name="pages"
            label={<span className="font-semibold text-gray-700">Số trang</span>}
          >
            <InputNumber placeholder="Nhập số trang..." className="w-full h-9 rounded-lg pt-1" min={0} />
          </Form.Item>

          <Form.Item
            name="replacement_cost"
            label={<span className="font-semibold text-gray-700">Giá đền bù (VND)</span>}
          >
            <InputNumber
              placeholder="Nhập giá đền bù..."
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '') as any}
              className="w-full h-9 rounded-lg pt-1"
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="language"
            label={<span className="font-semibold text-gray-700">Ngôn ngữ</span>}
          >
            <Select placeholder="Chọn ngôn ngữ..." className="h-9 rounded-lg">
              <Select.Option value="vi">Tiếng Việt (VI)</Select.Option>
              <Select.Option value="en">Tiếng Anh (EN)</Select.Option>
              <Select.Option value="fr">Tiếng Pháp (FR)</Select.Option>
              <Select.Option value="jp">Tiếng Nhật (JP)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="cover_type"
            label={<span className="font-semibold text-gray-700">Loại bìa</span>}
          >
            <Select placeholder="Chọn loại bìa..." className="h-9 rounded-lg">
              <Select.Option value="Bìa mềm">Bìa mềm</Select.Option>
              <Select.Option value="Bìa cứng">Bìa cứng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dimensions"
            label={<span className="font-semibold text-gray-700">Kích thước (cm)</span>}
          >
            <Input placeholder="Ví dụ: 13x20cm" className="h-9 rounded-lg" />
          </Form.Item>

          <Form.Item
            name="edition"
            label={<span className="font-semibold text-gray-700">Phiên bản xuất bản</span>}
          >
            <Input placeholder="Ví dụ: Tái bản lần 1" className="h-9 rounded-lg" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="font-semibold text-gray-700">Mô tả tóm tắt sách</span>}
            className="col-span-1 md:col-span-2"
          >
            <Input.TextArea placeholder="Nhập mô tả tóm tắt sách..." rows={3} className="rounded-lg" />
          </Form.Item>

          <Form.Item
            name="is_featured"
            valuePropName="checked"
            label={<span className="font-semibold text-gray-700">Sách nổi bật?</span>}
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>

          {!editingBook && (
            <div className="col-span-1 md:col-span-2 border-t border-dashed border-gray-100 pt-4 mt-2 space-y-2">
              <Form.Item name="create_first_copy" valuePropName="checked" initialValue={true} className="!mb-2">
                <Checkbox>Tạo bản sao đầu tiên ngay sau khi thêm sách</Checkbox>
              </Form.Item>

              {watchCreateFirstCopy !== false && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <Form.Item
                    name="copies_count"
                    label={<span className="font-semibold text-gray-700">Số lượng bản sao</span>}
                    initialValue={1}
                    rules={[{ required: true, message: 'Vui lòng nhập số lượng bản sao!' }]}
                  >
                    <InputNumber min={1} max={1000} className="h-9 rounded-lg w-full" />
                  </Form.Item>

                  <Form.Item
                    name="shelf_location"
                    label={<span className="font-semibold text-gray-700">Vị trí kệ</span>}
                  >
                    <Input placeholder="Ví dụ: A1-01" className="h-9 rounded-lg" />
                  </Form.Item>

                  {(!watchCopiesCount || watchCopiesCount <= 1) ? (
                    <Form.Item
                      name="barcode"
                      label={<span className="font-semibold text-gray-700">Barcode đầu tiên</span>}
                      rules={[{ required: true, message: 'Vui lòng nhập barcode hoặc bấm "Sinh barcode"!' }]}
                      className="col-span-1 md:col-span-2"
                    >
                      <Input
                        placeholder="Nhập barcode..."
                        className="h-9 rounded-lg"
                        addonAfter={
                          <button
                            type="button"
                            onClick={handleGenerateBarcode}
                            disabled={generatingBarcode}
                            className="flex items-center gap-1 text-blue-600 disabled:text-gray-400"
                          >
                            <RefreshCw size={13} className={generatingBarcode ? 'animate-spin' : ''} />
                            Sinh barcode
                          </button>
                        }
                      />
                    </Form.Item>
                  ) : (
                    <div className="col-span-1 md:col-span-2 -mt-1 mb-2 text-xs text-gray-500">
                      Sẽ tự động tạo <b>{watchCopiesCount}</b> bản sao, mã vạch dạng{' '}
                      <span className="font-mono">BOOK000001, BOOK000002...</span>
                    </div>
                  )}

                  {watchBarcode && (!watchCopiesCount || watchCopiesCount <= 1) && (
                    <div className="col-span-1 md:col-span-2 -mt-2 mb-2">
                      <span className="text-xs text-gray-400 mr-2">Xem trước:</span>
                      <span className="font-mono font-bold tracking-widest text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1">
                        {watchBarcode}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {editingBook && (
            <Form.Item
              name="edit_reason"
              label={<span className="font-semibold text-gray-700 text-amber-600">Lý do chỉnh sửa</span>}
              rules={[{ required: true, message: 'Vui lòng cung cấp lý do chỉnh sửa để lưu lịch sử!' }]}
              className="col-span-1 md:col-span-2 border-t border-dashed border-gray-100 pt-4 mt-2"
            >
              <Input.TextArea placeholder="Nhập lý do thay đổi thông tin..." rows={2} className="rounded-lg" />
            </Form.Item>
          )}

        </Form>
      </Modal>

      {/* EDIT HISTORY MODAL */}
      <Modal
        title={
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-base font-bold text-navyDark">
            <History size={18} className="text-amber-500" />
            <span>Lịch sử chỉnh sửa: <span className="text-blue-600 font-semibold">{historyBookTitle}</span></span>
          </div>
        }
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        width={800}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsHistoryModalOpen(false)} className="rounded-lg h-9 bg-blue-600 hover:bg-blue-700">
            Đóng
          </Button>
        ]}
        centered
      >
        <div className="py-4">
          <Table
            loading={historyLoading}
            dataSource={historyList.map((h, index) => ({ ...h, key: h.history_id || index }))}
            columns={[
              {
                title: 'Thời gian',
                dataIndex: 'edited_at',
                key: 'edited_at',
                width: 150,
                render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : '—',
              },
              {
                title: 'Người thực hiện',
                dataIndex: 'user',
                key: 'user',
                width: 150,
                render: (user: any) => (
                  <div>
                    <div className="font-semibold text-gray-800">{user?.full_name || 'Hệ thống'}</div>
                    <div className="text-[10px] text-gray-500">{user?.email || ''}</div>
                  </div>
                ),
              },
              {
                title: 'Trường thay đổi',
                dataIndex: 'field_name',
                key: 'field_name',
                width: 150,
                render: (field: string) => (
                  <Tag color="cyan" className="!rounded-md border-0 font-medium">
                    {translateFieldName(field)}
                  </Tag>
                ),
              },
              {
                title: 'Giá trị cũ',
                dataIndex: 'old_value',
                key: 'old_value',
                ellipsis: true,
                render: (val: string) => val === null || val === '' ? <span className="text-gray-400 font-italic">Rỗng</span> : val,
              },
              {
                title: 'Giá trị mới',
                dataIndex: 'new_value',
                key: 'new_value',
                ellipsis: true,
                render: (val: string) => val === null || val === '' ? <span className="text-gray-400 font-italic">Rỗng</span> : <span className="text-green-600 font-semibold">{val}</span>,
              },
              {
                title: 'Lý do',
                dataIndex: 'edit_reason',
                key: 'edit_reason',
                render: (val: string) => val || <span className="text-gray-400">—</span>,
              },
            ]}
            pagination={{ pageSize: 5 }}
            locale={{ emptyText: 'Chưa có lịch sử chỉnh sửa nào cho cuốn sách này.' }}
          />
        </div>
      </Modal>

      {/* CREATE & EDIT CATEGORY MODAL */}
      <Modal
        title={
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-base font-bold text-navyDark">
            <Tags size={18} className="text-purple-500" />
            {editingCategory ? "Chỉnh sửa thể loại" : "Thêm mới thể loại"}
          </div>
        }
        open={isCategoryModalOpen}
        onCancel={() => setIsCategoryModalOpen(false)}
        onOk={() => categoryForm.submit()}
        okText={editingCategory ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        centered
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleSaveCategory}
          className="py-3"
        >
          <Form.Item
            name="category_name"
            label="Tên thể loại"
            rules={[{ required: true, message: 'Vui lòng nhập tên thể loại!' }]}
          >
            <Input placeholder="Ví dụ: Văn học, Khoa học..." />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea placeholder="Mô tả tóm tắt thể loại..." rows={3} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Trạng thái"
            valuePropName="checked"
            getValueProps={(val) => ({ checked: val === 1 })}
            normalize={(val) => (val ? 1 : 0)}
          >
            <Switch checkedChildren="Hiện trên tìm kiếm" unCheckedChildren="Ẩn khỏi tìm kiếm" />
          </Form.Item>
        </Form>
      </Modal>

      {/* CREATE & EDIT AUTHOR MODAL */}
      <Modal
        title={
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-base font-bold text-navyDark">
            <User size={18} className="text-blue-500" />
            {editingAuthor ? "Chỉnh sửa tác giả" : "Thêm mới tác giả"}
          </div>
        }
        open={isAuthorModalOpen}
        onCancel={() => setIsAuthorModalOpen(false)}
        onOk={() => authorForm.submit()}
        okText={editingAuthor ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        centered
      >
        <Form
          form={authorForm}
          layout="vertical"
          onFinish={handleSaveAuthor}
          className="py-3"
        >
          <Form.Item
            name="name"
            label="Tên tác giả"
            rules={[{ required: true, message: 'Vui lòng nhập tên tác giả!' }]}
          >
            <Input placeholder="Ví dụ: Nguyễn Nhật Ánh, Nam Cao..." />
          </Form.Item>
          <Form.Item
            name="nationality"
            label="Quốc tịch"
          >
            <Input placeholder="Ví dụ: Việt Nam, Anh, Mỹ..." />
          </Form.Item>
          <Form.Item
            name="birth_date"
            label="Ngày sinh"
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item
            name="bio"
            label="Tiểu sử"
          >
            <Input.TextArea placeholder="Tiểu sử tóm tắt tác giả..." rows={4} />
          </Form.Item>
          <Form.Item
            name="is_active"
            valuePropName="checked"
            label="Hoạt động?"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
        </Form>
      </Modal>

      {/* AUTHOR PROFILE DRAWER */}
      <Drawer
        title={
          <div className="flex items-center gap-2 font-bold text-navyDark text-base">
            <User size={18} className="text-blue-600" />
            <span>Hồ sơ tác giả: {profileAuthor?.author_name}</span>
          </div>
        }
        open={isAuthorProfileOpen}
        onClose={() => setIsAuthorProfileOpen(false)}
        width={550}
        loading={profileLoading}
      >
        {profileAuthor && (
          <div className="space-y-6">
            {/* Bio Card */}
            <Descriptions column={1} bordered className="custom-descriptions">
              <Descriptions.Item label="Họ tên">
                <span className="font-bold text-gray-800">{profileAuthor.author_name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Quốc tịch">
                <Tag color="blue" className="!rounded-md border-0">{profileAuthor.nationality || 'Chưa cập nhật'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                <span className="flex items-center gap-1.5 text-gray-700">
                  <Calendar size={14} className="text-gray-400" />
                  {profileAuthor.birth_date ? new Date(profileAuthor.birth_date).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {profileAuthor.is_active ? (
                  <Tag color="success" icon={<CheckCircle2 size={12} className="inline mr-1" />} className="!rounded-full border-0">Đang hoạt động</Tag>
                ) : (
                  <Tag color="error" icon={<XCircle size={12} className="inline mr-1" />} className="!rounded-full border-0">Ngưng hoạt động</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            <div className="space-y-2">
              <h4 className="font-bold text-gray-800 text-sm">Tiểu sử</h4>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100 whitespace-pre-line">
                {profileAuthor.bio || 'Chưa có thông tin tiểu sử chi tiết.'}
              </p>
            </div>

            {/* List of Books written by this Author */}
            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                <BookOpen size={16} className="text-blue-500" />
                <span>Danh sách tác phẩm ({profileAuthor.books?.length || 0})</span>
              </h4>
              <List
                dataSource={profileAuthor.books || []}
                locale={{ emptyText: 'Chưa có đầu sách nào của tác giả này trong thư viện.' }}
                renderItem={(book: any) => {
                  const imgUrl = resolveCoverImageUrl(book.cover_image);
                  return (
                    <List.Item className="!py-3 border-b border-gray-100/50">
                      <List.Item.Meta
                        avatar={
                          <div className="w-[40px] h-[60px] rounded overflow-hidden shadow bg-gray-50">
                            {imgUrl ? (
                              <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100"><BookOpen size={14} className="text-gray-400" /></div>
                            )}
                          </div>
                        }
                        title={<span className="font-semibold text-gray-800 text-xs">{book.title}</span>}
                        description={<span className="text-[10px] text-gray-400 font-mono">ISBN: {book.isbn || '—'}</span>}
                      />
                    </List.Item>
                  );
                }}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* BOOK DETAIL DRAWER — opened by clicking a book title in the list */}
      <Drawer
        title={
          <div className="flex items-center gap-2 font-bold text-navyDark text-base">
            <BookOpen size={18} className="text-blue-600" />
            <span>Chi tiết sách</span>
          </div>
        }
        open={isBookDetailOpen}
        onClose={() => setIsBookDetailOpen(false)}
        width={600}
        loading={bookDetailLoading}
      >
        {bookDetail && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-[100px] h-[140px] shrink-0 rounded-lg overflow-hidden shadow-sm bg-gray-100 flex items-center justify-center">
                {resolveCoverImageUrl(bookDetail.cover_image) ? (
                  <img
                    src={resolveCoverImageUrl(bookDetail.cover_image) as string}
                    alt={bookDetail.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen size={28} className="text-gray-400" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-navyDark text-lg leading-snug m-0">{bookDetail.title}</h3>
                <div className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-1">
                  <Hash size={12} className="text-gray-400" />
                  {bookDetail.isbn || '—'}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(bookDetail.authors || []).map((a: Author) => (
                    <Tag key={a.author_id} color="blue" className="!rounded-md border-0 font-medium text-xs">
                      {a.author_name}
                    </Tag>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(bookDetail.categories || []).map((c: Category) => (
                    <Tag key={c.category_id} color="purple" className="!rounded-md border-0 font-medium text-xs">
                      {c.category_name}
                    </Tag>
                  ))}
                  {bookDetail.is_featured ? (
                    <Tag color="gold" className="!rounded-full border-0 text-xs">Nổi bật</Tag>
                  ) : null}
                </div>
              </div>
            </div>

            <Descriptions column={1} bordered size="small" className="custom-descriptions">
              <Descriptions.Item label="Nhà xuất bản">{bookDetail.publisher?.name || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Ngày xuất bản">
                {bookDetail.publish_date ? new Date(bookDetail.publish_date).toLocaleDateString('vi-VN') : (bookDetail.publish_year || 'Chưa cập nhật')}
              </Descriptions.Item>
              <Descriptions.Item label="Phiên bản">{bookDetail.edition || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Ngôn ngữ">{bookDetail.language ? bookDetail.language.toUpperCase() : 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Số trang">{bookDetail.pages ?? 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Kích thước">{bookDetail.dimensions || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Loại bìa">{bookDetail.cover_type || 'Chưa cập nhật'}</Descriptions.Item>
              <Descriptions.Item label="Giá đền bù">
                {bookDetail.replacement_cost ? `${Number(bookDetail.replacement_cost).toLocaleString('vi-VN')} đ` : 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Đánh giá">
                {bookDetail.avg_rating ? `${bookDetail.avg_rating}/5 (${bookDetail.total_reviews || 0} lượt)` : 'Chưa có đánh giá'}
              </Descriptions.Item>
            </Descriptions>

            <div className="space-y-2">
              <h4 className="font-bold text-gray-800 text-sm">Mô tả</h4>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100 whitespace-pre-line">
                {bookDetail.description || 'Chưa có mô tả.'}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
                <Layers size={16} className="text-blue-500" />
                <span>Bản sao ({bookDetail.book_copies?.length || 0})</span>
              </h4>
              <List
                dataSource={bookDetail.book_copies || []}
                locale={{ emptyText: 'Sách này chưa có bản sao nào.' }}
                renderItem={(copy: any) => {
                  const statusMap: Record<string, { label: string; color: string }> = {
                    available: { label: 'Có sẵn', color: 'green' },
                    borrowed: { label: 'Đang mượn', color: 'blue' },
                    reserved: { label: 'Đặt trước', color: 'orange' },
                    maintenance: { label: 'Bảo trì', color: 'purple' },
                    lost: { label: 'Mất/Hỏng', color: 'red' },
                    liquidated: { label: 'Đã thanh lý', color: 'default' },
                  };
                  const s = statusMap[copy.status] || { label: copy.status, color: 'default' };
                  return (
                    <List.Item className="!py-2 border-b border-gray-100/50">
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-mono text-xs text-gray-600">{copy.barcode}</span>
                        <span className="text-xs text-gray-400">{copy.shelf_location || 'Chưa xếp kệ'}</span>
                        <Tag color={s.color} className="!rounded-md border-0 text-xs">{s.label}</Tag>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* CREATE & EDIT COPY MODAL */}
      <Modal
        title={
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-base font-bold text-navyDark text-left">
            <Layers size={18} className="text-blue-500" />
            {editingCopy ? "Chỉnh sửa bản sao" : "Thêm bản sao mới"}
          </div>
        }
        open={isCopyModalOpen}
        onCancel={() => setIsCopyModalOpen(false)}
        onOk={() => copyForm.submit()}
        okText={editingCopy ? "Cập nhật" : "Tạo mới"}
        cancelText="Hủy"
        centered
      >
        <Form
          form={copyForm}
          layout="vertical"
          onFinish={handleSaveCopy}
          className="py-3 text-left"
        >
          {/* If editing, book is read-only. If creating, choose book */}
          {editingCopy ? (
            <Form.Item label="Đầu sách">
              <Input value={editingCopy.book_title} disabled className="h-9" />
            </Form.Item>
          ) : (
            <Form.Item
              name="book_id"
              label="Chọn đầu sách"
              rules={[{ required: true, message: 'Vui lòng chọn đầu sách!' }]}
            >
              <Select
                showSearch
                placeholder="Nhập tên sách để tìm kiếm..."
                onSearch={(val) => loadSelectBooks(val)}
                filterOption={false}
                options={selectBooks.map(b => ({ value: b.book_id, label: b.title }))}
                onDropdownVisibleChange={(open) => {
                  if (open && selectBooks.length === 0) {
                    loadSelectBooks('');
                  }
                }}
              />
            </Form.Item>
          )}

          <Form.Item
            name="barcode"
            label="Barcode / Mã vạch"
            rules={[{ required: true, message: 'Vui lòng nhập hoặc tự sinh barcode!' }]}
          >
            <Input 
              placeholder="Ví dụ: A1-01 hoặc tự sinh..." 
              className="h-9" 
              addonAfter={
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => {
                    const randomBarcode = 'LIB-' + Math.random().toString(36).substring(2, 9).toUpperCase();
                    copyForm.setFieldsValue({ barcode: randomBarcode });
                  }}
                  style={{ padding: 0, height: 'auto' }}
                >
                  Tự sinh
                </Button>
              }
            />
          </Form.Item>

          <Form.Item
            name="shelf_location"
            label="Vị trí kệ"
          >
            <Input placeholder="Ví dụ: A1-01, B2-05..." className="h-9" />
          </Form.Item>

          <Form.Item
            name="condition"
            label="Tình trạng vật lý"
            rules={[{ required: true, message: 'Vui lòng chọn tình trạng vật lý!' }]}
          >
            <Select className="h-9">
              <Select.Option value="new">Mới (New)</Select.Option>
              <Select.Option value="good">Tốt (Good)</Select.Option>
              <Select.Option value="old">Cũ (Old)</Select.Option>
              <Select.Option value="light">Hỏng nhẹ (Light damage)</Select.Option>
              <Select.Option value="heavy">Hỏng nặng (Heavy damage)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select className="h-9">
              <Select.Option value="available">Có sẵn trong kho (Available)</Select.Option>
              <Select.Option value="borrowed">Đang cho mượn (Borrowed)</Select.Option>
              <Select.Option value="reserved">Đang đặt trước (Reserved)</Select.Option>
              <Select.Option value="maintenance">Bảo trì (Maintenance)</Select.Option>
              <Select.Option value="lost">Mất/Hỏng (Lost/Damaged)</Select.Option>
              <Select.Option value="liquidated" disabled>Đã thanh lý (Liquidated)</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="acquisition_date"
            label="Ngày nhập kho"
          >
            <Input type="date" className="h-9" />
          </Form.Item>
        </Form>
      </Modal>
 
      {/* RETIRE COPY MODAL */}
      <Modal
        title={
          <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-base font-bold text-red-600 text-left">
            <Trash2 size={18} />
            Thanh lý bản sao sách
          </div>
        }
        open={isRetireModalOpen}
        onCancel={() => setIsRetireModalOpen(false)}
        onOk={() => retireForm.submit()}
        okText="Xác nhận thanh lý"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        centered
      >
        <Form
          form={retireForm}
          layout="vertical"
          onFinish={handleSaveRetire}
          className="py-3 text-left"
        >
          <Form.Item
            name="reason"
            label={<span className="font-semibold text-gray-700">Lý do thanh lý</span>}
            rules={[{ required: true, message: 'Vui lòng nhập hoặc chọn lý do thanh lý!' }]}
          >
            <Select 
              className="h-9"
              options={[
                { value: 'Hư hỏng nặng không thể sửa', label: 'Hư hỏng nặng không thể sửa' },
                { value: 'Sách bị mất / Thất thoát', label: 'Sách bị mất / Thất thoát' },
                { value: 'Hết hạn sử dụng / Lỗi thời', label: 'Hết hạn sử dụng / Lỗi thời' },
                { value: 'Khác', label: 'Lý do khác' }
              ]}
            />
          </Form.Item>
 
          <Form.Item
            name="retired_date"
            label={<span className="font-semibold text-gray-700">Ngày thanh lý</span>}
            rules={[{ required: true, message: 'Vui lòng chọn ngày thanh lý!' }]}
          >
            <Input type="date" className="h-9" />
          </Form.Item>
 
          <Form.Item
            name="note"
            label={<span className="font-semibold text-gray-700">Ghi chú thêm (nếu có)</span>}
          >
            <Input.TextArea placeholder="Nhập thêm chi tiết về tình trạng thanh lý..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>
 
    </div>
  );
}