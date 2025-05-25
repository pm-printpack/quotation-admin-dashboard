"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import { Customer, deleteCustomer, fetchCustomers, updateCustomer } from "@/lib/features/customers.slice";
import { CustomerLevel } from "@/lib/features/customerlevels.slice";
import EditableTable from "@/components/table/EditableTable";
import { EditableColumnsType } from "@/components/table/EditableCell";

export default function Admins() {
  const dispatch = useAppDispatch();
  const customers: Customer[] = useAppSelector((state: RootState) => state.customers.list);
  const loading: boolean = useAppSelector((state: RootState) => state.customers.loading);
  const [editingId, setEditingId] = useState<number>(NaN);
  
  const onEdit = useCallback((id: number) => {
    return () => {
      setEditingId(id);
    }
  }, [setEditingId]);

  const onEditSubmit = useCallback(async (record: Customer | undefined | null, preRecord: Customer) => {
    if (record) {
      await dispatch(updateCustomer({id: preRecord.id, customer: record})).unwrap();
      setEditingId(NaN);
    }
  }, [dispatch, updateCustomer, setEditingId]);

  const onEditCancel = useCallback(() => {
    setEditingId(NaN);
  }, [setEditingId]);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteCustomer(id)).unwrap();
      await dispatch(fetchCustomers()).unwrap();
    };
  }, [dispatch, deleteCustomer, fetchCustomers]);

  const columns: EditableColumnsType<Customer> = useMemo(() => [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      editable: true,
      width: "21.5%",
      rules: [
        {
          required: true,
          message: "Please Input username!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "level",
      dataIndex: "level",
      key: "level",
      editable: true,
      width: "6%",
      rules: [
        {
          required: true,
          message: "Please Input username!"
        }
      ],
      render: (level: CustomerLevel) => <Text>{level.level}</Text>
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      editable: true,
      width: "9%",
      rules: [
        {
          required: true,
          message: "Please Input username!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "Name of organization",
      dataIndex: "orgName",
      key: "orgName",
      editable: true,
      width: "17%",
      rules: [
        {
          required: true,
          message: "Please Input username!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "email",
      dataIndex: "email",
      key: "email",
      editable: true,
      width: "21.5%",
      rules: [
        {
          required: true,
          message: "Please Input username!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "phone",
      dataIndex: "phone",
      key: "phone",
      editable: true,
      width: "14%",
      rules: [
        {
          required: true,
          message: "Please Input username!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "Action",
      width: "11%",
      type: "operation",
      render: (_, record: Customer) => (
        <Space size="middle">
          <Tooltip title={`修改客户（${record.name}）的信息`}>
            <Button type="text" shape="circle" size="middle" disabled={!!editingId} icon={<EditOutlined />} onClick={onEdit(record.id)}></Button>
          </Tooltip>
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
      <EditableTable<Customer>
        editingId={editingId}
        onEditSubmit={onEditSubmit}
        onEditCancel={onEditCancel}
        columns={columns}
        dataSource={customers}
        loading={loading}
        pagination={false}
      />
    </Space>
  );
}