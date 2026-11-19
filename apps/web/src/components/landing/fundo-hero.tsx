export function FundoHero() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span
        className="mancha-dourada top-[-10%] left-[-8%] size-[28rem]"
        style={{ animation: "flutuar-a 24s ease-in-out infinite" }}
      />
      <span
        className="mancha-dourada right-[-10%] bottom-[-20%] size-[34rem] opacity-30"
        style={{ animation: "flutuar-b 30s ease-in-out infinite" }}
      />
      <span
        className="mancha-dourada top-[30%] left-[45%] size-[18rem] opacity-25"
        style={{ animation: "flutuar-a 20s ease-in-out infinite reverse" }}
      />
      <div className="textura-papel absolute inset-0" />
    </div>
  );
}
