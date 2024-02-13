import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Routes,
  Link
} from "react-router-dom";
import Auth from './components/auth';

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
