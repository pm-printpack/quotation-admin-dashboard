"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import { addRecord, createCustomerTier, CustomerTier, deleteAddingRecord, deleteCustomerTier, fetchCustomerTiers, NewCustomerTier, updateCustomerTier } from "@/lib/features/customer-tiers.slice";
import EditableTable from "@/components/table/EditableTable";
import { EditableColumnsType } from "@/components/table/EditableCell";
import { useTranslations } from "next-intl";

export default function CustomerTiersPage() {
  const t = useTranslations("customers");
  const dispatch = useAppDispatch();
  const customerTiers: CustomerTier[] = useAppSelector((state: RootState) => state.customerTiers.list);
  const loading: boolean = useAppSelector((state: RootState) => state.customerTiers.loading);
  const [editingId, setEditingId] = useState<number>(NaN);

  const onAdd = useCallback(() => {
    dispatch(addRecord());
    setEditingId(-1);
  }, [dispatch, setEditingId]);

  const onNewSubmit = useCallback(async(record: NewCustomerTier) => {
    await dispatch(createCustomerTier(record)).unwrap();
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
  }, [dispatch, setEditingId]);

  const onEditSubmit = useCallback(async (record: Required<Partial<CustomerTier> & {id: number}>, preRecord: CustomerTier) => {
    await dispatch(updateCustomerTier(record)).unwrap();
    setEditingId(NaN);
  }, [dispatch, setEditingId]);

  const onEditCancel = useCallback(() => {
    setEditingId(NaN);
  }, [dispatch, setEditingId]);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteCustomerTier(id)).unwrap();
      await dispatch(fetchCustomerTiers()).unwrap();
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCustomerTiers()).unwrap();
  }, []);

  const columns: EditableColumnsType<CustomerTier> = useMemo(() => [
    {
      title: t("tiers.columns.name"),
      dataIndex: "name",
      key: "name",
      width: "8%",
      editable: true,
      rules: [
        {
          required: true,
          message: t("tiers.rules.name")
        }
      ],
      render: (name: string) => <Text>{name}</Text>
    },
    {
      title: t("tiers.columns.digitalPrintingProfitMargin"),
      dataIndex: "digitalPrintingProfitMargin",
      key: "digitalPrintingProfitMargin",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: t("tiers.rules.digitalPrintingProfitMargin")
        }
      ],
      render: (digitalPrintingProfitMargin: number) => <Text>{digitalPrintingProfitMargin}</Text>
    },
    {
      title: t("tiers.columns.offsetPrintingProfitMargin"),
      dataIndex: "offsetPrintingProfitMargin",
      key: "offsetPrintingProfitMargin",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: t("tiers.rules.offsetPrintingProfitMargin")
        }
      ],
      render: (offsetPrintingProfitMargin: number) => <Text>{offsetPrintingProfitMargin}</Text>
    },
    {
      title: t("tiers.columns.gravurePrintingProfitMargin"),
      dataIndex: "gravurePrintingProfitMargin",
      key: "gravurePrintingProfitMargin",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: t("tiers.rules.gravurePrintingProfitMargin")
        }
      ],
      render: (gravurePrintingProfitMargin: number) => <Text>{gravurePrintingProfitMargin}</Text>
    },
    {
      title: t("tiers.columns.minimumDiscountAmount1"),
      dataIndex: "minimumDiscountAmount1",
      key: "minimumDiscountAmount1",
      width: "14%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: t("tiers.rules.minimumDiscountAmount1")
        }
      ],
      render: (minimumDiscountAmount1: number) => <Text>{minimumDiscountAmount1}</Text>
    },
    {
      title: t("tiers.columns.preferentialProfitMargin1"),
      dataIndex: "preferentialProfitMargin1",
      key: "preferentialProfitMargin1",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: t("tiers.rules.preferentialProfitMargin1")
        }
      ],
      render: (preferentialProfitMargin1: number) => <Text>{preferentialProfitMargin1}</Text>
    },
    {
      title: t("tiers.columns.minimumDiscountAmount2"),
      dataIndex: "minimumDiscountAmount2",
      key: "minimumDiscountAmount2",
      width: "14%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: t("tiers.rules.minimumDiscountAmount2")
        }
      ],
      render: (minimumDiscountAmount2: number) => <Text>{minimumDiscountAmount2}</Text>
    },
    {
      title: t("tiers.columns.preferentialProfitMargin2"),
      dataIndex: "preferentialProfitMargin2",
      key: "preferentialProfitMargin2",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: t("tiers.rules.preferentialProfitMargin2"),
        }
      ],
      render: (preferentialProfitMargin2: number) => <Text>{preferentialProfitMargin2}</Text>
    },
    {
      title: t("tiers.columns.operation"),
      width: "9%",
      type: "operation",
      render: (_, record: CustomerTier) => (
        <Space size="middle">
          {
            !!editingId
            ?
            <Button type="text" shape="circle" size="middle" disabled={true} icon={<EditOutlined />} onClick={onEdit(record.id)}></Button>
            :
            <Tooltip title={t("tiers.modificationTooltip", {name: record.name})}>
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
                title: t("tiers.removeTooltip", {name: record.name})
              }
            }
            popconfirmProps={{
              title: t("tiers.removeConfirming.title", {name: record.name}),
              description: t("tiers.removeConfirming.description", {name: record.name}),
              onConfirm: onDelete(record.id),
              okText: t("tiers.removeConfirming.ok"),
              cancelText: t("tiers.removeConfirming.cancel"),
              disabled: !!editingId
            }}
          />
        </Space>
      ),
    }
  ], [editingId]);

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Flex vertical={false} justify="flex-end">
        <Button type="primary" icon={<UserAddOutlined />} onClick={onAdd}>{t("tiers.new")}</Button>
      </Flex>
      <EditableTable<CustomerTier, NewCustomerTier, Required<Partial<CustomerTier> & {id: number}>>
        editingId={editingId}
        onNewSubmit={onNewSubmit}
        onNewCancel={onNewCancel}
        onEditSubmit={onEditSubmit}
        onEditCancel={onEditCancel}
        columns={columns}
        dataSource={customerTiers}
        loading={loading}
        pagination={false}
      />
    </Space>
  );
}