"use client";
import { Layout, Tabs, TabsProps, theme } from "antd";
import { Content, Header } from "antd/es/layout/layout";
import Title from "antd/es/typography/Title";
import { PropsWithChildren, useMemo } from "react";
import styles from "./layout.module.css";
import TabPane from "antd/es/tabs/TabPane";

export default function AdminsLayout({children}: PropsWithChildren) {
  return (
    <div>{children}</div>
  )
}