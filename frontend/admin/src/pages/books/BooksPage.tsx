import { TableColumnsType, Tag, Flex, Image } from 'antd';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getKey } from '@shared/types/I18nKeyType';
import FilterTable from '@shared/components/table/FilterTable';
import { courseHooks } from '../../hooks/useCourses';
import { IListCourse, IDetailCourse, ICreateCourse, IUpdateCourse } from '@shared/types/CourseType';
import { IMAGE_FALLBACK } from '@shared/constants/commonConst';
import ModalCreateUpdateBook from './components/ModalCreateUpdateBook';

const useFetchBookDetail = (id: string, enabled: boolean = true) => {
  return courseHooks.useFetchDetailCourse(id, !!id && enabled);
};

const BooksPage = () => {
  const { t } = useTranslation();

  const createMutation = courseHooks.useCreateCourse();
  const updateMutation = courseHooks.useUpdateCourse();
  const deleteMutation = courseHooks.useDeleteCourse();

  const columns: TableColumnsType<IListCourse> = useMemo(
    () => [
      {
        title: 'Mã',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        fixed: 'left',
        render: (id: string) => (
          <span className="font-mono text-xs text-gray-400 font-semibold">
            {id?.slice(0, 8).toUpperCase() || '—'}
          </span>
        ),
      },
      {
        title: 'Tên sách',
        key: 'name',
        className: 'text-left',
        fixed: 'left',
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
    ],
    [t]
  );

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
      <FilterTable<
        IListCourse,
        IDetailCourse,
        ICreateCourse,
        IUpdateCourse
      >
        pageTitle={t(getKey('course_management'))}
        pageSubtitle={t(getKey('course_management_desc'))}
        title={t(getKey('course_management'))}
        createButtonLabel={t(getKey('add_course'))}
        columns={columns}
        useQueryHook={courseHooks.useFetchListCourses}
        actions={{
          isDetail: false,
          isEdit: true,
          isDelete: true,
        }}
        deleteConfirmTitle={t(getKey('delete_title'))}
        deleteConfirmContent={t(getKey('delete_content'))}
        deleteInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: null,
            modalProps: {},
            modalFunc: deleteMutation,
          },
        }}
        createInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateUpdateBook />,
            modalProps: {},
            modalFunc: createMutation,
          },
        }}
        updateInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: <ModalCreateUpdateBook isEdit />,
            modalProps: {},
            modalFunc: updateMutation,
          },
        }}
        detailInfo={{
          type: 'modal',
          modalInfo: {
            modalContent: null,
            modalProps: { footer: null },
            modalFunc: useFetchBookDetail,
          },
        }}
      />
    </div>
  );
};

export default BooksPage;
