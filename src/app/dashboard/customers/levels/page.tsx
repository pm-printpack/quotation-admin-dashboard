"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import { CustomerLevel, deleteCustomerLevel, fetchCustomerLevels, updateCustomerLevel } from "@/lib/features/customerlevels.slice";
import EditableTable from "@/components/table/EditableTable";
import { EditableColumnsType } from "@/components/table/EditableCell";

export default function Admins() {
  const dispatch = useAppDispatch();
  const customerLevels: CustomerLevel[] = useAppSelector((state: RootState) => state.customerLevels.list);
  const loading: boolean = useAppSelector((state: RootState) => state.customerLevels.loading);
  const [editingId, setEditingId] = useState<number>(NaN);
  
  const onEdit = useCallback((id: number) => {
    return () => {
      setEditingId(id);
    }
  }, [setEditingId]);

  const onEditSubmit = useCallback(async (record: CustomerLevel | undefined | null, preRecord: CustomerLevel) => {
    if (record) {
      await dispatch(updateCustomerLevel({id: preRecord.id, customerLevel: record})).unwrap();
      setEditingId(NaN);
    }
  }, [dispatch, updateCustomerLevel, setEditingId]);

  const onEditCancel = useCallback(() => {
    setEditingId(NaN);
  }, [setEditingId]);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteCustomerLevel(id)).unwrap();
      await dispatch(fetchCustomerLevels()).unwrap();
    };
  }, [dispatch, deleteCustomerLevel, fetchCustomerLevels]);

  useEffect(() => {
    dispatch(fetchCustomerLevels()).unwrap();
  }, []);

  const columns: EditableColumnsType<CustomerLevel> = useMemo(() => [
    {
      title: "客户等级",
      dataIndex: "level",
      key: "level",
      width: "8%",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入客户等级!"
        }
      ],
      render: (level: string) => <Text>{level}</Text>
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
      render: (_, record: CustomerLevel) => (
        <Space size="middle">
          <Tooltip title={`修改等级（${record.level}）的信息`}>
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
              title: `删除等级（${record.level}）`
            }}
            popconfirmProps={{
              title: `删除（${record.level}）`,
              description: `你确定想删除等级（${record.level}）吗？`,
              onConfirm: onDelete(record.id),
              okText: "确定",
              cancelText: "再想想"
            }}
          />
        </Space>
      ),
    }
  ], []);

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Flex vertical={false} justify="flex-end">
        <Button type="primary" icon={<UserAddOutlined />}>添加新等级</Button>
      </Flex>
      <EditableTable<CustomerLevel>
        editingId={editingId}
        onEditSubmit={onEditSubmit}
        onEditCancel={onEditCancel}
        columns={columns}
        dataSource={customerLevels}
        loading={loading}
        pagination={false}
      />
    </Space>
  );
}