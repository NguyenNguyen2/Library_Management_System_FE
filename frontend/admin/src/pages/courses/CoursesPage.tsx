import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  UploadOutlined,
  DownloadOutlined,
  SearchOutlined,
  InfoCircleOutlined,
  ExclamationCircleFilled,
  BookOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Table,
  Tag,
  Typography,
  Upload,
  Tooltip,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { courseHooks } from '../../hooks/useCourses';
import {
  ICreateCourse,
  IDetailLesson,
  IListCourse,
  IListLesson,
  IListQuestion,
  IUpdateCourse,
  IUpdateLesson,
} from '@shared/types/CourseType';
import {
  IMAGE_FALLBACK,
  initSearchParams,
} from '@shared/constants/commonConst';
import { getKey } from '@shared/types/I18nKeyType';
import ModalCreateUpdateCourse from './components/ModalCreateUpdateCourse';

const { Text } = Typography;
const { confirm } = Modal;

const CoursesPage = () => {
  const { t } = useTranslation();

  const { data, isLoading } = courseHooks.useFetchListCourses(initSearchParams);

  const createMutation = courseHooks.useCreateCourse();
  const updateMutation = courseHooks.useUpdateCourse();
  const deleteMutation = courseHooks.useDeleteCourse();
  const updateLessonMutation = courseHooks.useUpdateLesson();
  const deleteLessonMutation = courseHooks.useDeleteLesson();
  const createLessonsMutation = courseHooks.useCreateLessons();
  const downloadTemplateMutation = courseHooks.useDownloadQuestionTemplate();
  const importQuestionsMutation = courseHooks.useImportQuestions();

  const [searchQuery, setSearchQuery] = useState('');

  const [courseModal, setCourseModal] = useState<{
    open: boolean;
    editingCourse: IListCourse | null;
    index: number;
  }>({ open: false, editingCourse: null, index: -1 });
  const [addLessonModal, setAddLessonModal] = useState<{
    open: boolean;
    courseId: string;
    courseIndex: number;
  }>({ open: false, courseId: '', courseIndex: -1 });
  const [questionModal, setQuestionModal] = useState<{
    open: boolean;
    lesson: IListLesson | null;
  }>({ open: false, lesson: null });
  const [importModal, setImportModal] = useState<{
    open: boolean;
    lesson: IListLesson | null;
  }>({ open: false, lesson: null });
  const [editLessonModal, setEditLessonModal] = useState<{
    open: boolean;
    lesson: IListLesson | null;
    courseId: string | null;
  }>({ open: false, lesson: null, courseId: null });
  const [importFile, setImportFile] = useState<File | null>(null);

  const [formCourse] = Form.useForm();
  const [formAddLesson] = Form.useForm();
  const [formEditLesson] = Form.useForm();

  // Reset to page 1 whenever the question modal opens with a different lesson.
  const [questionPage, setQuestionPage] = useState(1);
  const QUESTION_PAGE_SIZE = 5;
  useEffect(() => {
    if (questionModal?.open) setQuestionPage(1);
  }, [questionModal?.open, questionModal?.lesson?.id]);

  const { data: questionsData, isLoading: questionsLoading } =
    courseHooks.useFetchQuestionsByLesson(
      questionModal?.lesson?.id ?? '',
      questionPage,
      QUESTION_PAGE_SIZE,
      questionModal?.open
    );
  const questions = questionsData?.rows ?? [];
  const questionsTotal = questionsData?.total ?? 0;
  const deleteQuestionMutation = courseHooks.useDeleteQuestion();

  const handleDeleteQuestion = (id: string) => {
    const lessonId = questionModal?.lesson?.id;
    if (!lessonId) return;
    confirm({
      title: t(getKey('confirm_delete_question_title')),
      icon: <ExclamationCircleFilled />,
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      okButtonProps: { danger: true },
      onOk: () => deleteQuestionMutation.mutate({ id, lessonId }),
    });
  };

  const questionColumns = useMemo(
    () => [
      {
        title: t(getKey('col_stt')),
        key: 'stt',
        width: 60,
        align: 'center' as const,
        render: (_: unknown, __: IListQuestion, idx: number) => idx + 1,
      },
      {
        title: t(getKey('col_question')),
        dataIndex: 'question',
        key: 'question',
        ellipsis: true,
        render: (text: string) => <Text className="!font-medium">{text}</Text>,
      },
      {
        title: t(getKey('col_options')),
        dataIndex: 'options',
        key: 'options',
        width: 280,
        render: (options: string[], record: IListQuestion) => {
          const LETTER_TO_INDEX: Record<string, number> = {
            A: 0,
            B: 1,
            C: 2,
            D: 3,
          };
          const correctIdx = LETTER_TO_INDEX[record?.correctAnswer ?? ''];

          return (
            <div className="flex flex-col gap-1">
              {options?.map((opt, idx) => (
                <div
                  key={idx}
                  className={`rounded px-2 py-1 text-sm ${
                    idx === correctIdx
                      ? 'bg-greenLight font-medium text-greenDark'
                      : 'bg-grayLightest text-blackSoft'
                  }`}
                >
                  {opt}
                </div>
              ))}
            </div>
          );
        },
      },
      {
        title: t(getKey('col_correct_answer')),
        dataIndex: 'correctAnswer',
        key: 'correctAnswer',
        width: 130,
        align: 'center' as const,
        render: (answer: string) => (
          <Tag className="!rounded-full !border-0 !bg-greenLight !px-2 !text-greenDark">
            {t(getKey('correct_answer_label'), { answer })}
          </Tag>
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 64,
        align: 'center' as const,
        render: (_: unknown, record: IListQuestion) => (
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteQuestion(record.id)}
          />
        ),
      },
    ],
    [t, questionModal?.lesson?.id]
  );

  const handleOpenCreate = () => {
    formCourse.resetFields();
    setCourseModal({ open: true, editingCourse: null, index: -1 });
  };

  const handleOpenEdit = (course: IListCourse, index: number) => {
    formCourse.setFieldsValue({
      name: course?.name,
      description: course?.description,
      image: course?.image,
    });
    setCourseModal({ open: true, editingCourse: course, index });
  };

  const handleCancelCourseModal = () => {
    setCourseModal({ open: false, editingCourse: null, index: -1 });
    formCourse.resetFields();
  };

  const handleToggleVisibility = (course: IListCourse) => {
    const nextActive = !(course?.isActive !== false);
    const index = data?.rows?.findIndex((c) => c.id === course.id) ?? -1;
    if (index < 0) return;

    confirm({
      title: nextActive
        ? t(getKey('confirm_show_course_title'))
        : t(getKey('confirm_hide_course_title')),
      icon: <ExclamationCircleFilled />,
      okText: t(getKey('confirm_btn')),
      cancelText: t(getKey('cancel_btn')),
      onOk: () =>
        updateMutation.mutate({
          id: course.id,
          body: { ...course, isActive: nextActive } as IUpdateCourse,
          index,
          params: initSearchParams,
        }),
    });
  };

  const handleSubmitCourse = (values: ICreateCourse) => {
    const editingCourse = courseModal?.editingCourse;
    if (editingCourse?.id) {
      updateMutation.mutate(
        {
          id: editingCourse.id,
          body: values,
          index: courseModal?.index,
          params: initSearchParams,
        },
        { onSuccess: handleCancelCourseModal }
      );
    } else {
      createMutation.mutate(
        { body: values, params: initSearchParams },
        { onSuccess: handleCancelCourseModal }
      );
    }
  };

  const showDeleteConfirm = (onOk: () => void) => {
    confirm({
      centered: true,
      title: null,
      icon: null,
      content: (
        <div className="text-center">
          <ExclamationCircleFilled className="text-[40px] leading-none text-btnDelete" />
          <div className="mt-3 text-xl font-bold">
            {t(getKey('delete_title'))}
          </div>
          <div className="text-sm">{t(getKey('delete_content'))}</div>
        </div>
      ),
      okText: t(getKey('delete')),
      okButtonProps: { type: 'primary', danger: true },
      cancelButtonProps: { type: 'default', danger: true },
      cancelText: t(getKey('cancel_btn')),
      className: 'custom-confirm-modal',
      onOk,
    });
  };

  const handleDelete = (type: 'course' | 'lesson', id: string) =>
    showDeleteConfirm(() =>
      type === 'course'
        ? deleteMutation.mutate({ id, params: initSearchParams })
        : deleteLessonMutation.mutate({ id, params: initSearchParams })
    );

  const handleOpenImport = (lesson: IListLesson) => {
    setImportFile(null);
    setImportModal({ open: true, lesson });
  };

  const handleCancelImport = () => {
    setImportModal({ open: false, lesson: null });
    setImportFile(null);
  };

  const handleSubmitImport = () => {
    if (!importFile || !importModal?.lesson) return;
    importQuestionsMutation.mutate(
      {
        lessonId: importModal.lesson.id,
        file: importFile,
        params: initSearchParams,
      },
      { onSuccess: handleCancelImport }
    );
  };

  const handleCancelQuestionModal = () =>
    setQuestionModal({ open: false, lesson: null });

  const handleOpenEditLesson = (lesson: IListLesson, courseId: string) => {
    formEditLesson.setFieldsValue({
      name: lesson.name,
      youtubeUrl: lesson.youtubeUrl,
      duration: lesson.duration,
    });
    setEditLessonModal({ open: true, lesson, courseId });
  };

  const handleCancelEditLesson = () => {
    setEditLessonModal({ open: false, lesson: null, courseId: null });
    formEditLesson.resetFields();
  };

  const handleSubmitEditLesson = (values: IUpdateLesson) => {
    if (!editLessonModal?.lesson?.id || !editLessonModal?.courseId) return;
    updateLessonMutation.mutate(
      {
        id: editLessonModal.lesson.id,
        body: values,
        courseId: editLessonModal.courseId,
        params: initSearchParams,
      },
      { onSuccess: handleCancelEditLesson }
    );
  };

  const handleCancelAddLesson = () => {
    setAddLessonModal({ open: false, courseId: '', courseIndex: -1 });
    formAddLesson.resetFields();
  };

  const handleSubmitAddLesson = (values: { lessons: IListLesson[] }) => {
    if (!addLessonModal?.courseId) return;
    createLessonsMutation.mutate(
      {
        courseId: addLessonModal.courseId,
        lessons: values?.lessons,
        params: initSearchParams,
      },
      { onSuccess: handleCancelAddLesson }
    );
  };

  const handleDownloadTemplate = () => {
    downloadTemplateMutation.mutate({ params: initSearchParams });
  };

  const lessonFields = Form.useWatch('lessons', formAddLesson);
  const lessonCount = lessonFields?.length ?? 0;

  // Statistics Calculation
  const totalBooks = data?.rows?.length ?? 0;
  const activeBooksCount = data?.rows?.filter((c) => c.isActive !== false)?.length ?? 0;
  const hiddenBooksCount = data?.rows?.filter((c) => c.isActive === false)?.length ?? 0;
  const totalCopiesCount = data?.rows?.reduce((acc, c) => acc + (c.lessons?.length ?? 0), 0) ?? 0;

  // Filter locally based on search query
  const filteredCourses = useMemo(() => {
    if (!data?.rows) return [];
    return data.rows.filter(
      (course) =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (course.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data?.rows, searchQuery]);

  // Main columns configuration
  const columns = [
    {
      title: 'Mã',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => (
        <span className="font-mono text-xs text-gray-400 font-semibold">
          {id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      title: 'Tên sách',
      key: 'name',
      className: 'text-left',
      render: (_: unknown, record: IListCourse) => (
        <Flex gap={12} align="center">
          <Image
            src={record.image}
            alt={record.name}
            width={48}
            height={48}
            className="!rounded object-cover border border-gray-200 shrink-0"
            fallback={IMAGE_FALLBACK}
            preview={false}
          />
          <div className="min-w-0">
            <span className="font-semibold text-navyDark text-sm block truncate">
              {record.name}
            </span>
          </div>
        </Flex>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      className: 'text-left',
      render: (text: string) => (
        <span className="text-xs text-gray-500 line-clamp-2" title={text}>
          {text || t(getKey('not_available'))}
        </span>
      ),
    },
    {
      title: 'Bản sao',
      key: 'copiesCount',
      align: 'center' as const,
      width: 100,
      render: (_: unknown, record: IListCourse) => (
        <span className="font-semibold text-navyDark">{record.lessons?.length ?? 0}</span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: (_: unknown, record: IListCourse) => {
        const active = record.isActive !== false;
        return (
          <Tag
            color={active ? 'success' : 'default'}
            className="!rounded-full !px-2.5 !py-0.5 font-medium border-0"
          >
            {active ? 'Đang hiển thị' : 'Đang ẩn'}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      align: 'right' as const,
      render: (_: unknown, record: IListCourse, index: number) => (
        <Flex gap={4} justify="end" onClick={(e) => e.stopPropagation()}>
          <Tooltip title={t(getKey('add_lesson'))}>
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() =>
                setAddLessonModal({
                  open: true,
                  courseId: record.id,
                  courseIndex: index,
                })
              }
              className="text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title={record.isActive === false ? 'Hiện sách' : 'Ẩn sách'}>
            <Button
              type="text"
              icon={record.isActive === false ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => handleToggleVisibility(record)}
              className="text-gray-500 hover:bg-gray-100"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record, index)}
              className="text-amber-600 hover:bg-amber-50"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete('course', record.id)}
              className="hover:bg-red-50"
            />
          </Tooltip>
        </Flex>
      ),
    },
  ];

  // Nested table showing lessons (copies)
  const expandedRowRender = (course: IListCourse) => {
    const subColumns = [
      {
        title: 'Mã bản sao',
        dataIndex: 'id',
        key: 'id',
        width: 140,
        render: (id: string) => (
          <span className="font-mono text-xs text-gray-400">
            {id.slice(0, 8).toUpperCase()}
          </span>
        ),
      },
      {
        title: 'Mã vạch bản sao',
        dataIndex: 'name',
        key: 'name',
        className: 'font-semibold text-navyDark text-left',
      },
      {
        title: 'Kệ sách',
        dataIndex: 'youtubeUrl',
        key: 'youtubeUrl',
        render: (url: string | null) => (
          <span className="text-gray-500 font-medium">{url || '—'}</span>
        ),
      },
      {
        title: 'Tình trạng',
        dataIndex: 'duration',
        key: 'duration',
        render: (duration: string | null) => (
          <Tag color="cyan" className="!rounded-md border-0">
            {duration || 'Mới'}
          </Tag>
        ),
      },
      {
        title: 'Giao dịch',
        dataIndex: 'questionCount',
        key: 'questionCount',
        align: 'center' as const,
        width: 100,
        render: (count: number) => (
          <span className="font-bold text-blue-600">{count ?? 0}</span>
        ),
      },
      {
        title: 'Thao tác',
        key: 'actions',
        width: 280,
        align: 'right' as const,
        render: (_: unknown, lesson: IDetailLesson) => (
          <Flex gap={4} justify="end">
            <Button
              size="small"
              icon={<UploadOutlined />}
              onClick={() => handleOpenImport(lesson)}
              className="text-xs hover:bg-gray-100"
            >
              {t(getKey('import_questions'))}
            </Button>
            <Button
              size="small"
              type="primary"
              ghost
              icon={<InfoCircleOutlined />}
              onClick={() => {
                setQuestionModal({ open: true, lesson });
              }}
              className="text-xs"
            >
              Giao dịch ({lesson.questionCount ?? 0})
            </Button>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleOpenEditLesson(lesson, course.id)}
              className="text-amber-600 hover:bg-amber-50"
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete('lesson', lesson.id)}
              className="hover:bg-red-50"
            />
          </Flex>
        ),
      },
    ];

    return (
      <Table
        columns={subColumns}
        dataSource={course.lessons || []}
        rowKey="id"
        pagination={false}
        size="small"
        className="nested-table bg-gray-50/50 p-2 rounded-lg border border-gray-100"
      />
    );
  };

  return (
    <Flex vertical gap={24} align="stretch" className="max-w-[1400px] mx-auto">
      {/* Page header */}
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        <div className="text-left">
          <h1 className="m-0 text-[24px] font-semibold leading-[32px] text-navyDark">
            {t(getKey('course_management'))}
          </h1>
          <p className="m-0 mt-1 text-sm text-gray-500">
            {t(getKey('course_management_desc'))}
          </p>
        </div>
        <Flex align="center" gap={8}>
          <Button
            icon={<DownloadOutlined />}
            size="large"
            onClick={handleDownloadTemplate}
            loading={downloadTemplateMutation?.isPending}
            className="flex items-center justify-center text-sm rounded-md"
          >
            {t(getKey('download_question_template'))}
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined className="text-white" />}
            onClick={handleOpenCreate}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] border-0 text-sm rounded-md flex items-center justify-center text-white"
          >
            <span className="text-white font-medium">
              {t(getKey('add_course'))}
            </span>
          </Button>
        </Flex>
      </Flex>

      {/* Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <BookOutlined style={{ fontSize: 20 }} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">{t(getKey('total_courses'))}</p>
              <p className="m-0 text-[20px] font-bold text-navyDark mt-0.5">{totalBooks}</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <EyeOutlined style={{ fontSize: 20 }} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Đang hiển thị</p>
              <p className="m-0 text-[20px] font-bold text-emerald-600 mt-0.5">{activeBooksCount}</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <EyeInvisibleOutlined style={{ fontSize: 20 }} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Đang ẩn</p>
              <p className="m-0 text-[20px] font-bold text-red-600 mt-0.5">{hiddenBooksCount}</p>
            </div>
          </div>
        </Card>

        <Card
          className="!rounded-[10px] border border-gray-200 shadow-sm"
          bodyStyle={{ padding: '16px' }}
          loading={isLoading}
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2.5 rounded-lg shrink-0 flex items-center justify-center">
              <FileExcelOutlined style={{ fontSize: 20 }} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 m-0 font-medium">Tổng số bản sao</p>
              <p className="m-0 text-[20px] font-bold text-purple-600 mt-0.5">{totalCopiesCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card
        className="!rounded-[10px] border border-gray-200 shadow-sm"
        bodyStyle={{ padding: '20px' }}
      >
        {/* Search toolbar */}
        <div className="flex items-center justify-between mb-4 gap-3 text-left">
          <div className="relative flex-1 max-w-md">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên sách hoặc mô tả..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="!h-10 !rounded-lg"
              allowClear
            />
          </div>
        </div>

        {/* Main Books Table */}
        <Table
          columns={columns}
          dataSource={filteredCourses}
          loading={isLoading}
          rowKey="id"
          expandable={{
            expandedRowRender,
            defaultExpandAllRows: false,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sách`,
            className: 'custom-pagination',
          }}
          size="middle"
          className="custom-table"
        />
      </Card>

      {/* ── Edit lesson modal ── */}
      <Modal
        centered
        open={editLessonModal?.open}
        onCancel={handleCancelEditLesson}
        destroyOnClose
        maskClosable={false}
        footer={null}
        width={512}
      >
        <Form
          form={formEditLesson}
          layout="vertical"
          onFinish={handleSubmitEditLesson}
          className="max-h-[75vh] overflow-y-auto overflow-x-hidden px-1 text-left"
          scrollToFirstError={{
            behavior: 'instant',
            focus: true,
            block: 'center',
          }}
        >
          <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft mb-1">
            {t(getKey('edit_lesson_title'))}
          </h2>
          <p className="mb-4 text-sm leading-5 text-grayMedium">
            {t(getKey('edit_lesson_desc'))}
          </p>

          <Form.Item
            label={t(getKey('lesson_name'))}
            name="name"
            rules={[
              { required: true, message: t(getKey('lesson_name_required')) },
            ]}
          >
            <Input
              placeholder={t(getKey('lesson_name_placeholder'))}
              className="!h-10 !rounded-lg !border-graySilver"
            />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={t(getKey('youtube_url'))}
              name="youtubeUrl"
              rules={[
                {
                  required: true,
                  message: t(getKey('youtube_url_invalid')),
                },
              ]}
            >
              <Input
                placeholder={t(getKey('youtube_url_placeholder'))}
                className="!h-10 !rounded-lg !border-graySilver"
              />
            </Form.Item>
            <Form.Item label={t(getKey('lesson_duration'))} name="duration">
              <Input
                placeholder={t(getKey('lesson_duration_placeholder'))}
                className="!h-10 !rounded-lg !border-graySilver"
              />
            </Form.Item>
          </div>

          <Flex justify="end" gap={8} className="mt-4">
            <Button
              onClick={handleCancelEditLesson}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium !border-graySilver"
            >
              {t(getKey('cancel_btn'))}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateLessonMutation?.isPending}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium"
            >
              {t(getKey('update_btn'))}
            </Button>
          </Flex>
        </Form>
      </Modal>

      {/* ── Create/Edit course modal ── */}
      <Modal
        centered
        open={courseModal?.open}
        onCancel={handleCancelCourseModal}
        destroyOnClose
        maskClosable={false}
        width={512}
        footer={null}
      >
        <Form
          form={formCourse}
          layout="vertical"
          onFinish={handleSubmitCourse}
          className="max-h-[90dvh] overflow-y-auto overflow-x-hidden px-1 text-left"
          scrollToFirstError={{
            behavior: 'instant',
            focus: true,
            block: 'center',
          }}
        >
          <ModalCreateUpdateCourse isEdit={!!courseModal?.editingCourse} />

          <Flex justify="end" gap={8} className="mt-4">
            <Button
              onClick={handleCancelCourseModal}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium !border-graySilver"
            >
              {t(getKey('cancel_btn'))}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation?.isPending || updateMutation?.isPending}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium"
            >
              {courseModal?.editingCourse
                ? t(getKey('update_btn'))
                : t(getKey('create_course_btn'))}
            </Button>
          </Flex>
        </Form>
      </Modal>

      {/* ── Add lesson modal ── */}
      <Modal
        centered
        open={addLessonModal?.open}
        onCancel={handleCancelAddLesson}
        destroyOnClose
        maskClosable={false}
        footer={null}
        width={768}
      >
        <Form
          form={formAddLesson}
          layout="vertical"
          onFinish={handleSubmitAddLesson}
          className="max-h-[75vh] overflow-y-auto overflow-x-hidden px-1 text-left"
          scrollToFirstError={{
            behavior: 'instant',
            focus: true,
            block: 'center',
          }}
        >
          <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-blackSoft mb-1">
            {t(getKey('add_lesson_title'))}
          </h2>
          <p className="mb-4 text-sm leading-5 text-grayMedium">
            {t(getKey('add_lesson_desc'))}
          </p>

          <Form.List name="lessons" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <div className="flex flex-col gap-4">
                <div className="flex max-h-[320px] flex-col gap-3 overflow-y-auto pr-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      className="flex flex-col gap-3 rounded-[10px] border border-black/10 p-4"
                    >
                      <Flex justify="space-between" align="center">
                        <Text className="!text-sm !font-medium !text-grayMedium">
                          {t(getKey('lesson_number'), { number: index + 1 })}
                        </Text>
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(field.name)}
                          />
                        )}
                      </Flex>
                      <Form.Item
                        label={t(getKey('lesson_name'))}
                        name={[field.name, 'name']}
                        rules={[
                          {
                            required: true,
                            message: t(getKey('lesson_name_required')),
                          },
                        ]}
                        className="!mb-0"
                      >
                        <Input
                          placeholder={t(getKey('lesson_name_placeholder'))}
                          className="!h-10 !rounded-lg !border-graySilver"
                        />
                      </Form.Item>
                      <div className="grid grid-cols-2 gap-3">
                        <Form.Item
                          label={t(getKey('youtube_url'))}
                          name={[field.name, 'youtubeUrl']}
                          className="!mb-0"
                          rules={[
                            {
                              required: true,
                              message: t(getKey('youtube_url_invalid')),
                            },
                          ]}
                        >
                          <Input
                            placeholder={t(getKey('youtube_url_placeholder'))}
                            className="!h-10 !rounded-lg !border-graySilver"
                          />
                        </Form.Item>
                        <Form.Item
                          label={t(getKey('lesson_duration'))}
                          name={[field.name, 'duration']}
                          className="!mb-0"
                        >
                          <Input
                            placeholder={t(
                              getKey('lesson_duration_placeholder')
                            )}
                            className="!h-10 !rounded-lg !border-graySilver"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => add()}
                  className="w-full !h-10 !rounded-lg !font-medium"
                >
                  {t(getKey('add_lesson'))}
                </Button>
              </div>
            )}
          </Form.List>

          <Flex justify="end" gap={8} className="mt-4">
            <Button
              onClick={handleCancelAddLesson}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium !border-graySilver"
            >
              {t(getKey('cancel_btn'))}
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createLessonsMutation?.isPending}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium"
            >
              {t(getKey('save_all_lessons'), { count: lessonCount })}
            </Button>
          </Flex>
        </Form>
      </Modal>

      {/* ── View questions modal ── */}
      <Modal
        centered
        open={questionModal?.open}
        onCancel={handleCancelQuestionModal}
        destroyOnClose
        maskClosable={false}
        width={896}
        footer={
          <Flex justify="end">
            <Button
              type="primary"
              onClick={handleCancelQuestionModal}
              className="!h-10 !px-4 !rounded-lg !text-base !font-medium font-semibold bg-[#2563EB] text-white border-0"
            >
              {t(getKey('close_btn'))}
            </Button>
          </Flex>
        }
      >
        <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-navyDark mb-1 text-left">
          {t(getKey('question_list_title'))}
        </h2>
        <p className="mb-4 text-sm leading-5 text-grayMedium text-left">
          Bản sao: {questionModal?.lesson?.name}
        </p>
        <Table
          columns={questionColumns}
          dataSource={questions}
          loading={questionsLoading}
          rowKey="id"
          pagination={{
            current: questionPage,
            pageSize: QUESTION_PAGE_SIZE,
            total: questionsTotal,
            showSizeChanger: false,
            onChange: setQuestionPage,
          }}
          scroll={{ y: 360 }}
          size="middle"
          className="custom-table"
        />
      </Modal>

      {/* ── Import questions modal ── */}
      <Modal
        centered
        open={importModal?.open}
        onCancel={handleCancelImport}
        destroyOnClose
        maskClosable={false}
        footer={null}
        width={512}
      >
        <h2 className="text-[18px] font-semibold leading-[18px] tracking-[-0.45px] text-navyDark mb-1 text-left">
          {t(getKey('import_questions_title'))}
        </h2>
        <p className="mb-6 text-sm leading-5 text-grayMedium text-left">
          Bản sao: {importModal?.lesson?.name}
        </p>

        <div className="flex flex-col gap-2 mb-6 text-left">
          <Text className="!text-sm !font-medium">
            {t(getKey('import_questions_file_label'))}
          </Text>
          <Upload
            accept=".csv,.xlsx,.xls"
            showUploadList={false}
            style={{ display: 'block' }}
            beforeUpload={(file) => {
              setImportFile(file);
              return false;
            }}
          >
            <Button
              block
              icon={<UploadOutlined />}
              className="!h-10 !rounded-lg !border-graySilver !font-medium"
            >
              {importFile ? importFile.name : t(getKey('choose_file'))}
            </Button>
          </Upload>
          <Text className="!text-xs !text-grayMedium">
            {t(getKey('import_questions_desc'))}
          </Text>
        </div>

        <Flex justify="end" gap={8}>
          <Button
            onClick={handleCancelImport}
            className="!h-10 !px-4 !rounded-lg !text-base !font-medium !border-graySilver"
          >
            {t(getKey('cancel_btn'))}
          </Button>
          <Button
            type="primary"
            disabled={!importFile}
            loading={importQuestionsMutation?.isPending}
            onClick={handleSubmitImport}
            className="!h-10 !px-4 !rounded-lg !text-base !font-medium"
          >
            {t(getKey('import_questions'))}
          </Button>
        </Flex>
      </Modal>
    </Flex>
  );
};

export default CoursesPage;
