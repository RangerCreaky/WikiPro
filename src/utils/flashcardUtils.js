/**
 * Generate flashcards from article content
 * @param {string} content - HTML content to generate cards from
 * @param {string} difficulty - Difficulty level ('easy', 'medium', 'hard')
 * @returns {Array} Array of flashcard objects
 */
export const generateFlashcards = (content, difficulty = 'medium') => {
    // Create DOM parser to analyze content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Initialize cards array
    const cards = [];
    
    // Extract paragraphs and headings
    const paragraphs = Array.from(doc.querySelectorAll('p'));
    const headings = Array.from(doc.querySelectorAll('h2, h3, h4'));
    
    // Create Q&A cards from headings and paragraphs
    headings.forEach((heading, index) => {
      // Find paragraphs under this heading until the next heading
      const nextHeading = headings[index + 1];
      const paragraphsUnderHeading = paragraphs.filter(p => {
        if (!nextHeading) {
          return p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_PRECEDING;
        }
        
        return (
          (p.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_PRECEDING) &&
          (p.compareDocumentPosition(nextHeading) & Node.DOCUMENT_POSITION_FOLLOWING)
        );
      });
      
      // If we have content, create a Q&A card
      if (paragraphsUnderHeading.length > 0) {
        const sectionContent = paragraphsUnderHeading
          .map(p => p.textContent)
          .join(' ')
          .trim();
        
        if (sectionContent.length > 50) {
          cards.push({
            id: `qa-${Date.now()}-${cards.length}`,
            type: 'qa',
            front: `Explain ${heading.textContent}`,
            back: summarizeParagraph(sectionContent, difficulty)
          });
        }
      }
    });
    
    // Create cloze deletion cards
    paragraphs.forEach((paragraph, index) => {
      const text = paragraph.textContent.trim();
      
      // Only create cards from substantial paragraphs
      if (text.length > 100) {
        const clozeCard = createClozeCard(text, difficulty);
        if (clozeCard) {
          cards.push({
            id: `cloze-${Date.now()}-${index}`,
            type: 'cloze',
            text: clozeCard
          });
        }
      }
    });
    
    // Create multiple choice cards
    const longParagraphs = paragraphs.filter(p => p.textContent.length > 150);
    
    if (longParagraphs.length > 0) {
      // Take a subset of paragraphs for multiple choice
      const mcqSources = longParagraphs
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(5, longParagraphs.length));
      
      mcqSources.forEach((paragraph, index) => {
        const mcqCard = createMultipleChoiceCard(paragraph.textContent, difficulty);
        if (mcqCard) {
          cards.push({
            id: `mcq-${Date.now()}-${index}`,
            type: 'mcq',
            question: mcqCard.question,
            options: mcqCard.options,
            answer: mcqCard.answer
          });
        }
      });
    }
    
    return cards;
  };
  
  /**
   * Create a cloze deletion card from text
   * @param {string} text - Source text
   * @param {string} difficulty - Difficulty level
   * @returns {string|null} Formatted cloze text or null if unable to create
   */
  const createClozeCard = (text, difficulty) => {
    // Simplified cloze generation - in a real app this would use NLP
    
    // Find significant words or phrases
    const words = text.split(/\s+/);
    
    // Only process if we have enough words
    if (words.length < 8) return null;
    
    // Choose random indices to make into cloze deletions
    const clozeCount = difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3);
    
    // Find important words (longer words are often more important)
    const importantWords = words
      .map((word, index) => ({ word, index }))
      .filter(item => item.word.length > 5) // Words longer than 5 chars
      .filter(item => !item.word.match(/^[0-9]+$/)) // Not just numbers
      .filter(item => item.word.match(/^[A-Z0-9][a-z0-9]+/)); // Proper nouns and important terms
    
    // If we couldn't find enough important words, return null
    if (importantWords.length < clozeCount) return null;
    
    // Randomly select words to cloze
    const selectedIndices = new Set();
    
    while (selectedIndices.size < clozeCount && selectedIndices.size < importantWords.length) {
      const randomIndex = Math.floor(Math.random() * importantWords.length);
      selectedIndices.add(importantWords[randomIndex].index);
    }
    
    // Create cloze text
    const clozeText = words.map((word, index) => {
      if (selectedIndices.has(index)) {
        return `[[${word}]]`;
      }
      return word;
    }).join(' ');
    
    return clozeText;
  };
  
  /**
   * Create a multiple choice question from text
   * @param {string} text - Source text
   * @param {string} difficulty - Difficulty level
   * @returns {Object|null} MCQ card data or null if unable to create
   */
  const createMultipleChoiceCard = (text, difficulty) => {
    // Very simplified question generation - in a real app use NLP
    
    // Try to find a statement to turn into a question
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    
    if (sentences.length === 0) return null;
    
    // Select a random sentence that's not too short or long
    const eligibleSentences = sentences.filter(s => 
      s.trim().length > 40 && s.trim().length < 150
    );
    
    if (eligibleSentences.length === 0) return null;
    
    const sentence = eligibleSentences[Math.floor(Math.random() * eligibleSentences.length)].trim();
    
    // Create a basic fill-in-the-blank question
    const words = sentence.split(/\s+/);
    
    // Find a key word to remove (prefer longer words)
    const candidateWords = words
      .map((word, index) => ({ word, index }))
      .filter(item => item.word.length > 5)
      .filter(item => !item.word.match(/^[0-9]+$/))
      .filter(item => !item.word.match(/^(a|an|the|in|on|at|for|to|with|by|about)$/i));
    
    if (candidateWords.length === 0) return null;
    
    // Select a word to remove
    const selectedWord = candidateWords[Math.floor(Math.random() * candidateWords.length)];
    
    // Create the question by replacing the word with a blank
    const questionWords = [...words];
    const answer = questionWords[selectedWord.index];
    questionWords[selectedWord.index] = '_______';
    const question = questionWords.join(' ');
    
    // Generate wrong options (in a real app, use semantic similarity)
    const generateWrongOption = () => {
      // Simple approach: take other words from the text
      const otherWords = words.filter(word => 
        word !== answer && 
        word.length > 3 && 
        !word.match(/^(a|an|the|in|on|at|for|to|with|by|about)$/i)
      );
      
      if (otherWords.length > 0) {
        return otherWords[Math.floor(Math.random() * otherWords.length)];
      }
      
      // Fallback if we can't find suitable words
      const fallbackOptions = ['option A', 'option B', 'option C', 'option D'];
      return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
    };
    
    // Generate 3 wrong options
    const wrongOptions = [];
    for (let i = 0; i < 3; i++) {
      let wrongOption;
      do {
        wrongOption = generateWrongOption();
      } while (wrongOptions.includes(wrongOption) || wrongOption === answer);
      
      wrongOptions.push(wrongOption);
    }

    const options = [answer, ...wrongOptions].sort(() => 0.5 - Math.random());
  
    return {
      question,
      options,
      answer
    };
  };
  
  /**
   * Create a summary of paragraph for card backs
   * @param {string} text - Source text
   * @param {string} difficulty - Difficulty level
   * @returns {string} Summarized text
   */
  const summarizeParagraph = (text, difficulty) => {
    // In a real app, use NLP for proper summarization
    // Here we'll do a simple truncation with ellipsis
    
    const maxLength = difficulty === 'easy' ? 150 : 
                      (difficulty === 'medium' ? 200 : 300);
    
    if (text.length <= maxLength) {
      return text;
    }
    
    // Try to find a sentence break
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    
    if (lastPeriod > maxLength * 0.7) {
      // If we can find a good sentence break, use it
      return truncated.substring(0, lastPeriod + 1);
    }
    
    // Otherwise just truncate and add ellipsis
    return truncated + '...';
  };