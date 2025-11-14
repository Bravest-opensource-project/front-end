import { Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/Home";
import CreateChatRoom from "./pages/CreateChatRoom";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-chat" element={<CreateChatRoom />} />
    </Routes>
  );
}

export default App;
