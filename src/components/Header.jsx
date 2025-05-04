import WikiMenu from "../components/WikiMenu";
import WikiTagline from "../assets/images/Wikipedia_files/wikipedia-tagline-en.svg"
import WikiTitle from "../assets/images/Wikipedia_files/wikipedia-wordmark-en.svg"
import WikiGlobe from "../assets/images/main-logo.png"
import WikipediaSearchBar from "../components/WikipediaSearchbar";
import WikipediaMainPage2 from "./WikipediaMainPage2";

const Header = () =>{
    return (
        <header className="flex flex-row gap-2 mx-[70px] pt-4 bg-white">
                    <div className="header-start flex flex-row pl-12 py-2 items-center">
                        <WikiMenu />
                        <img src={WikiGlobe} className="w-[50px] h-[50px] ml-4"/>
                        <div className="ml-3 flex flex-col flex-start">
                            <img src={WikiTitle} className="h-[18px] w-[163px]"/>
                            <img src={WikiTagline} className="h-[13px] w-[117px] mt-1"/>
                        </div>
                    </div>
                    <div className="header-end flex flex-row px-16 py-4 items-center justify-between w-full">
                        <WikipediaSearchBar />

                        <div className="flex flex-row text-sm text-[#36c] gap-2">
                            <p> Donate </p>
                            <p> Create account </p>
                            <p> Log in </p>
                            <p className="text-black"> &#x2022;&#x2022;&#x2022; </p>
                        </div>
                    </div>
                </header>
    )
}

export default Header