import React, { useState } from 'react';

export const AddressBar = ({ onNavigate }: { onNavigate: (url: string) => void }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNavigate(url);
  };

  return (
    <div className="p-2 bg-gray-800">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL"
          className="w-full px-2 py-1 text-white bg-gray-700 rounded"
        />
      </form>
    </div>
  );
};
