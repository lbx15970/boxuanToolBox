import { useNavigate } from "react-router-dom";
import { EyeCard } from "./components/EyeCard";
import "./styles.css";

function Attribution() {
  return (
    <div className="w-full flex justify-center mt-4">
      <p className="text-[10px] text-white">
        Thank you to{" "}
        <a
          href="https://www.instagram.com/faelpt"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition-opacity"
        >
          Rafael Serra
        </a>{" "}
        for the original design
      </p>
    </div>
  );
}

function Link() {
  return (
    <div className="w-full flex justify-center mt-4">
      <p className="text-[10px] text-white">
        <a
          href="https://anotherplanet.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-80 transition-opacity"
        >
          https://anotherplanet.io/
        </a>
      </p>
    </div>
  );
}

export default function ImageGeneratorPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center sm:p-4"
      style={{ backgroundColor: "var(--cookie-monster-blue)" }}
    >
      {/* 返回按钮 */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 text-white hover:text-gray-200 transition-colors flex items-center gap-2 text-sm z-50"
      >
        ← 返回首页
      </button>

      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border flex flex-row gap-2 items-center justify-center sm:p-[24px] size-full">
          <EyeCard />
        </div>
      </div>
      <Link />
      <Attribution />
    </div>
  );
}
