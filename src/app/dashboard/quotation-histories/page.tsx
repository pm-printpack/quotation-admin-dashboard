"use client";
import { DigitalPrintingQuotationHistory, fetchQuotationHistories, GravurePrintingQuotationHistory, OffsetPrintingQuotationHistory, PrintingType, ProductSubcategory, QuotationHistory } from "@/lib/features/quotation-histories.slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Table, TableColumnsType, Tooltip } from "antd";
import { useEffect } from "react";
import { createStyles } from "antd-style";
import { Customer } from "@/lib/features/customers.slice";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import styles from "./page.module.css";

dayjs.extend(utc);
dayjs.extend(timezone);

declare module "antd-style" {
  export interface CustomToken {
    antCls: string;
  }
}

const useStyle = createStyles(({ css, token }) => {
  const { antCls } = token;
  return {
    customTable: css`
      ${antCls}-table {
        ${antCls}-table-container {
          ${antCls}-table-body,
          ${antCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

const columns: TableColumnsType<QuotationHistory> = [
  {
    title: "账号",
    width: 100,
    dataIndex: "customer",
    key: "customer",
    fixed: "left",
    render: (customer: Customer) => customer.username
  },
  {
    title: "询价时间",
    width: 120,
    dataIndex: "createdAt",
    key: "createdAt",
    render: (createdAt: string) => dayjs.tz(createdAt, "Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss")
  },
  {
    title: "记录号",
    dataIndex: "id",
    key: "id",
    align: "center"
  },
  {
    title: "袋型",
    width: 100,
    fixed: "left",
    dataIndex: "categoryProductSubcategory",
    key: "categoryProductSubcategory",
    render: (categoryProductSubcategory: ProductSubcategory) => `${ categoryProductSubcategory.chineseName }(${categoryProductSubcategory.name})`
  },
  {
    title: "印刷方式",
    width: 100,
    fixed: "left",
    dataIndex: "categoryPrintingType",
    key: "categoryPrintingType",
    render: (categoryPrintingType: PrintingType) => `${ categoryPrintingType.chineseName }(${categoryPrintingType.name})`
  },
  {
    title: "宽",
    dataIndex: "width",
    key: "width",
    align: "right",
    render: (value: string) => new Intl.NumberFormat().format(Number(value))
  },
  {
    title: "高",
    dataIndex: "height",
    key: "height",
    align: "right",
    render: (value: string) => new Intl.NumberFormat().format(Number(value))
  },
  {
    title: "全展",
    dataIndex: "gusset",
    key: "gusset",
    align: "right",
    render: (gusset?: string) => gusset || "-"
  },
  {
    title: "SKU",
    dataIndex: "numOfStyles",
    key: "numOfStyles",
    align: "right"
  },
  {
    title: "单SKU数量",
    dataIndex: "quantityPerStyle",
    key: "quantityPerStyle",
    align: "right",
    render: (value: string) => new Intl.NumberFormat().format(Number(value))
  },
  {
    title: "总数量",
    dataIndex: "totalQuantity",
    key: "totalQuantity",
    align: "right",
    render: (value: string) => new Intl.NumberFormat().format(Number(value))
  },



  {
    title: "总价（美元）",
    dataIndex: "totalPriceInUSD",
    key: "totalPriceInUSD",
    align: "right",
    render: (value: string, record: QuotationHistory) => (
      <>
        <p>{ new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value)) }</p>
        <p className={styles.hintStyle}>汇率：$1 = {new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(record.exchangeRateUSDToCNY)}</p>
      </>
    )
  },
  {
    title: "总价（元）",
    dataIndex: "totalPriceInCNY",
    key: "totalPriceInCNY",
    align: "right",
    render: (value: string) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(Number(value))
  },
  {
    title: "总成本（元）",
    dataIndex: "totalCostInCNY",
    key: "totalCostInCNY",
    align: "right",
    render: (value: string) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(Number(value))
  },
  {
    title: "匹配模数",
    dataIndex: "offsetPrinting",
    key: "offsetPrinting.numOfMatchedModulus",
    align: "right",
    render: (offsetPrinting?: OffsetPrintingQuotationHistory) => offsetPrinting?.numOfMatchedModulus || "-"
  },
  {
    title: "匹配周长",
    dataIndex: "offsetPrinting",
    key: "offsetPrinting.matchedPerimeter",
    align: "right",
    render: (offsetPrinting?: OffsetPrintingQuotationHistory) => offsetPrinting?.matchedPerimeter || "-"
  },
  {
    title: "倍数",
    dataIndex: "offsetPrinting",
    key: "offsetPrinting.multiple",
    align: "right",
    render: (offsetPrinting?: OffsetPrintingQuotationHistory) => offsetPrinting?.multiple || "-"
  },
  {
    title: "印刷用SKU数",
    dataIndex: "offsetPrinting",
    key: "offsetPrinting.numOfSKUs4Printing",
    align: "right",
    render: (offsetPrinting?: OffsetPrintingQuotationHistory) => offsetPrinting?.numOfSKUs4Printing ? new Intl.NumberFormat().format(Number(offsetPrinting.numOfSKUs4Printing)) : "-"
  },
  {
    title: "印刷宽度（mm）",
    key: "printingWidth",
    align: "right",
    render: (_, record: QuotationHistory) => {
      switch (record.categoryPrintingType.name.toLowerCase()) {
        case "digital printing":
          return record.digitalPrinting?.printingWidth || "-";
        case "offset printing":
          return record.offsetPrinting?.printingWidth || "-";
      }
      return "-";
    }
  },
  {
    title: "材料宽度（mm）",
    key: "materialWidth",
    align: "right",
    render: (_, record: QuotationHistory) => {
      switch (record.categoryPrintingType.name.toLowerCase()) {
        case "offset printing":
          return record.offsetPrinting?.materialWidth || "-";
        case "gravure printing":
          return record.gravurePrinting?.materialWidth || "-";
      }
      return "-";
    }
  },
  {
    title: "横向印刷数",
    dataIndex: "digitalPrinting",
    key: "digitalPrinting.horizontalLayoutCount",
    align: "right",
    render: (digitalPrinting?: DigitalPrintingQuotationHistory) => digitalPrinting?.horizontalLayoutCount || "-"
  },
  {
    title: "每印袋数",
    dataIndex: "digitalPrinting",
    key: "digitalPrinting.numOfBagsPerPrinting",
    align: "right",
    render: (digitalPrinting?: DigitalPrintingQuotationHistory) => digitalPrinting?.numOfBagsPerPrinting || "-"
  },
  {
    title: "印刷长度（m）",
    key: "printingLength",
    align: "right",
    render: (_, record: QuotationHistory) => {
      switch (record.categoryPrintingType.name.toLowerCase()) {
        case "digital printing":
          return record.digitalPrinting?.printingLength || "-";
        case "offset printing":
          return record.offsetPrinting?.printingLength || "-";
      }
      return "-";
    }
  },
  {
    title: "版长（mm）",
    dataIndex: "gravurePrinting",
    key: "gravurePrinting.plateLength",
    align: "right",
    render: (gravurePrinting: GravurePrintingQuotationHistory) => gravurePrinting?.plateLength || "-"
  },
  {
    title: "单袋印刷长（mm）",
    dataIndex: "gravurePrinting",
    key: "gravurePrinting.printingLengthPerPackage",
    align: "right",
    render: (gravurePrinting: GravurePrintingQuotationHistory) => gravurePrinting?.printingLengthPerPackage || "-"
  },
  {
    title: "版周（mm）",
    dataIndex: "gravurePrinting",
    key: "gravurePrinting.platePerimeter",
    align: "right",
    render: (gravurePrinting: GravurePrintingQuotationHistory) => gravurePrinting?.platePerimeter || "-"
  },
  {
    title: "材料面积（㎡）",
    dataIndex: "materialArea",
    key: "materialArea",
    align: "right"
  },
  {
    title: "印数",
    dataIndex: "digitalPrinting",
    key: "digitalPrinting.printingQuantity",
    align: "right",
    render: (digitalPrinting?: DigitalPrintingQuotationHistory) => digitalPrinting?.printingQuantity || "-"
  },
  {
    title: "印刷费（元）",
    dataIndex: "printingCost",
    key: "printingCost",
    align: "right"
  },
  {
    title: "材料费（元）",
    dataIndex: "materialCost",
    key: "materialCost",
    align: "right"
  },
  {
    title: "复合费（元）",
    dataIndex: "laminationCost",
    key: "laminationCost",
    align: "right"
  },
  {
    title: "制袋费（元）",
    dataIndex: "bagMakingCost",
    key: "bagMakingCost",
    align: "right",
    render: (value: string) => new Intl.NumberFormat().format(Number(value))
  },
  {
    title: "刀模费（元）",
    dataIndex: "dieCuttingCost",
    key: "dieCuttingCost",
    align: "right",
    render: (value: string) => new Intl.NumberFormat().format(Number(value))
  },
  {
    title: "版费（元）",
    dataIndex: "gravurePrinting",
    key: "gravurePrinting.plateFee",
    align: "right",
    render: (gravurePrinting: GravurePrintingQuotationHistory) => gravurePrinting?.plateFee ? new Intl.NumberFormat().format(Number(gravurePrinting.plateFee)) : "-"
  },
  {
    title: "包装费（元）",
    dataIndex: "packagingCost",
    key: "packagingCost",
    align: "right",
    render: (value: string) => new Intl.NumberFormat().format(Number(value))
  },
  {
    title: "人工费（元）",
    dataIndex: "laborCost",
    key: "laborCost",
    align: "right",
    render: (value: string) => new Intl.NumberFormat().format(Number(value))
  },
  {
    title: "文件处理费（元）",
    dataIndex: "fileProcessingFee",
    key: "fileProcessingFee",
    align: "right",
    render: (value: string) => new Intl.NumberFormat().format(Number(value))
  }
];

export default function AdminsPage() {
  const dispatch = useAppDispatch();
  const list: QuotationHistory[] = useAppSelector((state: RootState) => state.quotationHistories.list);
  const totalItems: number = useAppSelector((state: RootState) => state.quotationHistories.totalItems);
  const currentPage: number = useAppSelector((state: RootState) => state.quotationHistories.currentPage);
  const loading: boolean = useAppSelector((state: RootState) => state.quotationHistories.loading);

  const { styles } = useStyle();

  useEffect(() => {
    dispatch(fetchQuotationHistories(1));
  }, []);

  useEffect(() => {
    console.log(list);
  }, [list]);

  return (
    <Table<QuotationHistory>
      bordered
      rowKey="id"
      className={styles.customTable}
      columns={columns}
      dataSource={list}
      scroll={{ x: "max-content" }}
      loading={loading}
      pagination={{
        current: currentPage,
        pageSize: 10,
        total: totalItems
      }}
    />
  );
}