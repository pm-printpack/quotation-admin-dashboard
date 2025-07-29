"use client";
import { DigitalPrintingQuotationHistory, fetchQuotationHistories, GravurePrintingQuotationHistory, OffsetPrintingQuotationHistory, QuotationHistory } from "@/lib/features/quotation-histories.slice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { Button, Divider, Flex, Space, Table, TableColumnsType, TableColumnType, TablePaginationConfig, Tooltip } from "antd";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import { createStyles } from "antd-style";
import { Customer } from "@/lib/features/customers.slice";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import pageStyles from "./page.module.css";
import { CategoryOption, fetchCategoryOptions, CategoryPrintingType, CategoryProductSubcategory, CategoryAllMapping, CategoryOptionWithIndex } from "@/lib/features/categories.slice";
import { fetchMaxDisplayIndexByCategoryOptionIds, Material, MaterialDisplay, MaxMaterialDisplayByCategoryOption } from "@/lib/features/materials.slice";
import { useTranslations } from "next-intl";
import { getBrowserLocale } from "@/lib/i18n";

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
  const t = useTranslations("quotation-histories");
  const isZhCN: boolean = useMemo(() => getBrowserLocale() === "zh-CN", []);
  const categoryOptions: CategoryOption[] = useAppSelector((state: RootState) => state.categories.categoryOptions);
  const maxMaterialDisplayByCategoryOptions: MaxMaterialDisplayByCategoryOption[] = useAppSelector((state: RootState) => state.materials.maxDisplays);
  const list: QuotationHistory[] = useAppSelector((state: RootState) => state.quotationHistories.list);
  const totalItems: number = useAppSelector((state: RootState) => state.quotationHistories.totalItems);
  const currentPage: number = useAppSelector((state: RootState) => state.quotationHistories.currentPage);
  const loading: boolean = useAppSelector((state: RootState) => state.quotationHistories.loading);

  const { styles } = useStyle();

  const columns: TableColumnsType<QuotationHistory> = useMemo(() => [
    {
      title: t("list.columns.username"),
      width: 100,
      dataIndex: "customer",
      key: "customer",
      fixed: "left",
      render: (customer: Customer) => customer.username
    },
    {
      title: t("list.columns.quotationDate"),
      width: 120,
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt: string) => dayjs.tz(new Date(createdAt), "Asia/Shanghai").format("YYYY-MM-DD HH:mm:ss")
    },
    {
      title: t("list.columns.recordId"),
      dataIndex: "id",
      key: "id",
      align: "center"
    },
    {
      title: t("list.columns.bagFormat"),
      width: 125,
      fixed: "left",
      dataIndex: "categoryProductSubcategory",
      key: "categoryProductSubcategory",
      render: (categoryProductSubcategory: CategoryProductSubcategory) => (
        <>
          <span>{ isZhCN ? categoryProductSubcategory.chineseName : categoryProductSubcategory.name }</span>
          <br />
          <span className={pageStyles.hintStyle}>({isZhCN ? categoryProductSubcategory.name : categoryProductSubcategory.chineseName})</span>
        </>
      )
    },
    {
      title: t("list.columns.printingMethod"),
      width: 120,
      fixed: "left",
      dataIndex: "categoryPrintingType",
      key: "categoryPrintingType",
      render: (categoryPrintingType: CategoryPrintingType) => (
        <>
          <span>{ isZhCN ? categoryPrintingType.chineseName : categoryPrintingType.name }</span>
          <br />
          <span className={pageStyles.hintStyle}>({isZhCN ? categoryPrintingType.name : categoryPrintingType.chineseName})</span>
        </>
      )
    },
    {
      title: t("list.columns.width"),
      dataIndex: "width",
      key: "width",
      align: "right",
      render: (value: string) => new Intl.NumberFormat().format(Number(value))
    },
    {
      title: t("list.columns.height"),
      dataIndex: "height",
      key: "height",
      align: "right",
      render: (value: string) => new Intl.NumberFormat().format(Number(value))
    },
    {
      title: t("list.columns.gusset"),
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
      title: t("list.columns.quantityPerSKU"),
      dataIndex: "quantityPerStyle",
      key: "quantityPerStyle",
      align: "right",
      render: (value: string) => new Intl.NumberFormat().format(Number(value))
    },
    {
      title: t("list.columns.totalQuantity"),
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
          title: isZhCN ? categoryOption.chineseName : categoryOption.name,
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
                      <span>{ isZhCN ? materialDisplay.material.chineseName : materialDisplay.material.name }</span>
                      <br />
                      <span className={pageStyles.hintStyle}>({isZhCN ? materialDisplay.material.name : materialDisplay.material.chineseName})</span>
                    </>
                  );
                }
              }
              return "-";
            } else {
              const categoryAllMappings: CategoryAllMapping[] = record.categoryAllMappings.filter((mapping) => mapping.categoryOption?.id === categoryOption.id);
              if (categoryAllMappings.length > 0) {
                return categoryAllMappings.map((categoryAllMapping: CategoryAllMapping, index: number) => (
                  <Fragment key={`categoryAllMapping-${categoryAllMapping.id}-${index}`}>
                    {
                      index > 0
                      ?
                      <Divider size="small" />
                      :
                      null
                    }
                    <span>{ isZhCN ? categoryAllMapping.categorySuboption?.chineseName : categoryAllMapping.categorySuboption?.name }</span>
                    <br />
                    <span className={pageStyles.hintStyle}>({isZhCN ? categoryAllMapping.categorySuboption?.name : categoryAllMapping.categorySuboption?.chineseName})</span>
                  </Fragment>
                ));
              }
            }
            return "-";
          }
        }))
    ),
    {
      title: t("list.columns.totalPriceUSD"),
      dataIndex: "totalPriceInUSD",
      key: "totalPriceInUSD",
      fixed: "left",
      align: "right",
      render: (value: string, record: QuotationHistory) => (
        <>
          <p>{ new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value)) }</p>
          <p className={pageStyles.hintStyle}>{t("list.columns.exchangeRatelabel")}$1 = {new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(record.exchangeRateUSDToCNY)}</p>
        </>
      )
    },
    {
      title: t("list.columns.totalPriceCNY"),
      dataIndex: "totalPriceInCNY",
      key: "totalPriceInCNY",
      fixed: "left",
      align: "right",
      render: (value: string) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(Number(value))
    },
    {
      title: t("list.columns.totalCostCNY"),
      dataIndex: "totalCostInCNY",
      key: "totalCostInCNY",
      fixed: "left",
      align: "right",
      render: (value: string) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(Number(value))
    },
    {
      title: t("list.columns.matchingModulus"),
      dataIndex: "offsetPrinting",
      key: "offsetPrinting.numOfMatchedModulus",
      align: "right",
      render: (offsetPrinting?: OffsetPrintingQuotationHistory) => offsetPrinting?.numOfMatchedModulus || "-"
    },
    {
      title: t("list.columns.matchedPerimeter"),
      dataIndex: "offsetPrinting",
      key: "offsetPrinting.matchedPerimeter",
      align: "right",
      render: (offsetPrinting?: OffsetPrintingQuotationHistory) => offsetPrinting?.matchedPerimeter || "-"
    },
    {
      title: t("list.columns.multiple"),
      dataIndex: "offsetPrinting",
      key: "offsetPrinting.multiple",
      align: "right",
      render: (offsetPrinting?: OffsetPrintingQuotationHistory) => offsetPrinting?.multiple || "-"
    },
    {
      title: t("list.columns.numOfSKUs4Printing"),
      dataIndex: "offsetPrinting",
      key: "offsetPrinting.numOfSKUs4Printing",
      align: "right",
      render: (offsetPrinting?: OffsetPrintingQuotationHistory) => offsetPrinting?.numOfSKUs4Printing ? new Intl.NumberFormat().format(Number(offsetPrinting.numOfSKUs4Printing)) : "-"
    },
    {
      title: t("list.columns.printingWidth"),
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
      title: t("list.columns.materialWidth"),
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
      title: t("list.columns.horizontalLayoutCount"),
      dataIndex: "digitalPrinting",
      key: "digitalPrinting.horizontalLayoutCount",
      align: "right",
      render: (digitalPrinting?: DigitalPrintingQuotationHistory) => digitalPrinting?.horizontalLayoutCount || "-"
    },
    {
      title: t("list.columns.numOfBagsPerPrinting"),
      dataIndex: "digitalPrinting",
      key: "digitalPrinting.numOfBagsPerPrinting",
      align: "right",
      render: (digitalPrinting?: DigitalPrintingQuotationHistory) => digitalPrinting?.numOfBagsPerPrinting || "-"
    },
    {
      title: t("list.columns.printingLength"),
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
      title: t("list.columns.plateLength"),
      dataIndex: "gravurePrinting",
      key: "gravurePrinting.plateLength",
      align: "right",
      render: (gravurePrinting: GravurePrintingQuotationHistory) => gravurePrinting?.plateLength || "-"
    },
    {
      title: t("list.columns.printingLengthPerPackage"),
      dataIndex: "gravurePrinting",
      key: "gravurePrinting.printingLengthPerPackage",
      align: "right",
      render: (gravurePrinting: GravurePrintingQuotationHistory) => gravurePrinting?.printingLengthPerPackage || "-"
    },
    {
      title: t("list.columns.platePerimeter"),
      dataIndex: "gravurePrinting",
      key: "gravurePrinting.platePerimeter",
      align: "right",
      render: (gravurePrinting: GravurePrintingQuotationHistory) => gravurePrinting?.platePerimeter || "-"
    },
    {
      title: t("list.columns.materialArea"),
      dataIndex: "materialArea",
      key: "materialArea",
      align: "right",
      render: (value: string) => value || "-"
    },
    {
      title: t("list.columns.printingQuantity"),
      dataIndex: "digitalPrinting",
      key: "digitalPrinting.printingQuantity",
      align: "right",
      render: (digitalPrinting?: DigitalPrintingQuotationHistory) => digitalPrinting?.printingQuantity || "-"
    },
    {
      title: t("list.columns.printingCost"),
      dataIndex: "printingCost",
      key: "printingCost",
      align: "right",
      render: (value: string) => value || "-"
    },
    {
      title: t("list.columns.materialCost"),
      dataIndex: "materialCost",
      key: "materialCost",
      align: "right",
      render: (value: string) => value || "-"
    },
    {
      title: t("list.columns.laminationCost"),
      dataIndex: "laminationCost",
      key: "laminationCost",
      align: "right",
      render: (value: string) => value || "-"
    },
    {
      title: t("list.columns.bagMakingCost"),
      dataIndex: "bagMakingCost",
      key: "bagMakingCost",
      align: "right",
      render: (value: string) => new Intl.NumberFormat().format(Number(value))
    },
    {
      title: t("list.columns.dieCuttingCost"),
      dataIndex: "dieCuttingCost",
      key: "dieCuttingCost",
      align: "right",
      render: (value: string) => new Intl.NumberFormat().format(Number(value))
    },
    {
      title: t("list.columns.plateFee"),
      dataIndex: "gravurePrinting",
      key: "gravurePrinting.plateFee",
      align: "right",
      render: (gravurePrinting: GravurePrintingQuotationHistory) => gravurePrinting?.plateFee ? new Intl.NumberFormat().format(Number(gravurePrinting.plateFee)) : "-"
    },
    {
      title: t("list.columns.packagingCost"),
      dataIndex: "packagingCost",
      key: "packagingCost",
      align: "right",
      render: (value: string) => new Intl.NumberFormat().format(Number(value))
    },
    {
      title: t("list.columns.laborCost"),
      dataIndex: "laborCost",
      key: "laborCost",
      align: "right",
      render: (value: string) => new Intl.NumberFormat().format(Number(value))
    },
    {
      title: t("list.columns.fileProcessingFee"),
      dataIndex: "fileProcessingFee",
      key: "fileProcessingFee",
      align: "right",
      render: (value: string) => new Intl.NumberFormat().format(Number(value))
    }
  ], [isZhCN, categoryOptions, maxMaterialDisplayByCategoryOptions]);

  useEffect(() => {
    dispatch(fetchCategoryOptions());
    dispatch(fetchQuotationHistories(1));
  }, []);

  useEffect(() => {
    console.log("categoryOptions: ", categoryOptions);
    if (categoryOptions.length > 0) {
      dispatch(fetchMaxDisplayIndexByCategoryOptionIds(categoryOptions.map(({id}) => id)));
    }
  }, [dispatch, categoryOptions]);

  const onPaginationChange = useCallback((pagination: TablePaginationConfig) => {
    dispatch(fetchQuotationHistories(pagination.current || 1));
  }, []);

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
      onChange={onPaginationChange}
    />
  );
}