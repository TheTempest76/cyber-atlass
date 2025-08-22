export async function POST(request) {
  const body = await request.json();
  
  const response = await fetch('https://elegant-liked-fly.ngrok-free.app/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return Response.json(data);
}