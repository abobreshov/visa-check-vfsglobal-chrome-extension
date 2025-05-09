/**
 * Background service worker for handling fetch requests
 */

interface FetchRequest {
  type: string;
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

interface FetchResponse {
  success: boolean;
  data?: string;
  error?: string;
  status?: number;
  statusText?: string;
}

/**
 * Handle API fetch requests from content scripts
 * Use async/await for better readability and error handling
 */
chrome.runtime.onMessage.addListener((request: FetchRequest, _sender, sendResponse) => {
  if (request.type === "fetch-vfs-api") {
    handleFetchRequest(request)
      .then(sendResponse)
      .catch(error => {
        // Ensure any uncaught errors are properly formatted and sent back
        sendResponse({
          success: false,
          error: `Unhandled error in background script: ${error.message || error.toString()}`,
        });
      });

    // Return true to indicate we'll call sendResponse asynchronously
    return true;
  }
});

/**
 * Handle fetch requests in a structured way
 * @param request The fetch request object
 * @returns Promise that resolves with the formatted response
 */
async function handleFetchRequest(request: FetchRequest): Promise<FetchResponse> {
  try {
    const response = await fetch(request.url, {
      method: request.method || "GET",
      headers: request.headers || {},
      body: request.body || null,
      credentials: "include"
    });

    // Get response text
    const data = await response.text();

    // Check if the response was successful (status code 2xx)
    if (response.ok) {
      return {
        success: true,
        data,
        status: response.status,
        statusText: response.statusText
      };
    } else {
      // Handle HTTP error responses with proper status information
      return {
        success: false,
        error: `HTTP error: ${response.status} ${response.statusText}`,
        data, // Include the response data which might contain error details
        status: response.status,
        statusText: response.statusText
      };
    }
  } catch (error) {
    // Handle network errors or exceptions during fetch
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}