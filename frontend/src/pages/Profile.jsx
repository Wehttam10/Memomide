import { useEffect, useState } from 'react';
import { me } from '../api/auth';
import Loading from '../components/Loading';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    me().then(setUser).catch((err) => setError(err.message));
  }, []);

  if (error) return <div className="panel text-rose-700">{error}</div>;
  if (!user) return <Loading label="Loading profile" />;

  return (
    <section className="panel max-w-2xl">
      <h2 className="text-2xl font-bold">Profile</h2>
      <dl className="mt-5 grid gap-4 text-sm">
        <div><dt className="font-semibold text-slate-500">Name</dt><dd className="mt-1">{user.name}</dd></div>
        <div><dt className="font-semibold text-slate-500">Email</dt><dd className="mt-1">{user.email}</dd></div>
        <div><dt className="font-semibold text-slate-500">Joined</dt><dd className="mt-1">{new Date(user.created_at).toLocaleDateString()}</dd></div>
      </dl>
    </section>
  );
}
