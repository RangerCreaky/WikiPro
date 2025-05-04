import LanguageLink from '../components/LanguageLink';
import LanguageSelector from '../components/LanguageSelector';
import WikiProject from '../components/WikiProject';
import wikiGlobe from '../assets/images/main-logo.png'
import LanguageSearchBar from '../components/LanguageSearchBar';

const Landing = () => {
  // Language data
  const languages = [
    { name: 'English', articleCount: '6,974,000+', articleText: 'articles', href: '/en' },
    { name: '日本語', articleCount: '1,457,000+', articleText: '記事', href: '/ja' },
    { name: 'Русский', articleCount: '2,036,000+', articleText: 'статей', href: '/ru' },
    { name: 'Deutsch', articleCount: '3,001,000+', articleText: 'Artikel', href: '/de'},
    { name: 'Español', articleCount: '2,021,000+', articleText: 'artículos', href: '/es'},
    { name: 'Français', articleCount: '2,674,000+', articleText: 'articles', href: '/fr' },
    { name: '中文', articleCount: '1,470,000+', articleText: '条目 / 條目', href: '/zh', },
    { name: 'Italiano', articleCount: '1,910,000+', articleText: 'voci', href: '/it'},
    { name: 'Português', articleCount: '1,146,000+', articleText: 'artigos', href: '/pt' },
    { name: 'Polski', articleCount: '1,652,000+', articleText: 'haseł', href: '/pl' },
  ];

  // Wiki projects data
  const wikiProjects = [
    { 
      title: 'Commons', 
      description: 'Free media collection', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Commons-logo.svg/30px-Commons-logo.svg.png',
      href: 'https://commons.wikimedia.org/'
    },
    { 
      title: 'Wikivoyage', 
      description: 'Free travel guide', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Wikivoyage-Logo-v3-icon.svg/30px-Wikivoyage-Logo-v3-icon.svg.png',
      href: 'https://www.wikivoyage.org/'
    },
    { 
      title: 'Wiktionary', 
      description: 'Free dictionary', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Wiktionary-logo.svg/30px-Wiktionary-logo.svg.png',
      href: 'https://www.wiktionary.org/'
    },
    { 
      title: 'Wikibooks', 
      description: 'Free textbooks', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Wikibooks-logo.svg/30px-Wikibooks-logo.svg.png',
      href: 'https://www.wikibooks.org/'
    },
    { 
      title: 'Wikinews', 
      description: 'Free news source', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Wikinews-logo.svg/30px-Wikinews-logo.svg.png',
      href: 'https://www.wikinews.org/'
    },
    { 
      title: 'Wikidata', 
      description: 'Free knowledge base', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Wikidata-logo.svg/30px-Wikidata-logo.svg.png',
      href: 'https://www.wikidata.org/'
    },
    { 
      title: 'Wikiversity', 
      description: 'Free learning resources', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Wikiversity_logo_2017.svg/30px-Wikiversity_logo_2017.svg.png',
      href: 'https://www.wikiversity.org/'
    },
    { 
      title: 'Wikiquote', 
      description: 'Free quote compendium', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Wikiquote-logo.svg/30px-Wikiquote-logo.svg.png',
      href: 'https://www.wikiquote.org/'
    },
    { 
      title: 'MediaWiki', 
      description: 'Free and open wiki software', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/MediaWiki-2020-icon.svg/30px-MediaWiki-2020-icon.svg.png',
      href: 'https://www.mediawiki.org/'
    },
    { 
      title: 'Wikisource', 
      description: 'Free content Library', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/MediaWiki-2020-icon.svg/30px-MediaWiki-2020-icon.svg.png',
      href: 'https://www.mediawiki.org/'
    },
    { 
      title: 'Wikispecies', 
      description: 'Free wiki directory', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/MediaWiki-2020-icon.svg/30px-MediaWiki-2020-icon.svg.png',
      href: 'https://www.mediawiki.org/'
    },
    { 
      title: 'Wikifunctions', 
      description: 'Free function library', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/MediaWiki-2020-icon.svg/30px-MediaWiki-2020-icon.svg.png',
      href: 'https://www.mediawiki.org/'
    },
    { 
      title: 'Meta-wiki', 
      description: 'Community co-ordination and documentation', 
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/MediaWiki-2020-icon.svg/30px-MediaWiki-2020-icon.svg.png',
      href: 'https://www.mediawiki.org/'
    },
  ];

  return (
    <div className="min-h-[120vh] bg-white text-wiki-text">
      <div className='central-textlogo'>
        <img className="central-featured-logo" src={wikiGlobe} width="200" height="183" alt=""></img>
      </div>
      <section className=''>
        {/* <div className="bg-black">hello world</div> */}
          {/* Header */}
          <header className="text-center mb-8">
            <h1 className="font-libertine text-5xl mb-1">
              <span className="wiki-font sprite sprite-wiki"></span>
            </h1>
            <p className="wiki-font text-md font-normal">The Free Encyclopedia</p>
          </header>

          {/* Language grid */}
          <div className="central-featured">
            {languages.map((lang, index) => (
              <LanguageLink 
                key={index}
                index={index}
                name={lang.name}
                articleCount={lang.articleCount}
                articleText={lang.articleText}
                href={lang.href}
              />
            ))}
            
          </div>

          {/* Search box */}
          <LanguageSearchBar />

          {/* Language selector */}
          <div className="border-wiki-border my-8 py-2">
            <LanguageSelector />
          </div>
            
          <hr className='border-t border-gray-300 mb-[41px]' />

          {/* Wiki projects */}
        <div className="footer-sidebar">

        <div className="footer-sidebar-content">
          <div className="footer-sidebar-icon sprite svg-Wikimedia-logo_black">
          </div>
          <div className="footer-sidebar-text jsl10n" data-jsl10n="portal.footer-description">
            Wikipedia is hosted by the Wikimedia Foundation, a non-profit organization that also hosts a range of other projects.
          </div>
          <div className="footer-sidebar-text">
            <a href="https://donate.wikimedia.org/?wmf_medium=portal&amp;wmf_campaign=portalFooter&amp;wmf_source=portalFooter" target="_blank">
              <span className="jsl10n" data-jsl10n="footer-donate">You can support our work with a donation.</span>
            </a>
          </div>
        </div>
        </div> 

            <div className="other-projects">
                {wikiProjects.map((project, index) => (
                  <WikiProject 
                    key={index}
                    index={index}
                    title={project.title}
                    description={project.description}
                    logo={project.logo}
                    href={project.href}
                  />
                ))}
              </div>
      </section>
      </div>
  );
};

export default Landing;
