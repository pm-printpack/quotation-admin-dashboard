"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, SelectProps, Space, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import { addRecord, createCustomer, Customer, deleteAddingRecord, deleteCustomer, fetchCustomers, NewCustomer, updateCustomer, UpdatedCustomer } from "@/lib/features/customers.slice";
import { CustomerTier, fetchCustomerTiers } from "@/lib/features/customer-tiers.slice";
import EditableTable from "@/components/table/EditableTable";
import { EditableColumnsType } from "@/components/table/EditableCell";
import { useTranslations } from "next-intl";

export default function CustomerListPage() {
  const t = useTranslations("customers");
  const dispatch = useAppDispatch();
  const customers: Customer[] = useAppSelector((state: RootState) => state.customers.list);
  const customerTiers: CustomerTier[] = useAppSelector((state: RootState) => state.customerTiers.list);
  const loading: boolean = useAppSelector((state: RootState) => state.customers.loading);
  const [editingId, setEditingId] = useState<number>(NaN);
  
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
    dispatch(fetchCustomers()).unwrap();
    dispatch(fetchCustomerTiers()).unwrap();
  }, []);

  const columns: EditableColumnsType<Customer> = useMemo(() => [
    {
      title: t("list.columns.username"),
      dataIndex: "username",
      key: "username",
      width: "23%",
      type: "credential",
      editable: true,
      rules: [
        {
          required: true,
          message: t("list.rules.username")
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: t("list.columns.name"),
      dataIndex: "name",
      key: "name",
      width: "8%",
      editable: true,
      rules: [
        {
          required: true,
          message: t("list.rules.name"),
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: t("list.columns.orgName"),
      dataIndex: "orgName",
      key: "orgName",
      width: "13%",
      editable: true,
      rules: [
        {
          required: true,
          message: t("list.rules.orgName"),
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: t("list.columns.email"),
      dataIndex: "email",
      key: "email",
      width: "23%",
      editable: true,
      rules: [
        {
          required: true,
          message: t("list.rules.email")
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: t("list.columns.phone"),
      dataIndex: "phone",
      key: "phone",
      width: "13%",
      editable: true,
      rules: [
        {
          required: true,
          message: t("list.rules.phone")
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: t("list.columns.tier"),
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
          message: t("list.rules.tier")
        }
      ],
      render: (tier?: CustomerTier) => <Text>{tier?.name}</Text>
    },
    {
      title: t("list.columns.operation"),
      width: "11%",
      type: "operation",
      render: (_, record: Customer) => (
        <Space size="middle">
          {
            !!editingId
            ?
            <Button type="text" shape="circle" size="middle" disabled={true} icon={<EditOutlined />} onClick={onEdit(record.id)}></Button>
            :
            <Tooltip title={t("list.modificationTooltip", {name: record.name})}>
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
                title: t("list.removeTooltip", {name: record.name})
              }
            }
            popconfirmProps={{
              title: t("list.removeConfirming.title", {name: record.name}),
              description: t("list.removeConfirming.description", {name: record.name}),
              onConfirm: onDelete(record.id),
              okText: t("list.removeConfirming.ok"),
              cancelText: t("list.removeConfirming.cancel"),
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
        <Button type="primary" icon={<UserAddOutlined />} onClick={onAdd} disabled={!!editingId}>{t("list.new")}</Button>
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