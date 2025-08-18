import { useState, useCallback, useRef, useEffect } from "react";
import { ViewState } from "@/types";
import { BACKEND_API_URL } from "@/constants";

const getWebSocketURL = () => BACKEND_API_URL.replace(/^http/, "ws");

export const useAnalysis = <T>() => {
  const [view, setView] = useState<ViewState>(ViewState.START);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [isStopped, setIsStopped] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Skip WebSocket setup during SSR
    if (typeof window === "undefined") return;

    if (!jobId || isStopped) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    wsRef.current = new WebSocket(`${getWebSocketURL()}/ws/${jobId}`);
    let analysisCompleted = false;

    const handleError = (message: string) => {
      setError(message);
      setView(ViewState.START);
      analysisCompleted = true;
    };

    wsRef.current.onopen = () => setProgress(["Connection established..."]);
    wsRef.current.onerror = () =>
      handleError("A WebSocket connection error occurred.");

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setResult(data);
        setView(ViewState.RESULT);
        analysisCompleted = true;
      } catch {
        const message = event.data as string;
        if (typeof message === "string" && message.toLowerCase().includes("error")) {
          handleError(message);
        } else {
          setProgress((prev) => [...prev, message]);
        }
      }
    };

    wsRef.current.onclose = () => {
      if (!analysisCompleted && !isStopped) {
        handleError("The analysis was interrupted unexpectedly.");
      }
    };

    return () => {
      wsRef.current?.close();
    };
  }, [jobId, isStopped]);

  const startAnalysis = useCallback(
    async (apiCall: () => Promise<{ job_id: string }>) => {
      setView(ViewState.LOADING);
      setError(null);
      setProgress([]);
      setResult(null);
      setJobId(null);
      setIsStopped(false);
      try {
        const response = await apiCall();
        setJobId(response.job_id);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMessage);
        setView(ViewState.START);
      }
    },
    []
  );

  const resetState = useCallback(() => {
    setView(ViewState.START);
    setResult(null);
    setError(null);
    setJobId(null);
    setProgress([]);
    setIsStopped(false);
    wsRef.current?.close();
  }, []);

  const stopScanning = useCallback(() => {
    setIsStopped(true);
    wsRef.current?.close();
    setProgress((prev) => [...prev, "Scan cancelled by user."]);
  }, []);

  return {
    view,
    result,
    error,
    progress,
    isStopped,
    setView,
    startAnalysis,
    resetState,
    stopScanning,
  };
};
