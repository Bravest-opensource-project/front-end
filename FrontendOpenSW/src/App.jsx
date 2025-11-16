import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import CreateChatRoom from "./pages/CreateChatRoom";
import JoinChatRoom from "./pages/JoinChatRoom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-chat" element={<CreateChatRoom />} />
      <Route path="/join-chat" element={<JoinChatRoom />} />
    </Routes>
  );
}

export default App;
