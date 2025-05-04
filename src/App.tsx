import { Routes, Route } from 'react-router-dom';
import ArticlePage from './pages/ArticlePage';
import Header from './components/Header';
import GalleryPage from './pages/GalleryPage';
import TablesPage from './pages/TablesPage';
import CitationPage from './pages/CitationPage';
import TimelinePage from './pages/TimelinePage';
import MindMapPage from './pages/MindMapPage';
import FlashcardsPage from './pages/FlashCardPage';
import Main from './pages/Main';
import Landing from './pages/Landing';
function App() {
  return (
    <div className="main bg-white max-w-[1596px] mx-auto">
      <Header />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/en/:title" element={<ArticlePage />} />
          <Route path="/main/en" element={<Main />} />
          <Route path="/main/:lang" element={<> Language not yet supported </>} />
          <Route path="/gallery/:title" element={<GalleryPage />} />
            <Route path="/article/:title" element={<ArticlePage />} /> 
            <Route path="/tables/:title" element={<TablesPage />} />
            <Route path="/cite/:title" element={<CitationPage />} />
            <Route path="/timeline/:title" element={<TimelinePage />} />
            <Route path="/mindmap/:title" element={<MindMapPage />} />
            <Route path="/flashcards/:title" element={<FlashcardsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App