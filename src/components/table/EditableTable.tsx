import { Button, Form, FormInstance, Space, Table, TableProps } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { Reference } from "rc-table";
import { PropsWithChildren, Ref, RefAttributes, useCallback, useMemo, useRef } from "react";
import EditableCell, { EditableColumnType, wrapColumns } from "./EditableCell";
import DoubleCheckedButton from "../DoubleCheckedButton";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

interface RecordTypeWithId extends AnyObject {
  id: number | string;
}

export interface EditableTableProps<RecordType = AnyObject> extends PropsWithChildren<TableProps<RecordType>>, RefAttributes<Reference> {
  editingId?: number | string;
  onEditSubmit?: (record: RecordType | undefined | null, preRecord: RecordType, index: number) => void;
  onEditCancel?: (preRecord: RecordType, index: number) => void;
}

export default function EditableTable<RecordType extends RecordTypeWithId>({
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
        onEditSubmit(form.current?.getFieldsValue(), preRecord, index);
      }
    };
  }, [onEditSubmit]);

  const onCancel = useCallback((preRecord: RecordType, index: number) => {
    return () => {
      if (onEditCancel) {
        onEditCancel(preRecord, index);
      }
    };
  }, []);

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
                    title: "Sure to cancel?",
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
  }), (record: RecordType, index?: number, col?: EditableColumnType<RecordType>) => {
    const editing: boolean = record.id === editingId;
    if (form.current) {
      if (editing) {
        form.current.setFieldsValue(JSON.parse(JSON.stringify(record)));
      }
    }
    return {
      inputType: "text",
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