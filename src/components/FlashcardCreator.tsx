import React, { useState } from 'react';

const FlashcardCreator = ({ onAddCard, articleTitle }) => {
  const [cardType, setCardType] = useState('qa');
  const [cardData, setCardData] = useState({
    front: '',
    back: '',
    question: '',
    options: ['', '', '', ''],
    answer: '',
    text: ''
  });
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);

  const resetForm = () => {
    setCardData({
      front: '',
      back: '',
      question: '',
      options: ['', '', '', ''],
      answer: '',
      text: ''
    });
    setActiveOptionIndex(0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let newCard = {
      type: cardType
    };
    
    if (cardType === 'qa') {
      if (!cardData.front || !cardData.back) return;
      newCard = {
        ...newCard,
        front: cardData.front,
        back: cardData.back
      };
    } else if (cardType === 'cloze') {
      if (!cardData.text || !cardData.text.includes('[[') || !cardData.text.includes(']]')) return;
      newCard = {
        ...newCard,
        text: cardData.text
      };
    } else if (cardType === 'mcq') {
      if (!cardData.question || !cardData.answer || 
          cardData.options.some(option => !option.trim())) return;
      newCard = {
        ...newCard,
        question: cardData.question,
        options: cardData.options,
        answer: cardData.answer
      };
    }
    
    onAddCard(newCard);
    resetForm();
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...cardData.options];
    newOptions[index] = value;
    setCardData({
      ...cardData,
      options: newOptions
    });
  };

  const handleSelectAnswer = (option) => {
    setCardData({
      ...cardData,
      answer: option
    });
  };

  const addClozeTag = () => {
    const textArea = document.getElementById('cloze-text');
    if (!textArea) return;
    
    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    
    if (start === end) return;
    
    const selectedText = cardData.text.substring(start, end);
    const newText = 
      cardData.text.substring(0, start) + 
      '[[' + selectedText + ']]' + 
      cardData.text.substring(end);
    
    setCardData({
      ...cardData,
      text: newText
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded border border-gray-200 mb-6">
      <h2 className="text-xl font-bold mb-4">Create Custom Flashcards</h2>
      
      <div className="mb-4">
        <div className="flex space-x-2 border-b border-gray-200">
          <button
            onClick={() => setCardType('qa')}
            className={`px-4 py-2 ${cardType === 'qa' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
          >
            Question & Answer
          </button>
          <button
            onClick={() => setCardType('cloze')}
            className={`px-4 py-2 ${cardType === 'cloze' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
          >
            Fill in the Blank
          </button>
          <button
            onClick={() => setCardType('mcq')}
            className={`px-4 py-2 ${cardType === 'mcq' ? 'border-b-2 border-blue-500 text-blue-500' : ''}`}
          >
            Multiple Choice
          </button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Question & Answer Form */}
        {cardType === 'qa' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question/Front</label>
              <textarea
                value={cardData.front}
                onChange={(e) => setCardData({ ...cardData, front: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                placeholder="Enter the question or front of the card"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Answer/Back</label>
              <textarea
                value={cardData.back}
                onChange={(e) => setCardData({ ...cardData, back: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                placeholder="Enter the answer or back of the card"
                required
              />
            </div>
          </div>
        )}
        
        {/* Cloze Deletion Form */}
        {cardType === 'cloze' && (
          <div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Text with Blanks</label>
              <p className="text-xs text-gray-500 mb-2">
                Select text and click "Make Blank" to create a fill-in-the-blank card
              </p>
              <textarea
                id="cloze-text"
                value={cardData.text}
                onChange={(e) => setCardData({ ...cardData, text: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 h-32"
                placeholder="Enter text and highlight important terms to create blanks"
                required
              />
            </div>
            <button
              type="button"
              onClick={addClozeTag}
              className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm"
            >
              Make Blank
            </button>
            
            {cardData.text && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                <div className="border border-gray-200 rounded p-3 bg-white">
                  {cardData.text.split(/\[\[([^\]]+)\]\]/).map((part, i) => 
                    i % 2 === 0 ? 
                      part : 
                      <span key={i} className="bg-yellow-200 px-1 rounded">
                        {part}
                      </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Multiple Choice Form */}
        {cardType === 'mcq' && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <textarea
                value={cardData.question}
                onChange={(e) => setCardData({ ...cardData, question: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                placeholder="Enter the multiple choice question"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
              <div className="space-y-2">
                {cardData.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={cardData.answer === option}
                      onChange={() => handleSelectAnswer(option)}
                      disabled={!option.trim()}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className={`flex-grow border border-gray-300 rounded px-3 py-2 ${
                        activeOptionIndex === index ? 'ring-2 ring-blue-500' : ''
                      }`}
                      placeholder={`Option ${index + 1}`}
                      onFocus={() => setActiveOptionIndex(index)}
                      required
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Select the radio button next to the correct answer
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded"
          >
            Clear
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Card
          </button>
        </div>
      </form>
    </div>
  );
};

export default FlashcardCreator;