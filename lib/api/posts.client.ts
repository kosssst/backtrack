export async function createPost(input: { title: string; body: string }) {
	const res = await fetch('/api/posts', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});

	if (!res.ok) throw new Error(await res.text());
	return res.json();
}
