export async function handle({ event, resolve }) {
  const { request } = event;

  if (request.method === "POST") {
    const bodyLength = parseInt(request.headers.get("content-length") ?? "0");
    console.log(`Handling POST request: Content-Length = ${bodyLength}`);

    if (bodyLength > 536870912) {
      // 512 MB
      console.log("Rejecting request: Payload too large");
      return new Response("Payload too large", { status: 413 });
    }
  }

  try {
    const response = await resolve(event);
    if (!response || typeof response.status !== "number") {
      console.error("No valid response from resolve", { response });
      return new Response("Server error", { status: 500 });
    }
    return response;
  } catch (error) {
    console.error("Error in resolving request", { error });
    return new Response("Internal server error", { status: 500 });
  }
}
