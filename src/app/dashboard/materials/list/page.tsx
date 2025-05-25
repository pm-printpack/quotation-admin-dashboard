"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import { addRecord, Material, deleteAddingRecord, deleteMaterial, fetchMaterials, updateOrCreatMaterial } from "@/lib/features/materials.slice";
import EditableTable from "@/components/table/EditableTable";
import { EditableColumnsType } from "@/components/table/EditableCell";

export default function MaterialListPage() {
  const dispatch = useAppDispatch();
  const materials: Material[] = useAppSelector((state: RootState) => state.materials.list);
  const loading: boolean = useAppSelector((state: RootState) => state.materials.loading);
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

  const onEditSubmit = useCallback(async (record: Material | undefined | null, preRecord: Material) => {
    if (record) {
      await dispatch(updateOrCreatMaterial({id: preRecord.id, material: record})).unwrap();
      setEditingId(NaN);
    }
  }, [dispatch, updateOrCreatMaterial, setEditingId]);

  const onEditCancel = useCallback(() => {
    dispatch(deleteAddingRecord());
    setEditingId(NaN);
  }, [dispatch, deleteAddingRecord, setEditingId]);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteMaterial(id)).unwrap();
      await dispatch(fetchMaterials()).unwrap();
    };
  }, [dispatch, deleteMaterial, fetchMaterials]);

  useEffect(() => {
    dispatch(fetchMaterials()).unwrap();
  }, []);

  const columns: EditableColumnsType<Material> = useMemo(() => [
    {
      title: "材料名",
      dataIndex: "chineseName",
      key: "chineseName",
      width: "11%",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入材料名!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: "英文名",
      dataIndex: "name",
      key: "name",
      width: "9%",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入材料英文名!"
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: <span>比重<br/>（g/cm³）</span>,
      dataIndex: "density",
      key: "density",
      width: "11%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入比重（g/cm³）!"
        }
      ],
      render: (text: number) => <Text>{text}</Text>
    },
    {
      title: <span>厚度<br/>（μm）</span>,
      dataIndex: "thickness",
      key: "thickness",
      width: "9%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入厚度（μm）!"
        }
      ],
      render: (text: number) => <Text>{text}</Text>
    },
    {
      title: <span>面积重<br/>（g/cm²）</span>,
      key: "weightPerSurfaceArea",
      width: "11%",
      align: "right",
      render: (_, record: Material) => <Text>{record.thickness / 10000}</Text>
    },
    {
      title: <span>重量单价<br/>（元/kg）</span>,
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: "10%",
      align: "right",
      editable: true,
      rules: [
        {
          required: true,
          message: "请输入重量单价（元/kg）!"
        }
      ],
      render: (text: number) => <Text>{text}</Text>
    },
    {
      title: <span>面积单价<br/>（元/m²）</span>,
      key: "unitPricePerSurfaceArea",
      width: "11%",
      align: "right",
      render: (_, record: Material) => <Text>{(record.thickness / 10000) * record.unitPrice * 10}</Text>
    },
    {
      title: "备注",
      dataIndex: "remarks",
      key: "remarks",
      width: "15%",
      type: "textarea",
      editable: true,
      render: (remarks?: string) => <Text>{remarks}</Text>
    },
    {
      title: "操作",
      width: "13%",
      type: "operation",
      render: (_, record: Material) => (
        <Space size="middle">
          <Tooltip title={`修改材料（${record.chineseName}）的信息`}>
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
              title: `删除材料（${record.chineseName}）`
            }}
            popconfirmProps={{
              title: `删除（${record.chineseName}）`,
              description: `你确定想删除材料（${record.chineseName}）吗？`,
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
        <Button type="primary" icon={<UserAddOutlined />} onClick={onAdd}>添加新材料</Button>
      </Flex>
      <EditableTable<Material>
        editingId={editingId}
        onEditSubmit={onEditSubmit}
        onEditCancel={onEditCancel}
        columns={columns}
        dataSource={materials}
        loading={loading}
      />
    </Space>
  );
}