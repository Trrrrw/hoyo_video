import { Flex, Input, Select, Skeleton, Space } from "antd";
import { useEffect, useState } from "react";
import { useGames } from "../api/useGames";
import { backendUrl } from "../api/client";
import { useNavigate } from "react-router";
import PageTitle from "../components/PageTitle";

export default function Home() {
  return (
    <>
      <PageTitle />
      <Flex
        vertical
        align="center"
        className="w-full px-4! pt-[clamp(6rem,20vh,13rem)]!"
      >
        <h1 className="sr-only">影像档案架</h1>
        <RandomHomeMark />
        <SearchInput />
      </Flex>
    </>
  );
}

const homeMarks = Object.values(
  import.meta.glob("../assets/home-mark/*.avif", {
    eager: true,
    query: "?url",
    import: "default",
  }),
) as string[];

if (homeMarks.length === 0) {
  throw new Error("未找到首页标识图片");
}

function RandomHomeMark() {
  const [src] = useState(
    () => homeMarks[Math.floor(Math.random() * homeMarks.length)]!,
  );
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative flex h-32 w-40 items-center justify-center">
      {!loaded && <Skeleton.Image active className="!h-28! !w-36!" />}
      <img
        src={src}
        alt=""
        draggable={false}
        loading="eager"
        fetchPriority="high"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`absolute inset-0 m-auto h-32 w-auto max-w-full object-contain transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

function SearchInput() {
  const { Search } = Input;
  const { games, isLoading } = useGames();
  const [gameId, setGameId] = useState<string>();

  useEffect(() => {
    setGameId((current) => current ?? games[0]?.id);
  }, [games]);

  const selectOptions = games.map((game) => ({
    value: game.id,
    label: game.icon ? (
      <img
        src={backendUrl(game.icon)}
        alt={game.name}
        className="size-5 rounded object-cover"
        draggable={false}
      />
    ) : (
      <span aria-label={game.name}>{game.name.slice(0, 1)}</span>
    ),
  }));

  const navigate = useNavigate();
  const handleSearch = (keyword: string) => {
    if (!keyword) return;
    void navigate({
      pathname: "/search",
      search: new URLSearchParams({
        game: gameId ?? "",
        q: keyword,
      }).toString(),
    });
  };

  return (
    <Space.Compact block size="large" className="mt-3 w-full max-w-160">
      <Select
        suffixIcon={null}
        className="w-13!"
        value={gameId}
        onChange={setGameId}
        options={selectOptions}
        disabled={isLoading}
        placeholder={
          <Skeleton.Avatar
            active
            size={20}
            shape="square"
            className="rounded!"
          />
        }
        aria-label="选择游戏"
      />
      <Search
        id="search-input"
        className="flex-1!"
        placeholder="搜索视频"
        onSearch={handleSearch}
      />
    </Space.Compact>
  );
}
