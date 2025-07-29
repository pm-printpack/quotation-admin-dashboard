"use client";
import "@ant-design/v5-patch-for-react-19";
import { Button, Card, Flex, Form, Input } from "antd";
import styles from "./page.module.css";
import FormItem from "antd/es/form/FormItem";
import Password from "antd/es/input/Password";
import { useCallback } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { login } from "@/lib/features/auth.slice";
import { useTranslations } from "next-intl";

type FormValues = {
  username: string;
  password: string;
};

export default function Login() {
  const t = useTranslations("login");
  const dispath = useAppDispatch();

  const onFinish = useCallback((values: FormValues) => {
    dispath(login(values)).unwrap();
  }, [dispath]);

  return (
    <Flex className={ styles.container } justify="center" align="center">
      <Card
        title="Sign in to Quotation Admin"
        variant="borderless"
        className={ styles.signInCard }
        styles={{
          header: {
            paddingTop: 48,
            paddingLeft: 68,
            paddingRight: 68,
            border: "none"
          },
          body: {
            paddingLeft: 68,
            paddingRight: 68,
            paddingBottom: 48
          }
        }}
      >
        <Form
          name="login-form"
          layout="vertical"
          onFinish={onFinish}
        >
          <FormItem label={t("username")} name="username" rules={[{ required: true }]}>
            <Input />
          </FormItem>
          <FormItem label={t("password")} name="password" rules={[{ required: true }]}>
            <Password/>
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" className={ styles.signInButton }>{t("signin")}</Button>
          </FormItem>
        </Form>
      </Card>
    </Flex>
  );
}