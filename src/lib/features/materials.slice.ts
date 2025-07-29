import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Category, CategoryOption, NewCategory, CategoryPrintingType } from "./categories.slice";

const { get, post, patch, delete: deleteFn } = useRequest();

export interface NewMaterial extends NewCategory {
  /**
   * Density of material
   * Unit is g/cm³
   */
  density: number;

  /**
   * Thickness of material
   * Unit is μm
   */
  thickness: number;

  /**
   * Unit Price per Square Meter
   * CNY/m²
   */
  unitPricePerSquareMeter: number;

  /**
   * Unit Price per Kelogram
   * CNY/kg
   */
  unitPricePerKg: number;

  /**
   * Weight per square centimeter of material
   * The unit is g/cm²
   */
  weightPerCm2: number;

  remarks: string;
};

export interface Material extends NewMaterial, Category {
  displays: MaterialDisplay[];
};

interface PaginationOnMaterialsData {
  data: Material[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  }
}

export interface MaterialDisplay {
  id: number;
  categoryPrintingType?: CategoryPrintingType;
  categoryPrintingTypeId: number;
  categoryOption?: CategoryOption;
  categoryOptionId: number;
  material?: Material;
  isActive: boolean;
  index: number;
}

export interface MaxMaterialDisplayByCategoryOption {
  categoryOptionId: number;
  index: number;
}

interface MaterialsState {
  list: Material[];
  totalItems: number;
  currentPage: number;
  maxDisplays: MaxMaterialDisplayByCategoryOption[];
  loading: boolean;
}

const initialState: MaterialsState = {
  list: [],
  totalItems: 0,
  currentPage: 1,
  maxDisplays: [],
  loading: false
};

export const fetchMaterials = createAsyncThunk<PaginationOnMaterialsData, number>(
  "materials/list",
  async (page: number): Promise<PaginationOnMaterialsData> => {
    const limit: number = 10;
    const {data, error} = await get<{}, PaginationOnMaterialsData>(`/materials?page=${page}&limit=${limit}`);
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

export const fetchMaxDisplayIndexByCategoryOptionIds = createAsyncThunk<MaxMaterialDisplayByCategoryOption[], number[]>(
  "materials/maxDisplays",
  async (categoryOptionIds: number[]): Promise<MaxMaterialDisplayByCategoryOption[]> => {
    const {data, error} = await get<{categoryOptionIds: number[]}, MaxMaterialDisplayByCategoryOption[]>("/materials/material-max-index", {categoryOptionIds: categoryOptionIds});
    if (error) {
      throw error;
    }
    return data || [];
  }
);

export const createMaterial = createAsyncThunk<void, NewMaterial>(
  "materials/create",
  async (material: NewMaterial, {dispatch}): Promise<void> => {
    const weightPerCm2: number = material.density * material.thickness / 10000;
    const {error} = await post<NewMaterial>("/materials", {
      ...material,
      weightPerCm2: weightPerCm2,
      unitPricePerSquareMeter: weightPerCm2 * material.unitPricePerKg * 10
    });
    if (error) {
      throw error;
    }
    dispatch(fetchMaterials(1));
  }
);

export type UpdatedMaterial = Required<Partial<Material> & {id: number}>;

type UpdatedMaterialParams = {
  material: UpdatedMaterial;
  preMaterial: Material;
};

export const updateMaterial = createAsyncThunk<Partial<Material>, UpdatedMaterialParams>(
  "materials/update",
  async ({material, preMaterial}: UpdatedMaterialParams): Promise<Partial<Material>> => {
    const {id, ...updatedMaterial} = material;
    const updatedWholeMaterial: Material = {
      ...preMaterial,
      ...material
    };
    const weightPerCm2: number = updatedWholeMaterial.density * updatedWholeMaterial.thickness / 10000;
    const data: Partial<Material> = {
      ...updatedMaterial,
      weightPerCm2: weightPerCm2,
      unitPricePerSquareMeter: weightPerCm2 * updatedWholeMaterial.unitPricePerKg * 10
    };
    const {error} = await patch<Partial<Material>>(`/materials/${id}`, data);
    if (error) {
      throw error;
    }
    return {
      id: id,
      ...data
    };
  }
);

type UpdateMaterialDisplayParams = {
  id: number;
  materialId: number;
  materialDisplay: Partial<MaterialDisplay>;
};

export const updateMaterialDisplay = createAsyncThunk<void, UpdateMaterialDisplayParams>(
  "materials/updateMaterialDisplay",
  async ({id, materialDisplay}: UpdateMaterialDisplayParams): Promise<void> => {
    const {error} = await patch<Partial<MaterialDisplay>>(`/materials/display/${id}`, materialDisplay);
    if (error) {
      throw error;
    }
  }
);

export const deleteMaterial = createAsyncThunk<void, number>(
  "materials/delete",
  async (id: number, thunkApi): Promise<void> => {
    const {error} = await deleteFn(`/materials/${id}`);
    if (error) {
      throw error;
    }
  }
);

export const materialsSlice = createSlice({
  name: "materials",
  initialState: initialState,
  reducers: {
    addRecord: (state: MaterialsState) => {
      state.list = [
        {
          name: "",
          chineseName: "",
          density: 0.001,
          thickness: 0.01,
          unitPricePerSquareMeter: 0,
          weightPerCm2: 0,
          unitPricePerKg: 0.01,
          remarks: ""
        } as Material,
        ...state.list
      ];
    },
    deleteAddingRecord: (state: MaterialsState) => {
      const index: number = state.list.findIndex((item: Material | NewMaterial) => !item.hasOwnProperty("id"));
      if (index !== -1) {
        state.list.splice(index, 1);
        state.list = [...state.list];
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<MaterialsState>) => {
    [fetchMaxDisplayIndexByCategoryOptionIds, fetchMaterials, createMaterial, updateMaterial, updateMaterialDisplay, deleteMaterial].forEach((asyncThunk) => {
      builder.addCase(asyncThunk.pending, (state: MaterialsState) => {
        state.loading = true;
      });
      builder.addCase(asyncThunk.rejected, (state: MaterialsState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("materials slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchMaxDisplayIndexByCategoryOptionIds.fulfilled, (state: MaterialsState, action: PayloadAction<MaxMaterialDisplayByCategoryOption[]>) => {
      state.maxDisplays = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchMaterials.fulfilled, (state: MaterialsState, action: PayloadAction<PaginationOnMaterialsData>) => {
      const {data, meta} = action.payload;
      state.list = data;
      state.totalItems = meta.totalItems;
      state.currentPage = meta.currentPage;
      state.loading = false;
    });
    builder.addCase(updateMaterial.fulfilled, (state: MaterialsState, action: PayloadAction<Partial<Material>, string, {arg: UpdatedMaterialParams}>) => {
      const material: Partial<Material> = action.payload;
      const targetIndex: number = state.list.findIndex((item: Material) => item.id === material.id);
      if (targetIndex > -1) { // targeted
        state.list[targetIndex] = {
          ...state.list[targetIndex],
          ...material
        };
        state.list = [...state.list];
      }
      state.loading = false;
    });
    builder.addCase(updateMaterialDisplay.fulfilled, (state: MaterialsState, action: PayloadAction<void, string, {arg: UpdateMaterialDisplayParams}>) => {
      const {id, materialId, materialDisplay}: UpdateMaterialDisplayParams = action.meta.arg;
      const targetIndex: number = state.list.findIndex((item: Material) => item.id === materialId);
      if (targetIndex > -1) { // targeted
        const materialDisplays: MaterialDisplay[] = state.list[targetIndex].displays;
        const targetMaterialDisplayIndex: number = materialDisplays.findIndex((item: MaterialDisplay) => item.id === id);
        if (targetMaterialDisplayIndex > -1) {
          materialDisplays[targetMaterialDisplayIndex] = {
            ...materialDisplays[targetMaterialDisplayIndex],
            ...materialDisplay
          };
          state.list[targetIndex] = {
            ...state.list[targetIndex],
            displays: [...materialDisplays]
          };
          state.list = [...state.list];
        }
      }
      state.loading = false;
    });
  }
});

export const {
  addRecord,
  deleteAddingRecord
} = materialsSlice.actions;

export default materialsSlice.reducer;
