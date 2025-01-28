export const VideoDemo = () => {
  // Convert the Google Drive sharing URL to an embed URL
  const videoId = "1EIs3qZyxtUzoHSoCXF5wbQz0-paNhSnD";
  const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          App Demonstration
        </h2>
        <div className="relative w-full max-w-4xl mx-auto" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            src={embedUrl}
            title="App Demonstration"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </section>
  );
};