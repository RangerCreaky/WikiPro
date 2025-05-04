const DownloadSection = () => {
  return (
    <div className="flex items-start mt-4">
      <div className="mr-4">
        <div className="bg-wiki-gray p-2 rounded border border-wiki-border mb-2">
          <span className="text-4xl font-serif text-wiki-text-light">W</span>
        </div>
      </div>
      <div>
        <h3 className="text-wiki-blue font-bold mb-1">
          <a href="#" className="hover:text-wiki-blue-hover">Download Wikipedia for Android or iOS</a>
        </h3>
        <p className="text-sm mb-2">
          Save your favorite articles to read offline, sync your reading lists across devices and customize your reading experience with the official Wikipedia app.
        </p>
        <div className="flex space-x-2">
          <a href="#" className="inline-block">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" className="h-10" />
          </a>
          <a href="#" className="inline-block">
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Download on the App Store" className="h-10" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadSection;
