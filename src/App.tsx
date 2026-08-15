import { Navigate, Route, Routes } from "react-router-dom";
import { useStore } from "./store";
import { ToastHost } from "./components/Toast";
import Dashboard from "./pages/producer/Dashboard";
import MovieDetail from "./pages/producer/MovieDetail";
import CreateSynopsis from "./pages/producer/CreateSynopsis";
import TranslationDetail from "./pages/producer/TranslationDetail";
import MyTranslations from "./pages/translator/MyTranslations";
import Translate from "./pages/translator/Translate";
import MyReviewTasks from "./pages/reviewer/MyReviewTasks";
import ReviewTranslation from "./pages/reviewer/ReviewTranslation";

const ROLE_HOME: Record<string, string> = {
  Producer: "/producer",
  Translator: "/translator",
  Reviewer: "/reviewer",
};

function RoleHomeRedirect() {
  const role = useStore((s) => s.currentRole);
  return <Navigate to={ROLE_HOME[role]} replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RoleHomeRedirect />} />

        <Route path="/producer" element={<Dashboard />} />
        <Route path="/producer/create" element={<CreateSynopsis />} />
        <Route path="/producer/movie/:movieId" element={<MovieDetail />} />
        <Route path="/producer/movie/:movieId/:language" element={<TranslationDetail />} />

        <Route path="/translator" element={<MyTranslations />} />
        <Route path="/translator/:movieId/:language" element={<Translate />} />

        <Route path="/reviewer" element={<MyReviewTasks />} />
        <Route path="/reviewer/:movieId/:language" element={<ReviewTranslation />} />

        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>
      <ToastHost />
    </>
  );
}
