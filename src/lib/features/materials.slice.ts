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

  /*========== Display Properties ==========*/
  /*===== Digital printing =====*/
  digitalPrinting: boolean;
  digitalLayer1: boolean;
  digitalLayer2: boolean;
  digitalLayer3: boolean;
  digitalInner: boolean;

  /*===== Offset printing =====*/
  offsetPrinting: boolean;
  offsetLayer1: boolean;
  offsetLayer2: boolean;
  offsetLayer3: boolean;
  offsetInner: boolean;

  /*===== Gravure printing =====*/
  gravurePrinting: boolean;
  gravureLayer1: boolean;
  gravureLayer2: boolean;
  gravureLayer3: boolean;
  gravureInner: boolean;
};

export interface Material extends NewMaterial {
  createdAt: Date;
};

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
          remarks: "",
          digitalPrinting: false,
          digitalLayer1: false,
          digitalLayer2: false,
          digitalLayer3: false,
          digitalInner: false,
          offsetPrinting: false,
          offsetLayer1: false,
          offsetLayer2: false,
          offsetLayer3: false,
          offsetInner: false,
          gravurePrinting: false,
          gravureLayer1: false,
          gravureLayer2: false,
          gravureLayer3: false,
          gravureInner: false,
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
    [fetchMaterials.pending, updateOrCreatMaterial.pending, deleteMaterial.pending].forEach((asyncPendingAction) => {
      builder.addCase(asyncPendingAction, (state: MaterialsState) => {
        state.loading = true;
      });
    });
    [fetchMaterials.rejected, updateOrCreatMaterial.rejected, deleteMaterial.rejected].forEach((asyncRejectedAction) => {
      builder.addCase(asyncRejectedAction, (state: MaterialsState, action: PayloadAction<unknown, string, unknown, SerializedError>) => {
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
  }
});

export const {
  addRecord,
  deleteAddingRecord
} = materialsSlice.actions;

export default materialsSlice.reducer;
