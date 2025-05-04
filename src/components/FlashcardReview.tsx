import React, { useState, useEffect } from 'react';

const FlashcardReview = ({ deck, setDeck, onCompleteReview }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [revealedCloze, setRevealedCloze] = useState(false);
  const [reviewComplete, setReviewComplete] = useState(false);
  const [stats, setStats] = useState({
    total: deck.length,
    reviewed: 0,
    correct: 0
  });

  const currentCard = deck[currentCardIndex] || null;

  // Update stats when deck changes
  useEffect(() => {
    const reviewedCards = deck.filter(card => card.reviewed);
    const correctCards = deck.filter(card => card.correct);
    
    setStats({
      total: deck.length,
      reviewed: reviewedCards.length,
      correct: correctCards.length
    });
    
    // Check if review is complete
    if (reviewedCards.length === deck.length && deck.length > 0) {
      setReviewComplete(true);
    }
  }, [deck]);

  const flipCard = () => {
    setFlipped(!flipped);
  };

  const revealAnswer = () => {
    setShowAnswer(true);
  };

  const revealCloze = () => {
    setRevealedCloze(true);
  };

  const markCard = (correct) => {
    // Apply spaced repetition algorithm
    const now = new Date();
    let nextReviewDate = new Date();
    
    // Simple spaced repetition: if correct, schedule further out
    if (correct) {
      // For correct answers, schedule reviews based on previous performance
      const currentReviewCount = currentCard.reviewCount || 0;
      
      // Exponential backoff: 1 day, 3 days, 7 days, 14 days, 30 days, 60 days
      const daysToAdd = currentReviewCount < 5 ? 
        [1, 3, 7, 14, 30][currentReviewCount] : 
        60;
      
      nextReviewDate.setDate(now.getDate() + daysToAdd);
    } else {
      // For incorrect answers, review again today or tomorrow
      nextReviewDate.setDate(now.getDate() + 1);
    }
    
    // Update the deck with the results
    const updatedDeck = [...deck];
    updatedDeck[currentCardIndex] = {
      ...currentCard,
      reviewed: true,
      correct: correct,
      nextReviewDate: nextReviewDate
    };
    
    setDeck(updatedDeck);
    
    // Move to next card
    goToNextCard();
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const checkMultipleChoice = () => {
    const isCorrect = selectedOption === currentCard.answer;
    markCard(isCorrect);
  };

  const goToNextCard = () => {
    // Reset state for next card
    setFlipped(false);
    setShowAnswer(false);
    setSelectedOption(null);
    setRevealedCloze(false);
    
    // Find the next unreviewed card
    const nextUnreviewedIndex = deck.findIndex((card, index) => 
      index > currentCardIndex && !card.reviewed
    );
    
    if (nextUnreviewedIndex !== -1) {
      setCurrentCardIndex(nextUnreviewedIndex);
    } else {
      // If we've reached the end, look from the beginning
      const firstUnreviewedIndex = deck.findIndex(card => !card.reviewed);
      
      if (firstUnreviewedIndex !== -1 && firstUnreviewedIndex !== currentCardIndex) {
        setCurrentCardIndex(firstUnreviewedIndex);
      } else {
        // All cards reviewed
        setReviewComplete(true);
      }
    }
  };

  // Render the card based on type
  const renderCard = () => {
    if (!currentCard) return null;
    
    switch (currentCard.type) {
      case 'qa':
        return (
          <div 
            className={`card ${flipped ? 'flipped' : ''}`}
            onClick={flipCard}
          >
            <div className="card-inner">
              <div className="card-front">
                <div className="text-lg font-bold">{currentCard.front}</div>
                <div className="mt-4 text-sm text-gray-500">Click to flip</div>
              </div>
              <div className="card-back">
                <div className="text-lg">{currentCard.back}</div>
                <div className="flex justify-center mt-6 space-x-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); markCard(false); }} 
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Incorrect
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); markCard(true); }} 
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  >
                    Correct
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'cloze':
        return (
          <div className="card">
            <div className="text-lg">
              {currentCard.text.split(/\[\[([^\]]+)\]\]/).map((part, i) => 
                i % 2 === 0 ? 
                  part : 
                  <span key={i} className={`px-1 rounded ${revealedCloze ? 'bg-green-200' : 'bg-gray-300'}`}>
                    {revealedCloze ? part : '________'}
                  </span>
              )}
            </div>
            
            {!revealedCloze ? (
              <div className="flex justify-center mt-6">
                <button 
                  onClick={revealCloze} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Reveal Answer
                </button>
              </div>
            ) : (
              <div className="flex justify-center mt-6 space-x-4">
                <button 
                  onClick={() => markCard(false)} 
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                >
                  Incorrect
                </button>
                <button 
                  onClick={() => markCard(true)} 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  Correct
                </button>
              </div>
            )}
          </div>
        );
        
      case 'mcq':
        return (
          <div className="card">
            <div className="text-lg font-bold mb-4">{currentCard.question}</div>
            
            <div className="space-y-2 mb-6">
              {currentCard.options.map((option, index) => (
                <div 
                  key={index} 
                  className={`
                    p-3 rounded border cursor-pointer transition-colors
                    ${selectedOption === option 
                      ? 'bg-blue-100 border-blue-300' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}
                    ${showAnswer && option === currentCard.answer ? 'bg-green-100 border-green-300' : ''}
                  `}
                  onClick={() => !showAnswer && handleOptionSelect(option)}
                >
                  {option}
                </div>
              ))}
            </div>
            
            {!showAnswer ? (
              <div className="flex justify-center">
                <button 
                  onClick={revealAnswer} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-2"
                  disabled={!selectedOption}
                >
                  Check Answer
                </button>
              </div>
            ) : (
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => markCard(selectedOption === currentCard.answer)} 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Continue
                </button>
              </div>
            )}
          </div>
        );
        
      default:
        return <div>Unknown card type</div>;
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Review progress */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress: {stats.reviewed} / {stats.total}</span>
          <span>Correct: {stats.correct} ({stats.reviewed > 0 ? Math.round((stats.correct / stats.reviewed) * 100) : 0}%)</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 w-full">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${(stats.reviewed / stats.total) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {reviewComplete ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Review Complete!</h2>
          <div className="text-lg mb-6">
            You got {stats.correct} out of {stats.total} cards correct ({Math.round((stats.correct / stats.total) * 100)}%).
          </div>
          <button 
            onClick={onCompleteReview}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Finish Review
          </button>
        </div>
      ) : (
        <div className="w-full max-w-2xl mx-auto">
          {/* Card container */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-8 min-h-[300px] flex flex-col justify-between">
            {renderCard()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardReview;