import { DownOutlined, HomeOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Menu,
  Modal,
  type BreadcrumbProps,
} from "antd";
import { Link } from "react-router";
import { useMemo, useState } from "react";

type BreadcrumbNode = {
  id: string;
  name: string;
  to?: string;
};

type BreadcrumbDropdownNode = BreadcrumbNode & {
  children: BreadcrumbNode[];
};

type AppBreadcrumbProps = {
  game: BreadcrumbNode;
  source: BreadcrumbDropdownNode;
  tag?: BreadcrumbDropdownNode;
};

function nodeTitle(node: BreadcrumbNode) {
  return node.to ? <Link to={node.to}>{node.name}</Link> : node.name;
}

function dropdownItem(node: BreadcrumbDropdownNode) {
  return {
    menu: {
      items: node.children.map((child) => ({
        key: child.id,
        label: nodeTitle(child),
      })),
    },
    title: nodeTitle(node),
  };
}

function TagPicker({ node }: { node: BreadcrumbDropdownNode }) {
  const [open, setOpen] = useState(false);
  const items = useMemo(
    () =>
      node.children.map((child) => ({
        key: child.id,
        label: nodeTitle(child),
      })),
    [node.children],
  );

  return (
    <>
      <Button
        type="text"
        size="small"
        aria-label="切换标签"
        className="h-auto! px-1! text-inherit!"
        onClick={() => setOpen(true)}
      >
        <span className="inline-flex items-center gap-1">
          {node.name}
          <DownOutlined className="text-xs" />
        </span>
      </Button>
      <Modal
        title="切换标签"
        open={open}
        footer={null}
        centered
        onCancel={() => setOpen(false)}
        width={420}
        classNames={{ body: "app-scrollbar" }}
        styles={{
          body: {
            maxHeight: "min(60vh, 32rem)",
            overflowY: "auto",
            padding: 8,
          },
        }}
      >
        <Menu
          mode="vertical"
          selectable
          selectedKeys={[node.id]}
          items={items}
          onClick={() => setOpen(false)}
          style={{ background: "transparent", borderInlineEnd: 0 }}
        />
      </Modal>
    </>
  );
}

export default function AppBreadcrumb({
  game,
  source,
  tag,
}: AppBreadcrumbProps) {
  const items: BreadcrumbProps["items"] = [
    {
      title: (
        <Link to="/" aria-label="首页">
          <HomeOutlined />
        </Link>
      ),
    },
    {
      title: <Link to={game.to ?? `/${game.id}`}>{game.name}</Link>,
    },
    dropdownItem(source),
    ...(tag ? [{ title: <TagPicker node={tag} /> }] : []),
  ];

  return <Breadcrumb items={items} />;
}
