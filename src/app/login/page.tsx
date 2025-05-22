"use client";
import "@ant-design/v5-patch-for-react-19";
import { Button, Card, Flex, Form, Input } from "antd";
import styles from "./page.module.css";
import FormItem from "antd/es/form/FormItem";
import Password from "antd/es/input/Password";
import { useCallback } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { login } from "@/lib/features/auth.slice";

type FormValue = {
  username: string;
  password: string;
};

export default function Login() {
  const dispath = useAppDispatch();

  const onFinish = useCallback((values: FormValue) => {
    console.log(values);
    dispath(login(values)).unwrap();
  }, []);

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
          <FormItem label="Username" name="username" rules={[{ required: true }]}>
            <Input />
          </FormItem>
          <FormItem label="Password" name="password" rules={[{ required: true }]}>
            <Password/>
          </FormItem>
          <FormItem>
            <Button type="primary" htmlType="submit" className={ styles.signInButton }>Sign in</Button>
          </FormItem>
        </Form>
      </Card>
    </Flex>
  );
}