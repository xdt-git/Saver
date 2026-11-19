import { Layout } from "./layout/layout";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.scss";

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
