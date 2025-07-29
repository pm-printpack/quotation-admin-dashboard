import { Button, Form, FormInstance, Space, Table, TableProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { Reference } from "rc-table";
import { PropsWithChildren, Ref, RefAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditableCell, { EditableCellInputType, EditableCellInputTypeObject, EditableColumnType, wrapColumns } from "./EditableCell";
import DoubleCheckedButton from "../DoubleCheckedButton";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { DataIndex } from "rc-table/lib/interface";
import { useTranslations } from "next-intl";

interface RecordTypeWithId extends AnyObject {
  id: number | string;
}

interface NewRecordType extends AnyObject {}

interface UpdatedRecordType extends RecordTypeWithId, NewRecordType {}

export interface EditableTableProps<RecordType extends RecordTypeWithId, NewRecordType = Omit<RecordType, "id">, UpdatedRecordType = Partial<RecordType>> extends PropsWithChildren<TableProps<RecordType>>, RefAttributes<Reference> {
  editingId?: number | string;
  onNewSubmit?: (record: NewRecordType, index: number) => void;
  onNewCancel?: (index: number) => void;
  onEditSubmit?: (record: UpdatedRecordType, preRecord: RecordType, index: number) => void;
  onEditCancel?: (preRecord: RecordType, index: number) => void;
}

export default function EditableTable<RecordType extends RecordTypeWithId, NewRecordType = Omit<RecordType, "id">, UpdatedRecordType = Partial<RecordType>>({
  editingId,
  columns,
  onNewSubmit,
  onNewCancel,
  onEditSubmit,
  onEditCancel,
  children,
  ...props
}: EditableTableProps<RecordType, NewRecordType, UpdatedRecordType>) {
  const form: Ref<FormInstance> = useRef<FormInstance>(null);
  const t = useTranslations("components/EditableTable");

  const onSubmit = useCallback((preRecord: RecordType, index: number) => {
    return async () => {
      try {
        await form.current?.validateFields();
        if (preRecord.id) { // update
          if (onEditSubmit) {
            onEditSubmit({ id: preRecord.id, ...form.current?.getFieldsValue() }, preRecord, index);
          }
        } else { // new
          if (onNewSubmit) {
            onNewSubmit(form.current?.getFieldsValue(), index);
          }
        }
      } catch(error) {
        console.error(error);
      }
    };
  }, [onEditSubmit]);

  const onCancel = useCallback((preRecord: RecordType, index: number) => {
    return () => {
      if (preRecord?.id) { // cancel update
        if (onEditCancel) {
          onEditCancel(preRecord, index);
        }
      } else { // cancel a new
        if (onNewCancel) {
          onNewCancel(index);
        }
      }
    };
  }, [onEditCancel]);

  columns = useMemo(() => columns ? wrapColumns(columns.map((column: EditableColumnType<RecordType>) => {
    if (column.type === "operation") {
      return {
        ...column,
        render: (_, record: RecordType, index: number) => {
          if (column.render) {
            const editing: boolean = !record.id || record.id === editingId;
            return (
              editing
              ?
              <Space size="small">
                <Button type="text" shape="circle" size="middle" htmlType="submit" icon={<CheckCircleOutlined />} onClick={onSubmit(record, index)}/>
                <DoubleCheckedButton
                  buttonProps={{
                    type: "text",
                    shape: "circle",
                    icon: <CloseCircleOutlined />,
                    size: "small"
                  }}
                  popconfirmProps={{
                    title: t("removePop.title"),
                    okText: t("removePop.ok"),
                    cancelText: t("removePop.cancel"),
                    onConfirm: onCancel(record, index)
                  }}
                />
              </Space>
              :
              column.render(_, record, index)
            );
          }
          return undefined;
        }
      };
    }
    return column;
  }), (value: any, record: RecordType, col: EditableColumnType<RecordType>, index?: number) => {
    const [editing, setEditing] = useState<boolean>(record.id === editingId);
    useEffect(() => {
      setEditing(!record.id || record.id === editingId);
    }, [record.id, editingId]);

    useEffect(() => {
      if (editing && col.dataIndex) {
        let value: any = record[col.dataIndex as string];
        if (Object.prototype.toString.call(value) === "[object Object]") {
          value = value.id || value.name;
        }
        const typeName: string | undefined = ((col.type as EditableCellInputTypeObject)?.props || {}).name;
        const dataIndex: DataIndex<RecordType> = typeName || col.dataIndex;
        form.current?.setFieldsValue({
          [dataIndex as string]: value
        });
      }
    }, [editing])
    return {
      inputType: col?.type ? (col.type === "credential" ? "credential" : col.type as EditableCellInputType) : (typeof value === "number" ? "number" : "text"),
      editing: editing
    }
  }) : [], [editingId, columns]);
  
  return (
    <Form ref={form}>
      <Table<RecordType>
        components={{
          body: {
            cell: EditableCell<RecordType>
          }
        }}
        rowKey={(record: RecordType) => record.id || Date.now().toString()}
        columns={columns}
        {...props}
      >
        {children}
      </Table>
    </Form>
  );
}