import {
  ArrowLeftOutlined,
  HomeOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, Card, Flex, Layout, Result, Typography } from "antd";
import type { ReactNode } from "react";
import { useBackendErrorState } from "../hooks/useBackendErrorNavigation";
import AppHeader from "./AppHeader";

type ErrorPageProps = {
  status: string;
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  hint: ReactNode;
  actions: ReactNode;
};

export default function ErrorPage({
  status,
  image,
  imageAlt,
  title,
  description,
  hint,
  actions,
}: ErrorPageProps) {
  return (
    <Layout className="min-h-dvh!">
      <AppHeader showRightItems={false} />

      <Flex
        vertical
        align="center"
        justify="center"
        className="min-h-0 flex-1 p-4 sm:p-8"
      >
        <Card
          className="w-full max-w-2xl overflow-hidden shadow-sm"
          styles={{ body: { padding: 0 } }}
        >
          <Result
            className="px-4! py-8! sm:px-10! sm:py-12!"
            icon={
              <img
                src={image}
                alt={imageAlt}
                className="mx-auto h-44 w-auto max-w-full object-contain sm:h-52"
                draggable={false}
              />
            }
            title={
              <Flex vertical align="center" gap={4}>
                <span className="text-3xl leading-tight font-semibold tracking-wide">
                  {status}
                </span>
                <span>{title}</span>
              </Flex>
            }
            subTitle={description}
            extra={
              <Flex wrap justify="center" gap="small">
                {actions}
              </Flex>
            }
          />
          <div className="border-t border-black/6 px-4 py-3 text-center dark:border-white/12">
            <Typography.Text type="secondary" className="text-xs!">
              {hint}
            </Typography.Text>
          </div>
        </Card>
      </Flex>
    </Layout>
  );
}

export function HomeButton() {
  const { clearError } = useBackendErrorState();

  return (
    <Button
      type="primary"
      href="/"
      icon={<HomeOutlined />}
      onClick={clearError}
    >
      返回首页
    </Button>
  );
}

export function BackButton() {
  const { clearError } = useBackendErrorState();

  return (
    <Button
      icon={<ArrowLeftOutlined />}
      onClick={() => {
        clearError();
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.assign("/");
        }
      }}
    >
      返回上一页
    </Button>
  );
}

export function ReloadButton() {
  const { clearError } = useBackendErrorState();

  return (
    <Button
      type="primary"
      icon={<ReloadOutlined />}
      onClick={() => {
        clearError();
        window.location.reload();
      }}
    >
      重新加载
    </Button>
  );
}
