"use client";
import { Layout, theme } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { PropsWithChildren } from "react";
import styles from "./layout.module.css";
import { useTranslations } from "next-intl";

export default function SettingsLayout({children}: PropsWithChildren) {
  const t = useTranslations("settings");
  const { token: { colorBgContainer } } = theme.useToken();
  return (
    <Layout className={styles.layoutContainer}>
      <Header style={{ backgroundColor: colorBgContainer }} className={styles.layoutHeader}>
        <Title level={2}>{t("title")}</Title>
      </Header>
      <Content style={{ backgroundColor: colorBgContainer }}>{children}</Content>
    </Layout>
  )
}