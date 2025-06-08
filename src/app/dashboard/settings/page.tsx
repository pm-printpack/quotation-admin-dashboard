"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Card, Flex, InputNumber, Space } from "antd";
import styles from "./page.module.css";
import { SyncOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ExhangeRate, findExhangeRate, updateExhangeRate } from "@/lib/features/exchange.slice";
import { RootState } from "@/lib/store";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const exchangeRate: ExhangeRate | undefined = useAppSelector((state: RootState) => state.exchange.exchangeRate);
  const [exchangeRateValue, setExchangeRateValue] = useState<number | undefined>(exchangeRate?.rate);

  useEffect(() => {
    dispatch(findExhangeRate());
  }, [dispatch]);

  useEffect(() => {
    setExchangeRateValue(exchangeRate?.rate);
  }, [exchangeRate]);

  const updateExchangeRateCallback = useDebouncedCallback((value: number) => {
    if (!exchangeRate) {
      return;
    }
    dispatch(updateExhangeRate({
      id: exchangeRate.id,
      rate: value,
      baseCurrencyCode: exchangeRate.baseCurrencyCode
    }));
  }, 250);

  const onExchangeRateChange = useCallback((value: number | string | null) => {
    if (value) {
      setExchangeRateValue(Number(value));
      if (exchangeRate) {
        updateExchangeRateCallback(Number(value));
      }
    }
  }, [dispatch, exchangeRate, updateExchangeRateCallback]);

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Card title="汇率（Exchange Rate）" variant="borderless" hoverable={true}>
        <Flex vertical={false} align="center" gap={16}>
          <InputNumber addonBefore="$" addonAfter="USD" defaultValue={1} readOnly className={styles.currencyInput} />
          <SyncOutlined spin />
          <InputNumber addonBefore="¥" addonAfter="CNY" step={0.01} className={styles.currencyInput} value={exchangeRateValue} onChange={onExchangeRateChange} />
        </Flex>
      </Card>
    </Space>
  );
}