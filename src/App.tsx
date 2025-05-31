import './App.css'
import { Sidebar } from "./components/sidebar/Sidebar";
import { View } from "./components/View";
import { Toolbar } from "./components/toolbar/Toolbar";

function App() {

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 overflow-hidden relative">
        <View />
      </div>
      <Toolbar />
    </div>
  );
}

export default App