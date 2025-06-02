import { Button, Form, FormInstance, Space, Table, TableProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { Reference } from "rc-table";
import { PropsWithChildren, Ref, RefAttributes, useCallback, useEffect, useMemo, useRef, useState } from "react";
import EditableCell, { EditableCellInputType, EditableColumnType, wrapColumns } from "./EditableCell";
import DoubleCheckedButton from "../DoubleCheckedButton";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

interface RecordTypeWithId extends AnyObject {
  id: number | string;
}

export interface EditableTableProps<RecordType = AnyObject> extends PropsWithChildren<TableProps<RecordType>>, RefAttributes<Reference> {
  editingId?: number | string;
  onEditSubmit?: <RecordTypeByForm extends Partial<AnyObject>>(record: RecordTypeByForm | undefined | null, preRecord: RecordType, index: number) => void;
  onEditCancel?: (preRecord: RecordType, index: number) => void;
}

export default function EditableTable<RecordType extends RecordTypeWithId, RecordTypeByForm = AnyObject>({
  editingId,
  columns,
  onEditSubmit,
  onEditCancel,
  children,
  ...props
}: EditableTableProps<RecordType>) {
  const form: Ref<FormInstance> = useRef<FormInstance>(null);

  const onSubmit = useCallback((preRecord: RecordType, index: number) => {
    return () => {
      if (onEditSubmit) {
        onEditSubmit<Partial<RecordTypeByForm>>(form.current?.getFieldsValue(), preRecord, index);
      }
    };
  }, [onEditSubmit]);

  const onCancel = useCallback((preRecord: RecordType, index: number) => {
    return () => {
      if (onEditCancel) {
        onEditCancel(preRecord, index);
      }
    };
  }, [onEditCancel]);

  columns = useMemo(() => columns ? wrapColumns(columns.map((column: EditableColumnType<RecordType>) => {
    if (column.type === "operation") {
      return {
        ...column,
        render: (_, record: RecordType, index: number) => {
          if (column.render) {
            const editing: boolean = record.id === editingId;
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
                    title: "确定取消操作吗?",
                    okText: "确定",
                    cancelText: "再想想",
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
  }), (value: any, record: RecordType, index?: number, col?: EditableColumnType<RecordType>) => {
    const [editing, setEditing] = useState<boolean>(record.id === editingId);
    useEffect(() => {
      setEditing(record.id === editingId);
    }, [record.id, editingId]);

    useEffect(() => {
      if (editing) {
        const cloningRecord = JSON.parse(JSON.stringify(record)); // clone a record for form values.
        for (const key in cloningRecord) {
          if (Object.prototype.toString.call(cloningRecord[key]) === "[object Object]") {
            cloningRecord[key] = cloningRecord[key].id || cloningRecord[key].name;
          }
        }
        form.current?.setFieldsValue(cloningRecord);
      }
    }, [editing])
    return {
      inputType: col?.type ? (col.type === "credential" ? "credential" : col.type as EditableCellInputType) : (typeof value === "number" ? "number" : "text"),
      editing: editing
    }
  }) : [], [editingId]);
  return (
    <Form ref={form}>
      <Table<RecordType>
        components={{
          body: {
            cell: EditableCell<RecordType>
          }
        }}
        columns={columns}
        {...props}
      >
        {children}
      </Table>
    </Form>
  );
}