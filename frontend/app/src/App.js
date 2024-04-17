import logo from './logo.svg';
import Createimage from "./createimage.jsx";
import { Routes, Route } from "react-router-dom";
import Input from "./input.jsx"
function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/create" element={<Createimage />} />
        <Route path="/" element={<Input />} />
      </Routes>
    </div>
  );
}

export default App;
