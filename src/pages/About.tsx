import {
  Button,
  Card,
  Divider,
  Flex,
  Space,
  Tag,
  Typography,
} from "antd";
import {
  CodeOutlined,
  DatabaseOutlined,
  GithubFilled,
  LinkOutlined,
  PlayCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import Logo from "../assets/logo.webp";
import PageTitle from "../components/PageTitle";

const { Paragraph, Text, Title } = Typography;

const features = [
  {
    icon: <DatabaseOutlined />,
    title: "集中归档",
    description: "按游戏、来源和标签整理视频，让分散的内容更容易被找到",
  },
  {
    icon: <SearchOutlined />,
    title: "快速检索",
    description: "通过关键词搜索已收录的视频，快速定位想看的内容",
  },
  {
    icon: <PlayCircleOutlined />,
    title: "随时观看",
    description: "在详情页查看视频信息、播放内容，并发现更多相关视频",
  },
];

export default function About() {
  return (
    <>
      <PageTitle title="关于" />
      <Flex
        vertical
        gap="large"
        className="app-scrollbar mx-auto! min-h-0 min-w-0 w-full max-w-6xl flex-1 overflow-y-auto p-3! pb-8"
      >
        <Card>
        <Flex
          vertical
          align="center"
          gap="middle"
          className="px-4 py-8 text-center sm:px-10 sm:py-12"
        >
          <img
            src={Logo}
            alt="影像档案架"
            className="h-16 w-auto object-contain"
            draggable={false}
          />
          <div>
            <Title level={1} className="mb-2! mt-0!">
              影像档案架
            </Title>
            <Text type="secondary" className="text-base">
              一个简洁的游戏视频归档与检索工具
            </Text>
          </div>
          <Space wrap>
            <Tag color="blue">视频归档</Tag>
            <Tag color="green">快速检索</Tag>
            <Tag color="purple">RSS订阅</Tag>
          </Space>
        </Flex>
      </Card>

      <Card title="关于项目">
        <Paragraph className="mb-0! text-base leading-7">
          影像档案架用于整理和浏览已收录的游戏视频内容。项目提供清晰的分类、标签和搜索能力，帮助你更快找到想看的视频。
        </Paragraph>
      </Card>

      <Card title="内容与版权声明">
        <Flex vertical gap="small">
          <Paragraph className="mb-0! leading-7">
            本项目是个人制作的非官方整理工具，用于整理和检索相关游戏官方发布的视频内容。本项目仅提供索引、整理和播放入口，不代表米哈游或其他权利方，也未获得其官方授权。站内展示的视频、图片、游戏名称、角色名称及其他相关素材，其著作权、商标权和其他权利归米哈游及相关权利方所有，本项目不主张对上述素材享有任何权利。
          </Paragraph>
          <Text type="secondary">
            相关内容仅用于索引、整理和个人非商业浏览。如有版权或内容问题，欢迎通过下方联系方式与我联系。
          </Text>
        </Flex>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="h-full">
            <Flex vertical gap="small">
              <Text className="text-2xl! text-blue-500!">{feature.icon}</Text>
              <Title level={4} className="mb-0! mt-1!">
                {feature.title}
              </Title>
              <Text type="secondary">{feature.description}</Text>
            </Flex>
          </Card>
        ))}
      </div>

      <Card>
        <Flex vertical gap="middle">
          <div>
            <Title level={3} className="mb-1! mt-0!">
              开源与技术
            </Title>
            <Text type="secondary">
              使用 React、TypeScript 和 Ant Design 构建，保持轻量、清晰且易于维护
            </Text>
          </div>
          <Divider className="my-0!" />
          <Flex
            align="center"
            justify="space-between"
            gap="middle"
            wrap
          >
            <Space wrap>
              <Tag icon={<CodeOutlined />}>React</Tag>
              <Tag icon={<LinkOutlined />}>React Router</Tag>
              <Tag icon={<DatabaseOutlined />}>TypeScript</Tag>
            </Space>
            <Button
              type="primary"
              icon={<GithubFilled />}
              href="https://github.com/Trrrrw/hoyo_video"
              target="_blank"
              rel="noopener noreferrer"
            >
              查看项目源码
            </Button>
          </Flex>
        </Flex>
      </Card>

      <Card title="联系与反馈">
        <Flex vertical gap="small">
          <Text type="secondary">
            如果你有建议、问题反馈或合作意向，欢迎联系我
          </Text>
          <Space wrap>
            <Button href="mailto:contact@trrw.cn">
              contact@trrw.cn
            </Button>
            <Button
              href="https://qm.qq.com/q/6l9M3S5YUU"
              target="_blank"
              rel="noopener noreferrer"
            >
              加入 QQ 群
            </Button>
            <Button
              type="link"
              href="https://trrw.cn/#contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              查看完整联系方式
            </Button>
          </Space>
        </Flex>
      </Card>

      <Text type="secondary" className="text-center text-xs">
        感谢每一位使用和反馈的朋友
        </Text>
      </Flex>
    </>
  );
}
