// --- File: src/pages/ThreadifyPage.tsx ---
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticleContent } from '../services/api';

const tones = ['casual', 'professional', 'teacher'];
const formats = ['twitter', 'instagram', 'linkedin'];

const ThreadifyPage = () => {
  const { title } = useParams();
  const [article, setArticle] = useState(null);
  const [tone, setTone] = useState('casual');
  const [format, setFormat] = useState('twitter');
  const [thread, setThread] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      const data = await fetchArticleContent(title);
      setArticle(data);
    };
    fetchArticle();
  }, [title]);

  const generateThread = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/threadify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, html: article.text, tone, format })
      });
      const data = await res.json();
      setThread(data.thread);
    } catch (err) {
      console.error('Error generating thread:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportThread = () => {
    const content = thread.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_${format}_${tone}_thread.txt`;
    link.click();
  };

  return (
    <div className="p-6">
      <Link to={`/article/${title}`} className="text-blue-600 underline">← Back to Article</Link>
      <h1 className="text-2xl font-bold mt-4">Threadify: {title}</h1>
      <div className="my-4 flex gap-4">
        <select value={tone} onChange={(e) => setTone(e.target.value)} className="border px-2 py-1 rounded">
          {tones.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className="border px-2 py-1 rounded">
          {formats.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <button onClick={generateThread} disabled={loading} className="bg-blue-600 text-white px-4 py-1 rounded">
          {loading ? 'Generating...' : 'Generate Thread'}
        </button>
        {thread.length > 0 && (
          <button onClick={exportThread} className="border px-3 py-1 rounded bg-gray-100 hover:bg-gray-200">
            Export
          </button>
        )}
      </div>

      <div className="bg-white border p-4 rounded">
        {thread.map((t, i) => (
          <p key={i} className="mb-4 border-b pb-2 text-gray-700 whitespace-pre-wrap">{t}</p>
        ))}
        {thread.length === 0 && !loading && <p className="text-gray-500">No content yet. Click Generate.</p>}
      </div>
    </div>
  );
};

export default ThreadifyPage;
