import { ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import { Customer } from "./customers.slice";
import { useRequest } from "@/hooks/useRequest";
import { MaterialDisplay } from "./materials.slice";
import { CategoryPrintingType, CategoryProductSubcategory, CategoryAllMapping } from "./categories.slice";

const {get} = useRequest();

export interface DigitalPrintingQuotationHistory {
  /**
   * 印刷宽度（mm）
   */
  printingWidth: string;

  /**
   * 横向印刷数
   */
  horizontalLayoutCount: string;

  /**
   * 每印袋数
   */
  numOfBagsPerPrinting: string;

  /**
   * 印刷长度（m）
   */
  printingLength: string;

  /**
   * 印数
   */
  printingQuantity: string;
}

export interface OffsetPrintingQuotationHistory {
  /**
   * 匹配模数
   */
  numOfMatchedModulus: string;

  /**
   * 匹配周长
   */
  matchedPerimeter: string;

  /**
   * 倍数
   */
  multiple: string;

  /**
   * 印刷用SKU数
   */
  numOfSKUs4Printing: string;

  /**
   * 材料宽度（mm）
   */
  materialWidth: string;

  /**
   * 印刷宽度（mm）
   */
  printingWidth: string;

  /**
   * 印刷长度（m）
   */
  printingLength: string;
}

export interface GravurePrintingQuotationHistory {
  /**
   * 材料宽度（mm）
   */
  materialWidth: string;

  /**
   * 版长（mm）
   */
  plateLength: string;

  /**
   * 单袋印刷长/mm
   */
  printingLengthPerPackage: string;

  /**
   * 版周/mm
   */
  platePerimeter: string;

  /**
   * 版费（元）
   */
  plateFee: string;
}

export interface QuotationHistory {
  id: number;
  customer: Customer;
  categoryProductSubcategory: CategoryProductSubcategory;
  categoryPrintingType: CategoryPrintingType;

  width: string;
  height: string;
  gusset?: string;

  /**
   * number of SKU
   */
  numOfStyles: string;

  /**
   * quantity of per SKU
   */
  quantityPerStyle: string;

  /**
   * total quantity of SKU
   */
  totalQuantity: string;

  categoryAllMappings: CategoryAllMapping[];

  materialDisplays: MaterialDisplay[];

  /**
   * 成本总价（元）
   */
  totalCostInCNY: number;

  /**
   * 总价（元）
   */
  totalPriceInCNY: number;

  /**
   * 总价（美元）
   */
  totalPriceInUSD: number;

  /**
   * 记录时的汇率，1美元兑多少RMB
   */
  exchangeRateUSDToCNY: number;

  /**
   * 材料面积（㎡）
   */
  materialArea: string;

  /**
   * 印刷费（元）
   */
  printingCost: string;

  /**
   * 材料费（元）
   */
  materialCost: string;

  /**
   * 复合费（元）
   */
  laminationCost: string;

  /**
   * 制袋费（元）
   */
  bagMakingCost: string;

  /**
   * 刀模费（元）
   */
  dieCuttingCost: string;

  /**
   * 包装费（元）
   */
  packagingCost: string;

  /**
   * 人工费（元）
   */
  laborCost: number;

  /**
   * 文件处理费（元）
   */
  fileProcessingFee: number;

  digitalPrinting?: DigitalPrintingQuotationHistory;
  offsetPrinting?: OffsetPrintingQuotationHistory;
  gravurePrinting?: GravurePrintingQuotationHistory;

  createdAt: Date;
}

interface QuotationHistoriesState {
  list: QuotationHistory[];
  totalItems: number;
  currentPage: number;
  loading: boolean;
}

interface PaginationOnQuotationHistoriesData {
  data: QuotationHistory[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  }
}

const initialState: QuotationHistoriesState = {
  list: [],
  totalItems: 0,
  currentPage: 1,
  loading: false
};

export const fetchQuotationHistories = createAsyncThunk<PaginationOnQuotationHistoriesData, number>(
  "quotationHistories/list",
  async (page: number): Promise<PaginationOnQuotationHistoriesData> => {
    const limit: number = 20;
    const {data, error} = await get<{}, PaginationOnQuotationHistoriesData>(`/quotation-histories?page=${page}&limit=${limit}`);
    if (error) {
      throw error;
    }
    return data || {data:[], meta: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: 0,
      totalPages: page
    }};
  }
);

export const quotationHistoriesSlice = createSlice({
  name: "quotationHistories",
  initialState: initialState,
  reducers: {
  },
  extraReducers: (builder: ActionReducerMapBuilder<QuotationHistoriesState>) => {
    [fetchQuotationHistories].forEach((asyncThunk) => {
      builder.addCase(asyncThunk.pending, (state: QuotationHistoriesState) => {
        state.loading = true;
      });
      builder.addCase(asyncThunk.rejected, (state: QuotationHistoriesState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("quotation histories slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchQuotationHistories.fulfilled, (state: QuotationHistoriesState, action: PayloadAction<PaginationOnQuotationHistoriesData>) => {
      const {data, meta} = action.payload;
      state.list = data;
      state.totalItems = meta.totalItems;
      state.currentPage = meta.currentPage;
      state.loading = false;
    });
  }
});

export const {
} = quotationHistoriesSlice.actions;

export default quotationHistoriesSlice.reducer;