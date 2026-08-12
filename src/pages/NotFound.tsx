import Error404 from "../assets/404.avif";
import ErrorPage, { BackButton, HomeButton } from "../components/ErrorPage";

export default function NotFound() {
  return (
    <ErrorPage
      status="404"
      image={Error404}
      imageAlt="404 页面不存在"
      title="页面找不到了"
      description="你访问的页面不存在，可能已经被移动或删除"
      hint="可以返回首页重新选择游戏和内容"
      actions={
        <>
          <HomeButton />
          <BackButton />
        </>
      }
    />
  );
}
