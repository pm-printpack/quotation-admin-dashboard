"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import { Customer, deleteCustomer, fetchCustomers } from "@/lib/features/customers.slice";
import { CustomerLevel } from "@/lib/features/customerlevels.slice";

export default function Admins() {
  const dispatch = useAppDispatch();
  const customers: Customer[] = useAppSelector((state: RootState) => state.customers.list);
  const loading: boolean = useAppSelector((state: RootState) => state.customers.loading);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteCustomer(id)).unwrap();
      await dispatch(fetchCustomers()).unwrap();
    };
  }, []);

  const columns: ColumnsType<Customer> = useMemo(() => [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "level",
      dataIndex: "level",
      key: "level",
      render: (level: CustomerLevel) => <Text>{level.level}</Text>
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "Name of organization",
      dataIndex: "orgName",
      key: "orgName",
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "phone",
      dataIndex: "phone",
      key: "phone",
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "Action",
      key: "id",
      render: (_, record: Customer) => (
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
              title: `删除客户（${record.name}）`
            }}
            popconfirmProps={{
              title: `删除（${record.name}）`,
              description: `你确定想删除客户（${record.name}）吗？`,
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
    dispatch(fetchCustomers()).unwrap();
  }, []);

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Flex vertical={false} justify="flex-end">
        <Button type="primary" icon={<UserAddOutlined />}>添加新客户</Button>
      </Flex>
      <Table<Customer> columns={columns} dataSource={customers} loading={loading} pagination={false} />
    </Space>
  );
}