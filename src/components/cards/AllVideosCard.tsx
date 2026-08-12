import { VideoCameraOutlined } from "@ant-design/icons";
import { Card } from "antd";
import { Link } from "react-router";

type AllVideosCardProps = {
  game: string;
  source: string;
};

export default function AllVideosCard({
  game,
  source,
}: AllVideosCardProps) {
  return (
    <Link
      to={{
        pathname: `/${game}/videos`,
        search: new URLSearchParams({ source }).toString(),
      }}
      className="block text-inherit!"
    >
      <Card
        hoverable
        cover={
          <div className="flex! aspect-video w-full items-center justify-center bg-blue-50 text-6xl text-blue-500 dark:bg-blue-500/15 dark:text-blue-400">
            <VideoCameraOutlined />
          </div>
        }
      >
        <Card.Meta className="text-center" title="全部视频" />
      </Card>
    </Link>
  );
}
