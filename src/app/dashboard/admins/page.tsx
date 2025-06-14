"use client";
import { addRecord, Admin, createAdmin, deleteAddingRecord, deleteAdmin, fetchAdmins, NewAdmin, updateAdmin } from "@/lib/features/admins.slice";
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
  }, [dispatch, setEditingId]);

  const onNewSubmit = useCallback(async(record: NewAdmin) => {
    await dispatch(createAdmin(record)).unwrap();
    setEditingId(NaN);
  }, [dispatch, setEditingId]);

  const onNewCancel = useCallback(() => {
    dispatch(deleteAddingRecord());
    setEditingId(NaN);
  }, [dispatch, setEditingId]);

  const onEdit = useCallback((id: number) => {
    return () => {
      setEditingId(id);
    }
  }, [setEditingId]);

  const onEditSubmit = useCallback(async (record: Admin) => {
    await dispatch(updateAdmin(record)).unwrap();
    setEditingId(NaN);
  }, [dispatch, setEditingId]);

  const onEditCancel = useCallback(() => {
    setEditingId(NaN);
  }, [dispatch, setEditingId]);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteAdmin(id)).unwrap();
      await dispatch(fetchAdmins()).unwrap();
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchAdmins()).unwrap();
  }, []);

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
          {
            !!editingId
            ?
            <Button type="text" shape="circle" size="middle" disabled={true} icon={<EditOutlined />} onClick={onEdit(record.id)}></Button>
            :
            <Tooltip title={`修改管理员（${record.name}）的信息`}>
              <Button type="text" shape="circle" size="middle" icon={<EditOutlined />} onClick={onEdit(record.id)}></Button>
            </Tooltip>
          }
          <DoubleCheckedButton
            buttonProps={{
              type: "text",
              shape: "circle",
              icon: <DeleteOutlined />,
              size: "middle",
              danger: true,
              disabled: !!editingId
            }}
            tooltipProps={
              !!editingId
              ?
              undefined
              :
              {
                title: `删除管理员（${record.name}）`
              }
            }
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

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Flex vertical={false} justify="flex-end">
        <Button type="primary" icon={<UserAddOutlined />} onClick={onAdd}>添加新管理员</Button>
      </Flex>
      <EditableTable<Admin, NewAdmin, Admin>
        editingId={editingId}
        onNewSubmit={onNewSubmit}
        onNewCancel={onNewCancel}
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