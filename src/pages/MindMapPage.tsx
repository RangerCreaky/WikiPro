// --- Updated MindMapPage.tsx with export and node expansion ---
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticleContent } from '../services/api';
import cytoscape from 'cytoscape';

const MindMapPage = () => {
  const { title } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [cyInstance, setCyInstance] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await fetchArticleContent(title);
        setArticle(data);
        console.log(data)
      } catch (err) {
        setError('Failed to load article');
      }
    };
    fetchArticle();
  }, [title]);

  useEffect(() => {
    if (!article) return;
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.text, 'text/html');
    const headings = doc.querySelectorAll('h2, h3, h4');

    const elements = [
      { data: { id: 'root', label: article.title } }
    ];

    headings.forEach((heading, idx) => {
      const level = heading.tagName;
      const text = heading.innerText;
      const id = `${level}-${idx}`;
      elements.push({ data: { id, label: text } });
      elements.push({ data: { source: 'root', target: id } });
    });

    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#36c',
            'label': 'data(label)',
            'color': '#fff',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
            'cursor': 'pointer'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1.5,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        padding: 10,
        directed: true,
        spacingFactor: 1.5
      }
    });

    cy.on('tap', 'node', async (evt) => {
      const label = evt.target.data('label');
      const articleTitle = encodeURIComponent(label.replace(/\s+/g, '_'));
      const subArticle = await fetchArticleContent(articleTitle).catch(() => null);
      if (subArticle) {
        const subDoc = new DOMParser().parseFromString(subArticle.text, 'text/html');
        const subHeadings = subDoc.querySelectorAll('h2, h3');
        subHeadings.forEach((heading, idx) => {
          const text = heading.innerText;
          const subId = `${label}-sub-${idx}`;
          cy.add([
            { data: { id: subId, label: text } },
            { data: { source: evt.target.id(), target: subId } }
          ]);
        });
        cy.layout({ name: 'breadthfirst', directed: true }).run();
      }
    });

    setCyInstance(cy);
  }, [article]);

  const exportAsPng = () => {
    if (cyInstance) {
      const pngBlob = cyInstance.png({ full: true, output: 'blob' });
      const url = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title}_mindmap.png`;
      link.click();
    }
  };

  const exportAsMarkdown = () => {
    if (!cyInstance) return;
    const nodes = cyInstance.nodes().map(n => `- ${n.data('label')}`);
    const markdown = `# Mind Map for ${title}\n\n` + nodes.join('\n');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_mindmap.md`;
    link.click();
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold mt-2">Mind Map: {title}</h1>
        <Link to={`/article/${title}`} className="text-blue-600 underline">← Back to Article</Link>
        <p className="text-gray-600 text-sm mb-2">Visual map of section structure</p>
        <div className="flex gap-3 mt-2">
          <button
            onClick={exportAsPng}
            className="px-3 py-1 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            Export as PNG
          </button>
          <button
            onClick={exportAsMarkdown}
            className="px-3 py-1 border border-gray-300 rounded bg-gray-100 hover:bg-gray-200 text-sm"
          >
            Export as Markdown
          </button>
        </div>
      </div>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div id="cy" className="w-full h-[600px] border rounded shadow"></div>
      )}
    </div>
  );
};

export default MindMapPage;
