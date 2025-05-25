"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Checkbox, CheckboxChangeEvent, Table } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import Text from "antd/es/typography/Text";
import { Material, fetchMaterials, updateOrCreatMaterial } from "@/lib/features/materials.slice";
import { ColumnsType } from "antd/es/table";

export default function MaterialDisplayControllerPage() {
  const dispatch = useAppDispatch();
  const materials: Material[] = useAppSelector((state: RootState) => state.materials.list);
  const loading: boolean = useAppSelector((state: RootState) => state.materials.loading);

  useEffect(() => {
    dispatch(fetchMaterials()).unwrap();
  }, [dispatch]);

  const onChange = useCallback((dataIndex: string, record: Material, index: number) => {
    return (e: CheckboxChangeEvent) => {
      dispatch(updateOrCreatMaterial({
        id: record.id,
        material: {
          [dataIndex]: e.target.checked
        }
      }));
    };
  }, [dispatch]);

  const columns: ColumnsType<Material> = useMemo(() => [
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
    },
    {
      title: <span>数码<br/>印刷层</span>,
      dataIndex: "digitalPrinting",
      key: "digitalPrinting",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("digitalPrinting", record, index)}></Checkbox>
    },
    {
      title: <span>数码<br/>复合层1</span>,
      dataIndex: "digitalLayer1",
      key: "digitalLayer1",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("digitalLayer1", record, index)}></Checkbox>
    },
    {
      title: <span>数码<br/>复合层2</span>,
      dataIndex: "digitalLayer2",
      key: "digitalLayer2",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("digitalLayer2", record, index)}></Checkbox>
    },
    {
      title: <span>数码<br/>复合层3</span>,
      dataIndex: "digitalLayer3",
      key: "digitalLayer3",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("digitalLayer3", record, index)}></Checkbox>
    },
    {
      title: <span>数码<br/>内层</span>,
      dataIndex: "digitalInner",
      key: "digitalInner",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("digitalInner", record, index)}></Checkbox>
    },
    {
      title: <span>胶印<br/>印刷层</span>,
      dataIndex: "offsetPrinting",
      key: "offsetPrinting",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("offsetPrinting", record, index)}></Checkbox>
    },
    {
      title: <span>胶印<br/>复合层1</span>,
      dataIndex: "offsetLayer1",
      key: "offsetLayer1",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("offsetLayer1", record, index)}></Checkbox>
    },
    {
      title: <span>胶印<br/>复合层2</span>,
      dataIndex: "offsetLayer2",
      key: "offsetLayer2",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("offsetLayer2", record, index)}></Checkbox>
    },
    {
      title: <span>胶印<br/>复合层3</span>,
      dataIndex: "offsetLayer3",
      key: "offsetLayer3",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("offsetLayer3", record, index)}></Checkbox>
    },
    {
      title: <span>胶印<br/>内层</span>,
      dataIndex: "offsetInner",
      key: "offsetInner",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("offsetInner", record, index)}></Checkbox>
    },
    {
      title: <span>凹印<br/>印刷层</span>,
      dataIndex: "gravurePrinting",
      key: "gravurePrinting",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("gravurePrinting", record, index)}></Checkbox>
    },
    {
      title: <span>凹印<br/>复合层1</span>,
      dataIndex: "gravureLayer1",
      key: "gravureLayer1",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("gravureLayer1", record, index)}></Checkbox>
    },
    {
      title: <span>凹印<br/>复合层2</span>,
      dataIndex: "gravureLayer2",
      key: "gravureLayer2",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("gravureLayer2", record, index)}></Checkbox>
    },
    {
      title: <span>凹印<br/>复合层3</span>,
      dataIndex: "gravureLayer3",
      key: "gravureLayer3",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("gravureLayer3", record, index)}></Checkbox>
    },
    {
      title: <span>凹印<br/>内层</span>,
      dataIndex: "gravureInner",
      key: "gravureInner",
      width: "5.6%",
      align: "center",
      render: (value: boolean, record: Material, index: number) => <Checkbox checked={value} onChange={onChange("gravureInner", record, index)}></Checkbox>
    }
  ], [onChange]);

  return (
    <Table<Material>
      columns={columns}
      dataSource={materials}
      loading={loading}
    />
  );
}