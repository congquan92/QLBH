import {
  GhnApi,
  type GhnDistrict,
  type GhnProvince,
  type GhnWard,
} from "@/api/ghn.api";
import { useEffect, useMemo, useState } from "react";

function toPositiveInt(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function useGhnAddressOptions(
  selectedProvinceId: string,
  selectedDistrictId: string,
) {
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);

  const provinceId = useMemo(
    () => toPositiveInt(selectedProvinceId),
    [selectedProvinceId],
  );
  const districtId = useMemo(
    () => toPositiveInt(selectedDistrictId),
    [selectedDistrictId],
  );

  useEffect(() => {
    let active = true;

    void GhnApi.getProvinces()
      .then((items) => {
        if (!active) return;
        setProvinces(items);
      })
      .catch(() => {
        if (!active) return;
        setProvinces([]);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingProvinces(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!provinceId) {
      queueMicrotask(() => {
        if (!active) return;
        setDistricts([]);
        setWards([]);
        setIsLoadingDistricts(false);
        setIsLoadingWards(false);
      });
      return;
    }

    queueMicrotask(() => {
      if (!active) return;
      setIsLoadingDistricts(true);
      setWards([]);
    });

    void GhnApi.getDistrictsByProvince(provinceId)
      .then((items) => {
        if (!active) return;
        setDistricts(items);
      })
      .catch(() => {
        if (!active) return;
        setDistricts([]);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingDistricts(false);
      });

    return () => {
      active = false;
    };
  }, [provinceId]);

  useEffect(() => {
    let active = true;

    if (!districtId) {
      queueMicrotask(() => {
        if (!active) return;
        setWards([]);
        setIsLoadingWards(false);
      });
      return;
    }

    queueMicrotask(() => {
      if (!active) return;
      setIsLoadingWards(true);
    });

    void GhnApi.getWardsByDistrict(districtId)
      .then((items) => {
        if (!active) return;
        setWards(items);
      })
      .catch(() => {
        if (!active) return;
        setWards([]);
      })
      .finally(() => {
        if (!active) return;
        setIsLoadingWards(false);
      });

    return () => {
      active = false;
    };
  }, [districtId]);

  return {
    provinces,
    districts,
    wards,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
  };
}
