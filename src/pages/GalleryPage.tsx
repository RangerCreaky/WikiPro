// ------ File: src/pages/GalleryPage.jsx (New) ------
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchArticleContent } from '../services/api';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const GalleryPage = () => {
  const { title } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedImages, setSelectedImages] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const articleData = await fetchArticleContent(title);
        
        // Extract images and captions from the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = articleData.text;
        
        const figures = tempDiv.querySelectorAll('figure');
        const extractedImages = [];
        
        figures.forEach((figure, index) => {
          const img = figure.querySelector('img');
          const caption = figure.querySelector('figcaption');
          
          if (img) {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt') || '';
            const captionText = caption ? caption.textContent : '';
            
            // Make sure the src is a valid URL
            if (src) {
              // If src is a relative URL, make it absolute
              const fullSrc = src.startsWith('http') ? 
                src : 
                `https:${src}`;
              
              extractedImages.push({
                id: index,
                src: fullSrc,
                alt,
                caption: captionText
              });
            }
          }
        });
        
        setImages(extractedImages);
      } catch (err) {
        setError(err.message || 'Failed to fetch images');
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };

    if (title) {
      fetchImages();
    }
  }, [title]);

  useEffect(() => {
    // Reset selected images when images change
    const initialSelection = {};
    images.forEach(img => {
      initialSelection[img.id] = selectAll;
    });
    setSelectedImages(initialSelection);
  }, [images, selectAll]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    const newSelection = {};
    images.forEach(img => {
      newSelection[img.id] = newSelectAll;
    });
    setSelectedImages(newSelection);
  };

  const handleSelectImage = (id) => {
    setSelectedImages(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const downloadSelectedImages = async () => {
    try {
      const selectedIds = Object.keys(selectedImages).filter(id => selectedImages[id]);
      
      if (selectedIds.length === 0) {
        alert('Please select at least one image to download.');
        return;
      }
      
      const zip = new JSZip();
      const folder = zip.folder('wikipedia-images');
      
      // Fetch and add images to the zip
      const promises = selectedIds.map(async id => {
        const image = images.find(img => img.id === parseInt(id));
        if (!image) return;
        
        try {
          const response = await fetch(image.src);
          const blob = await response.blob();
          
          // Create a filename from the alt text or URL
          const extension = image.src.split('.').pop().split('?')[0];
          const filename = `image-${id}.${extension}`;
          
          folder.file(filename, blob);
          
          // Also save caption as a text file
          if (image.caption) {
            folder.file(`caption-${id}.txt`, image.caption);
          }
        } catch (err) {
          console.error(`Error downloading image ${id}:`, err);
        }
      });
      
      await Promise.all(promises);
      
      // Generate and download the zip
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `wikipedia-images-${title}.zip`);
    } catch (err) {
      console.error('Error creating zip file:', err);
      alert('Failed to download images. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white border border-gray-200 rounded p-6">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Gallery: {title}</h1>
            <Link to={`/article/${encodeURIComponent(title)}`} className="text-blue-600 hover:underline">
              ← Back to article
            </Link>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex border border-gray-300 rounded">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`px-3 py-1 text-sm ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white'}`}
              >
                Grid View
              </button>
              <button 
                onClick={() => setViewMode('table')} 
                className={`px-3 py-1 text-sm ${viewMode === 'table' ? 'bg-gray-200' : 'bg-white'}`}
              >
                Tabular View
              </button>
            </div>
            
            <div className="flex items-center">
              <label className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="form-checkbox h-4 w-4"
                />
                <span className="ml-2 text-sm">Select All</span>
              </label>
              
              <button 
                onClick={downloadSelectedImages}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                disabled={Object.values(selectedImages).filter(Boolean).length === 0}
              >
                DOWNLOAD
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader">Loading...</div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        ) : images.length === 0 ? (
          <p>No images found in this article.</p>
        ) : (
          <div>
            {viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map(image => (
                  <div key={image.id} className="border border-gray-200 rounded overflow-hidden">
                    <div className="p-2 flex items-center justify-between bg-gray-50">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedImages[image.id] || false}
                          onChange={() => handleSelectImage(image.id)}
                          className="form-checkbox h-4 w-4"
                        />
                        <span className="ml-2 text-xs text-gray-600">Select</span>
                      </label>
                      <a href={image.src} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        View Full
                      </a>
                    </div>
                    <div className="p-2">
                      <img 
                        src={image.src} 
                        alt={image.alt} 
                        className="w-full h-40 object-contain" 
                      />
                    </div>
                    {image.caption && (
                      <div className="p-2 text-xs border-t border-gray-200 bg-gray-50">
                        {image.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Tabular View
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="w-12 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select
                      </th>
                      <th className="w-64 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Caption
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {images.map(image => (
                      <tr key={image.id}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedImages[image.id] || false}
                            onChange={() => handleSelectImage(image.id)}
                            className="form-checkbox h-4 w-4"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col items-center">
                            <img 
                              src={image.src} 
                              alt={image.alt} 
                              className="w-48 h-32 object-contain mb-1" 
                            />
                            <a href={image.src} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                              View Full
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {image.caption || "No caption available"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;