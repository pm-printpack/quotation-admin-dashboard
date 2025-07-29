"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Tooltip } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import Text from "antd/es/typography/Text";
import { DeleteOutlined, EditOutlined, UserAddOutlined } from "@ant-design/icons";
import DoubleCheckedButton from "@/components/DoubleCheckedButton";
import { addRecord, Material, deleteAddingRecord, deleteMaterial, fetchMaterials, createMaterial, NewMaterial, updateMaterial, UpdatedMaterial } from "@/lib/features/materials.slice";
import EditableTable from "@/components/table/EditableTable";
import { EditableColumnsType } from "@/components/table/EditableCell";
import { useTranslations } from "next-intl";
import { getBrowserLocale } from "@/lib/i18n";

export default function MaterialListPage() {
  const dispatch = useAppDispatch();
  const t = useTranslations("materials");
  const materials: Material[] = useAppSelector((state: RootState) => state.materials.list);
  const loading: boolean = useAppSelector((state: RootState) => state.materials.loading);
  const [editingId, setEditingId] = useState<number>(NaN);
  const isZhCN: boolean = useMemo(() => getBrowserLocale() === "zh-CN", []);
  
  const onAdd = useCallback(() => {
    dispatch(addRecord());
    setEditingId(-1);
  }, [dispatch, setEditingId]);

  const onNewSubmit = useCallback(async(record: NewMaterial) => {
    await dispatch(createMaterial(record as NewMaterial)).unwrap();
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

  const onEditSubmit = useCallback(async(record: UpdatedMaterial, preRecord: Material) => {
    await dispatch(updateMaterial({material: record, preMaterial: preRecord})).unwrap();
    setEditingId(NaN);
  }, [dispatch, setEditingId]);
  
  const onEditCancel = useCallback(() => {
    setEditingId(NaN);
  }, [dispatch, setEditingId]);

  const onDelete = useCallback((id: number) => {
    return async () => {
      await dispatch(deleteMaterial(id)).unwrap();
      await dispatch(fetchMaterials()).unwrap();
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchMaterials()).unwrap();
  }, [dispatch]);

  const columns: EditableColumnsType<Material> = useMemo(() => [
    {
      title: t("list.columns.chineseName"),
      dataIndex: "chineseName",
      key: "chineseName",
      width: "11%",
      editable: true,
      rules: [
        {
          required: true,
          message: t("list.rules.chineseName")
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: t("list.columns.name"),
      dataIndex: "name",
      key: "name",
      width: "9%",
      editable: true,
      rules: [
        {
          required: true,
          message: t("list.rules.name")
        }
      ],
      render: (text: string) => <Text>{text}</Text>
    },
    {
      title: <span>{t("list.columns.density")}<br/>({t("list.columns.densityUnit")})</span>,
      dataIndex: "density",
      key: "density",
      width: "11%",
      align: "right",
      editable: true,
      type: {
        name: "number",
        props: {
          min: 0.001,
          step: 0.001
        }
      },
      rules: [
        {
          required: true,
          message: t("list.rules.density")
        }
      ],
      render: (text: number) => <Text>{text}</Text>
    },
    {
      title: <span>{t("list.columns.thickness")}<br/>({t("list.columns.thicknessUnit")})</span>,
      dataIndex: "thickness",
      key: "thickness",
      width: "9%",
      align: "right",
      editable: true,
      type: {
        name: "number",
        props: {
          min: 0.01,
          step: 0.01
        }
      },
      rules: [
        {
          required: true,
          message: t("list.rules.thickness")
        }
      ],
      render: (text: number) => <Text>{text}</Text>
    },
    {
      title: <span>{t("list.columns.weightPerCm2")}<br/>({t("list.columns.weightPerCm2Unit")})</span>,
      key: "weightPerCm2",
      dataIndex: "weightPerCm2",
      width: "11%",
      align: "right",
      render: (text: number) => <Text>{Number(text.toFixed(6))}</Text>
    },
    {
      title: <span>{t("list.columns.unitPricePerKg")}<br/>({t("list.columns.unitPricePerKgUnit")})</span>,
      dataIndex: "unitPricePerKg",
      key: "unitPricePerKg",
      width: "10%",
      align: "right",
      editable: true,
      type: {
        name: "number",
        props: {
          min: 0.01,
          step: 0.01
        }
      },
      rules: [
        {
          required: true,
          message: t("list.rules.unitPricePerKg")
        }
      ],
      render: (text: number) => <Text>{text}</Text>
    },
    {
      title: <span>{t("list.columns.unitPricePerSquareMeter")}<br/>({t("list.columns.unitPricePerSquareMeterUnit")})</span>,
      key: "unitPricePerSquareMeter",
      dataIndex: "unitPricePerSquareMeter",
      width: "11%",
      align: "right",
      render: (text: number) => <Text>{Number(text.toFixed(4))}</Text>
    },
    {
      title: t("list.columns.remarks"),
      dataIndex: "remarks",
      key: "remarks",
      width: "15%",
      type: "textarea",
      editable: true,
      render: (remarks?: string) => <Text>{remarks}</Text>
    },
    {
      title: t("list.columns.operations"),
      width: "13%",
      type: "operation",
      render: (_, record: Material) => (
        <Space size="middle">
          {
            !!editingId
            ?
            <Button type="text" shape="circle" size="middle" disabled={true} icon={<EditOutlined />} onClick={onEdit(record.id)}></Button>
            :
            <Tooltip title={t("list.modificationTooltip", {name: isZhCN ? record.chineseName : record.name})}>
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
                title: t("list.removeTooltip", {name: isZhCN ? record.chineseName : record.name})
              }
            }
            popconfirmProps={{
              title: t("list.removeConfirming.title", {name: isZhCN ? record.chineseName : record.name}),
              description: t("list.removeConfirming.description", {name: isZhCN ? record.chineseName : record.name}),
              onConfirm: onDelete(record.id),
              okText: t("list.removeConfirming.ok"),
              cancelText: t("list.removeConfirming.cancel"),
              disabled: !!editingId
            }}
          />
        </Space>
      ),
    }
  ], [isZhCN, editingId, onEdit, onDelete]);

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Flex vertical={false} justify="flex-end">
        <Button type="primary" icon={<UserAddOutlined />} onClick={onAdd}>{t("list.new")}</Button>
      </Flex>
      <EditableTable<Material, NewMaterial, UpdatedMaterial>
        editingId={editingId}
        onNewSubmit={onNewSubmit}
        onNewCancel={onNewCancel}
        onEditSubmit={onEditSubmit}
        onEditCancel={onEditCancel}
        columns={columns}
        dataSource={materials}
        loading={loading}
      />
    </Space>
  );
}