"use client";
import { Layout, theme } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { PropsWithChildren } from "react";
import styles from "./layout.module.css";

export default function QuotationHistoriesLayout({children}: PropsWithChildren) {
  const { token: { colorBgContainer } } = theme.useToken();
  return (
    <Layout className={styles.layoutContainer}>
      <Header style={{ backgroundColor: colorBgContainer }} className={styles.layoutHeader}>
        <Title level={2}>Quotation History Records</Title>
      </Header>
      <Content style={{ backgroundColor: colorBgContainer }}>{children}</Content>
    </Layout>
  )
}