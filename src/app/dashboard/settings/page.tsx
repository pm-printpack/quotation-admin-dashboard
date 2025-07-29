"use client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Card, Flex, Form, InputNumber, Space } from "antd";
import styles from "./page.module.css";
import { SyncOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { ExhangeRate, findExhangeRate, updateExhangeRate } from "@/lib/features/exchange.slice";
import { RootState } from "@/lib/store";
import { findShippings, Shipping, ShippingType, updateShippingUnitPrice } from "@/lib/features/shippings.slice";
import { useTranslations } from "next-intl";
import { getBrowserLocale } from "@/lib/i18n";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const isZhCN: boolean = useMemo(() => getBrowserLocale() === "zh-CN", []);
  const dispatch = useAppDispatch();
  const exchangeRate: ExhangeRate | undefined = useAppSelector((state: RootState) => state.exchange.exchangeRate);
  const shippings: Shipping[] | undefined = useAppSelector((state: RootState) => state.shippings.shippings);
  const [exchangeRateValue, setExchangeRateValue] = useState<number | undefined>(exchangeRate?.rate);

  useEffect(() => {
    dispatch(findExhangeRate());
    dispatch(findShippings());
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

  const onShippingUnitPriceChange = useCallback((shippingType: ShippingType) => {
    return (value: number | string | null) => {
      if (value) {
        dispatch(updateShippingUnitPrice({
          unitPrice: Number(value),
          type: shippingType
        }));
      }
    };
  }, []);

  return (
    <Space direction="vertical" size="middle" style={{display: "flex"}}>
      <Card title={t("exchangeRateLabel")} variant="borderless" hoverable={true}>
        <Flex vertical={false} align="center" gap={16}>
          <InputNumber addonBefore="$" addonAfter="USD" defaultValue={1} readOnly className={styles.currencyInput} />
          <SyncOutlined spin />
          <InputNumber addonBefore="¥" addonAfter="CNY" step={0.01} className={styles.currencyInput} value={exchangeRateValue} onChange={onExchangeRateChange} />
        </Flex>
      </Card>
      <Card title={t("shippingtLabel")} variant="borderless" hoverable={true}>
        <Form labelCol={{ span: isZhCN ? 2 : 4 }} wrapperCol={{ span: isZhCN ? 22 : 20 }}>
          {
            shippings.map((shipping: Shipping) => (
              <Form.Item label={t(`shippingTypeUnitPriceLabel.${shipping.type}`)} key={shipping.id}>
                <InputNumber addonBefore="¥" addonAfter={t("weightUnit")} step={0.01} className={styles.currencyInput} value={shipping.unitPrice} onChange={onShippingUnitPriceChange(shipping.type)} />
              </Form.Item>
            ))
          }
        </Form>
      </Card>
    </Space>
  );
}