import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.LINEAR_API_TOKEN;

  const query = `{
    issues(filter: {
      team: { id: { eq: "5ca4bd7e-625b-4bcb-8bf7-213e3002f218" } }
      state: { name: { nin: ["\u2705 Готово", "Cancelled"] } }
    }, orderBy: updatedAt) {
      nodes {
        id
        identifier
        title
        priority
        state { name }
        labels { nodes { name color } }
        updatedAt
      }
    }
  }`;

  try {
    const res = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Authorization': token!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 30 },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Linear API error' }, { status: 500 });
  }
}
