import { App as AntdApp } from "antd";
import { useCallback } from "react";

async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

let copyMessageId = 0;
type CopyTextInput = string | Promise<string>;

export function useCopyText() {
  const { message } = AntdApp.useApp();

  return useCallback(
    async (
      text: CopyTextInput,
      successMessage = "已复制",
      errorMessage = "复制失败，请检查浏览器权限",
    ) => {
      const key = `copy-text-${++copyMessageId}`;
      message.loading({
        key,
        content: "复制中…",
        duration: 0,
      });

      try {
        await copyText(await text);
        message.success({
          key,
          content: successMessage,
          duration: 2,
        });
      } catch {
        message.error({
          key,
          content: errorMessage,
          duration: 3,
        });
      }
    },
    [message],
  );
}
