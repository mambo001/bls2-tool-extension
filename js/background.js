chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.contentScriptQuery == "submitDashboardCasesQuery") {
          console.log("Query: submittedBucketQuery")
            
          // Submitted Dashboard Cases Query
          const caseData = encodeURIComponent(JSON.stringify(request.postData));
          const bls2ToolEndpointURL = `https://script.google.com/a/macros/google.com/s/AKfycbxivFmpPEs3So4NaC3Lk2BN5iE3ahxF4H4eTt8W-v64/dev`;
          const URL = `${bls2ToolEndpointURL}?caseData=${caseData}`
            
          fetch(URL,{
              method: 'POST',
              cache: 'no-cache',
              redirect: 'follow',
              body: JSON.stringify(request.postData)
          })
          .then(response => response.json())
          .then(data => sendResponse(data))
          .catch(error => sendResponse({response: 'error'}))
          return true;  // Will respond asynchronously.
            
            
        }
    }
)
