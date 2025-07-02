"use client";
import "@ant-design/v5-patch-for-react-19";
import styles from "./layout.module.css";
import { Layout, Menu, theme } from "antd";
import { useAppSelector } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import Sider from "antd/es/layout/Sider";
import { Key, PropsWithChildren, ReactNode, useCallback, useMemo, useState } from "react";
import { ItemType, MenuItemType } from "antd/es/menu/interface";
import { AuditOutlined, BarChartOutlined, BuildOutlined, HistoryOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Content, Footer } from "antd/es/layout/layout";
import { SelectInfo } from "rc-menu/lib/interface";
import { usePathname, useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function DashboardLayout({children}: PropsWithChildren) {
  const isAuthenticated: boolean = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { token: { colorBgContainer } } = theme.useToken();
  const router: AppRouterInstance = useRouter();
  const pathname: string = usePathname();

  const onSiderCollapse = useCallback((value: boolean) => {
    setCollapsed(value);
  }, []);

  const getItem = useCallback((label: ReactNode, key: Key, icon?: ReactNode, children?: ItemType<MenuItemType>[]): ItemType<MenuItemType> => {
    return {
      key,
      icon,
      children,
      label
    };
  }, []);

  const menuItems: ItemType<MenuItemType>[] = useMemo(() => [
    getItem("Home", "/", <BarChartOutlined />),
    getItem("材料管理", "/materials/", <BuildOutlined />),
    getItem("估价记录", "/quotation-histories/", <HistoryOutlined />),
    getItem("客户管理", "/customers/", <UserOutlined />),
    getItem("系统管理员", "/admins/", <AuditOutlined />),
    getItem("系统设置", "/settings/", <SettingOutlined />)
  ], [getItem]);

  const onMenuSelect = useCallback((info: SelectInfo) => {
    const {selectedKeys} = info;
    router.push(`/dashboard${selectedKeys[0]}`);
  }, [router]);

  const defaultSelectedKeys: string[] = useMemo(() => [`/${(pathname.match(/^\/dashboard\/([a-zA-Z0-9\-_]*\/?)/) || [])[1] || ""}`], [pathname]);

  return (
    isAuthenticated
    ?
    (
      <Layout className={styles.layoutContainer}>
        <Sider collapsible collapsed={collapsed} onCollapse={onSiderCollapse}>
          <div className={styles.headLogoVertical}></div>
          <Menu theme="dark" defaultSelectedKeys={defaultSelectedKeys} mode="inline" items={menuItems} onSelect={onMenuSelect} />
        </Sider>
        <Layout>
          <Content className={styles.layoutContent} style={{backgroundColor: colorBgContainer}}>
            {children}
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
