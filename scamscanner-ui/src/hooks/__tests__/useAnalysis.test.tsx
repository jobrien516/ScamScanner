import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnalysis } from "@/hooks/useAnalysis";
import { ViewState } from "@/types";

class MockWebSocket {
  static instances: MockWebSocket[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: any }) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;
  url: string;
  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }
  send() {}
  close() {
    if (this.onclose) this.onclose();
  }
}

describe("useAnalysis hook", () => {
  const originalWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    // @ts-expect-error override for test
    globalThis.WebSocket = MockWebSocket as any;
    MockWebSocket.instances = [];
  });

  afterEach(() => {
    // @ts-expect-error restore after test
    globalThis.WebSocket = originalWebSocket as any;
  });

  it("streams progress then yields final result and sets view to RESULT", async () => {
    const { result } = renderHook(() => useAnalysis<any>());

    // Start analysis with a fake API call returning a job id
    await act(async () => {
      await result.current.startAnalysis(async () => ({ job_id: "abc123" }));
    });

    // Should have created one WebSocket instance pointing to /ws/abc123
    expect(MockWebSocket.instances.length).toBe(1);
    const ws = MockWebSocket.instances[0];

    // Simulate open
    act(() => {
      ws.onopen && ws.onopen();
    });

    expect(result.current.progress[0]).toContain("Connection established");

    // Simulate progress messages
    act(() => {
      ws.onmessage && ws.onmessage({ data: "Crawling page 1" });
      ws.onmessage && ws.onmessage({ data: "Crawling page 2" });
    });

    expect(result.current.progress).toEqual([
      expect.stringContaining("Connection established"),
      "Crawling page 1",
      "Crawling page 2",
    ]);

    // Simulate final JSON result
    const finalPayload = { overallRisk: "Low", riskScore: 5 };
    act(() => {
      ws.onmessage && ws.onmessage({ data: JSON.stringify(finalPayload) });
    });

    expect(result.current.result).toEqual(finalPayload);
    expect(result.current.view).toBe(ViewState.RESULT);
  });

  it("handles error message and resets to START view", async () => {
    const { result } = renderHook(() => useAnalysis<any>());

    await act(async () => {
      await result.current.startAnalysis(async () => ({ job_id: "err1" }));
    });

    const ws = MockWebSocket.instances[0];

    act(() => {
      ws.onmessage && ws.onmessage({ data: "Error: something bad" });
    });

    expect(result.current.error).toContain("Error");
    expect(result.current.view).toBe(ViewState.START);
  });

  it("stopScanning closes socket and appends message", async () => {
    const { result } = renderHook(() => useAnalysis<any>());

    await act(async () => {
      await result.current.startAnalysis(async () => ({ job_id: "stop1" }));
    });

    const ws = MockWebSocket.instances[0];

    await act(async () => {
      result.current.stopScanning();
    });

    // After stop, further close shouldn't set error due to isStopped flag
    act(() => {
      ws.onclose && ws.onclose();
    });

    expect(result.current.isStopped).toBe(true);
    expect(result.current.progress[result.current.progress.length - 1]).toBe(
      "Scan cancelled by user."
    );
  });
});

