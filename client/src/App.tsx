import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BOForm from './components/BOForm';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/bo" element={<BOForm />} />
    </Routes>
  );
}

export default App;