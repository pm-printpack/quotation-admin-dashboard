import { useRequest } from "@/hooks/useRequest";
import { ActionReducerMapBuilder, PayloadAction, SerializedError, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const { get, post, patch, delete: deleteFn } = useRequest();

type NewMaterial = {
  id: number;
  name: string;
  chineseName: string;

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
   * Unit price by weight of material
   * Unit is RMB/kg
   */
  unitPrice: number;

  remarks: string;
};

export interface Material extends NewMaterial {
  displays: MaterialDisplay[];
  createdAt: Date;
};

type Category = {
  id: number;
  name: string;
  chineseName: string;
};

export interface MaterialDisplay {
  id: number;
  categoryPrintingType: Category;
  categoryOption: Category;
  material: Material
  isActive: boolean;
  index: number;
}

interface MaterialsState {
  list: Material[];
  loading: boolean;
}

const initialState: MaterialsState = {
  list: [],
  loading: false
};

export const fetchMaterials = createAsyncThunk<Material[], void>(
  "materials/list",
  async (): Promise<Material[]> => {
    const {data, error} = await get<{}, Material[]>("/materials");
    if (error) {
      throw error;
    }
    return data || [];
  }
);

type UpdateOrCreatMaterialParams = {
  id: number;
  material: Partial<Material> | NewMaterial;
};

export const updateOrCreatMaterial = createAsyncThunk<void, UpdateOrCreatMaterialParams>(
  "materials/updateOrCreat",
  async ({id, material}: UpdateOrCreatMaterialParams, {dispatch}): Promise<void> => {
    if (id === -1) { // create a new one
      const {id, ...newMaterial} = material as NewMaterial;
      const {error} = await post<Omit<NewMaterial, "id">>("/materials", newMaterial);
      if (error) {
        throw error;
      }
      dispatch(fetchMaterials());
    } else {
      const {error} = await patch<Partial<Material>>(`/materials/${id}`, material);
      if (error) {
        throw error;
      }
    }
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
    const {error} = await patch<Partial<Material>>(`/materials/display/${id}`, materialDisplay);
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
          id: -1,
          name: "",
          chineseName: "",
          density: 0,
          thickness: 0,
          unitPrice: 0,
          remarks: ""
        } as Material,
        ...state.list
      ];
    },
    deleteAddingRecord: (state: MaterialsState) => {
      const index: number = state.list.findIndex((item: Material) => item.id === -1);
      if (index !== -1) {
        state.list.splice(index, 1);
        state.list = [...state.list];
      }
    }
  },
  extraReducers: (builder: ActionReducerMapBuilder<MaterialsState>) => {
    [fetchMaterials, updateOrCreatMaterial, updateMaterialDisplay, deleteMaterial].forEach((asyncThunk) => {
      builder.addCase(asyncThunk.pending, (state: MaterialsState) => {
        state.loading = true;
      });
      builder.addCase(asyncThunk.rejected, (state: MaterialsState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
        console.error("materials slice error: ", action.error);
        state.loading = false;
      });
    });
    builder.addCase(fetchMaterials.fulfilled, (state: MaterialsState, action: PayloadAction<Material[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(updateOrCreatMaterial.fulfilled, (state: MaterialsState, action: PayloadAction<void, string, {arg: UpdateOrCreatMaterialParams}>) => {
      const {id, material}: UpdateOrCreatMaterialParams = action.meta.arg;
      const targetIndex: number = state.list.findIndex((item: Material) => item.id === id);
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
