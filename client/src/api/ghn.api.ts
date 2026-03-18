const GHN_MASTER_DATA_BASE_URL =
  "https://online-gateway.ghn.vn/shiip/public-api/master-data";

type GhnResponse<T> = {
  code: number;
  message: string;
  data: T;
};

export type GhnProvince = {
  ProvinceID: number;
  ProvinceName: string;
};

export type GhnDistrict = {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
};

export type GhnWard = {
  WardCode: string;
  DistrictID: number;
  WardName: string;
};

function buildHeaders(hasBody: boolean) {
  const token = process.env.NEXT_PUBLIC_GHN_TOKEN?.trim();
  if (!token) {
    throw new Error("Thiếu cấu hình NEXT_PUBLIC_GHN_TOKEN để gọi API GHN.");
  }

  const shopId = process.env.NEXT_PUBLIC_GHN_SHOP_ID?.trim();
  const headers: HeadersInit = {
    Token: token,
  };

  if (shopId) {
    headers.ShopId = shopId;
  }

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function requestGhn<T>(
  path: string,
  options?: { method?: "GET" | "POST"; body?: Record<string, unknown> },
) {
  const method = options?.method ?? "GET";
  const hasBody = Boolean(options?.body);

  const response = await fetch(`${GHN_MASTER_DATA_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(hasBody),
    body: hasBody ? JSON.stringify(options?.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Không thể gọi API GHN (${response.status}).`);
  }

  const payload = (await response.json()) as GhnResponse<T>;
  if (payload.code !== 200) {
    throw new Error(payload.message || "API GHN trả về dữ liệu không hợp lệ.");
  }

  return payload.data;
}

export const GhnApi = {
  getProvinces: async () => {
    const provinces = await requestGhn<GhnProvince[]>("/province");
    return [...provinces].sort((a, b) =>
      a.ProvinceName.localeCompare(b.ProvinceName, "vi"),
    );
  },

  getDistricts: async (provinceId?: number) => {
    const districts = await requestGhn<GhnDistrict[]>("/district", {
      method: "POST",
      body:
        Number.isFinite(provinceId) && Number(provinceId) > 0
          ? { province_id: Number(provinceId) }
          : {},
    });

    return [...districts].sort((a, b) =>
      a.DistrictName.localeCompare(b.DistrictName, "vi"),
    );
  },

  getDistrictsByProvince: async (provinceId: number) => {
    if (!Number.isFinite(provinceId) || provinceId <= 0) {
      return [] as GhnDistrict[];
    }

    return GhnApi.getDistricts(provinceId);
  },

  getWardsByDistrict: async (districtId: number) => {
    if (!Number.isFinite(districtId) || districtId <= 0) {
      return [] as GhnWard[];
    }

    const wards = await requestGhn<GhnWard[]>("/ward", {
      method: "POST",
      body: { district_id: districtId },
    });

    return [...wards].sort((a, b) =>
      a.WardName.localeCompare(b.WardName, "vi"),
    );
  },
};
