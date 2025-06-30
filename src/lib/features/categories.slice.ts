import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction, SerializedError } from "@reduxjs/toolkit";

const { get } = useRequest();

export interface NewCategory {
  name: string;
  chineseName: string;
}

export interface Category extends NewCategory {
  id: number;
  createdAt: Date;
};

export interface ProductSubcategory extends Category {
  hasGusset: boolean;
  isVisible: boolean;
}

export interface CategorySuboption extends Category {
  /**
   * Unit Price per Square Meter
   * CNY/m²
   */
  unitPricePerSquareMeter: number;
}

export interface PrintingType extends Category {}

export interface CategoryOption extends Category {
  isMaterial: boolean;
  isRequired: boolean;
}

interface CategoriesState {
  categoryOptions: CategoryOption[];
  loading: boolean;
}

const initialState = {
  categoryOptions: [],
  loading: false
};

export const fetchCategoryOptions = createAsyncThunk<CategoryOption[], void>(
  "categories/categoryOptions",
  async (): Promise<CategoryOption[]> => {
    const {data, error} = await get<{}, CategoryOption[]>("/categories/options");
    if (error) {
      throw error;
    }
    return data || [];
  }
);

export const categoriesSlice = createSlice({
  name: "categories",
  initialState: initialState,
  reducers: {
  },
  extraReducers: (builder: ActionReducerMapBuilder<CategoriesState>) => {
    [fetchCategoryOptions].forEach((asyncThunk) => {
      builder.addCase(asyncThunk.pending, (state: CategoriesState) => {
        state.loading = true;
      });
      builder.addCase(asyncThunk.rejected, (state: CategoriesState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("categories slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchCategoryOptions.fulfilled, (state: CategoriesState, action: PayloadAction<CategoryOption[]>) => {
      state.categoryOptions = action.payload;
      state.loading = false;
    });
  }
});

export const {
} = categoriesSlice.actions;

export default categoriesSlice.reducer;