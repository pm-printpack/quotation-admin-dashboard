import { Input, InputNumber, Select } from "antd";
import type { AnyObject } from "antd/es/_util/type";
import { Rule } from "antd/es/form";
import FormItem from "antd/es/form/FormItem";
import Password from "antd/es/input/Password";
import TextArea from "antd/es/input/TextArea";
import type { ColumnGroupType, ColumnsType, ColumnType } from "antd/es/table";
import { ColumnTitle } from "antd/es/table/interface";
import { useTranslations } from "next-intl";
import { ReactNode, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from "react";

type ColumnCategory = "operation" | EditableCellInputType;

interface EditableBaseColumnType {
  editable?: boolean;
  rules?: Rule[];
  type?: ColumnCategory;
}

export interface EditableColumnType<RecordType = AnyObject> extends ColumnType<RecordType>, EditableBaseColumnType {}

export interface EditableColumnGroupType<RecordType = AnyObject> extends ColumnGroupType<RecordType>, EditableBaseColumnType {}

export type EditableColumnsType<RecordType = AnyObject> = ColumnsType<RecordType> & (EditableColumnGroupType<RecordType> | EditableColumnType<RecordType>)[]

export type EditableCellInputTypeString = "number" | "text" | "credential" | "textarea" | "options";

export type EditableCellInputTypeObject<RecordType = AnyObject, Props = any> = {
  name: EditableCellInputTypeString;
  props: Props;
};

export type EditableCellInputType = EditableCellInputTypeString | EditableCellInputTypeObject;

export interface EditableBaseCellProps {
  editing: boolean;
  inputType: EditableCellInputType;
}

export interface EditableCellProps<RecordType = AnyObject> extends EditableBaseCellProps {
  dataIndex: string;
  title: ColumnTitle<RecordType>;
  record: RecordType;
  index: number;
  rules?: Rule[];
};

export default function EditableCell<RecordType extends AnyObject>({
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
  const t = useTranslations("components/EditableCell");
  const inputNode: ReactNode = useMemo(() => {
    if (!editing) {
      return undefined;
    }
    let inputTypeName: EditableCellInputTypeString;
    let inputProps: any;
    if (typeof inputType === "object") {
      inputTypeName = inputType.name;
      inputProps = inputType.props;
    } else {
      inputTypeName = inputType;
    }
    switch (inputTypeName) {
      case "number":
        return <InputNumber min={0} {...inputProps} />;
      case "textarea":
        return <TextArea rows={6} {...inputProps} />;
      case "options":
        return <Select {...inputProps}/>;
      default:
        return <Input {...inputProps} />;
    }
  }, [editing, inputType]);
  return (
    <td {...restProps}>
      {
        editing
        ?
        (
          !record.id && inputType === "credential"
          ?
          <>
            <FormItem
              name={dataIndex}
              rules={rules}
            >
              <Input placeholder={t("register.newUsername")} />
            </FormItem>
            <FormItem
              name="password"
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  message: t("register.rulesPassword")
                }
              ]}
            >
              <Password placeholder={t("register.newPassword")} />
            </FormItem>
          </>
          :
          <FormItem
            name={(typeof inputType === "object" && inputType.props?.name) || dataIndex}
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

export type GetEditableColumnComponentProps<RecordType = AnyObject> = (value: any, record: RecordType, column: EditableColumnType<RecordType>, index?: number) => EditableBaseCellProps;

export function wrapColumns<RecordType extends AnyObject>(columns: EditableColumnsType<RecordType>, mapping: GetEditableColumnComponentProps<RecordType>): EditableColumnsType<RecordType> {
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
        ...mapping(record[col.dataIndex as string], record, col, index)
      }),
    };
  }) as EditableColumnsType<RecordType>;
}