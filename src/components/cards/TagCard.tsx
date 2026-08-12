import { Card } from "antd";
import type { TagInfo } from "../../api/useTags";
import { Link } from "react-router";

type TagCardProps = {
  tag: TagInfo;
  game: string;
  source: string;
};

export default function TagCard({ tag, game, source }: TagCardProps) {
  const preview = tag.recent.video[0];

  return (
    <Link
      to={{
        pathname: `/${game}/videos`,
        search: new URLSearchParams({
          source: source,
          tag: tag.name,
        }).toString(),
      }}
    >
      <Card
        hoverable
        cover={
          preview?.cover ? (
            <img
              draggable={false}
              alt={tag.name}
              src={preview.cover}
              className="aspect-video w-full object-cover"
            />
          ) : undefined
        }
      >
        <Card.Meta className="text-center" title={tag.name} />
      </Card>
    </Link>
  );
}
