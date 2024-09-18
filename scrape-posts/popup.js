document.getElementById('scrapeButton').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      {file: 'content.js'},
      function(results) {
        if (chrome.runtime.lastError) {
          document.getElementById('status').textContent = 'Error: ' + chrome.runtime.lastError.message;
        } else {
          document.getElementById('status').textContent = 'Scraping in progress. Please check the console for details.';
        }
      }
    );
  });
});