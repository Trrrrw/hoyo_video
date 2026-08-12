import Error500 from "../assets/500.avif";
import ErrorPage, { HomeButton, ReloadButton } from "../components/ErrorPage";

export default function ServerError() {
  return (
    <ErrorPage
      status="500"
      image={Error500}
      imageAlt="500 服务器错误"
      title="服务暂时不可用"
      description="服务器没有正常响应，请稍后再试"
      hint={
        <>
          如果问题持续存在，欢迎在{" "}
          <a
            href="https://github.com/Trrrrw/hoyo_video/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub Issue
          </a>{" "}
          或通过{" "}
          <a
            href="https://trrw.cn/#contact"
            target="_blank"
            rel="noopener noreferrer"
          >
            我的个人主页
          </a>{" "}
          联系我
        </>
      }
      actions={
        <>
          <ReloadButton />
          <HomeButton />
        </>
      }
    />
  );
}
