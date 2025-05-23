"use client";
import { Admin, deleteAdmin, fetchAdmins } from "@/lib/features/admins.slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";

export default function Admins() {
  const dispatch = useAppDispatch();
  const admins: Admin[] = useAppSelector((state: RootState) => state.admins.list);
  const loading: boolean = useAppSelector((state: RootState) => state.admins.loading);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteAdmin(id)).unwrap();
      await dispatch(fetchAdmins()).unwrap();
    };
  }, []);

  const columns: ColumnsType<Admin> = useMemo(() => [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "Action",
      key: "id",
      render: (_, record: Admin) => (
        <Space size="middle">
          <DoubleCheckedButton
            buttonProps={{
              type: "text",
              shape: "circle",
              icon: <DeleteOutlined />,
              size: "middle",
              danger: true
            }}
            tooltipProps={{
              title: `删除管理员（${record.name}）`
            }}
            popconfirmProps={{
              title: `删除（${record.name}）`,
              description: `你确定想删除管理员（${record.name}）吗？`,
              onConfirm: onDelete(record.id),
              okText: "确定",
              cancelText: "再想想"
            }}
          />
        </Space>
      ),
    }
  ], []);

  useEffect(() => {
    dispatch(fetchAdmins()).unwrap();
  }, []);

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Flex vertical={false} justify="flex-end">
        <Button type="primary" icon={<UserAddOutlined />}>添加管理员</Button>
      </Flex>
      <Table<Admin> columns={columns} dataSource={admins} loading={loading} pagination={false} />
    </Space>
  );
}