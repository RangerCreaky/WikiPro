interface LanguageLinkProps {
  index: number
  name: string;
  nativeName?: string;
  articleCount: string;
  articleText: string;
  href: string;
}

import { Link } from "react-router-dom";

const LanguageLink = ({ index, name, nativeName, articleCount, articleText, href, }: LanguageLinkProps) => {
  return (
    <>
      <div className={`central-featured-lang lang${index+1}`} lang="pt" dir="ltr">
        <Link id="js-link-box-pt" to={`/main${href}`} className="link-box text-[#36c] flex flex-col" data-slogan="A enciclopédia livre">
          <strong>{nativeName || name}</strong>
          <small className="text-[#54595d]">{articleCount} <span>{articleText}</span></small>
        </Link>
      </div>
    </>
  );
};



export default LanguageLink;
