"use client";
import { DigitalPrintingQuotationHistory, fetchQuotationHistories, GravurePrintingQuotationHistory, OffsetPrintingQuotationHistory, QuotationHistory } from "@/lib/features/quotation-histories.slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Flex, Space, Table, TableColumnsType, TableColumnType, Tooltip } from "antd";
import { useEffect, useMemo } from "react";
import { createStyles } from "antd-style";
import { Customer } from "@/lib/features/customers.slice";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import pageStyles from "./page.module.css";
import { CategoryOption, fetchCategoryOptions, CategoryPrintingType, CategoryProductSubcategory, CategoryAllMapping, CategoryOptionWithIndex } from "@/lib/features/categories.slice";
import { fetchMaxDisplayIndexByCategoryOptionIds, Material, MaterialDisplay, MaxMaterialDisplayByCategoryOption } from "@/lib/features/materials.slice";

dayjs.extend(utc);
dayjs.extend(timezone);

const useStyle = createStyles(({ css, prefixCls }) => {
  return {
    customTable: css`
      ${prefixCls}-table {
        ${prefixCls}-table-container {
          ${prefixCls}-table-body,
          ${prefixCls}-table-content {
            scrollbar-width: thin;
            scrollbar-color: #eaeaea transparent;
            scrollbar-gutter: stable;
          }
        }
      }
    `,
  };
});

export default function QuotationHistoriesPage() {
  const dispatch = useAppDispatch();
  const categoryOptions: CategoryOption[] = useAppSelector((state: RootState) => state.categories.categoryOptions);
  const maxMaterialDisplayByCategoryOptions: MaxMaterialDisplayByCategoryOption[] = useAppSelector((state: RootState) => state.materials.maxDisplays);
  const list: QuotationHistory[] = useAppSelector((state: RootState) => state.quotationHistories.list);
  const totalItems: number = useAppSelector((state: RootState) => state.quotationHistories.totalItems);
  const currentPage: number = useAppSelector((state: RootState) => state.quotationHistories.currentPage);
  const loading: boolean = useAppSelector((state: RootState) => state.quotationHistories.loading);

  const { styles } = useStyle();

  const columns: TableColumnsType<QuotationHistory> = useMemo(() => [
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
      width: 125,
      fixed: "left",
      dataIndex: "categoryProductSubcategory",
      key: "categoryProductSubcategory",
      render: (categoryProductSubcategory: CategoryProductSubcategory) => (
        <>
          <span>{ categoryProductSubcategory.chineseName }</span>
          <br />
          <span className={pageStyles.hintStyle}>({categoryProductSubcategory.name})</span>
        </>
      )
    },
    {
      title: "印刷方式",
      width: 120,
      fixed: "left",
      dataIndex: "categoryPrintingType",
      key: "categoryPrintingType",
      render: (categoryPrintingType: CategoryPrintingType) => (
        <>
          <span>{ categoryPrintingType.chineseName }</span>
          <br />
          <span className={pageStyles.hintStyle}>({categoryPrintingType.name})</span>
        </>
      )
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
    ...(
      categoryOptions
        .filter(({name}) => name.toLowerCase() !== "bag out direction")
        .map((categoryOption: CategoryOption, index: number) => {
          const maxMaterialDisplayByCategoryOption: MaxMaterialDisplayByCategoryOption | undefined = maxMaterialDisplayByCategoryOptions.find(({categoryOptionId}) => categoryOptionId === categoryOption.id);
          if (maxMaterialDisplayByCategoryOption && maxMaterialDisplayByCategoryOption.index > 0) { // multiple-layer
            return Array.from(new Array(maxMaterialDisplayByCategoryOption.index + 1)).map((_, index: number): CategoryOptionWithIndex => ({
              ...categoryOption,
              chineseName: `${categoryOption.chineseName} ${index + 1}`,
              name: `${categoryOption.name} ${index + 1}`,
              index: index
            }));
          }
          return categoryOption;
        })
        .flat()
        .map((categoryOption: CategoryOption, index: number): TableColumnType<QuotationHistory> => ({
          title: categoryOption.chineseName,
          key: `categoryOption-${categoryOption.id}-${index}`,
          render: (_, record: QuotationHistory) => {
            if (categoryOption.isMaterial) {
              for (const materialDisplay of record.materialDisplays) {
                if (materialDisplay.categoryOptionId === categoryOption.id
                    && materialDisplay.categoryPrintingTypeId === record.categoryPrintingType.id
                    && materialDisplay.index === ((categoryOption as CategoryOptionWithIndex).index || 0)
                ) {
                  return (
                    <>
                      <span>{ materialDisplay.material.chineseName }</span>
                      <br />
                      <span className={pageStyles.hintStyle}>({materialDisplay.material.name})</span>
                    </>
                  );
                }
              }
              return "-";
            } else {
              const categoryAllMapping: CategoryAllMapping | undefined = record.categoryAllMappings.find((mapping) => mapping.categoryOption?.id === categoryOption.id)
              if (categoryAllMapping && categoryAllMapping.categorySuboption) {
                return (
                  <>
                    <span>{ categoryAllMapping.categorySuboption.chineseName }</span>
                    <br />
                    <span className={pageStyles.hintStyle}>({categoryAllMapping.categorySuboption.name})</span>
                  </>
                );
              }
            }
            return "-";
          }
        }))
    ),
    {
      title: "总价（美元）",
      dataIndex: "totalPriceInUSD",
      key: "totalPriceInUSD",
      fixed: "left",
      align: "right",
      render: (value: string, record: QuotationHistory) => (
        <>
          <p>{ new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value)) }</p>
          <p className={pageStyles.hintStyle}>汇率：$1 = {new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(record.exchangeRateUSDToCNY)}</p>
        </>
      )
    },
    {
      title: "总价（元）",
      dataIndex: "totalPriceInCNY",
      key: "totalPriceInCNY",
      fixed: "left",
      align: "right",
      render: (value: string) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(Number(value))
    },
    {
      title: "总成本（元）",
      dataIndex: "totalCostInCNY",
      key: "totalCostInCNY",
      fixed: "left",
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
      align: "right",
      render: (value: string) => value || "-"
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
      align: "right",
      render: (value: string) => value || "-"
    },
    {
      title: "材料费（元）",
      dataIndex: "materialCost",
      key: "materialCost",
      align: "right",
      render: (value: string) => value || "-"
    },
    {
      title: "复合费（元）",
      dataIndex: "laminationCost",
      key: "laminationCost",
      align: "right",
      render: (value: string) => value || "-"
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
  ], [categoryOptions, maxMaterialDisplayByCategoryOptions]);

  useEffect(() => {
    dispatch(fetchCategoryOptions());
    dispatch(fetchQuotationHistories(1));
  }, []);

  useEffect(() => {
    console.log(list);
  }, [list]);

  useEffect(() => {
    console.log("categoryOptions: ", categoryOptions);
    if (categoryOptions.length > 0) {
      dispatch(fetchMaxDisplayIndexByCategoryOptionIds(categoryOptions.map(({id}) => id)));
    }
  }, [dispatch, categoryOptions]);

  /**
  useEffect(() => {
    console.log("maxMaterialDisplayByCategoryOptions: ", maxMaterialDisplayByCategoryOptions);
    if (maxMaterialDisplayByCategoryOptions.length > 0 && categoryOptions.length > 0) {
      for (let i: number = 0; i < categoryOptions.length; ++i) {
        const categoryOption: CategoryOption = categoryOptions[i];
        const maxMaterialDisplayByCategoryOption: MaxMaterialDisplayByCategoryOption | undefined = maxMaterialDisplayByCategoryOptions.find(({categoryOptionId}) => categoryOptionId === categoryOption.id);
        if (maxMaterialDisplayByCategoryOption && maxMaterialDisplayByCategoryOption.index > 0) {
          categoryOptions[i] = {
            ...categoryOption,
            chineseName: `${categoryOption.chineseName} 1`,
            name: `${categoryOption.name} 1`
          };
          ++i;
          for (let j: number = 1; j <= maxMaterialDisplayByCategoryOption.index; ++j) {
            categoryOptions.splice(i, 0, {
              ...categoryOption,
              chineseName: `${categoryOption.chineseName} ${j + 1}`,
              name: `${categoryOption.name} ${j + 1}`
            });
            ++i;
          }
        }
      }
    }
  }, [maxMaterialDisplayByCategoryOptions, categoryOptions]);
   */

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
        pageSize: 20,
        total: totalItems
      }}
    />
  );
}