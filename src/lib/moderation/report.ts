interface SubmitReportPayload {
  reportedId: string | number;
  type: string;
  reason: string;
}

export const submitReport = async (payload: SubmitReportPayload) => {
  const response = await fetch('/moderation/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to submit report');
  }
};
