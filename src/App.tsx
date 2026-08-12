import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { useBackendErrorState } from "./hooks/useBackendErrorNavigation";

const MainLayout = lazy(() => import("./layouts/MainLayout"));
const Home = lazy(() => import("./pages/Home"));
const TagList = lazy(() => import("./pages/TagList"));
const Search = lazy(() => import("./pages/Search"));
const About = lazy(() => import("./pages/About"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ServerError = lazy(() => import("./pages/ServerError"));
const VideoList = lazy(() => import("./pages/VideoList"));
const VideoDetail = lazy(() => import("./pages/VideoDetail"));

function App() {
  const { error } = useBackendErrorState();

  return (
    <Suspense fallback={null}>
      {error ? (
        error.status === 404 ? <NotFound /> : <ServerError />
      ) : (
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path=":gameId" element={<TagList />} />
            <Route path=":gameId/videos" element={<VideoList />} />
            <Route
              path=":gameId/videos/:sourceId/:videoId"
              element={<VideoDetail />}
            />
            <Route path="search" element={<Search />} />
            <Route path="about" element={<About />} />
          </Route>

          <Route path="404" element={<NotFound />} />
          <Route path="500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </Suspense>
  );
}

export default App;
