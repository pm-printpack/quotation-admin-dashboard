import { Input, InputNumber } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import { Rule } from "antd/es/form";
import FormItem from "antd/es/form/FormItem";
import type { ColumnGroupType, ColumnsType, ColumnType } from "antd/es/table";
import type { PropsWithChildren } from "react";

type ColumnCategory = "operation" | "normal";

interface EditableBaseColumnType {
  editable?: boolean;
  rules?: Rule[];
  type?: ColumnCategory;
}

export interface EditableColumnType<RecordType = AnyObject> extends ColumnType<RecordType>, EditableBaseColumnType {}

export interface EditableColumnGroupType<RecordType = AnyObject> extends ColumnGroupType<RecordType>, EditableBaseColumnType {}

export type EditableColumnsType<RecordType = AnyObject> = ColumnsType<RecordType> & (EditableColumnGroupType<RecordType> | EditableColumnType<RecordType>)[]

export type EditableCellInputType = "number" | "text" | "enum";

export interface EditableBaseCellProps {
  editing: boolean;
  inputType: EditableCellInputType;
}

export interface EditableCellProps<RecordType = AnyObject> extends EditableBaseCellProps {
  dataIndex: string;
  title: any;
  record: RecordType;
  index: number;
  rules?: Rule[];
};

export default function EditableCell<RecordType = AnyObject>({
  editing,
  dataIndex,
  title,
  inputType,
  rules,
  record,
  index,
  children,
  ...restProps
}: PropsWithChildren<EditableCellProps<RecordType>>) {
  const inputNode = inputType === "number" ? <InputNumber width="auto" /> : <Input width="auto" />;
  return (
    <td {...restProps}>
      {
        editing
        ?
        (
          <FormItem
            name={dataIndex}
            style={{ margin: 0 }}
            rules={rules}
          >
            {inputNode}
          </FormItem>
        )
        :
        children
      }
    </td>
  );
}

export type GetEditableColumnComponentProps<RecordType = AnyObject> = (record: RecordType, index?: number, column?: EditableColumnType<RecordType>) => EditableBaseCellProps;

export function wrapColumns<RecordType = AnyObject>(columns: EditableColumnsType<RecordType>, mapping: GetEditableColumnComponentProps<RecordType>): EditableColumnsType<RecordType> {
  return columns.map((col: EditableColumnType<RecordType>) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: RecordType, index?: number) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        rules: col.rules,
        ...mapping(record, index, col)
      }),
    };
  }) as EditableColumnsType<RecordType>;
}