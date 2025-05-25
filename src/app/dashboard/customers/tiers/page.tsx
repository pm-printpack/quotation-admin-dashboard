"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import { addRecord, CustomerTier, deleteAddingRecord, deleteCustomerTier, fetchCustomerTiers, NewCustomerTier, updateOrCreatCustomerTier } from "@/lib/features/customer-tiers.slice";
import EditableTable from "@/components/table/EditableTable";
import { EditableColumnsType } from "@/components/table/EditableCell";

export default function CustomerTiersPage() {
  const dispatch = useAppDispatch();
  const customerTiers: CustomerTier[] = useAppSelector((state: RootState) => state.customerTiers.list);
  const loading: boolean = useAppSelector((state: RootState) => state.customerTiers.loading);
  const [editingId, setEditingId] = useState<number>(NaN);

  const onAdd = useCallback(() => {
    dispatch(addRecord());
    setEditingId(-1);
  }, [dispatch, addRecord, setEditingId]);
  
  const onEdit = useCallback((id: number) => {
    return () => {
      setEditingId(id);
    }
  }, [dispatch, setEditingId]);

  const onEditSubmit = useCallback(async (record: CustomerTier | undefined | null, preRecord: CustomerTier) => {
    if (record) {
      await dispatch(updateOrCreatCustomerTier({id: preRecord.id, customerTier: record})).unwrap();
      setEditingId(NaN);
    }
  }, [dispatch, updateOrCreatCustomerTier, setEditingId]);

  const onEditCancel = useCallback(() => {
    dispatch(deleteAddingRecord());
    setEditingId(NaN);
  }, [dispatch, deleteAddingRecord, setEditingId]);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteCustomerTier(id)).unwrap();
      await dispatch(fetchCustomerTiers()).unwrap();
    };
  }, [dispatch, deleteCustomerTier, fetchCustomerTiers]);

  useEffect(() => {
    dispatch(fetchCustomerTiers()).unwrap();
  }, []);

  const columns: EditableColumnsType<CustomerTier> = useMemo(() => [
    {
      title: "客户等级",
      dataIndex: "name",
      key: "name",
      width: "8%",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入客户等级!"
        }
      ],
      render: (name: string) => <Text>{name}</Text>
    },
    {
      title: "数码利润率/%",
      dataIndex: "digitalPrintingProfitMargin",
      key: "digitalPrintingProfitMargin",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入数码利润率!"
        }
      ],
      render: (digitalPrintingProfitMargin: number) => <Text>{digitalPrintingProfitMargin}</Text>
    },
    {
      title: "胶印利润率/%",
      dataIndex: "offsetPrintingProfitMargin",
      key: "offsetPrintingProfitMargin",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入胶印利润率!"
        }
      ],
      render: (offsetPrintingProfitMargin: number) => <Text>{offsetPrintingProfitMargin}</Text>
    },
    {
      title: "凹印利润率/%",
      dataIndex: "gravurePrintingProfitMargin",
      key: "gravurePrintingProfitMargin",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入凹印利润率/%!"
        }
      ],
      render: (gravurePrintingProfitMargin: number) => <Text>{gravurePrintingProfitMargin}</Text>
    },
    {
      title: "优惠金额起点1/美元",
      dataIndex: "minimumDiscountAmount1",
      key: "minimumDiscountAmount1",
      width: "14%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入优惠金额起点1!"
        }
      ],
      render: (minimumDiscountAmount1: number) => <Text>{minimumDiscountAmount1}</Text>
    },
    {
      title: "优惠利润率1/%",
      dataIndex: "preferentialProfitMargin1",
      key: "preferentialProfitMargin1",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入优惠利润率1!"
        }
      ],
      render: (preferentialProfitMargin1: number) => <Text>{preferentialProfitMargin1}</Text>
    },
    {
      title: "优惠金额起点2/美元",
      dataIndex: "minimumDiscountAmount2",
      key: "minimumDiscountAmount2",
      width: "14%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入优惠金额起点2!"
        }
      ],
      render: (minimumDiscountAmount2: number) => <Text>{minimumDiscountAmount2}</Text>
    },
    {
      title: "优惠利润率2/%",
      dataIndex: "preferentialProfitMargin2",
      key: "preferentialProfitMargin2",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入优惠利润率1!"
        }
      ],
      render: (preferentialProfitMargin2: number) => <Text>{preferentialProfitMargin2}</Text>
    },
    {
      title: "操作",
      width: "9%",
      type: "operation",
      render: (_, record: CustomerTier) => (
        <Space size="middle">
          <Tooltip title={`修改等级（${record.name}）的信息`}>
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
              title: `删除等级（${record.name}）`
            }}
            popconfirmProps={{
              title: `删除（${record.name}）`,
              description: `你确定想删除等级（${record.name}）吗？`,
              onConfirm: onDelete(record.id),
              okText: "确定",
              cancelText: "再想想",
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
        <Button type="primary" icon={<UserAddOutlined />} onClick={onAdd}>添加新等级</Button>
      </Flex>
      <EditableTable<CustomerTier>
        editingId={editingId}
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