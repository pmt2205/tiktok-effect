export default function LandingBackground() {
  return (
    <>
      {/* Background Glowing Atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-25">
        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-primary/25 blur-[140px] animate-glow-drift" />
        <div className="absolute -right-40 top-1/3 h-[550px] w-[550px] rounded-full bg-secondary/25 blur-[150px] animate-glow-drift" style={{ animationDelay: '-6s' }} />
        <div className="absolute bottom-10 left-1/3 h-[450px] w-[450px] rounded-full bg-accent/20 blur-[130px] animate-glow-drift" style={{ animationDelay: '-12s' }} />
      </div>
    </>
  );
}

