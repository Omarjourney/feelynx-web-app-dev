import React from 'react';

interface CreatorBubble {
  username: string;
  avatar: string;
  isLive?: boolean;
  badge?: string;
}

interface StoryBubblesProps {
  creators: CreatorBubble[];
  onSelect: (username: string) => void;
}

const StoryBubbles = ({ creators, onSelect }: StoryBubblesProps) => {
  return (
    <div className="flex space-x-4 overflow-x-auto pb-2" data-testid="story-bubbles">
      {creators.map((c) => (
        <button
          key={c.username}
          onClick={() => onSelect(c.username)}
          className="flex flex-col items-center focus:outline-none"
        >
          <div
            className={`relative p-1 rounded-full ${
              c.isLive ? 'ring-2 ring-live animate-pulse' : 'ring-2 ring-muted'
            }`}
          >
            <img
              src={c.avatar}
              alt={c.username}
              className="w-16 h-16 rounded-full object-cover"
              width={64}
              height={64}
              loading="lazy"
              decoding="async"
            />
          </div>
          <span className="text-xs mt-1">@{c.username}</span>
        </button>
      ))}
    </div>
  );
};

export default StoryBubbles;
