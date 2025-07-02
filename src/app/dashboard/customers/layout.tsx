"use client";
import { Layout, Tabs, TabsProps, theme } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { PropsWithChildren, useCallback, useMemo } from "react";
import styles from "./layout.module.css";
import { usePathname, useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function CustomersLayout({children}: PropsWithChildren) {
  const { token: { colorBgContainer } } = theme.useToken();
  const pathname: string = usePathname();
  const router: AppRouterInstance = useRouter();
  const defaultActiveKey: string = useMemo(() => `/${(pathname.match(/^\/dashboard\/customers\/([a-zA-Z0-9\-_]*\/?)/) || [])[1] || "list"}`, [pathname]);

  const items: TabsProps["items"] = [
    {
      key: "/list/",
      label: "客户列表",
      children: children
    },
    {
      key: "/tiers/",
      label: "客户等级",
      children: children
    }
  ];

  const onChange = useCallback((activeKey: string) => {
    router.push(`/dashboard/customers${activeKey}`);
  }, [router]);

  return (
    <Layout className={styles.layoutContainer}>
      <Header style={{ backgroundColor: colorBgContainer }} className={styles.layoutHeader}>
        <Title level={2}>Customers</Title>
      </Header>
      <Content style={{ backgroundColor: colorBgContainer }}>
        <Tabs defaultActiveKey={defaultActiveKey} items={items} onChange={onChange} />
      </Content>
    </Layout>
  )
}