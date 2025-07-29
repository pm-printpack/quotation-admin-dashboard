"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Checkbox, CheckboxChangeEvent, Table } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import Text from "antd/es/typography/Text";
import { Material, MaterialDisplay, fetchMaterials, updateMaterialDisplay } from "@/lib/features/materials.slice";
import { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useTranslations } from "next-intl";
import { getBrowserLocale } from "@/lib/i18n";

export default function MaterialDisplayControllerPage() {
  const dispatch = useAppDispatch();
  const t = useTranslations("materials");
  const materials: Material[] = useAppSelector((state: RootState) => state.materials.list);
  const totalItems: number = useAppSelector((state: RootState) => state.materials.totalItems);
  const currentPage: number = useAppSelector((state: RootState) => state.materials.currentPage);
  const loading: boolean = useAppSelector((state: RootState) => state.materials.loading);
  const isZhCN: boolean = useMemo(() => getBrowserLocale() === "zh-CN", []);

  useEffect(() => {
    dispatch(fetchMaterials(1)).unwrap();
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
        title: t("displayList.columns.chineseName"),
        dataIndex: "chineseName",
        key: "chineseName",
        width: "8%",
        render: (text: string) => <Text>{text}</Text>
      },
      {
        title: t("displayList.columns.name"),
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
      if (materialDisplay.categoryPrintingType && materialDisplay.categoryOption) {
        columnSegments.push({
          title: <span>{isZhCN ? materialDisplay.categoryPrintingType.chineseName : materialDisplay.categoryPrintingType.name}<br/>{isZhCN ? materialDisplay.categoryOption.chineseName : materialDisplay.categoryOption.name}{materialDisplay.index === 0 ? "" : (materialDisplay.index + 1)}</span>,
          key: `material-display-${materialDisplay.id}`,
          align: "center",
          width: `${widthRatio}%`,
          render: (_, record: Material, index: number) => <Checkbox checked={record.displays[i].isActive} onChange={onChange(record.displays[i].id, record, index)}></Checkbox>
        });
      }
    }
    return columnSegments;
  }, [isZhCN, onChange, materials]);

  const onPaginationChange = useCallback((pagination: TablePaginationConfig) => {
    dispatch(fetchMaterials(pagination.current || 1));
  }, []);

  return (
    <Table<Material>
      columns={columns}
      dataSource={materials}
      loading={loading}
      rowKey={(record: Material) => record.id}
      pagination={{
        current: currentPage,
        total: totalItems,
        pageSize: 10,
        showSizeChanger: false
      }}
      onChange={onPaginationChange}
    />
  );
}