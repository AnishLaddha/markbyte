// MarkByte's Official Loading Screen
import { FaPen } from "react-icons/fa";

function Loading() {
  return (
    <div className="loadingScreen relative bg-[#011A29] text-white overflow-hidden h-screen w-screen flex justify-center items-center">
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[400px] -rotate-45 rounded-full bg-blue-500 opacity-15 blur-[150px] z-0"></div>
      <div className="absolute left-[-15%] top-1/6 h-[450px] w-[350px] -rotate-15 rounded-full bg-blue-500 opacity-10 blur-[130px] z-0"></div>
      <div className="absolute right-[-10%] bottom-1/4 h-[550px] w-[450px] rotate-45 rounded-full bg-blue-500 opacity-10 blur-[140px] z-0"></div>
      <img
        src="/assets/markbytealt.png"
        alt="MarkByte Logo"
        className="absolute left-0 top-0 h-24 w-auto ml-6 mt-6"
      />

      <div className="relative z-10 text-center bg-white/5 backdrop-blur-sm p-12 rounded-2xl shadow-xl border border-white/10 flex flex-col justify-center items-center">
        <div className="relative">
          <FaPen className="animate-spincustom text-white text-7xl mb-8 relative z-10" />
        </div>

        <h2 className="text-4xl font-light tracking-widest flex items-center justify-center">
          LOADING
          <div className="ml-4 flex space-x-1">
            <span className="dot w-2 h-2 bg-white rounded-full inline-block animate-pulse1"></span>
            <span className="dot w-2 h-2 bg-white rounded-full inline-block animate-pulse2"></span>
            <span className="dot w-2 h-2 bg-white rounded-full inline-block animate-pulse3"></span>
          </div>
        </h2>
      </div>
    </div>
  );
}

export default Loading;
