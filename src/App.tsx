import './App.css'
import Keyboard from './components/Keyboard'
import useActivityLogger from './hooks/useActivityLogger';

function App() {
  useActivityLogger();
  

  return (
    <>
     {/* <Trainer/> */}
      <Keyboard/>
    </>
  )
}

export default App