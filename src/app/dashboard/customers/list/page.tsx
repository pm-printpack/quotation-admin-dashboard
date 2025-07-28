"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, SelectProps, Space, Tooltip } from "antd";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import { addRecord, createCustomer, Customer, deleteAddingRecord, deleteCustomer, fetchCustomers, NewCustomer, updateCustomer, UpdatedCustomer } from "@/lib/features/customers.slice";
import { CustomerTier, fetchCustomerTiers } from "@/lib/features/customer-tiers.slice";
import EditableTable from "@/components/table/EditableTable";
import { EditableColumnsType } from "@/components/table/EditableCell";

export default function CustomerListPage() {
  const dispatch = useAppDispatch();
  const customers: Customer[] = useAppSelector((state: RootState) => state.customers.list);
  const customerTiers: CustomerTier[] = useAppSelector((state: RootState) => state.customerTiers.list);
  const loading: boolean = useAppSelector((state: RootState) => state.customers.loading);
  const [editingId, setEditingId] = useState<number>(NaN);
  const loadOnce: RefObject<boolean> = useRef<boolean>(false);
  
  const onAdd = useCallback(() => {
    dispatch(addRecord());
    setEditingId(-1);
  }, [dispatch, setEditingId]);

  const onNewSubmit = useCallback(async(record: NewCustomer) => {
    await dispatch(createCustomer(record)).unwrap();
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

  const onEditSubmit = useCallback(async (record: UpdatedCustomer, preRecord: Customer) => {
    await dispatch(updateCustomer({customer: record, preCustomer: preRecord})).unwrap();
    setEditingId(NaN);
  }, [dispatch, setEditingId]);

  const onEditCancel = useCallback(() => {
    setEditingId(NaN);
  }, [dispatch, setEditingId]);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteCustomer(id)).unwrap();
      await dispatch(fetchCustomers()).unwrap();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!loadOnce.current) {
      loadOnce.current = true;
      dispatch(fetchCustomers()).unwrap();
      dispatch(fetchCustomerTiers()).unwrap();
    }
    return () => {
      loadOnce.current = false;
    };
  }, []);

  const columns: EditableColumnsType<Customer> = useMemo(() => [
    {
      title: "客户账号",
      dataIndex: "username",
      key: "username",
      width: "23%",
      type: "credential",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入客户账号!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "客户名",
      dataIndex: "name",
      key: "name",
      width: "8%",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入客户名!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "客户公司名",
      dataIndex: "orgName",
      key: "orgName",
      width: "13%",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入客户公司名!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "客户邮箱",
      dataIndex: "email",
      key: "email",
      width: "23%",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入客户邮箱!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "手机号码",
      dataIndex: "phone",
      key: "phone",
      width: "13%",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入客户的手机号码!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "客户等级",
      dataIndex: "tier",
      key: "tier",
      width: "9%",
      type: {
        name: "options",
        props: {
          name: "tierId",
          fieldNames: {
            value: "id",
            label: "name"
          },
          options: customerTiers
        } as SelectProps
      },
      editable: true,
      rules: [
        {
          required: true,
          message: "请选择客户等级!"
        }
      ],
      render: (tier?: CustomerTier) => <Text>{tier?.name}</Text>
    },
    {
      title: "操作",
      width: "11%",
      type: "operation",
      render: (_, record: Customer) => (
        <Space size="middle">
          {
            !!editingId
            ?
            <Button type="text" shape="circle" size="middle" disabled={true} icon={<EditOutlined />} onClick={onEdit(record.id)}></Button>
            :
            <Tooltip title={`修改客户（${record.name}）的信息`}>
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
                title: `删除客户（${record.name}）`
              }
            }
            popconfirmProps={{
              title: `删除（${record.name}）`,
              description: `你确定想删除客户（${record.name}）吗？`,
              onConfirm: onDelete(record.id),
              okText: "确定",
              cancelText: "再想想",
              disabled: !!editingId
            }}
          />
        </Space>
      ),
    }
  ], [editingId, customerTiers.map(({id}) => id).join(","), onEdit, onDelete]);

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Flex vertical={false} justify="flex-end">
        <Button type="primary" icon={<UserAddOutlined />} onClick={onAdd}>添加新客户</Button>
      </Flex>
      <EditableTable<Customer, NewCustomer, UpdatedCustomer>
        editingId={editingId}
        onNewSubmit={onNewSubmit}
        onNewCancel={onNewCancel}
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