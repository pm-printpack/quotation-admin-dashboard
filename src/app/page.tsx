"use client";
import "@ant-design/v5-patch-for-react-19";
import styles from "./page.module.css";
import { Button, Layout, Menu, MenuProps, theme } from "antd";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import Sider from "antd/es/layout/Sider";
import { Key, ReactNode, useCallback, useMemo, useState } from "react";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { AuditOutlined, BarChartOutlined, UserOutlined } from "@ant-design/icons";
import { Content, Footer } from "antd/es/layout/layout";

type MenuItem = Required<MenuProps>["items"][number];

export default function Home() {
  const isAuthenticated: boolean = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const [collapsed, setCollapsed] = useState(false);
  const { token: { colorBgContainer } } = theme.useToken();

  const onSiderCollapse = useCallback((value: boolean) => {
    setCollapsed(value);
  }, []);

  const getItem = useCallback((label: ReactNode, key: Key, icon?: ReactNode, children?: ItemType<MenuItemType>[]): ItemType<MenuItemType> => {
    return {
      key,
      icon,
      children,
      label
    } as MenuItem;
  }, []);

  const menuItems: ItemType<MenuItemType>[] = useMemo(() => [
    getItem("Home", "home", <BarChartOutlined />),
    getItem("Customers", "customers", <UserOutlined />),
    getItem("Admins", "admins", <AuditOutlined />)
  ], [getItem]);

  return (
    isAuthenticated
    ?
    (
      <Layout className={styles.layoutContainer}>
        <Sider collapsible collapsed={collapsed} onCollapse={onSiderCollapse}>
          <div className={styles.headLogoVertical}></div>
          <Menu theme="dark" defaultSelectedKeys={["home"]} mode="inline" items={menuItems} />
        </Sider>
        <Layout>
          <Content className={styles.layoutContent} style={{backgroundColor: colorBgContainer}}>

          </Content>
          <Footer className={styles.layoutFooter} style={{backgroundColor: colorBgContainer}}>
            PM Printing Packaging Inc ©{new Date().getFullYear()} Created by Cory
          </Footer>
        </Layout>
      </Layout>
    )
    :
    null
  );
}
