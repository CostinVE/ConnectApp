import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Routes,
  Link
} from "react-router-dom";
import Auth from './components/auth';
import { body } from './Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path={"/About"} exact element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
