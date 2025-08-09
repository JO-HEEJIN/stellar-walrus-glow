interface BrandStoryProps {
  story: {
    title: string;
    content: string;
    highlights: Array<{
      icon: string;
      label: string;
      value: string;
    }>;
  };
}

export function BrandStory({ story }: BrandStoryProps) {
  return (
    <div className="bg-gray-50 p-10 rounded-xl mt-8 mb-10">
      <h2 className="text-xl font-bold mb-5">{story.title}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Story Content */}
        <div className="text-sm leading-7 text-gray-600 space-y-4">
          {story.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Story Highlights */}
        <div className="bg-white p-5 rounded-lg">
          {story.highlights.map((highlight, index) => (
            <div key={index} className="flex items-center gap-3 mb-4 last:mb-0">
              <div className="w-10 h-10 bg-indigo-900 text-white rounded-full flex items-center justify-center text-xl">
                {highlight.icon}
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">{highlight.label}</div>
                <div className="text-sm font-semibold">{highlight.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}