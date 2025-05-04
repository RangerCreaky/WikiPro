interface WikiProjectProps {
  title: string;
  description: string;
  logo: string;
  href: string;
  index: number;
}

const WikiProject = ({ index, title, description, logo, href }: WikiProjectProps) => {
  return (
    <>
      <div className="other-project">
        <a className="other-project-link" href="//www.wiktionary.org/">
          <div className="other-project-icon">
            <div className={`sprite small-logo small-logo${index+1}`}></div>
            </div>
            <div className="other-project-text">
              <span className="other-project-title jsl10n" data-jsl10n="wiktionary.name">{title}</span>
              <span className="other-project-tagline jsl10n" data-jsl10n="wiktionary.slogan">{description}</span>
            </div>
        </a>
      </div>

      {/* <div className="flex items-start mb-6">
        <div className="mr-2">
          <img src={logo} alt={title} className="w-10 h-10" />
        </div>
        <div>
          <a 
            href={href} 
            className="text-wiki-blue hover:text-wiki-blue-hover"
          >
            
          </a>
          <div className="text-sm text-wiki-text-light">
            
          </div>
        </div>
      </div> */}
    </>
  );
};

export default WikiProject;
