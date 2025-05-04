/**
 * Generate thread content from article content
 * @param {string} title - Article title
 * @param {string} content - HTML content to generate thread from
 * @param {string} platform - Target platform ('twitter', 'instagram', 'linkedin')
 * @param {string} tone - Tone of voice ('casual', 'professional', 'teacher')
 * @param {string} threadLength - Desired thread length ('short', 'medium', 'long')
 * @param {boolean} includeSources - Whether to include source attribution
 * @param {boolean} includeHashtags - Whether to include hashtags
 * @returns {Array} Array of post objects with content
 */
export const generateThreadContent = async (
    title,
    content,
    platform,
    tone,
    threadLength,
    includeSources,
    includeHashtags
  ) => {
    // Define post limits based on platform
    const platformLimits = {
      twitter: 280,
      instagram: 2200,
      linkedin: 3000
    };
  
    // Define number of posts based on thread length
    const postCounts = {
      short: { min: 3, max: 5 },
      medium: { min: 5, max: 8 },
      long: { min: 8, max: 12 }
    };
  
    // Extract plain text from HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean the text (remove extra spaces, etc.)
    const cleanText = textContent.replace(/\s+/g, ' ').trim();
    
    // Generate relevant hashtags based on title and content
    const generateHashtags = () => {
      const titleWords = title.split(' ');
      const potentialTags = [];
      
      // Add title-based hashtags
      titleWords.forEach(word => {
        // Only use words longer than 3 characters and clean them
        if (word.length > 3) {
          const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
          if (cleanWord.length > 3) {
            potentialTags.push('#' + cleanWord);
          }
        }
      });
      
      // Add some generic hashtags based on platform
      switch (platform) {
        case 'twitter':
          potentialTags.push('#TIL', '#ThreadTime', '#KnowledgeThread');
          break;
        case 'instagram':
          potentialTags.push('#LearnSomethingNew', '#KnowledgeCarousel', '#DidYouKnow');
          break;
        case 'linkedin':
          potentialTags.push('#ProfessionalDevelopment', '#KnowledgeSharing', '#Learning');
          break;
      }
      
      // Limit number of hashtags based on platform
      let maxTags;
      switch (platform) {
        case 'twitter':
          maxTags = 3;
          break;
        case 'instagram':
          maxTags = 8;
          break;
        case 'linkedin':
          maxTags = 3;
          break;
        default:
          maxTags = 3;
      }
      
      // Shuffle and take a subset
      const shuffled = [...potentialTags].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, maxTags).join(' ');
    };
    
    // Determine the number of posts based on thread length and content
    const targetPostCount = Math.min(
      postCounts[threadLength].max,
      Math.max(
        postCounts[threadLength].min,
        Math.ceil(cleanText.length / (platformLimits[platform] * 0.7))
      )
    );
    
    // Generate appropriate tone adjustments
    const getToneIntro = () => {
      switch (tone) {
        case 'casual':
          return [
            "Hey folks! Let's talk about",
            "Did you know about",
            "I just learned something cool about",
            "Check this out:",
            "This blew my mind:",
          ];
        case 'professional':
          return [
            "I'd like to share some insights on",
            "An important topic to understand:",
            "Today I'm discussing",
            "Let's explore the key aspects of",
            "I've compiled some information about",
          ];
        case 'teacher':
          return [
            "Today's lesson: Understanding",
            "Let's break down",
            "An essential concept to grasp:",
            "Here's how you can understand",
            "The key principles of",
          ];
      }
    };
    
    const getToneTransitions = () => {
      switch (tone) {
        case 'casual':
          return [
            "Next up,",
            "Also,",
            "Here's another cool thing:",
            "But wait, there's more!",
            "The next part is interesting:",
          ];
        case 'professional':
          return [
            "Furthermore,",
            "Additionally,",
            "Moving on to the next point,",
            "Another important aspect is",
            "To continue this analysis,",
          ];
        case 'teacher':
          return [
            "The next concept to understand:",
            "Building on this foundation,",
            "Let's examine another aspect:",
            "Now that we've covered that, consider:",
            "This leads us to our next point:",
          ];
      }
    };
    
    const getToneClosing = () => {
      switch (tone) {
        case 'casual':
          return [
            "That's the rundown! What do you think?",
            "Pretty interesting, right?",
            "Hope you found this useful!",
            "Would love to hear your thoughts on this!",
            "That's it for this thread! Thanks for reading!",
          ];
        case 'professional':
          return [
            "In conclusion, these insights should provide valuable context.",
            "I welcome your professional perspectives on this topic.",
            "This information should be valuable for your decision-making.",
            "I hope this analysis provides helpful context for your work.",
            "Let's continue the discussion in the comments.",
          ];
        case 'teacher':
          return [
            "To summarize what we've learned today:",
            "Test your understanding: Can you explain this concept to someone else?",
            "What questions do you still have about this topic?",
            "Remember these key points as you continue your learning journey.",
            "In your own words, how would you explain what we've covered?",
          ];
      }
    };
    
    // Choose random tone pieces
    const intros = getToneIntro();
    const transitions = getToneTransitions();
    const closings = getToneClosing();
    
    const intro = intros[Math.floor(Math.random() * intros.length)];
    const closing = closings[Math.floor(Math.random() * closings.length)];
    
    // Split content into chunks for posts
    const generatePosts = () => {
      const posts = [];
      const avgChunkSize = Math.floor(cleanText.length / (targetPostCount - 2)); // -2 for intro and closing posts
      
      // Add intro post
      let introContent = `${intro} ${title}. 🧵 (1/${targetPostCount})`;
      
      // Add a brief summary from the first paragraph if there's room
      const firstPara = textContent.split(/\n\s*\n/)[0].trim();
      const shortSummary = firstPara.length > 100 ? firstPara.substring(0, 100) + '...' : firstPara;
      
      if ((introContent.length + shortSummary.length + 3) <= platformLimits[platform]) {
        introContent += `\n\n${shortSummary}`;
      }
      
      posts.push({ content: introContent });
      
      // Split content into reasonably sized chunks
      let remainingText = cleanText;
      let postIndex = 2; // Start at 2 since 1 is the intro
      
      while (remainingText.length > 0 && posts.length < targetPostCount - 1) { // -1 for closing post
        let postSize = Math.min(
          avgChunkSize,
          platformLimits[platform] - 15 // Account for post number and spacing
        );
        
        // Find a good breakpoint (end of sentence)
        let breakPoint = postSize;
        if (remainingText.length > postSize) {
          const lastPeriod = remainingText.substring(0, postSize).lastIndexOf('.');
          const lastQuestion = remainingText.substring(0, postSize).lastIndexOf('?');
          const lastExclamation = remainingText.substring(0, postSize).lastIndexOf('!');
          
          breakPoint = Math.max(lastPeriod, lastQuestion, lastExclamation);
          
          // If no good breakpoint found, try to break at a space
          if (breakPoint < 0 || breakPoint < postSize / 2) {
            breakPoint = remainingText.substring(0, postSize).lastIndexOf(' ');
          }
          
          // If still no good breakpoint, just use the maximum size
          if (breakPoint < 0) {
            breakPoint = postSize;
          }
          
          // Add 1 to include the punctuation or space
          breakPoint += 1;
        } else {
          breakPoint = remainingText.length;
        }
        
        // Create post content with appropriate transitions for non-first posts
        let transition = '';
        if (posts.length > 1) {
          transition = transitions[Math.floor(Math.random() * transitions.length)] + ' ';
        }
        
        const postContent = `${transition}${remainingText.substring(0, breakPoint).trim()} (${postIndex}/${targetPostCount})`;
        posts.push({ content: postContent });
        
        // Update remainingText and postIndex
        remainingText = remainingText.substring(breakPoint).trim();
        postIndex++;
      }
      
      // Add closing post
      let closingContent = `${closing} (${targetPostCount}/${targetPostCount})`;
      
      // Add source if requested
      if (includeSources) {
        closingContent += `\n\nSource: Wikipedia article on "${title}"`;
      }
      
      // Add hashtags if requested
      if (includeHashtags) {
        const hashtagText = generateHashtags();
        if ((closingContent.length + hashtagText.length + 2) <= platformLimits[platform]) {
          closingContent += `\n\n${hashtagText}`;
        }
      }
      
      posts.push({ content: closingContent });
      
      // If we ended up with too few posts, merge some content
      if (posts.length < targetPostCount) {
        // We'll just leave it as is, since fewer posts is better than
        // artificially breaking content up too much
      }
      
      // Format posts based on platform specifics
      return posts.map((post, index) => {
        let content = post.content;
        
        // Platform-specific formatting
        switch (platform) {
          case 'twitter':
            // Twitter is already handled with character limits
            break;
          case 'instagram':
            // Instagram likes line breaks and emojis
            if (index === 0) {
              content = content.replace('🧵', '📱✨');
            }
            // Add some line breaks for readability
            content = content.replace(/\. ([A-Z])/g, '.\n\n$1');
            break;
          case 'linkedin':
            // LinkedIn prefers professional formatting with some line breaks
            if (index === 0) {
              content = content.replace('🧵', ''); // Remove thread emoji
            }
            // Add bullet points for key sentences in middle posts
            if (index > 0 && index < posts.length - 1) {
              const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
              if (sentences.length > 2) {
                content = sentences.slice(0, 1).join(' ') + '\n\n' +
                  sentences.slice(1).map(s => `• ${s.trim()}`).join('\n');
              }
            }
            break;
        }
        
        return { content };
      });
    };
    
    return generatePosts();
  };
  
  /**
   * Generate relevant hashtags for article content
   * @param {string} title - Article title
   * @param {string} content - Article content
   * @param {string} platform - Social media platform
   * @returns {string} Hashtag string
   */
  export const generateRelevantHashtags = (title, content, platform) => {
    // Extract keywords from title
    const keywords = title.split(' ')
      .filter(word => word.length > 3)
      .map(word => word.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(word => word.length > 3);
    
    // Create hashtags
    const hashtags = keywords.map(word => `#${word}`);
    
    // Add platform-specific hashtags
    switch (platform) {
      case 'twitter':
        hashtags.push('#TIL', '#FactsThread');
        break;
      case 'instagram':
        hashtags.push('#LearnSomethingNew', '#FactOfTheDay', '#DidYouKnow');
        break;
      case 'linkedin':
        hashtags.push('#ProfessionalDevelopment', '#KnowledgeSharing');
        break;
    }
    
    // Limit hashtags based on platform
    const maxTags = platform === 'instagram' ? 8 : 3;
    
    // Shuffle and take a subset
    return [...hashtags]
      .sort(() => 0.5 - Math.random())
      .slice(0, maxTags)
      .join(' ');
  };
  
  /**
   * Convert HTML to plain text
   * @param {string} html - HTML content
   * @returns {string} Plain text
   */
  export const htmlToPlainText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };