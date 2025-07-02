import { message } from "antd";
import axios, { AxiosRequestConfig, AxiosResponse, isAxiosError } from "axios";
import qs from "qs";

type ResponseBody<ResponseDataType = Record<string, any>> = {
  readonly statusCode: number;
  readonly data?: ResponseDataType | null;
  readonly message?: string | null;
};

type Response<ResponseDataType = Record<string, any>> = {
  readonly data?: ResponseDataType | null;
  readonly error?: Error;
};

async function request<RequestDataType = any, ResponseDataType = Record<string, any>>(method: string, path: string, data?: RequestDataType, requestConfig?: AxiosRequestConfig<RequestDataType>): Promise<Response<ResponseDataType>> {
  try {
    const token: string | null = localStorage.getItem("jwtToken");
    if (!token && !/\/login$/.test(path)) {
      throw new Error("Unauthorized");
    }
    console.log((method.toLowerCase() === "get" ? {params: data} : {data: data}));
    const { data: responseData }: AxiosResponse<ResponseBody<ResponseDataType>, RequestDataType> = await axios({
      url: `${process.env.NEXT_PUBLIC_API_BASE}${path}`,
      ...(
        method.toLowerCase() === "get"
        ?
        {
          params: data,
          paramsSerializer: function (params) {
            return qs.stringify(params, {arrayFormat: "comma"})
          }
        }
        :
        {data: data}
      ),
      headers: {
        ...(token ? {"Authorization": `Bearer ${token}`} : {}),
        "Content-Type": "application/json",
        ...requestConfig?.headers
      },
      ...requestConfig,
      method: method
    });
    if (responseData.statusCode >= 400 && responseData.statusCode < 600) {
      throw new Error(responseData.message || "System error");
    }
    return {
      data: responseData.data
    };
  } catch (error) {
    let newError: Error;
    if (isAxiosError(error)) {
      if (error.response) {
        newError = new Error(error.response.data.message || "Service error");
      } else if (error.request) {
        newError = new Error(error.request);
      } else {
        newError = new Error(error.message);
      }
    } else {
      newError = new Error((error as Error).message || "Client error");
    }
    message.error(newError.message);
    return {
      error: newError
    };
  }
}

function _get<RequestDataType extends Record<string, any>, ResponseDataType extends Record<string, any>>(path: string, data?: RequestDataType, requestConfig?: AxiosRequestConfig<RequestDataType>) {
  return request<RequestDataType, ResponseDataType>("GET", path, data, requestConfig);
}

function _post<RequestDataType = any, ResponseDataType = Record<string, any>>(path: string, data?: RequestDataType, requestConfig?: AxiosRequestConfig<RequestDataType>) {
  return request<RequestDataType, ResponseDataType>("POST", path, data, requestConfig);
}

function _put<RequestDataType = any, ResponseDataType = Record<string, any>>(path: string, data?: RequestDataType, requestConfig?: AxiosRequestConfig<RequestDataType>) {
  return request<RequestDataType, ResponseDataType>("PUT", path, data, requestConfig);
}

function _patch<RequestDataType = any, ResponseDataType = Record<string, any>>(path: string, data?: RequestDataType, requestConfig?: AxiosRequestConfig<RequestDataType>) {
  return request<RequestDataType, ResponseDataType>("PATCH", path, data, requestConfig);
}

function _delete<RequestDataType = any, ResponseDataType = Record<string, any>>(path: string, data?: RequestDataType, requestConfig?: AxiosRequestConfig<RequestDataType>) {
  return request<RequestDataType, ResponseDataType>("DELETE", path, data, requestConfig);
}

export function useRequest() {
  return {
    get: _get,
    post: _post,
    put: _put,
    patch: _patch,
    delete: _delete
  };
}