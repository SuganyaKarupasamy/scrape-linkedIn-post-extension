(function() {
  console.log("LinkedIn Saved Posts Scraper content script loaded");

  function logPageStructure() {
    console.log("Page title:", document.title);
    console.log("Body class:", document.body.className);
    console.log("First level children of body:", Array.from(document.body.children).map(el => el.tagName + (el.id ? '#' + el.id : '')).join(', '));
  }

  function findPotentialPostElements() {
    const potentialSelectors = [
      'li', 'div.entity-result', 'div.occludable-update', 'div.relative',
      '[data-id]', '[data-urn]', '[data-test-id]'
    ];

    potentialSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      console.log(`Found ${elements.length} elements with selector: ${selector}`);
      if (elements.length > 0) {
        console.log("First element HTML:", elements[0].outerHTML.substring(0, 200));
      }
    });
  }

  // function scrapeLinkedInSavedPosts() {
  //   console.log("Starting to scrape posts...");
  //   const posts = document.querySelectorAll('li.reusable-search__result-container');
  //   console.log(`Found ${posts.length} posts`);
  
  //   const scrapedData = [['Author', 'Date Time', 'Content', 'No. of Likes', 'No. of Comments', 'URL']];
  
  //   posts.forEach((post, index) => {
  //     console.log(`Processing post ${index + 1}`);
  
  //     // Author
  //     const authorElement = post.querySelector('.entity-result__title-text a');
  //     const author = authorElement ? authorElement.textContent.trim() : 'N/A';
  
  //     // Date Time
  //     const dateTimeElement = post.querySelector('.entity-result__primary-subtitle, .t-black--light.t-12');
  //     let dateTime = dateTimeElement ? dateTimeElement.textContent.trim() : 'N/A';
  //     dateTime = dateTime.split('•')[0].trim(); // Extract only the time part
  
  //     // Content
  //     const contentElement = post.querySelector('.entity-result__summary');
  //     let content = contentElement ? contentElement.textContent.trim() : 'N/A';
  //     content = content.replace(/…see more$/, '').trim(); // Remove "…see more" if present
  
  //     // Likes and Comments
  //     let likes = 'N/A';
  //     let comments = 'N/A';
  //     const socialCountsElement = post.querySelector('.social-details-social-counts');
  //     if (socialCountsElement) {
  //       const socialText = socialCountsElement.textContent;
  //       const likesMatch = socialText.match(/(\d+)\s*(?:reaction|like)/i);
  //       const commentsMatch = socialText.match(/(\d+)\s*comment/i);
  //       likes = likesMatch ? likesMatch[1] : '0';
  //       comments = commentsMatch ? commentsMatch[1] : '0';
  //     }
  
  //     // URL
  //     const url = authorElement ? authorElement.href : 'N/A';
  
  //     console.log(`Author: ${author}, Date Time: ${dateTime}, Content: ${content.substring(0, 50)}..., Likes: ${likes}, Comments: ${comments}, URL: ${url}`);
  //     scrapedData.push([author, dateTime, content, likes, comments, url]);
  //   });
  
  //   return scrapedData;
  // }
  function scrapeLinkedInSavedPosts() {
    console.log("Starting to scrape posts...");
    const posts = document.querySelectorAll('li.reusable-search__result-container');
    console.log(`Found ${posts.length} posts`);
  
    const scrapedData = [['Author', 'Date Time', 'Content', 'No. of Likes', 'No. of Comments', 'URL']];
  
    posts.forEach((post, index) => {
      console.log(`Processing post ${index + 1}`);
  
      // Author
      const authorElement = post.querySelector('.entity-result__title-text a');
      const author = authorElement ? authorElement.textContent.trim() : 'N/A';
  
      // Date Time
      const dateTimeElement = post.querySelector('.entity-result__content-actor .t-black--light.t-12');
      let dateTime = dateTimeElement ? dateTimeElement.textContent.trim() : 'N/A';
      dateTime = dateTime.split('•')[0].trim(); // Extract only the time part
  
      // Content
      const contentElement = post.querySelector('.entity-result__content-summary, .feed-shared-update-v2__description');
      let content = contentElement ? contentElement.textContent.trim() : 'N/A';
      content = content.replace(/…see more$/, '').trim(); // Remove "…see more" if present
  
      // Likes and Comments
      let likes = 'N/A';
      let comments = 'N/A';
      const socialCountsElement = post.querySelector('.social-details-social-counts');
      if (socialCountsElement) {
        const socialText = socialCountsElement.textContent;
        const likesMatch = socialText.match(/(\d+)\s*(?:reaction|like)/i);
        const commentsMatch = socialText.match(/(\d+)\s*comment/i);
        likes = likesMatch ? likesMatch[1] : '0';
        comments = commentsMatch ? commentsMatch[1] : '0';
      }
  
      // URL
      const url = authorElement ? authorElement.href : 'N/A';
  
      console.log(`Author: ${author}, Date Time: ${dateTime}, Content: ${content.substring(0, 50)}..., Likes: ${likes}, Comments: ${comments}, URL: ${url}`);
      scrapedData.push([author, dateTime, content, likes, comments, url]);
    });
  
    return scrapedData;
  }

  function convertToCSV(data) {
    return data.map(row => 
      row.map(cell => 
        `"${(cell || '').toString().replace(/"/g, '""')}"`
      ).join(',')
    ).join('\n');
  }

  function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const scrapedData = scrapeLinkedInSavedPosts();
  const csv = convertToCSV(scrapedData);
  console.log(`CSV data length: ${csv.length}`);
  console.log(`First 500 characters of CSV: ${csv.substring(0, 500)}`);
  
  if (csv.length > 0) {
    downloadCSV(csv, 'linkedin_saved_posts.csv');
    console.log(`CSV download initiated. Scraped ${scrapedData.length - 1} items.`);
  } else {
    console.error("No data scraped. Here's what we found on the page:");
    logPageStructure();
    findPotentialPostElements();
  }
})();