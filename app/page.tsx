import { redirect } from 'next/navigation';

// Root → redirect to /connect
export default function Home() {
  redirect('/connect');
}
