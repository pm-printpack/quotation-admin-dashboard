"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Checkbox, CheckboxChangeEvent, Table } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import Text from "antd/es/typography/Text";
import { Material, MaterialDisplay, fetchMaterials, updateMaterialDisplay, updateOrCreatMaterial } from "@/lib/features/materials.slice";
import { ColumnsType } from "antd/es/table";

export default function MaterialDisplayControllerPage() {
  const dispatch = useAppDispatch();
  const materials: Material[] = useAppSelector((state: RootState) => state.materials.list);
  const loading: boolean = useAppSelector((state: RootState) => state.materials.loading);

  useEffect(() => {
    dispatch(fetchMaterials()).unwrap();
  }, [dispatch]);

  const onChange = useCallback((materialDisplayId: number, record: Material, index: number) => {
    return (e: CheckboxChangeEvent) => {
      dispatch(updateMaterialDisplay({
        id: materialDisplayId,
        materialId: record.id,
        materialDisplay: {
          isActive: e.target.checked
        }
      }));
    };
  }, [dispatch]);

  const columns: ColumnsType<Material> = useMemo(() => {
    const columnSegments: ColumnsType<Material> = [
      {
        title: "材料名",
        dataIndex: "chineseName",
        key: "chineseName",
        width: "8%",
        render: (text: string) => <Text>{text}</Text>
      },
      {
        title: "英文名",
        dataIndex: "name",
        key: "name",
        width: "8%",
        render: (text: string) => <Text>{text}</Text>
      }
    ];
    if (materials.length === 0) {
      return columnSegments;
    }
    const materialDisplays: MaterialDisplay[] = materials[0].displays;
    const widthRatio: number = Math.round(84 / materialDisplays.length);
    for (let i: number = 0; i < materialDisplays.length; ++i) {
      const materialDisplay: MaterialDisplay = materialDisplays[i];
      columnSegments.push({
        title: <span>{materialDisplay.categoryPrintingType.chineseName}<br/>{materialDisplay.categoryOption.chineseName}{materialDisplay.index === 0 ? "" : (materialDisplay.index + 1)}</span>,
        align: "center",
        width: `${widthRatio}%`,
        render: (_, record: Material, index: number) => <Checkbox checked={materialDisplay.isActive} onChange={onChange(materialDisplay.id, record, index)}></Checkbox>
      });
    }
    return columnSegments;
  }, [onChange, materials]);

  return (
    <Table<Material>
      columns={columns}
      dataSource={materials}
      loading={loading}
    />
  );
}