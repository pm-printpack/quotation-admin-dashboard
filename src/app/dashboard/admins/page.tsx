"use client";
import { addRecord, Admin, deleteAddingRecord, deleteAdmin, fetchAdmins, updateOrCreatAdmin } from "@/lib/features/admins.slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import EditableTable from "@/components/table/EditableTable";
import { ColumnsType } from "antd/es/table";

export default function AdminsPage() {
  const dispatch = useAppDispatch();
  const admins: Admin[] = useAppSelector((state: RootState) => state.admins.list);
  const loading: boolean = useAppSelector((state: RootState) => state.admins.loading);
  const [editingId, setEditingId] = useState<number>(NaN);

  const onAdd = useCallback(() => {
    dispatch(addRecord());
    setEditingId(-1);
  }, [dispatch, addRecord, setEditingId]);

  const onEdit = useCallback((id: number) => {
    return () => {
      setEditingId(id);
    }
  }, [setEditingId]);

  const onEditSubmit = useCallback(async (record: Admin | undefined | null, preRecord: Admin) => {
    if (record) {
      await dispatch(updateOrCreatAdmin({id: preRecord.id, admin: record})).unwrap();
      setEditingId(NaN);
    }
  }, [dispatch, updateOrCreatAdmin, setEditingId]);

  const onEditCancel = useCallback(() => {
    dispatch(deleteAddingRecord());
    setEditingId(NaN);
  }, [dispatch, deleteAddingRecord, setEditingId]);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteAdmin(id)).unwrap();
      await dispatch(fetchAdmins()).unwrap();
    };
  }, [dispatch, deleteAdmin, fetchAdmins]);

  const columns: ColumnsType<Admin> = useMemo(() => [
    {
      title: "管理员账号",
      dataIndex: "username",
      key: "username",
      width: "50%",
      type: "credential",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入管理员账号!"
        }
      ],
      render: (username: string) => <Text>{username}</Text>
    },
    {
      title: "管理员姓名",
      dataIndex: "name",
      key: "name",
      editable: true,
      width: "25%",
      rules: [
        {
          required: true,
          message: "请输入管理员姓名!"
        }
      ],
      render: (name: string) => <Text>{name}</Text>
    },
    {
      title: "操作",
      width: "25%",
      type: "operation",
      render: (_, record: Admin) => (
        <Space size="middle">
          <Tooltip title={`修改管理员（${record.name}）的信息`}>
            <Button type="text" shape="circle" size="middle" disabled={!!editingId} icon={<EditOutlined />} onClick={onEdit(record.id)}></Button>
          </Tooltip>
          <DoubleCheckedButton
            buttonProps={{
              type: "text",
              shape: "circle",
              icon: <DeleteOutlined />,
              size: "middle",
              danger: true,
              disabled: !!editingId
            }}
            tooltipProps={{
              title: `删除管理员（${record.name}）`
            }}
            popconfirmProps={{
              title: `删除（${record.name}）`,
              description: `你确定想删除管理员（${record.name}）吗？`,
              onConfirm: onDelete(record.id),
              okText: "确定",
              cancelText: "再想想",
              disabled: !!editingId
            }}
          />
        </Space>
      )
    }
  ], [editingId]);

  useEffect(() => {
    dispatch(fetchAdmins()).unwrap();
  }, []);

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Flex vertical={false} justify="flex-end">
        <Button type="primary" icon={<UserAddOutlined />} onClick={onAdd}>添加新管理员</Button>
      </Flex>
      <EditableTable<Admin>
        editingId={editingId}
        onEditSubmit={onEditSubmit}
        onEditCancel={onEditCancel}
        columns={columns}
        dataSource={admins}
        loading={loading}
        pagination={false}
      />
    </Space>
  );
}