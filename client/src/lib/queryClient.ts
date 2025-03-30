import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = '';
    try {
      errorText = await res.text();
    } catch (e) {
      errorText = 'Could not read error response';
    }
    throw new Error(`${res.status}: ${errorText || res.statusText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    const options: RequestInit = {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include' as RequestCredentials,
    };
    
    console.log(`Making ${method} request to ${url}`, data ? JSON.stringify(data, null, 2) : '(no data)');
    
    // Add a timestamp to see how long the request takes
    const startTime = Date.now();
    const res = await fetch(url, options);
    const endTime = Date.now();
    console.log(`Request completed in ${endTime - startTime}ms with status ${res.status}`);
    
    // Check for non-OK responses
    if (!res.ok) {
      let errorText = '';
      try {
        // Clone the response before reading it
        const errorRes = res.clone();
        errorText = await errorRes.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }
      console.error(`API Error (${res.status}):`, errorText);
      throw new Error(`${res.status}: ${errorText || res.statusText}`);
    }
    
    return res;
  } catch (error) {
    console.error(`API Request Error (${method} ${url}):`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
