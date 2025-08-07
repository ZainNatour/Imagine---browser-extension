import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';

interface ProfileData {
  name: string;
  email: string;
}

const STORAGE_KEY = 'profile';

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) setProfile(JSON.parse(raw));
  }, []);

  const save = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    alert('Profile saved');
  };

  return (
    <div>
      <h1>User Profile</h1>
      <div>
        <label>
          Name
          <input
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          />
        </label>
      </div>
      <div>
        <label>
          Email
          <input
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
          />
        </label>
      </div>
      <button onClick={save}>Save</button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
