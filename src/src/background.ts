/**
 * Background service worker for handling fetch requests
 */
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "fetch-vfs-api") {
    fetch(request.url, {
      method: request.method || "GET",
      headers: request.headers || {},
      body: request.body || null,
      credentials: "include"
    })
    .then(response => response.text())
    .then(data => sendResponse({ success: true, data }))
    .catch(error => sendResponse({ success: false, error: error.toString() }));
    return true;
  }
});