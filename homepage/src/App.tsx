import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import { lazy, Suspense } from "react";

// 懒加载工具页面，避免首页加载不必要的代码
const VideoGeneratorPage = lazy(() => import("./tools/video-generator/VideoGeneratorPage"));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/tools/video-generator"
          element={
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0a0a0f', color: '#9898b0' }}>加载中...</div>}>
              <VideoGeneratorPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}