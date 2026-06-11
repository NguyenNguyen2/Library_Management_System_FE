import { TableColumnsType } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FilterTable from '@shared/components/table/FilterTable';
import { userHooks } from '../../hooks/useUsers';
import {
  ICreateUser,
  IDetailUser,
  IListUser,
  IUpdateUser,
} from '@shared/types/UserType';
import { getKey } from '@shared/types/I18nKeyType';
import { DATE_DISPLAY_FORMAT } from '@shared/constants/commonConst';
import ModalCreateEditUser from './components/ModalCreateEditUser';

// Wrapper: ignore enabled param from FilterTable so detail fetches for both detail & update modal types
const useFetchUserDetail = (id: string, _enabled: boolean = true) => {
  return userHooks.useFetchDetailUser(id, !!id);
};

const UsersPage = () => {
  const { t } = useTranslation();

  const createMutation = userHooks.useCreateUser();
  const updateMutation = userHooks.useUpdateUser();
  const deleteMutation = userHooks.useDeleteUser();

  const columns: TableColumnsType<IListUser> = useMemo(
    () => [
      {
        title: t(getKey('full_name')),
        dataIndex: 'name',
        key: 'name',
        fixed: 'left',
        ellipsis: true,
      },
      {
        title: t(getKey('email')),
        dataIndex: 'email',
        key: 'email',
        ellipsis: true,
      },
      {
        title: t(getKey('created_date')),
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 120,
        render: (date: string) =>
          date ? dayjs(date).format(DATE_DISPLAY_FORMAT) : '',
      },
    ],
    [t]
  );

  return (
    <FilterTable<IListUser, IDetailUser, ICreateUser, IUpdateUser>
      pageTitle={t(getKey('user_management'))}
      pageSubtitle={t(getKey('user_management_desc'))}
      title={t(getKey('user_list'))}
      createButtonLabel={t(getKey('add_user'))}
      columns={columns}
      useQueryHook={userHooks.useFetchListUsers}
      actions={{
        isDetail: false,
        isEdit: true,
        isDelete: true,
      }}
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
          modalContent: <ModalCreateEditUser />,
          modalProps: { title: null },
          modalFunc: createMutation,
        },
      }}
      updateInfo={{
        type: 'modal',
        modalInfo: {
          modalContent: <ModalCreateEditUser />,
          modalProps: { title: null },
          modalFunc: updateMutation,
        },
      }}
      detailInfo={{
        type: 'modal',
        modalInfo: {
          modalContent: <ModalCreateEditUser />,
          modalProps: {},
          modalFunc: useFetchUserDetail,
        },
      }}
    />
  );
};

export default UsersPage;
