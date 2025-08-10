import type { HistoryAnalysisResult } from '@/types';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const getHistory = async (): Promise<HistoryAnalysisResult[]> => { // Use the new type here
  try {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) {
      throw new Error('Failed to fetch analysis history');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getHistory:', error);
    throw error;
  }
};

export const analyzeUrl = async (url: string): Promise<{ job_id: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to start URL analysis');
    }
    return await response.json();
  } catch (error) {
    console.error('Error in analyzeUrl:', error);
    throw error;
  }
};

export const startHtmlAnalysis = async (html: string): Promise<{ job_id: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/analyze-html`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start HTML analysis');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in startHtmlAnalysis:', error);
      throw error;
    }
  };

// import type { AnalysisResult } from '@/types';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// export class ApiError extends Error {
//   constructor(message: string) {
//     super(message);
//     this.name = 'ApiError';
//   }
// }

// export const analyzeUrl = async (url: string): Promise<AnalysisResult> => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/analyze`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ url }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.detail || 'Failed to analyze URL');
//     }
//     return await response.json();
//   } catch (error) {
//     console.error('Error in analyzeUrl:', error);
//     throw error;
//   }
// };

// export const analyzeHtml = async (html: string): Promise<AnalysisResult> => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/analyze-html`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ html }),
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.detail || 'Failed to analyze HTML');
//       }
//       return await response.json();
//     } catch (error) {
//       console.error('Error in analyzeHtml:', error);
//       throw error;
//     }
//   };