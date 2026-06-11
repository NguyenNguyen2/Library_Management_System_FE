import { Outlet } from 'react-router-dom';
import { cn } from '@shared/constants/commonConst';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 font-sans flex items-center justify-center">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] bg-indigo-400/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto px-6 py-8 lg:py-12 flex items-center">
        <div className="grid lg:grid-cols-2 gap-10 items-center w-full">
          {/* Left promo */}
          <div className="text-white flex flex-col items-center text-center select-none hidden lg:flex">
            {/* Logo */}
            <div className="mb-6">
              <div
                className="w-[140px] h-[140px] rounded-full overflow-hidden bg-white/10 border-2 border-white/20 shadow-2xl flex items-center justify-center"
              >
                <img
                  src="/images/image-2.png"
                  alt="The Library Dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] drop-shadow-md">
              KHO TÀNG<br />TRI THỨC
            </h1>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="bg-emerald-400 text-emerald-950 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                HỌC TIẾN BỘ
              </span>
              <span className="bg-emerald-400 text-emerald-950 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                ĐỌC THÔNG MINH
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-md">
              <div className="bg-blue-900/40 backdrop-blur-md border border-white/10 rounded-xl px-5 py-4 text-center">
                <div className="text-xs text-white/70 font-semibold tracking-wider uppercase mb-1">HƠN 10.000+</div>
                <div className="text-2xl font-bold">ĐẦU SÁCH</div>
              </div>
              <div className="bg-blue-900/40 backdrop-blur-md border border-white/10 rounded-xl px-5 py-4 text-center">
                <div className="text-xs text-white/70 font-semibold tracking-wider uppercase mb-1">MƯỢN SÁCH CHỈ TỪ</div>
                <div className="text-2xl font-bold">0Đ</div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 mt-6 bg-yellow-400 text-yellow-950 px-5 py-2.5 rounded-full font-semibold shadow-lg text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-5.14a1 1 0 0 0-.29-.7l-4.25-4.26a1 1 0 0 0-.71-.29H14"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/></svg>
              <span>FREE SHIP TẬN NHÀ</span>
            </div>
          </div>

          {/* Right form container */}
          <div className="w-full max-w-[448px] mx-auto lg:ml-auto">
            <div className={cn(
              'w-full rounded-2xl border border-[var(--color-gray-border)] bg-white p-6 lg:p-8',
              'shadow-[var(--color-shadow-sm)]'
            )}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
