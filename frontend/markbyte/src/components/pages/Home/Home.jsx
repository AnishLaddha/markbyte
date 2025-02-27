import "./Home.css";
import { CiLogin } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";

function Home() {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:470px)");
  const isSmallScreen2 = useMediaQuery("(min-width:611px)");

  return (
    <div className="App relative bg-[#011A29] text-white overflow-hidden">
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[400px] -rotate-100 rounded-[150px] bg-blue-500 opacity-15 blur-[150px] z-0"></div>
      <div className="absolute left-[-15%] top-1/6 h-[450px] w-[350px] -rotate-15 rounded-[120px] bg-blue-500 opacity-10 blur-[130px] z-0"></div>
      <div className="absolute right-[-10%] bottom-1/4 h-[550px] w-[450px] rotate-40 rounded-[130px] bg-blue-500 opacity-10 blur-[140px] z-0"></div>
      <header className="header">
        <div className="logo-container" onClick={() => navigate("/")}>
          <img
            src="/assets/markbytealt.png"
            alt="MarkByte Logo"
            className="page-logo-2"
          />
          {!isSmallScreen && <span className="logo-text">arkByte</span>}
        </div>
        <div className="flex gap-6 items-center">
          <a
            href="/"
            className="text-white font-semibold rounded text-lg transition-all duration-300"
          >
            Home
          </a>
          <a
            href="#"
            className="text-white font-semibold rounded text-lg transition-all duration-300"
          >
            About
          </a>
          <button
            className="text-white font-semibold rounded flex items-center justify-center text-lg"
            onClick={() => navigate("/auth?tab=login")}
          >
            Login <CiLogin className="ml-2 text-lg " />
          </button>
          <button
            className="bg-white hover:bg-gray-300 text-black font-semibold py-2 px-4 rounded min-w-[100px] transition duration-300 text-lg"
            onClick={() => navigate("/auth?tab=signup")}
          >
            Sign Up
          </button>
        </div>
      </header>
      <section className="text-white py-32 mt-32 z-20">
        <div className="container mx-auto px-4 z-20">
          <div className="max-w-3xl mx-auto text-center z-10">
            <div className="relative">
              <h1 className="text-5xl font-bold mb-4 leading-tight z-10">
                Welcome to MarkByte.
              </h1>
              {isSmallScreen2 && (
                <img
                  src="/assets/pen.png"
                  alt="Pen"
                  className="absolute -top-[200%] left-[46%] transform -translate-x-1/2 z-20 w-40 h-40"
                />
              )}
            </div>
            <p className="tagline text-xl mb-8 text-gray-200">
              The future of blogging is written in Markdown
            </p>
            <div class="flex justify-center">
              <a
                href="/auth?tab=signup"
                class="items-center bg-gradient-to-r from-blue-700 to-cyan-400 text-white font-medium py-3 px-6 rounded-lg transition duration-300 shadow-lg cursor-pointer hover:from-blue-800 hover:to-cyan-500"
              >
                Upload Your First Blog &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
export default Home;
